/**
 * Standard error handling interface for typed errors
 */
export interface AppError extends Error {
    message: string;
    code?: number;
}

/**
 * Type guard to check if error is an AppError
 */
export const isAppError = (error: unknown): error is AppError => {
    return error instanceof Error;
};

/**
 * Extract error message from unknown error type
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Internal server error';
};

/**
 * Extract error code from error object
 */
export const getErrorCode = (error: unknown): number => {
    if (error instanceof Error && 'code' in error && typeof (error as any).code === 'number') {
        return (error as any).code;
    }
    return 500;
};
