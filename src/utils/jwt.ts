import jwt, { SignOptions } from 'jsonwebtoken';
import { ErrorResponse } from './errorResponse';

interface TokenPayload {
    id: string;
}

export const generateToken = (payload: TokenPayload): string => {
    if (!process.env.JWT_SECRET) {
        throw new ErrorResponse('JWT_SECRET is not defined', 500);
    }

    const options: SignOptions = {
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '7') * 24 * 60 * 60 // Convert days to seconds
    };

    try {
        return jwt.sign(payload, process.env.JWT_SECRET, options);
    } catch (error) {
        throw new ErrorResponse('Error generating token', 500);
    }
};

export const verifyToken = (token: string): TokenPayload => {
    if (!process.env.JWT_SECRET) {
        throw new ErrorResponse('JWT_SECRET is not defined', 500);
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    } catch (error) {
        throw new ErrorResponse('Invalid token', 401);
    }
}; 