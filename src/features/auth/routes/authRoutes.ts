import { Password } from './../controllers/password';
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
    this.router.post('/forgot-password', Password.prototype.create);
    this.router.post('/reset-password/:token', Password.prototype.update);
    return this.router;
  }

  public logout(): Router {
    this.router.post('/logout', SignOut.prototype.logout);
    return this.router;
  }
}

export const authRoutes: AuthRoute = new AuthRoute();
