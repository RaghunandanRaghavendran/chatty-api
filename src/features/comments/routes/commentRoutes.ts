import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Add } from '@comment/controllers/add-comment';
import { Get } from '@comment/controllers/get-comments';

class CommentRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/post/comment', authMiddleware.checkAuthentication, Add.prototype.comment);

    this.router.get('/post/comments/:postId', authMiddleware.checkAuthentication, Get.prototype.comments);
    this.router.get('/post/single/comment/:postId/:commentId', authMiddleware.checkAuthentication, Get.prototype.singleComment);
    this.router.get('/post/commentsnames/:postId', authMiddleware.checkAuthentication, Get.prototype.commentsNamesFromCache);
    return this.router;
  }
}

export const commentRoutes: CommentRoutes = new CommentRoutes();
