declare const _default: () => {
    port: number;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        synchronize: boolean;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
};
export default _default;
