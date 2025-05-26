import { Router } from 'express';
import { addCategory, deleteCategory, getAllCategories, updateCategory } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/getAllCategories', authenticate, getAllCategories);

router.post('/updateCategory', authenticate, updateCategory);

router.post('/addCategory', authenticate, addCategory);

router.delete('/deleteCategory/:id', authenticate, deleteCategory);

export default router;