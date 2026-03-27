import { Router, Request, Response } from 'express';
import * as authService from '../services/authService';
import * as tokenService from '../services/tokenService';
import { RegisterUserRequest, LoginUserRequest, RegisterAdminRequest, LoginAdminRequest, AuthApiResponse } from '../dto/authDTO';
import {
    validateUserRegistration,
    validateUserLogin,
    validateAdminRegistration,
    validateAdminLogin
} from '../middlewares/validators/authValidator';

const router = Router();

// Get current user/admin/ec staff info
router.get('/me', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization ?? '';
    const result = tokenService.verifyAuthToken(authHeader);
    
    if (!result.success || !result.data) {
        return res.status(result.error!.code).json({
            success: false,
            error: result.error!.message,
        });
    }

    if (result.data.role === 'ADMIN' && result.data.adminId) {
        const adminResult = await authService.getCurrentAdmin(result.data.adminId);
        if (!adminResult.success) {
            return res.status(adminResult.error?.code || 500).json({
                success: false,
                error: adminResult.error?.message || 'Failed to fetch admin data',
            });
        }
        return res.status(200).json({
            success: true,
            admin: {
                ...adminResult.data,
                role: 'ADMIN',
            },
        } as AuthApiResponse);
    } else if (result.data.role === 'EC' && result.data.ecStaffId) {
        const ecStaffResult = await authService.getCurrentECStaff(result.data.ecStaffId);
        if (!ecStaffResult.success) {
            return res.status(ecStaffResult.error?.code || 500).json({
                success: false,
                error: ecStaffResult.error?.message || 'Failed to fetch EC staff data',
            });
        }
        return res.status(200).json({
            success: true,
            user: {
                ...ecStaffResult.data,
                role: 'EC',
            },
        } as AuthApiResponse);
    } else if (result.data.userId) {
        const userResult = await authService.getCurrentUser(result.data.userId);
        if (!userResult.success) {
            return res.status(userResult.error?.code || 500).json({
                success: false,
                error: userResult.error?.message || 'Failed to fetch user data',
            });
        }
        return res.status(200).json({
            success: true,
            user: {
                ...userResult.data,
                role: 'VOTER',
            },
        } as AuthApiResponse);
    }

    res.status(401).json({
        success: false,
        error: 'Invalid token',
    });
});


// User registration
router.post('/register', validateUserRegistration, async (req: Request, res: Response) => {
    const data: RegisterUserRequest = req.body;

    const result = await authService.registerUser(data);

    if (!result.success) {
        const statusCode = result.error?.code || 500;
        return res.status(statusCode).json({
            success: false,
            error: result.error?.message || 'Registration failed',
        } as AuthApiResponse);
    }

    res.status(201).json({
        success: true,
        token: result.data!.token,
        user: result.data!.user ? {
            id: result.data!.user!.id,
            nationalId: (result.data!.user! as any).nationalId,
            title: result.data!.user!.title,
            firstName: (result.data!.user! as any).firstName,
            lastName: (result.data!.user! as any).lastName,
            role: result.data!.user!.role,
        } : undefined,
    } as AuthApiResponse);
});

// User login
router.post('/login', validateUserLogin, async (req: Request, res: Response) => {
    const data: LoginUserRequest = req.body;

    const result = await authService.loginUser(data);

    if (!result.success) {
        const statusCode = result.error?.code || 500;
        return res.status(statusCode).json({
            success: false,
            error: result.error?.message || 'Login failed',
        } as AuthApiResponse);
    }

    res.status(200).json({
        success: true,
        token: result.data!.token,
        user: result.data!.user ? {
            id: result.data!.user!.id,
            nationalId: (result.data!.user! as any).nationalId,
            title: result.data!.user!.title,
            firstName: (result.data!.user! as any).firstName,
            lastName: (result.data!.user! as any).lastName,
            role: result.data!.user!.role,
        } : undefined,
    } as AuthApiResponse);
});

// Admin registration
router.post('/admin/register', validateAdminRegistration, async (req: Request, res: Response) => {
    const data: RegisterAdminRequest = req.body;

    const result = await authService.registerAdmin(data);

    if (!result.success) {
        const statusCode = result.error?.code || 500;
        return res.status(statusCode).json({
            success: false,
            error: result.error?.message || 'Admin registration failed',
        } as AuthApiResponse);
    }

    res.status(201).json({
        success: true,
        token: result.data!.token,
        admin: result.data!.admin ? {
            id: result.data!.admin!.id,
            username: result.data!.admin!.username,
            role: 'ADMIN',
        } : undefined,
    } as AuthApiResponse);
});

// Admin login
router.post('/admin/login', validateAdminLogin, async (req: Request, res: Response) => {
    const data: LoginAdminRequest = req.body;

    const result = await authService.loginAdmin(data);

    if (!result.success) {
        const statusCode = result.error?.code || 500;
        return res.status(statusCode).json({
            success: false,
            error: result.error?.message || 'Admin login failed',
        } as AuthApiResponse);
    }

    // Check if it's an admin or EC staff
    if (result.data!.admin) {
        // Admin user response
        res.status(200).json({
            success: true,
            token: result.data!.token,
            admin: {
                id: result.data!.admin!.id,
                username: result.data!.admin!.username,
                role: 'ADMIN',
            },
        } as AuthApiResponse);
    } else if (result.data!.ecStaff) {
        // EC staff response
        res.status(200).json({
            success: true,
            token: result.data!.token,
            user: {
                id: result.data!.ecStaff!.id,
                nationalId: (result.data!.ecStaff as any).national_id || (result.data!.ecStaff as any).nationalId,
                title: result.data!.ecStaff!.title,
                firstName: (result.data!.ecStaff as any).first_name || (result.data!.ecStaff as any).firstName,
                lastName: (result.data!.ecStaff as any).last_name || (result.data!.ecStaff as any).lastName,
                role: 'EC',
                email: result.data!.ecStaff!.email,
            },
        } as AuthApiResponse);
    } else {
        res.status(500).json({
            success: false,
            error: 'Invalid login response',
        } as AuthApiResponse);
    }
});

export default router;
