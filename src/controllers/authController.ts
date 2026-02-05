import type {Request, Response} from 'express';
import * as authService from '../services/authService';

interface AuthResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        nationalId: string;
        title: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    admin?: {
        id: number;
        username: string;
    };
    error?: string;
}

export const register = async (req: Request, res: Response) => {
    const {
        nationalId,
        password,
        title,
        firstName,
        lastName,
        address,
        role = 'VOTER',
        constituencyId,
    } = req.body;

    const result = await authService.registerUser({
        nationalId,
        password,
        title,
        firstName,
        lastName,
        address,
        role,
        constituencyId,
    });

    if (!result.success) {
        const statusCode = result.error?.code || 500;
        return res.status(statusCode).json({
            success: false,
            error: result.error?.message || 'Registration failed',
        });
    }

    const response: AuthResponse = {
        success: true,
        token: result.data!.token,
        user: {
            id: result.data!.user!.id,
            nationalId: result.data!.user!.national_id,
            title: result.data!.user!.title,
            firstName: result.data!.user!.first_name,
            lastName: result.data!.user!.last_name,
            role: result.data!.user!.role,
        },
    };

    res.status(201).json(response);
};

export const login = async (req: Request, res: Response) => {
    const {nationalId, password} = req.body;

    const result = await authService.loginUser({nationalId, password});

    if (!result.success) {
        const statusCode = result.error?.code || 500;
        return res.status(statusCode).json({
            success: false,
            error: result.error?.message || 'Login failed',
        });
    }

    const response: AuthResponse = {
        success: true,
        token: result.data!.token,
        user: {
            id: result.data!.user!.id,
            nationalId: result.data!.user!.national_id,
            title: result.data!.user!.title,
            firstName: result.data!.user!.first_name,
            lastName: result.data!.user!.last_name,
            role: result.data!.user!.role,
        },
    };

    res.status(200).json(response);
};

export const adminRegister = async (req: Request, res: Response) => {
    const {username, password} = req.body;

    const result = await authService.registerAdmin({username, password});

    if (!result.success) {
        const statusCode = result.error?.code || 500;
        return res.status(statusCode).json({
            success: false,
            error: result.error?.message || 'Admin registration failed',
        });
    }

    const response: AuthResponse = {
        success: true,
        token: result.data!.token,
        admin: {
            id: result.data!.admin!.id,
            username: result.data!.admin!.username,
        },
    };

    res.status(201).json(response);
};

export const adminLogin = async (req: Request, res: Response) => {
    const {username, password} = req.body;

    const result = await authService.loginAdmin({username, password});

    if (!result.success) {
        const statusCode = result.error?.code || 500;
        return res.status(statusCode).json({
            success: false,
            error: result.error?.message || 'Admin login failed',
        });
    }

    const response: AuthResponse = {
        success: true,
        token: result.data!.token,
        admin: {
            id: result.data!.admin!.id,
            username: result.data!.admin!.username,
        },
    };

    res.status(200).json(response);
};
