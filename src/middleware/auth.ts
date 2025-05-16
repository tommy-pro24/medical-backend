import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { verifyToken } from '../utils/jwt';
import { ErrorResponse } from '../utils/errorResponse';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new ErrorResponse('No token, authorization denied', 401);
        }

        // Verify token
        const decoded = verifyToken(token);

        // Get user from database
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            throw new ErrorResponse('Token is not valid', 401);
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(401).json({ message: 'Token is not valid' });
        }
    }
}; 