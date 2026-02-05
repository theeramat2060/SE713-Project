import type {Request, Response, NextFunction} from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code) {
        if (err.code === '23505') {
            return res.status(400).json({
                success: false,
                error: 'Duplicate entry exists',
                ...(err.detail && {details: err.detail}),
            });
        }

        if (err.code === '23503') {
            return res.status(400).json({
                success: false,
                error: 'Referenced record not found',
                ...(err.detail && {details: err.detail}),
            });
        }
    }

    console.error('Unhandled Error:', err);
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(err.details && {details: err.details}),
    });
};
