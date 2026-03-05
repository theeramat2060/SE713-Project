import jwt, {type SignOptions} from 'jsonwebtoken';
import {config} from '../config/env';

interface TokenPayload {
    userId?: string;
    adminId?: number;
    role: string;
    constituencyId?: number;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    } as SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
};
