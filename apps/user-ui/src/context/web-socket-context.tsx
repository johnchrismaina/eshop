'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

const WebSocketContext = createContext<any>(null);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const initWebSocket = async () => {
      try {
        // Check if WebSocket URI is available
        const wsUri = process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI;
        if (!wsUri) {
          console.warn('WebSocket URI not configured');
          return;
        }

        // Try to fetch user data
        try {
          const response = await fetch('/api/logged-in-user', {
            credentials: 'include',
          });

          if (!response.ok) {
            setWsReady(true); // Still ready, just no user
            return;
          }

          const userData = await response.json();
          const userId = userData?.user?.id;

          if (!userId || !isMounted) return;

          const ws = new WebSocket(wsUri);
          wsRef.current = ws;

          ws.onopen = () => {
            if (isMounted) {
              ws.send(`user_${userId}`);
              setWsReady(true);
            }
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'UNSEEN_COUNT_UPDATE') {
                const { conversationId, count } = data.payload;
                setUnreadCounts((prev) => ({
                  ...prev,
                  [conversationId]: count,
                }));
              }
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error);
            }
          };

          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
          };
        } catch (error) {
          console.error('Failed to fetch user for WebSocket:', error);
          setWsReady(true); // Still mark as ready to unblock UI
        }
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        setWsReady(true);
      }
    };

    initWebSocket();

    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{ ws: wsRef.current, unreadCounts, isReady: wsReady }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === null) {
    return { ws: null, unreadCounts: {}, isReady: false };
  }
  return context;
};
