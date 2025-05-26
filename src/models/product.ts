import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    category: Types.ObjectId;
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
            type: mongoose.Schema.ObjectId, ref: 'product',
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
    }, {
    timestamps: true, // optional: adds createdAt and updatedAt
})

export const Product = mongoose.model<IProduct>('Product', productSchema); 