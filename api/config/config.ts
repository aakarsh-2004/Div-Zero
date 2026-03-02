import dotenv from 'dotenv';

dotenv.config();

const _config = {
    dbUrl: process.env.DATABASE_URL || "",
    port: process.env.PORT || 3000,
    frontendUrl: process.env.FRONTEND_URL || "",
    jwtSecret: process.env.JWT_SECRET || "test"
}

export const config = Object.freeze(_config);