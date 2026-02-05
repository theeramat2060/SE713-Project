import {Router} from 'express';
import authRoutes from './authRoutes';
import publicRoutes from './publicRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);

export default router;

