import {Router} from 'express';
import authRoutes from './authRoutes';
import publicRoutes from './publicRoutes';
import voteRoutes from './voteRoutes';
import ecRoutes from './ecRoutes';
import { Admin } from '../models';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/ec', ecRoutes);
router.use('/admin',adminRoutes);

router.use('/election', voteRoutes);

export default router;