import mongoose, { Schema, Document, Types } from 'mongoose';

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface IOrder extends Document {
    clientId: Types.ObjectId;
    orderDate: Date;
    status: 'pending' | 'confirmed' | 'dispatched' | 'in-transit' | 'cancelled';
    items: OrderItem[];
    deliveryAgent?: string;
    deliveryDate?: Date;
    totalAmount: number;
}

const OrderItemSchema: Schema = new Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema<IOrder>({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'dispatched', 'in-transit', 'cancelled'],
        required: true,
    },
    items: { type: [OrderItemSchema], required: true },
    deliveryAgent: { type: String },
    deliveryDate: { type: Date },
    totalAmount: { type: Number, required: true },
}, {
    timestamps: true, // optional: adds createdAt and updatedAt
});

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
