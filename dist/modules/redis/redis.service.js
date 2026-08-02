"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
        const host = this.configService.get('redis.host');
        const port = this.configService.get('redis.port');
        const password = this.configService.get('redis.password');
        this.client = new ioredis_1.default({
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
    getClient() {
        return this.client;
    }
    async get(key) {
        return this.client.get(key);
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async del(key) {
        return this.client.del(key);
    }
    async acquireLock(key, value, ttlMs = 5000) {
        const result = await this.client.set(key, value, 'PX', ttlMs, 'NX');
        return result === 'OK';
    }
    async acquireLockWithRetry(key, value, ttlMs = 5000, retryDelayMs = 50, maxRetries = 60) {
        for (let i = 0; i < maxRetries; i++) {
            const result = await this.client.set(key, value, 'PX', ttlMs, 'NX');
            if (result === 'OK') {
                return true;
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
        return false;
    }
    async releaseLock(key, value) {
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
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map