import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { ErrorResponse } from '../utils/errorResponse';

export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, password, phone } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            throw new ErrorResponse('User already exists', 400);
        }

        await User.create({
            name,
            email,
            password,
            phone,
        });

        res.status(201).json({
            message: 'success'
        });

    } catch (error) {

        if (error.code === 11000) {
            const duplicatedField = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                message: `${duplicatedField} already exists.`
            });
        }

        if (error instanceof ErrorResponse) {
            return res.status(error.statusCode).json({ message: error.message });
        } else {
            return res.status(500).json({ message: 'Server error' });
        }
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw new ErrorResponse('Invalid credentials', 401);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new ErrorResponse('Invalid credentials', 401);
        }

        if (user.status === 'unverify') {
            throw new ErrorResponse('Unverify email', 401);
        }

        const token = generateToken({ id: user._id.toString() });

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token,
        });
    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }
        res.json(user);
    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
}; 