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
