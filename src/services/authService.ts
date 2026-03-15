import bcrypt from 'bcryptjs';
import {generateToken} from '../utils/jwt';
import * as userRepository from '../repositories/userRepository';
import * as adminRepository from '../repositories/adminRepository';
import {
    RegisterUserRequest,
    LoginUserRequest,
    RegisterAdminRequest,
    LoginAdminRequest,
    AuthTokenResponse,
    ServiceResult
} from '../dto/authDTO';

const SALT_ROUNDS = 10;

const logAuthEvent = (event: string, data: Record<string, any>) => {
    console.log(`[AUTH] ${event}:`, {timestamp: new Date().toISOString(), ...data});
};

export const registerUser = async (data: RegisterUserRequest): Promise<ServiceResult<AuthTokenResponse>> => {
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
        data.role || 'VOTER',
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
        // @ts-ignore
        data: {token, user},
    };
};

export const loginUser = async (data: LoginUserRequest): Promise<ServiceResult<AuthTokenResponse>> => {
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
        // @ts-ignore
        data: {token, user},
    };
};

export const registerAdmin = async (data: RegisterAdminRequest): Promise<ServiceResult<AuthTokenResponse>> => {
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

export const loginAdmin = async (data: LoginAdminRequest): Promise<ServiceResult<AuthTokenResponse>> => {
    // First try to find Admin user by username
    let admin = await adminRepository.findAdminByUsername(data.username);

    if (admin) {
        // Admin user found
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
    }

    // If not found as admin, try to find as EC user by national ID
    const ecUser = await userRepository.findUserByNationalId(data.username);

    if (!ecUser || ecUser.role !== 'EC') {
        logAuthEvent('ADMIN_LOGIN_FAILED', {reason: 'Invalid credentials', username: data.username});
        return {
            success: false,
            error: {
                message: 'Invalid credentials',
                code: 401,
            },
        };
    }

    // EC user found, validate password
    const isPasswordValid = await bcrypt.compare(data.password, ecUser.password);

    if (!isPasswordValid) {
        logAuthEvent('ADMIN_LOGIN_FAILED', {reason: 'Invalid password', userId: ecUser.id});
        return {
            success: false,
            error: {
                message: 'Invalid credentials',
                code: 401,
            },
        };
    }

    const token = generateToken({
        userId: ecUser.id,
        role: ecUser.role,
        constituencyId: ecUser.constituency_id,
    });

    logAuthEvent('EC_LOGIN', {userId: ecUser.id, role: ecUser.role});
    return {
        success: true,
        // @ts-ignore
        data: {token, user: ecUser},
    };
};

export const getCurrentUser = async (userId: string): Promise<ServiceResult<any>> => {
    const user = await userRepository.getUserById(userId);

    if (!user) {
        logAuthEvent('GET_USER_FAILED', {reason: 'User not found', userId});
        return {
            success: false,
            error: {
                message: 'User not found',
                code: 404,
            },
        };
    }

    logAuthEvent('GET_USER', {userId: user.id, role: user.role});
    return {
        success: true,
        data: {
            id: user.id,
            nationalId: user.national_id,
            title: user.title,
            firstName: user.first_name,
            lastName: user.last_name,
            address: user.address,
            role: user.role,
            constituencyId: user.constituency_id,
        },
    };
};

export const getCurrentAdmin = async (adminId: number): Promise<ServiceResult<any>> => {
    const admin = await adminRepository.getAdminById(adminId);

    if (!admin) {
        logAuthEvent('GET_ADMIN_FAILED', {reason: 'Admin not found', adminId});
        return {
            success: false,
            error: {
                message: 'Admin not found',
                code: 404,
            },
        };
    }

    logAuthEvent('GET_ADMIN', {adminId: admin.id});
    return {
        success: true,
        data: {
            id: admin.id,
            username: admin.username,
        },
    };
};
