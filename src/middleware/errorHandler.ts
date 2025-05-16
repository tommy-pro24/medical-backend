import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/errorResponse';

export const errorHandler = (
    err: Error | ErrorResponse,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('Error:', err);

    if (err instanceof ErrorResponse) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
        return;
    }

    // Handle other types of errors
    res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}; 