import {verifyToken} from '../utils/jwt';

interface TokenPayload {
    userId?: string;
    adminId?: number;
    role: string;
    constituencyId?: number;
}

interface VerifyResult {
    success: boolean;
    data?: TokenPayload;
    error?: {
        message: string;
        code: number;
    };
}

interface RoleCheckResult {
    success: boolean;
    error?: {
        message: string;
        code: number;
    };
}

const logAuthEvent = (event: string, data: Record<string, any>) => {
    console.log(`[TOKEN] ${event}:`, {timestamp: new Date().toISOString(), ...data});
};

export const verifyAuthToken = (authHeader: string): VerifyResult => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logAuthEvent('VERIFY_FAILED', {reason: 'No token provided'});
        return {
            success: false,
            error: {
                message: 'No token provided',
                code: 401,
            },
        };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        logAuthEvent('VERIFY_FAILED', {reason: 'Malformed authorization header'});
        return {
            success: false,
            error: {
                message: 'No token provided',
                code: 401,
            },
        };
    }

    try {
        const decoded = verifyToken(token);
        logAuthEvent('TOKEN_VERIFIED', {role: decoded.role});
        return {
            success: true,
            data: decoded,
        };
    } catch (error) {
        logAuthEvent('VERIFY_FAILED', {reason: 'Invalid or expired token'});
        return {
            success: false,
            error: {
                message: 'Invalid or expired token',
                code: 401,
            },
        };
    }
};

export const checkUserRole = (userRole: string | undefined, requiredRoles: string[]): RoleCheckResult => {
    if (!userRole) {
        logAuthEvent('ROLE_CHECK_FAILED', {reason: 'No user context'});
        return {
            success: false,
            error: {
                message: 'Unauthorized',
                code: 401,
            },
        };
    }

    if (!requiredRoles.includes(userRole)) {
        logAuthEvent('ROLE_CHECK_FAILED', {reason: 'Insufficient permissions', userRole, requiredRoles});
        return {
            success: false,
            error: {
                message: 'You do not have permission to perform this action',
                code: 403,
            },
        };
    }

    logAuthEvent('ROLE_CHECK_PASSED', {userRole});
    return {
        success: true,
    };
};
