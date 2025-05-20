import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './ourder.routes';

const router = Router();

router.use('/auth', authRoutes);

router.use('/product', productRoutes);

router.use('/order', orderRoutes);

export default router; 