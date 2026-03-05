// Auth Request DTOs
export interface RegisterUserRequest {
    nationalId: string;
    password: string;
    title: string;
    firstName: string;
    lastName: string;
    address: string;
    role?: 'VOTER' | 'EC';
    constituencyId: number;
}

export interface LoginUserRequest {
    nationalId: string;
    password: string;
}

export interface RegisterAdminRequest {
    username: string;
    password: string;
}

export interface LoginAdminRequest {
    username: string;
    password: string;
}

// Auth Response DTOs
export interface UserAuthResponse {
    id: string;
    nationalId: string;
    title: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface AdminAuthResponse {
    id: number;
    username: string;
}

export interface AuthTokenResponse {
    token: string;
    user?: UserAuthResponse;
    admin?: AdminAuthResponse;
}

export interface AuthApiResponse {
    success: boolean;
    token?: string;
    user?: UserAuthResponse;
    admin?: AdminAuthResponse;
    error?: string;
}

// Generic Service Result
export interface ServiceResult<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: number;
    };
}
