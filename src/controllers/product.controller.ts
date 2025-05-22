import { Request, Response } from 'express';
import { ErrorResponse } from '../utils/errorResponse';
import { Product } from '../models/product';
import { User } from '../models/User';
import { History } from '../models/history';

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

        const product: any = await Product.findById(id);

        await History.create({
            productId: id,
            productName: product?.name,
            actionType: 'stock-in',
            userId: user._id,
            userName: user.name + "(Admin)",
            details: {
                oldValue: {
                    stockLevel: product?.stockNumber,
                    price: product?.price
                },
                newValue: {
                    stockLevel: newStock,
                    price: product?.price
                },
                quantity: newStock - product?.stockNumber,
                reference: 'Emergency Stock Replenishment'
            }
        })

        await Product.findByIdAndUpdate(
            id,
            { stockNumber: newStock },
            { new: true }
        );

        res.status(200);

    } catch (error) {

        console.log(error);

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

        if (!user) throw new ErrorResponse('User not found', 404);
        if (user.role !== 'admin') throw new ErrorResponse('Unauthorized user', 403);

        let { name, category, description, price, stockNumber, lowStockThreshold } = req.body;

        // Capitalize first letter
        name = name.charAt(0).toUpperCase() + name.slice(1);
        description = description.charAt(0).toUpperCase() + description.slice(1);

        const data = await Product.create({
            name,
            category,
            stockNumber,
            description,
            price,
            lowStockThreshold
        });

        await History.create({
            productId: data._id,
            productName: data.name,
            actionType: 'new',
            timestamp: new Date(),
            userId: user._id,
            userName: user.name + " (Admin)",
            details: {
                newValue: {
                    stockLevel: stockNumber,
                    price: price * stockNumber
                },
                reference: "Add new product"
            },
        });

        return res.status(200).json(data);

    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
}

export const getAllProduct = async (_req: Request, res: Response): Promise<any> => {

    try {

        const data = await Product.find();

        return res.status(200).json(data);

    } catch (error) {

        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }

    }

}

export const updateProduct = async (req: Request, res: Response): Promise<any> => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        if (user.role !== 'admin') {
            throw new ErrorResponse('Unauthorized user', 403);
        }

        const { _id, name, category, description, price, stockNumber, lowStockThreshold } = req.body;

        await Product.findByIdAndUpdate(_id, {
            name, category, description, price, stockNumber, lowStockThreshold,
        },
            {
                new: true
            }
        );

        return res.status(200);


    } catch (error) {

        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }

    }

}
