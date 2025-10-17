import { Redis } from '@upstash/redis';
import 'dotenv/config';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function checkRedis() {
  try {
    await redis.set('redis_test_key', 'working', { ex: 10 });
    const value = await redis.get('redis_test_key');
    console.log('Redis is working. Value:', value);
  } catch (error) {
    console.error('Redis error:', error);
  }
}

checkRedis();
