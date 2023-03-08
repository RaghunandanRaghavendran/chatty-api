import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';

export class SignOut {
  public async logout(req: Request, response: Response): Promise<void> {
    req.session = null;
    response.status(HTTP_STATUS.OK).json({ message: 'Logout Successful', user: {}, token: '' });
  }
}
