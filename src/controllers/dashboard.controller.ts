import { ErrorResponse } from '../utils/errorResponse';
import { OrderModel } from '../models/order';
import { Product } from '../models/product';
import { History } from '../models/history';
import { Request, Response } from 'express';

type OrderStatus = 'pending' | 'dispatched' | 'transit' | 'confirmed' | 'cancelled';
type StockAction = 'stock-in' | 'stock-out';

export const getDashboardData = async (req: Request, res: Response): Promise<any> => {
    try {
        const { from, to } = req.body;

        // Get total product type count
        const totalProductTypes = await Product.countDocuments();

        // Get total product count (sum of stockNumber for all products)
        const totalProducts = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$stockNumber" }
                }
            }
        ]);

        // Get low stock product types count
        const lowStockProductTypes = await Product.countDocuments({
            $expr: { $lte: ["$stockNumber", "$lowStockThreshold"] }
        });

        // Get order status counts
        const orderStatusCounts = await OrderModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert array to object with default values
        const orderCounts: Record<OrderStatus, number> = {
            pending: 0,
            dispatched: 0,
            transit: 0,
            confirmed: 0,
            cancelled: 0
        };

        // Fill in actual counts
        orderStatusCounts.forEach(status => {
            if (status._id in orderCounts) {
                orderCounts[status._id as OrderStatus] = status.count;
            }
        });

        // Get stock-in and stock-out quantities and type counts from history
        const stockInOutCounts = await History.aggregate([
            {
                $match: {
                    actionType: { $in: ['stock-in', 'stock-out'] },
                    createdAt: {
                        $gte: new Date(from),
                        $lte: new Date(to)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        actionType: "$actionType",
                        productId: "$productId"
                    },
                    quantity: { $sum: "$details.quantity" }
                }
            },
            {
                $group: {
                    _id: "$_id.actionType",
                    totalQuantity: { $sum: "$quantity" },
                    typeCount: { $sum: 1 }
                }
            }
        ]);

        // Initialize stock counts
        const stockCounts: Record<StockAction, { quantity: number; typeCount: number }> = {
            'stock-in': { quantity: 0, typeCount: 0 },
            'stock-out': { quantity: 0, typeCount: 0 }
        };

        // Fill in actual stock counts
        stockInOutCounts.forEach(stock => {
            if (stock._id in stockCounts) {
                stockCounts[stock._id as StockAction] = {
                    quantity: stock.totalQuantity,
                    typeCount: stock.typeCount
                };
            }
        });

        res.status(200).json({
            totalProductTypes,
            totalProducts: totalProducts[0]?.total || 0,
            lowStockProductTypes,
            orders: orderCounts,
            stockCounts
        });

    } catch (error) {
        if (error instanceof ErrorResponse) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
}