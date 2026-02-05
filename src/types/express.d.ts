declare global {
    namespace Express {
        interface Request {
            user?: {
                userId?: string;
                adminId?: number;
                role: string;
                constituencyId?: number;
            };
        }
    }
}

export {};
