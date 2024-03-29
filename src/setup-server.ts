import { SocketIOImageHandler } from './shared/sockets/image';
import { SocketIOFollowerHandler } from './shared/sockets/follower';
import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import 'express-async-errors';
import { config } from './config';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import applicationRoutes from './routes';
import Logger from 'bunyan';
import { CustomError, IErrorResponse } from '@global/helpers/error-handler';
import { SocketIOPostHandler } from '@socket/post';
import { SocketIONotificationHandler } from '@socket/notification';
import { SocketIOChatHandler } from '@socket/chat';
import { SocketIOUserHandler } from '@socket/user';

const SERVER_PORT = 5000;
const log: Logger = config.createLogger('server');

export class ChattyServer {
  private application: Application;
  constructor(app: Application) {
    this.application = app;
  }

  public start(): void {
    this.securityMiddleware(this.application);
    this.standardMiddleware(this.application);
    this.routeMiddleware(this.application);
    this.globarErrorHandler(this.application);
    this.startServer(this.application);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000, //timeout
        //secure:false
        secure: config.NODE_ENV !== 'development'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        //origin: '*',
        origin: config.CLIENT_URL,
        credentials: true, // needed for the cookies
        optionsSuccessStatus: 200, //needed for older browsers like IE
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routeMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  private globarErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeError());
      }
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnection(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`The server has started with process ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server running on the port ${SERVER_PORT}`);
    });
  }

  private socketIOConnection(io: Server): void {
    const postSocketHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
    postSocketHandler.listen();

    const followerSocketHandler: SocketIOFollowerHandler = new SocketIOFollowerHandler(io);
    followerSocketHandler.listen();

    const notificationSocketHandler: SocketIONotificationHandler = new SocketIONotificationHandler();
    notificationSocketHandler.listen(io);

    const imageSocketHandler: SocketIOImageHandler = new SocketIOImageHandler();
    imageSocketHandler.listen(io);

    const chatSocketHandler: SocketIOChatHandler = new SocketIOChatHandler(io);
    chatSocketHandler.listen();

    const userSocketHandler: SocketIOUserHandler = new SocketIOUserHandler(io);
    userSocketHandler.listen();
  }
}
