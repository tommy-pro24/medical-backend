import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller';

const router = Router();

router.post('/getData', getDashboardData);

export default router;