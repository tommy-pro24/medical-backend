import { User } from '../models/User';
import { OrderModel, IOrder } from '../models/order';
import { IUser } from '../models/User';

interface PopulatedOrder extends Omit<IOrder, 'clientId'> {
    clientId: IUser;
}

export const getOrders = async (id: any): Promise<any> => {
    try {
        const user = await User.findById(id);
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
            deliveryAgent: order.deliveryAgent,
            deliveryDate: order.deliveryDate,
            totalAmount: order.totalAmount
        }));

        return formattedOrders;
    } catch (error) {
        console.log(error);
        return null;
    }
}