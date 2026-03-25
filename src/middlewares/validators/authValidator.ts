import type {Request, Response, NextFunction} from 'express';

interface ValidationError {
    field: string;
    message: string;
}

interface ValidationResult {
    success: boolean;
    errors?: ValidationError[];
}

const logValidationEvent = (event: string, data: Record<string, any>) => {
    console.log(`[VALIDATION] ${event}:`, {timestamp: new Date().toISOString(), ...data});
};

const validateUserRegistrationLogic = (data: any): ValidationResult => {
    const errors: ValidationError[] = [];

    if (!data.nationalId) {
        errors.push({field: 'nationalId', message: 'National ID is required'});
    } else if (data.nationalId.length !== 13) {
        errors.push({field: 'nationalId', message: 'National ID must be exactly 13 digits'});
    } else if (!/^\d+$/.test(data.nationalId)) {
        errors.push({field: 'nationalId', message: 'National ID must contain only numbers'});
    }

    if (!data.password) {
        errors.push({field: 'password', message: 'Password is required'});
    } else if (data.password.length < 6) {
        errors.push({field: 'password', message: 'Password must be at least 6 characters'});
    }

    if (!data.title) {
        errors.push({field: 'title', message: 'Title is required'});
    }

    if (!data.firstName) {
        errors.push({field: 'firstName', message: 'First name is required'});
    }

    if (!data.lastName) {
        errors.push({field: 'lastName', message: 'Last name is required'});
    }

    if (!data.address) {
        errors.push({field: 'address', message: 'Address is required'});
    }

    if (!data.constituencyId || !Number.isInteger(data.constituencyId)) {
        errors.push({field: 'constituencyId', message: 'Valid constituency ID is required'});
    }

    if (errors.length > 0) {
        logValidationEvent('USER_REGISTRATION_FAILED', {fieldCount: errors.length});
        return {success: false, errors};
    }

    logValidationEvent('USER_REGISTRATION_PASSED', {});
    return {success: true};
};

const validateUserLoginLogic = (data: any): ValidationResult => {
    const errors: ValidationError[] = [];

    if (!data.nationalId) {
        errors.push({field: 'nationalId', message: 'National ID is required'});
    } else if (data.nationalId.length !== 13) {
        errors.push({field: 'nationalId', message: 'National ID must be exactly 13 digits'});
    } else if (!/^\d+$/.test(data.nationalId)) {
        errors.push({field: 'nationalId', message: 'National ID must contain only numbers'});
    }

    if (!data.password) {
        errors.push({field: 'password', message: 'Password is required'});
    } else if (data.password.length < 6) {
        errors.push({field: 'password', message: 'Password must be at least 6 characters'});
    }

    if (errors.length > 0) {
        logValidationEvent('USER_LOGIN_FAILED', {fieldCount: errors.length});
        return {success: false, errors};
    }

    logValidationEvent('USER_LOGIN_PASSED', {});
    return {success: true};
};

const validateAdminRegistrationLogic = (data: any): ValidationResult => {
    const errors: ValidationError[] = [];

    if (!data.username) {
        errors.push({field: 'username', message: 'Username is required'});
    } else if (data.username.length < 3 || data.username.length > 50) {
        errors.push({field: 'username', message: 'Username must be between 3 and 50 characters'});
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
        errors.push({
            field: 'username',
            message: 'Username can only contain letters, numbers, underscores, and hyphens',
        });
    }

    if (!data.password) {
        errors.push({field: 'password', message: 'Password is required'});
    } else if (data.password.length < 8) {
        errors.push({field: 'password', message: 'Password must be at least 8 characters for admin accounts'});
    } else if (!/[A-Z]/.test(data.password)) {
        errors.push({field: 'password', message: 'Password must contain at least one uppercase letter'});
    } else if (!/[0-9]/.test(data.password)) {
        errors.push({field: 'password', message: 'Password must contain at least one number'});
    }

    if (errors.length > 0) {
        logValidationEvent('ADMIN_REGISTRATION_FAILED', {fieldCount: errors.length});
        return {success: false, errors};
    }

    logValidationEvent('ADMIN_REGISTRATION_PASSED', {});
    return {success: true};
};

const validateAdminLoginLogic = (data: any): ValidationResult => {
    const errors: ValidationError[] = [];

    if (!data.username) {
        errors.push({field: 'username', message: 'Username is required'});
    } else if (data.username.length < 3) {
        errors.push({field: 'username', message: 'Username is required'});
    }

    if (!data.password) {
        errors.push({field: 'password', message: 'Password is required'});
    } else if (data.password.length < 6) {
        errors.push({field: 'password', message: 'Password is required'});
    }

    if (errors.length > 0) {
        logValidationEvent('ADMIN_LOGIN_FAILED', {fieldCount: errors.length});
        return {success: false, errors};
    }

    logValidationEvent('ADMIN_LOGIN_PASSED', {});
    return {success: true};
};

export const validateUserRegistration = (req: Request, res: Response, next: NextFunction) => {
    const result = validateUserRegistrationLogic(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: result.errors,
        });
    }

    next();
};

export const validateUserLogin = (req: Request, res: Response, next: NextFunction) => {
    const result = validateUserLoginLogic(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: result.errors,
        });
    }

    next();
};

export const validateAdminRegistration = (req: Request, res: Response, next: NextFunction) => {
    const result = validateAdminRegistrationLogic(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: result.errors,
        });
    }

    next();
};

export const validateAdminLogin = (req: Request, res: Response, next: NextFunction) => {
    const result = validateAdminLoginLogic(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: result.errors,
        });
    }

    next();
};

export const validateECLogin = (req: Request, res: Response, next: NextFunction) => {
    const result = validateAdminLoginLogic(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: result.errors,
        });
    }

    next();
};