import type {Request, Response} from 'express';
import { User, Admin } from '../models';
import * as tokenService from '../services/tokenService';

interface TokenPayload {
    userId?: string;
    adminId?: number;
    ecStaffId?: string;
    role: string;
    constituencyId?: number;
}

type AuthHandler = (req: Request, res: Response, user: TokenPayload) => Promise<void>;
type AdminHandler = (req: Request, res: Response, admin: TokenPayload) => Promise<void>;


export const withAuth = (handler: AuthHandler) => {
    return async (req: Request, res: Response) => {
        const authHeader = req.headers.authorization ?? '';
        const result = tokenService.verifyAuthToken(authHeader);
        
        if (!result.success || !result.data) {
            return res.status(result.error!.code).json({
                success: false,
                error: result.error!.message,
            });
        }
        
        await handler(req, res, result.data);
    };
};


export const withUserRole = (...roles: string[]) => {
    return (handler: AuthHandler) => {
        return async (req: Request, res: Response) => {
            const authHeader = req.headers.authorization ?? '';
            const authResult = tokenService.verifyAuthToken(authHeader);
            
            if (!authResult.success || !authResult.data) {
                return res.status(authResult.error!.code).json({
                    success: false,
                    error: authResult.error!.message,
                });
            }
            
            const roleResult = tokenService.checkUserRole(authResult.data.role, roles);
            if (!roleResult.success) {
                return res.status(roleResult.error!.code).json({
                    success: false,
                    error: roleResult.error!.message,
                });
            }
            
            await handler(req, res, authResult.data);
        };
    };
};


export const withAdmin = (handler: AdminHandler) => {
    return async (req: Request, res: Response) => {
        const authHeader = req.headers.authorization ?? '';
        const result = tokenService.verifyAuthToken(authHeader);
        
        if (!result.success || !result.data) {
            return res.status(result.error!.code).json({
                success: false,
                error: result.error!.message,
            });
        }
        
        if (result.data.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required',
            });
        }
        
        await handler(req, res, result.data);
    };
};

export const withVoter = withUserRole('VOTER');
export const withEC = withUserRole('EC');
