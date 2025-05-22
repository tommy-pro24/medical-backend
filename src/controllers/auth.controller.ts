import { Request, Response } from 'express';
import { User } from '../models/User';
import { OrderModel } from '../models/order';
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
        const { id } = req.body;

        const user = await User.findById(id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        const token = generateToken({ id: user._id.toString() });

        let status = 'no';

        if (user.role === 'admin') status = 'pending';
        else if (user.role === 'warehouse') status = 'dispatched';

        const count = await OrderModel.countDocuments({ status: status });


        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token
            },
            count
        });

    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<any> => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        if (user.role === 'client') {
            throw new ErrorResponse('Unauthorized user', 403);
        }

        const users = await User.find().select('name email role _id');

        const formattedUsers = users.map(user => ({
            name: user.name,
            email: user.email,
            role: user.role,
            _id: user._id.toString(), // converts ObjectId to string
        }));


        return res.status(200).json(formattedUsers);

    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }

}

export const updateUser = async (req: Request, res: Response): Promise<any> => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }
        if (user.role === 'client') {
            throw new ErrorResponse('Unauthorized user', 403);
        }

        const { _id, name, email, role } = req.body;

        await User.findByIdAndUpdate(
            _id,
            {
                name: name,
                email: email,
                role: role
            },
            { new: true }
        );

        return res.status(200).send();

    } catch (error) {

        console.log(error);

        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }

}

export const updateProfile = async (req: Request, res: Response): Promise<any> => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        const { name, email, phone } = req.body;

        await User.findByIdAndUpdate(
            user._id,
            {
                name: name,
                email: email,
                phone: phone
            },
            {
                new: true
            }
        )

        return res.status(200).send();

    } catch (error) {
        console.log(error);

        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }

}

export const updatePassword = async (req: Request, res: Response): Promise<any> => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        const { currentPassword, newPassword } = req.body;

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            throw new ErrorResponse('Invalid password', 401);
        }

        await User.findByIdAndUpdate(
            user._id,
            {
                password: newPassword
            },
            { new: true }
        )

        return res.status(200).send();


    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }

}