import { authRoutes } from '@auth/routes/authRoutes';
import { currentUserRoute } from '@auth/routes/currentuserRoutes';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { serverAdapter } from '@service/queues/base.queue';
import { Application } from 'express';
import { reactionRoutes } from '@reaction/routes/reactionRoutes';
import { followerRoutes } from '@follower/routes/followerRoutes';
import { postRoutes } from '@post/routes/post.route';
import { commentRoutes } from '@comment/routes/commentRoutes';

const BASE_PATH = '/api/v1';

//This needs to be in the setup server
export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.logout());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followerRoutes.routes());
  };
  routes();
};
