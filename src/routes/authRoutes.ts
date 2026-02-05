import {Router} from 'express';
import * as authController from '../controllers/authController';
import {
    validateUserRegistration,
    validateUserLogin,
    validateAdminRegistration,
    validateAdminLogin
} from '../middlewares/validators/authValidator';

const router = Router();

// User routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);

// Admin routes
router.post('/admin/register', validateAdminRegistration, authController.adminRegister);
router.post('/admin/login', validateAdminLogin, authController.adminLogin);

export default router;
