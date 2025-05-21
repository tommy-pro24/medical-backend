import { ErrorResponse } from "../utils/errorResponse";
import { History } from "../models/history";
import { User } from "../models/User";
import { Request, Response } from 'express';

export const getHistory = async (req: Request, res: Response): Promise<any> => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        if (user.role === 'client') {
            throw new ErrorResponse('Unauthorized user', 403);
        }

        const { from, to } = req.body;

        let query: any = {}

        if (from) {
            query.createdAt = {
                $gte: new Date(from),
                ...(to && { $lte: new Date(to) })
            };
        }

        const data = await History.find(query).sort({ createdAt: -1 });

        return res.status(200).json(data);

    } catch (error) {

        console.log(error);

        if (error instanceof ErrorResponse) {

            res.status(error.statusCode).json({ message: error.message });

        } else {

            res.status(500).json({ message: 'Server error' });

        }
    }

}