// Generic Service Result
export interface ServiceResult<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: number;
    };
}

// Admin Request DTOs (for future use)
export interface AdminActionRequest {
    [key: string]: any;
}

// Admin Response DTOs
export interface AdminActionResponse {
    success: boolean;
    message: string;
}


export interface CreateNewUserRequest {
    password: string;
    national_id: string;
    role: string;
    title: string;
    first_name: string;
    last_name: string;
    address: string;
    constitency_id: number;
}


export interface AddConstituencyRequest {
    province: string;
    district_number: number;
    is_closed: boolean;
}

export interface RemoveConstituencyRequest {
    province: string;
    district_number: number;
}

export interface ChangeUserRoleRequest {
    userId: string;
    newRole: string;
}