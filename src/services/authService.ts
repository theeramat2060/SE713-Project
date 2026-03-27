import bcrypt from 'bcryptjs';
import {generateToken} from '../utils/jwt';
import * as userRepository from '../repositories/userRepository';
import * as adminRepository from '../repositories/adminRepository';
import ecStaffRepository from '../repositories/ecStaffRepository';
import {
    RegisterUserRequest,
    LoginUserRequest,
    RegisterAdminRequest,
    LoginAdminRequest,
    AuthTokenResponse,
    ServiceResult,
    UserAuthResponse,
    AdminAuthResponse,
    ECStaffAuthResponse,
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
        data.constituencyId
    );

    const token = generateToken({
        userId: user.id,
        role: 'VOTER',
        constituencyId: user.constituency_id,
    });

    logAuthEvent('USER_REGISTERED', {userId: user.id, role: 'VOTER'});

    const userResponse: UserAuthResponse = {
        id: user.id,
        nationalId: user.national_id,
        title: user.title,
        firstName: user.first_name,
        lastName: user.last_name,
        address: user.address,
        constituencyId: user.constituency_id,
        role: 'VOTER',
    };

    return {
        success: true,
        data: {
            token,
            user: userResponse,
        },
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
        role: 'VOTER',
        constituencyId: user.constituency_id,
    });

    logAuthEvent('USER_LOGIN', {userId: user.id, role: 'VOTER'});

    const userResponse: UserAuthResponse = {
        id: user.id,
        nationalId: user.national_id,
        title: user.title,
        firstName: user.first_name,
        lastName: user.last_name,
        address: user.address,
        constituencyId: user.constituency_id,
        role: 'VOTER',
    };

    return {
        success: true,
        data: {
            token,
            user: userResponse,
        },
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
        const adminResponse: AdminAuthResponse = {
            id: admin.id,
            username: admin.username,
        };
        return {
            success: true,
            data: {token, admin: adminResponse},
        };
    }

    // If not found as admin, try to find as EC staff by national ID
    const ecStaff = await ecStaffRepository.findByNationalId(data.username);

    if (!ecStaff) {
        logAuthEvent('ADMIN_LOGIN_FAILED', {reason: 'Invalid credentials', username: data.username});
        return {
            success: false,
            error: {
                message: 'Invalid credentials',
                code: 401,
            },
        };
    }

    // Check if EC staff is active
    if (ecStaff.status !== 'ACTIVE') {
        logAuthEvent('ADMIN_LOGIN_FAILED', {reason: 'EC Staff account inactive', ecStaffId: ecStaff.id});
        return {
            success: false,
            error: {
                message: 'Account is inactive',
                code: 403,
            },
        };
    }

    // EC staff found, validate password
    const isPasswordValid = await bcrypt.compare(data.password, ecStaff.password);

    if (!isPasswordValid) {
        logAuthEvent('ADMIN_LOGIN_FAILED', {reason: 'Invalid password', ecStaffId: ecStaff.id});
        return {
            success: false,
            error: {
                message: 'Invalid credentials',
                code: 401,
            },
        };
    }

    const token = generateToken({
        ecStaffId: ecStaff.id,
        role: 'EC',
        constituencyId: ecStaff.constituency_id,
    });

    logAuthEvent('EC_LOGIN', {ecStaffId: ecStaff.id, role: 'EC'});
    const ecStaffResponse: ECStaffAuthResponse = {
        id: ecStaff.id,
        nationalId: ecStaff.national_id,
        title: ecStaff.title,
        firstName: ecStaff.first_name,
        lastName: ecStaff.last_name,
        email: ecStaff.email || undefined,
        status: ecStaff.status,
        constituencyId: ecStaff.constituency_id,
        role: 'EC',
    };
    return {
        success: true,
        data: {token, ecStaff: ecStaffResponse},
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

    logAuthEvent('GET_USER', {userId: user.id});
    return {
        success: true,
        data: {
            id: user.id,
            nationalId: user.national_id,
            title: user.title,
            firstName: user.first_name,
            lastName: user.last_name,
            address: user.address,
            constituencyId: user.constituency_id,
            role: 'VOTER',
        },
    };
};

export const getCurrentECStaff = async (ecStaffId: string): Promise<ServiceResult<any>> => {
    const ecStaff = await ecStaffRepository.findById(ecStaffId);

    if (!ecStaff) {
        logAuthEvent('GET_EC_STAFF_FAILED', {reason: 'EC Staff not found', ecStaffId});
        return {
            success: false,
            error: {
                message: 'EC Staff not found',
                code: 404,
            },
        };
    }

    logAuthEvent('GET_EC_STAFF', {ecStaffId: ecStaff.id, role: 'EC'});
    return {
        success: true,
        data: {
            id: ecStaff.id,
            nationalId: ecStaff.national_id,
            title: ecStaff.title,
            firstName: ecStaff.first_name,
            lastName: ecStaff.last_name,
            email: ecStaff.email,
            role: 'EC',
            constituencyId: ecStaff.constituency_id,
            status: ecStaff.status,
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
