import mongoose, { Schema, Document, Types } from 'mongoose';

export interface InventoryHistoryDetails {
    oldValue?: {
        stockLevel?: number;
        price?: number;
    };
    newValue?: {
        stockLevel?: number;
        price?: number;
    };
    quantity?: number;
    reference?: string;
}

export interface IHistory extends Document {
    productId: Types.ObjectId;
    productName: string;
    actionType: 'new' | 'update' | 'delete' | 'stock-in' | 'stock-out';
    timestamp: Date;
    userId: Types.ObjectId;
    userName: string;
    details: InventoryHistoryDetails;
}

const HistorySchema = new Schema<IHistory>(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Product',
            required: [true, 'productId is required'],
        },
        productName: {
            type: String,
            required: [true, 'productName is required'],
        },
        actionType: {
            type: String,
            enum: ['new', 'update', 'delete', 'stock-in', 'stock-out'],
            required: [true, 'actionType is required'],
            timestamp: {
                type: Date,
                default: Date.now,
            }
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User',
            required: [true, 'userId is required']
        },
        userName: {
            type: String,
            required: [true, 'userName is required']
        },
        details: {
            oldValue: {
                stockLevel: Number,
                price: Number,
            },
            newValue: {
                stockLevel: Number,
                price: Number,
            },
            quantity: Number,
            reference: String,
        },
    }, {
    timestamps: true, // optional: adds createdAt and updatedAt
})

export const History = mongoose.model<IHistory>('History', HistorySchema); 
