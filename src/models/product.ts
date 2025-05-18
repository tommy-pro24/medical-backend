import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    category: string;
    stockNumber: number;
    description: string;
    price: number;
    image: string;
    lowStockThreshold: number;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'category is required'],
            trim: true,
        },
        stockNumber: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'price is required']
        },
        image: {
            type: String,
            trim: true,
        },
        lowStockThreshold: {
            type: Number,
            default: 0
        }
    }
)

export const Product = mongoose.model<IProduct>('Product', productSchema); 