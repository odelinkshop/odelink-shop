const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

class CacheService {
  constructor() {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.client.on('connect', () => {
      logger.info('🚀 Redis: Connected');
    });

    this.client.on('error', (err) => {
      logger.error('❌ Redis Error:', err);
    });
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.error(`Redis Get Error (${key}):`, err);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.error(`Redis Set Error (${key}):`, err);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      logger.error(`Redis Del Error (${key}):`, err);
    }
  }

  async clearStoreCache(host) {
    try {
      await this.del(`store:${host}`);
      await this.del(`products:${host}`);
      logger.info(`🧹 Cache cleared for host: ${host}`);
    } catch (err) {
      logger.error(`Cache Clear Error (${host}):`, err);
    }
  }
}

module.exports = new CacheService();
