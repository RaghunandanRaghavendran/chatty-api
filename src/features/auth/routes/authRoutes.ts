import { SignOut } from './../controllers/logout';
import { SignIn } from './../controllers/signin';
import { SignUp } from './../controllers/signup';
import express, { Router } from 'express';

class AuthRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', SignUp.prototype.signup);
    this.router.post('/signin', SignIn.prototype.login);
    return this.router;
  }

  public logout(): Router {
    this.router.post('/logout', SignOut.prototype.logout);
    return this.router;
  }
}

export const authRoutes: AuthRoute = new AuthRoute();
