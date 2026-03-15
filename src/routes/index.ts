import {Router} from 'express';
import authRoutes from './authRoutes';
import publicRoutes from './publicRoutes';
import voteRoutes from './voteRoutes';
import ecRoutes from './ecRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/ec', ecRoutes);

router.use('/election', voteRoutes);

export default router;