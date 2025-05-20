import { User } from '../models/User';
import { Request, Response } from 'express';
import { ErrorResponse } from '../utils/errorResponse';
import { OrderModel, IOrder } from '../models/order';
import { IUser } from '../models/User';

interface PopulatedOrder extends Omit<IOrder, 'clientId'> {
    clientId: IUser;
}

export const getOrders = async (req: Request, res: Response): Promise<any> => {
    try {


        const user = await User.findById(req.user._id);

        if (!user) return null;

        let orders;
        if (user.role === 'client') {
            orders = await OrderModel.find({ clientId: user._id }).populate('clientId', 'name') as PopulatedOrder[];
        } else {
            orders = await OrderModel.find().populate('clientId', 'name') as PopulatedOrder[];
        }

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