import express from 'express';
import { prisma } from '@eshop/libs/prisma';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const config = await prisma.site_config.findFirst();
    res.json(config);
  } catch (error) {
    next(error);
  }
});

export default router;
