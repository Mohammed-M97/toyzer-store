import Redis from "ioredis"
import dotenv from "dotenv";

dotenv.config();

// Create Redis connection with error handling
let redis;

try {
  redis = new Redis(process.env.UPSTASH_REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxLoadingTimeout: 1000,
  });

  // Test connection
  await redis.ping();
  console.log('✅ Redis connected successfully');
} catch (error) {
  console.warn('⚠️ Redis connection failed, running without cache:', error.message);
  redis = null;
}

// Helper functions for safe Redis operations
export const safeRedisGet = async (key) => {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch (error) {
    console.warn('Redis GET error:', error.message);
    return null;
  }
};

export const safeRedisSet = async (key, value, expiration = 3600) => {
  if (!redis) return false;
  try {
    await redis.set(key, value, 'EX', expiration);
    return true;
  } catch (error) {
    console.warn('Redis SET error:', error.message);
    return false;
  }
};

export const safeRedisDel = async (key) => {
  if (!redis) return false;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn('Redis DEL error:', error.message);
    return false;
  }
};

export { redis };

