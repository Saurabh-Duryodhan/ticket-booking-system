import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private configService;
    private readonly client;
    private readonly logger;
    constructor(configService: ConfigService);
    getClient(): Redis;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<number>;
    acquireLock(key: string, value: string, ttlMs?: number): Promise<boolean>;
    acquireLockWithRetry(key: string, value: string, ttlMs?: number, retryDelayMs?: number, maxRetries?: number): Promise<boolean>;
    releaseLock(key: string, value: string): Promise<boolean>;
    onModuleDestroy(): void;
}
