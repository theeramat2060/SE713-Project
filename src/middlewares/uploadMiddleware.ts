import multer from 'multer';
import type {Request} from 'express';

const storage = multer.memoryStorage();

interface CustomError extends Error {
    statusCode?: number;
}

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        const error: CustomError = new Error('Only image files are allowed');
        error.statusCode = 400;
        cb(error);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
