import { NextFunction, Response } from 'express';
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '../../packages/error-handler';
import { prisma } from '../../packages/libs/prisma';
import redis from '../../packages/libs/redis';

//  create a new conversation
export const newConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    const userId = req.user.id;

    if (!sellerId) {
      return next(new ValidationError('Seller Id is required!'));
    }

    const existingGroup = await prisma.conversationGroup.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, sellerId],
        },
      },
    });

    if (existingGroup) {
      return res
        .status(200)
        .json({ conversation: existingGroup, isNew: false });
    }

    // Create conversation + participants
    const newGroup = await prisma.conversationGroup.create({
      data: {
        isGroup: false,
        creatorId: userId,
        participantIds: [userId, sellerId],
      },
    });

    await prisma.participant.createMany({
      data: [
        {
          conversationId: newGroup.id,
          userId,
        },
        {
          conversationId: newGroup.id,
          sellerId,
        },
      ],
    });

    return res.status(201).json({ conversation: newGroup, isNew: true });
  } catch (error) {}
};

// get user conversation
export const getUserConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    // Find all conversatioGroups where the user is a participant
    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group) => {
        // Get the sellerParticipant inside this conversation
        const sellerParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            sellerId: { not: null },
          },
        });

        // Get the sellers full info
        let seller = null;
        if (sellerParticipant?.sellerId) {
          seller = await prisma.sellers.findUnique({
            where: {
              id: sellerParticipant.sellerId,
            },
            include: {
              shop: true,
            },
          });
        }

        // Get last message in the conversation
        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Check online status from Redis
        let isOnline = false;
        if (sellerParticipant?.sellerId) {
          const redisKey = `online:seller:${sellerParticipant.sellerId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount('user', group.id);

        return {
          conversationId: group.id,
          seller: {
            id: seller?.id || null,
            name: seller?.shop?.name || 'Unknown',
            isOnline,
            avatar: seller?.shop?.avatar,
          },
          lastMessage: lastMessage?.content || 'Start a conversation',
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      conversations: responseData,
    });
  } catch (error) {
    return next(error);
  }
};

// get user conversation
export const getSellerConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    // Find all conversatioGroups where the seller is a participant
    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: sellerId,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group) => {
        // Get the userParticipant (NOT seller) inside this conversation
        const userParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            userId: { not: null },
          },
        });

        // Get user details
        let user = null;
        if (userParticipant?.userId) {
          user = await prisma.users.findUnique({
            where: {
              id: userParticipant.userId,
            },
            include: {
              avatar: true,
            },
          });
        }

        // Get last message in the conversation
        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Check online status from Redis
        let isOnline = false;
        if (userParticipant?.userId) {
          const redisKey = `online:user:user_${userParticipant.userId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount('seller', group.id);

        return {
          conversationId: group.id,
          user: {
            id: user?.id || null,
            name: user?.name || 'Unknown',
            avatar: user?.avatar || null,
            isOnline,
          },
          lastMessage: lastMessage?.content || 'Start a conversation',
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      conversations: responseData,
    });
  } catch (error) {
    return next(error);
  }
};

// fetch user messages
export const fetchMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError('Conversation ID is required'));
    }

    // Check if user has access to this conversation
    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError('Conversation not found'));
    }

    const hasAccess = conversation.participantIds.includes(userId);
    if (!hasAccess) {
      return next(new AuthError('Access denied to this conversation'));
    }

    // Clear unseen messages for this user
    await clearUnseenCount('user', conversationId);

    // get the seller participant
    const sellerParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        sellerId: { not: null },
      },
    });

    // Fetch seller info
    let seller = null;
    let isOnline = false;

    if (sellerParticipant?.sellerId) {
      seller = await prisma.sellers.findUnique({
        where: { id: sellerParticipant.sellerId },
        include: {
          shop: true,
        },
      });

      const redisKey = `online:seller:${sellerParticipant.sellerId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    // Fetch paginated messages (latest first)
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      seller: {
        id: seller?.id || null,
        name: seller?.shop?.name || 'Unknown',
        avatar: seller?.shop?.avatar || null,
        isOnline,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};

// fetch seller messages
export const fetchSellerMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError('Conversation ID is required'));
    }

    // Check if seller has access to this conversation
    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError('Conversation not found'));
    }

    if (!conversation.participantIds.includes(sellerId)) {
      return next(new AuthError('Access denied to this conversation'));
    }

    // Clear unseen messages for this seller
    await clearUnseenCount('seller', conversationId);

    // get the user participant
    const userParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: { not: null },
      },
    });

    // Get user info
    let user = null;
    let isOnline = false;

    if (userParticipant?.userId) {
      user = await prisma.users.findUnique({
        where: { id: userParticipant.userId },
        include: {
          avatar: true,
        },
      });

      const redisKey = `online:user:user_${userParticipant.userId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    // Get paginated messages (latest first)
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      user: {
        id: user?.id || null,
        name: user?.name || 'Unknown',
        avatar: user?.avatar || null,
        isOnline,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};
