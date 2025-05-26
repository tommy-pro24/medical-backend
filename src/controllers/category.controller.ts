import { Request, Response } from 'express';
import { ErrorResponse } from '../utils/errorResponse';
import { User } from '../models/User';
import { Category } from '../models/category';

export const getAllCategories = async (req: Request, res: Response): Promise<any> => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        const categories = await Category.find({});

        return res.status(200).json({ data: categories });


    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }

}

export const updateCategory = async (req: Request, res: Response): Promise<any> => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        if (user.role !== 'admin') {
            throw new ErrorResponse('Unauthorized user', 403);
        }

        const { selectedCategory } = req.body;

        if (!selectedCategory) {
            return res.status(400).json({ message: "Missing selectedCategory" });
        }

        const updateData = await Category.findByIdAndUpdate(
            selectedCategory._id,
            {
                name: selectedCategory.name,
                description: selectedCategory.description
            },
            {
                new: true
            }
        )

        return res.status(200).json(updateData);

    } catch (error) {

        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }

}

export const addCategory = async (req: Request, res: Response): Promise<any> => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        if (user.role !== 'admin') {
            throw new ErrorResponse('Unauthorized user', 403);
        }

        const { newCategory } = req.body;

        const newData = await Category.create({
            name: newCategory.name,
            description: newCategory.description
        });

        return res.status(200).json(newData);

    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }

}

export const deleteCategory = async (req: Request, res: Response): Promise<any> => {

    try {

        const categoryId = req.params.id;

        const deleted = await Category.findByIdAndDelete(categoryId);

        if (!deleted) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.status(200).json({ message: 'Category deleted successfully' });

    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }

}