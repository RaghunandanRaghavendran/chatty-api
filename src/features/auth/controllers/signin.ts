import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { loginSchema } from '@auth/schemas/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';
import { config } from '@root/config';

export class SignIn {
  @joiValidation(loginSchema)
  public async login(request: Request, response: Response): Promise<void> {
    const { username, password } = request.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUserName(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credential: Username does not exist');
    }

    const passwordMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid password');
    }

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

    const userJwt: string = JWT.sign(
      {
        userId: existingUser._id,
        //userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    request.session = { jwt: userJwt };

    //bug fix -- instead of existing user, pass the user document
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as IUserDocument;
    // end of bug fix

    response.status(HTTP_STATUS.OK).json({ message: 'user successfully loggedIn', user: userDocument, token: userJwt });
  }
}
