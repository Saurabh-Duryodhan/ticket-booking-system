import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('redis.host');
    const port = this.configService.get<number>('redis.port');
    const password = this.configService.get<string>('redis.password');

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      maxRetriesPerRequest: null,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  /**
   * Acquire a distributed lock using Redis (PX NX)
   */
  async acquireLock(key: string, value: string, ttlMs: number = 5000): Promise<boolean> {
    const result = await this.client.set(key, value, 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  /**
   * Acquire lock with spin-lock retry mechanism
   */
  async acquireLockWithRetry(
    key: string,
    value: string,
    ttlMs: number = 5000,
    retryDelayMs: number = 50,
    maxRetries: number = 60,
  ): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const result = await this.client.set(key, value, 'PX', ttlMs, 'NX');
      if (result === 'OK') {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
    return false;
  }

  /**
   * Release lock safely only if the value matches
   */
  async releaseLock(key: string, value: string): Promise<boolean> {
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.client.eval(luaScript, 1, key, value);
    return result === 1;
  }

  onModuleDestroy() {
    this.client.quit();
  }
}
