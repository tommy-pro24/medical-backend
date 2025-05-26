import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import historyRoutes from './history.routes';
import dashboardRoutes from './dashboard.routes';
import categoryRoutes from './category.routes';

const router = Router();

router.use('/auth', authRoutes);

router.use('/product', productRoutes);

router.use('/order', orderRoutes);

router.use('/history', historyRoutes);

router.use('/dashboard', dashboardRoutes);

router.use('/category', categoryRoutes);

export default router; 