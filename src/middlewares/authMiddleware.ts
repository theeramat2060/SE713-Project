import type {Request, Response} from 'express';
import type {User, Admin} from '../types/models';
import * as tokenService from '../services/tokenService';

type AuthHandler = (req: Request, res: Response, user: User) => Promise<void>;
type AdminHandler = (req: Request, res: Response, admin: Admin) => Promise<void>;


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
        
        await handler(req, res, result.data as User);
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
            
            await handler(req, res, authResult.data as User);
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
        
        const admin = result.data as any as Admin;
        await handler(req, res, admin);
    };
};

export const withVoter = withUserRole('VOTER');
export const withEC = withUserRole('EC');
