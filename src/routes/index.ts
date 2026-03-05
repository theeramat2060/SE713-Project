import e, {Router} from 'express';
import authRoutes from './authRoutes';
import publicRoutes from './publicRoutes';
import ecRoutes from './ecRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/ec', ecRoutes);


export default router;