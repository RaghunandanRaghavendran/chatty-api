import { serverAdapter } from './shared/services/queues/base.queue';
import { authRoutes } from './features/auth/routes/authRoutes';
import { Application } from 'express';

const BASE_PATH = '/api/v1';

//This needs to be in the setup server
export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
  };
  routes();
};
