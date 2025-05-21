import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { getAllUsers } from '../controllers/auth.controller';
import { updateUser } from '../controllers/auth.controller';

const router = Router();

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('name').notEmpty().withMessage('Name is required'),
        validateRequest,
    ],
    register
);

// Login route
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
        validateRequest,
    ],
    login
);

router.post('/profile', getProfile);

router.post('/getAllUsers', authenticate, getAllUsers);

router.post('/updateUser', authenticate, updateUser);

export default router; 