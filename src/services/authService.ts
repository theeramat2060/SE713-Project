import bcrypt from 'bcryptjs';
import {generateToken} from '../utils/jwt';
import * as userRepository from '../repositories/userRepository';
import * as adminRepository from '../repositories/adminRepository';
import type {User, Admin} from '../types/models';

interface RegisterUserDTO {
    nationalId: string;
    password: string;
    title: string;
    firstName: string;
    lastName: string;
    address: string;
    role: 'VOTER' | 'EC';
    constituencyId: number;
}

interface LoginUserDTO {
    nationalId: string;
    password: string;
}

interface RegisterAdminDTO {
    username: string;
    password: string;
}

interface LoginAdminDTO {
    username: string;
    password: string;
}

interface AuthToken {
    token: string;
    user?: User;
    admin?: Admin;
}

interface AuthResult<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: number;
    };
}

const SALT_ROUNDS = 10;

const logAuthEvent = (event: string, data: Record<string, any>) => {
    console.log(`[AUTH] ${event}:`, {timestamp: new Date().toISOString(), ...data});
};

export const registerUser = async (data: RegisterUserDTO): Promise<AuthResult<AuthToken>> => {
    const existingUser = await userRepository.findUserByNationalId(data.nationalId);

    if (existingUser) {
        logAuthEvent('REGISTER_FAILED', {reason: 'User already exists', nationalId: data.nationalId});
        return {
            success: false,
            error: {
                message: 'User with this national ID already exists',
                code: 409,
            },
        };
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await userRepository.createUser(
        data.nationalId,
        hashedPassword,
        data.title,
        data.firstName,
        data.lastName,
        data.address,
        data.role,
        data.constituencyId
    );

    const token = generateToken({
        userId: user.id,
        role: user.role,
        constituencyId: user.constituency_id,
    });

    logAuthEvent('USER_REGISTERED', {userId: user.id, role: user.role});
    return {
        success: true,
        data: {token, user},
    };
};

export const loginUser = async (data: LoginUserDTO): Promise<AuthResult<AuthToken>> => {
    const user = await userRepository.findUserByNationalId(data.nationalId);

    if (!user) {
        logAuthEvent('LOGIN_FAILED', {reason: 'Invalid credentials', nationalId: data.nationalId});
        return {
            success: false,
            error: {
                message: 'Invalid credentials',
                code: 401,
            },
        };
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
        logAuthEvent('LOGIN_FAILED', {reason: 'Invalid password', userId: user.id});
        return {
            success: false,
            error: {
                message: 'Invalid credentials',
                code: 401,
            },
        };
    }

    const token = generateToken({
        userId: user.id,
        role: user.role,
        constituencyId: user.constituency_id,
    });

    logAuthEvent('USER_LOGIN', {userId: user.id, role: user.role});
    return {
        success: true,
        data: {token, user},
    };
};

export const registerAdmin = async (data: RegisterAdminDTO): Promise<AuthResult<AuthToken>> => {
    const existingAdmin = await adminRepository.findAdminByUsername(data.username);

    if (existingAdmin) {
        logAuthEvent('ADMIN_REGISTER_FAILED', {reason: 'Admin already exists', username: data.username});
        return {
            success: false,
            error: {
                message: 'Admin with this username already exists',
                code: 409,
            },
        };
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const admin = await adminRepository.createAdmin(data.username, hashedPassword);

    const token = generateToken({
        adminId: admin.id,
        role: 'ADMIN',
    });

    logAuthEvent('ADMIN_REGISTERED', {adminId: admin.id});
    return {
        success: true,
        data: {token, admin},
    };
};

export const loginAdmin = async (data: LoginAdminDTO): Promise<AuthResult<AuthToken>> => {
    const admin = await adminRepository.findAdminByUsername(data.username);

    if (!admin) {
        logAuthEvent('ADMIN_LOGIN_FAILED', {reason: 'Invalid credentials', username: data.username});
        return {
            success: false,
            error: {
                message: 'Invalid credentials',
                code: 401,
            },
        };
    }

    const isPasswordValid = await bcrypt.compare(data.password, admin.password);

    if (!isPasswordValid) {
        logAuthEvent('ADMIN_LOGIN_FAILED', {reason: 'Invalid password', adminId: admin.id});
        return {
            success: false,
            error: {
                message: 'Invalid credentials',
                code: 401,
            },
        };
    }

    const token = generateToken({
        adminId: admin.id,
        role: 'ADMIN',
    });

    logAuthEvent('ADMIN_LOGIN', {adminId: admin.id});
    return {
        success: true,
        data: {token, admin},
    };
};
