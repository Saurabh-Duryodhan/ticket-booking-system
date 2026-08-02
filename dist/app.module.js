"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const configuration_1 = require("./config/configuration");
const redis_module_1 = require("./modules/redis/redis.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const events_module_1 = require("./modules/events/events.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('database.host'),
                    port: config.get('database.port'),
                    username: config.get('database.username'),
                    password: config.get('database.password'),
                    database: config.get('database.name'),
                    autoLoadEntities: true,
                    synchronize: config.get('database.synchronize'),
                    logging: false,
                }),
                inject: [config_1.ConfigService],
            }),
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    connection: {
                        host: config.get('redis.host'),
                        port: config.get('redis.port'),
                        password: config.get('redis.password'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            subscriptions_module_1.SubscriptionsModule,
            events_module_1.EventsModule,
            bookings_module_1.BookingsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map