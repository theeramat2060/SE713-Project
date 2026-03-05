import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_KEY',
];

requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});

export const config = {
    database: {
        url: process.env.DATABASE_URL!,
    },
    jwt: {
        secret: process.env.JWT_SECRET!,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    supabase: {
        url: process.env.SUPABASE_URL!,
        key: process.env.SUPABASE_KEY!,
    },
    port: process.env.PORT || 3000,
};
