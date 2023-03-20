import { Update } from './../controllers/update-post';
import express, { Router } from 'express';
import { Create } from '@post/controllers/create-post';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Get } from '@post/controllers/get-posts';
import { Delete } from '@post/controllers/delete-post';

class PostRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
    this.router.post('/post/image/post', authMiddleware.checkAuthentication, Create.prototype.postWithImage);

    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.posts);
    this.router.get('/post/images/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImages);

    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.post);

    this.router.put('/post/:postId', authMiddleware.checkAuthentication, Update.prototype.post);
    this.router.put('/post/image/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithImage);

    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
