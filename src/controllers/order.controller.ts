import { User } from '../models/User';
import { Request, Response } from 'express';
import { ErrorResponse } from '../utils/errorResponse';
import { OrderModel, IOrder } from '../models/order';
import { IUser } from '../models/User';
import { Product } from '../models/product';
import { History } from '../models/history';

interface PopulatedOrder extends Omit<IOrder, 'clientId'> {
    clientId: IUser;
}

export const getOrders = async (req: Request, res: Response): Promise<any> => {
    try {

        const { from, to } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return null;

        let query: any = {};

        // Filter by user role
        if (user.role === 'client') {
            query.clientId = user._id;
        }

        console.log(from);

        // Filter by date range (if provided)
        if (from) {
            query.orderDate = {
                $gte: new Date(from),
                ...(to && { $lte: new Date(to) })
            };
        }

        const orders = await OrderModel.find(query)
            .populate('clientId', 'name')
            .sort({ createdAt: -1 })
            .lean() as PopulatedOrder[];

        const formattedOrders = orders.map(order => ({
            id: order._id.toString(),
            clientId: order.clientId._id.toString(),
            clientName: order.clientId.name,
            orderDate: order.orderDate,
            status: order.status,
            items: order.items,
            deliveryAgent: order.deliveryAgent || null,
            deliveryDate: order.deliveryDate || null,
            totalAmount: order.totalAmount
        }));

        return res.status(200).json(formattedOrders);

    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
}

export const setNewOrder = async (user: any, data: any): Promise<any> => {
    try {
        const orderItems = data.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice
        }));

        const totalAmount = orderItems.reduce((sum: any, item: any) => {
            return sum + item.quantity * item.unitPrice;
        }, 0);

        const newOrder = await OrderModel.create({
            clientId: user._id,
            orderDate: new Date(),
            status: 'pending',
            items: orderItems,
            totalAmount
        });

        // Get all products and update their stock
        const products = await Product.find({
            _id: { $in: data.map((item: any) => item.productId) }
        });

        // Create history records and update stock
        await Promise.all(
            products.map(async (product) => {
                const orderItem = data.find((item: any) => item.productId === product._id.toString());
                if (!orderItem) return;

                // Create history record
                await History.create({
                    productId: product._id,
                    productName: product.name,
                    actionType: 'stock-out',
                    timestamp: new Date(),
                    userId: user._id,
                    userName: user.name,
                    details: {
                        oldValue: {
                            stockLevel: product.stockNumber,
                            price: product.price
                        },
                        newValue: {
                            stockLevel: product.stockNumber - orderItem.quantity,
                            price: product.price
                        },
                        quantity: orderItem.quantity,
                        reference: `Order ID: ${newOrder._id}`
                    }
                });

                // Update product stock
                return Product.updateOne(
                    { _id: product._id },
                    { $inc: { stockNumber: -orderItem.quantity } }
                );
            })
        );

        return {
            id: newOrder._id.toString(),
            clientId: user._id.toString(),
            clientName: user.name,
            orderDate: new Date(),
            status: 'pending',
            items: orderItems,
            totalAmount
        };

    } catch (error) {
        console.log(error);
        return null;
    }
}

export const updateOrderStatus = async (data: { id: any; newStatus: any; }): Promise<any> => {

    try {

        const order = await OrderModel.findByIdAndUpdate(data.id, { status: data.newStatus }, { new: true });

        if (order) return order.clientId;
        return null;
    } catch (error) {
        console.log(error);
        return null;
    }

}
