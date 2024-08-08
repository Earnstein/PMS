export interface I_ServerConfig {
    port: number;
    db: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    };
}