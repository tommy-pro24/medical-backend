import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { setNewOrder, updateOrderStatus } from '../controllers/order.controller';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';
import { ErrorResponse as ApiErrorResponse } from '../utils/errorResponse';

// Define message types
interface MessagePayload {
    token?: string;
    [key: string]: any;
}

interface SocketMessage {
    type: string;
    payload: MessagePayload;
    timestamp: number;
}

interface SocketErrorResponse {
    type: string;
    message: string;
    statusCode?: number;
    timestamp: number;
}

export class SocketService {
    private io: SocketIOServer;
    private static instance: SocketService;

    private constructor(httpServer: HTTPServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || '*',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.setupSocketHandlers();
    }

    public static getInstance(httpServer: HTTPServer): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService(httpServer);
        }
        return SocketService.instance;
    }

    private sendError(socket: Socket, error: any, type: string = 'ERROR'): void {
        const errorResponse: SocketErrorResponse = {
            type,
            message: error instanceof ApiErrorResponse ? error.message : 'An unexpected error occurred',
            statusCode: error instanceof ApiErrorResponse ? error.statusCode : 500,
            timestamp: Date.now()
        };

        logger.error(`Socket error: ${errorResponse.message}`, {
            socketId: socket.id,
            errorType: errorResponse.type,
            statusCode: errorResponse.statusCode
        });

        socket.emit('error', errorResponse);
    }

    private async verifySocketToken(token: string): Promise<any> {
        try {
            if (!token) {
                throw new ApiErrorResponse('No token, authorization denied', 401);
            }

            // Verify token
            const decoded = verifyToken(token);

            // Get user from database
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                throw new ApiErrorResponse('Token is not valid', 401);
            }

            return user;
        } catch (error) {
            throw new ApiErrorResponse('Token is not valid', 401);
        }
    }

    private setupSocketHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`Client connected: ${socket.id}`);

            // Handle client disconnection
            socket.on('disconnect', () => {
                logger.info(`Client disconnected: ${socket.id}`);
            });

            // Add your custom event handlers here
            this.setupCustomEventHandlers(socket);
        });
    }

    private setupCustomEventHandlers(socket: Socket): void {
        // Handle all messages with type and payload structure
        socket.on('message', async (message: SocketMessage) => {
            try {
                logger.info(`Received message from ${socket.id}:`, message);

                switch (message.type) {
                    case 'SET_NEW_ORDER':
                        await this.handleSetNewOrder(socket, message);
                        break;
                    case 'SET_DISPATCHED':
                        await this.handleChangeOrderStatus(socket, message);
                        break;
                    default:
                        this.sendError(socket, {
                            message: `Unknown message type: ${message.type}`,
                            statusCode: 400
                        }, 'UNKNOWN_MESSAGE_TYPE');
                }
            } catch (error) {
                this.sendError(socket, error, 'INTERNAL_ERROR');
            }
        });
    }

    private async handleSetNewOrder(socket: Socket, message: SocketMessage): Promise<any> {

        try {

            const { token, products } = message.payload;

            if (!token) {
                this.sendError(socket, {
                    message: 'Authentication token is required',
                    statusCode: 401
                }, 'AUTHENTICATION_ERROR');
                return;
            }

            // Verify token and get user
            const user = await this.verifySocketToken(token);

            const result = await setNewOrder(user, products);

            try {
                this.emitToAll("NEW_ORDER", result);

            } catch (error) {

                this.sendError(socket, error, 'SET_NEW_ORDER_ERROR');

            }

        } catch (error) {
            this.sendError(socket, error, 'SET_NEW_ORDER_ERROR');
        }

    }

    private async handleChangeOrderStatus(socket: Socket, message: SocketMessage): Promise<any> {
        try {

            const { token, id, newStatus } = message.payload;

            if (!token) {
                this.sendError(socket, {
                    message: 'Authentication token is required',
                    statusCode: 401
                }, 'AUTHENTICATION_ERROR');
                return;
            }

            const user = await this.verifySocketToken(token);

            this.emitToAll("SET_DISPATCHED",
                {
                    userId: user._id.toString(),
                    orderId: id,
                    newStatus
                }
            )

            await updateOrderStatus({ id, newStatus });

        } catch (error) {
            this.sendError(socket, error, 'SET_DISPATCHED_ERROR');
        }
    }

    // Method to emit events to all connected clients
    public emitToAll(event: string, data: any): void {
        this.io.emit("message", {
            type: event,
            payload: data,
        });
    }

    // Method to emit events to a specific room
    public emitToRoom(room: string, event: string, data: any): void {
        this.io.to(room).emit(event, data);
    }

    // Method to join a room
    public joinRoom(socketId: string, room: string): void {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
            socket.join(room);
        }
    }

    // Method to leave a room
    public leaveRoom(socketId: string, room: string): void {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
            socket.leave(room);
        }
    }
} 