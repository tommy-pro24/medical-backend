import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getHistory } from '../controllers/history.controller';

const router = Router();

router.post('/getHistories', authenticate, getHistory);

export default router;