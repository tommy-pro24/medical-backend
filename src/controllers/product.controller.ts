import { Request, Response } from 'express';
import { ErrorResponse } from '../utils/errorResponse';
import { Product } from '../models/product';
import { User } from '../models/User';

export const updateStock = async (req: Request, res: Response): Promise<any> => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        if (user.role !== 'admin') {
            throw new ErrorResponse('Unauthorized user', 403);
        }

        const { id, newStock } = req.body;

        await Product.findByIdAndUpdate(
            id,
            { stockNumber: newStock },
            { new: true }
        );

        res.status(200);

    } catch (error) {

        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }

    }

}

export const addNewProduct = async (req: Request, res: Response): Promise<any> => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        if (user.role !== 'admin') {
            throw new ErrorResponse('Unauthorized user', 403);
        }

        const { name, category, description, price, stockLevel, lowStockThreshold } = req.body;

        await Product.create({
            name: name,
            category: category,
            stockNumber: stockLevel,
            description: description,
            price: price,
            lowStockThreshold: lowStockThreshold
        });

        return res.status(200);

    } catch (error) {

        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }

    }

}