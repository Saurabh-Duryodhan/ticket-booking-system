"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgrespassword',
        name: process.env.DB_NAME || 'ticket_booking_db',
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'super_secret_jwt_key_ticket_booking_2026',
        expiresIn: process.env.JWT_EXPIRATION || '1d',
    },
});
//# sourceMappingURL=configuration.js.map