import { authMiddleware } from './../../../shared/globals/helpers/auth-middleware';
import express, { Router } from 'express';
import { CurrentUser } from '../controllers/current-user';

class CurrentUserRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/currentuser', authMiddleware.checkAuthentication, CurrentUser.prototype.read);
    return this.router;
  }
}

export const currentUserRoute: CurrentUserRoute = new CurrentUserRoute();
