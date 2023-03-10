import { userService } from './../../../shared/services/db/user.service';
import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { BadRequestError } from './../../../shared/globals/helpers/error-handler';
import { authService } from './../../../shared/services/db/auth.service';
import { IAuthDocument } from 'src/features/auth/interfaces/auth.interface';
import { Request, Response } from 'express';
import { config } from 'src/config';
import { joiValidation } from 'src/shared/globals/decorators/joi-validation.decorators';
import { loginSchema } from '../schemas/signin';
//#region Email testing logic
// import moment from 'moment';
// import publicIP from 'ip';
// import { emailQueue } from './../../../shared/services/queues/email.queue';
//import { forgotPasswordTemplate } from './../../../shared/services/emails/templates/forgot-password/forgot-password-template';
// import { IResetPasswordParams } from './../../user/interfaces/user.interface';
// import { resetPasswordTemplate } from './../../../shared/services/emails/templates/reset-password/reset-password-template';
//#endregion

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

    //#region email testing logic
    //testing mail directly
    //await mailTransport.sendEmail('conor31@ethereal.email', 'Test Email', 'Testing email from Raghunandan on development box');

    //Testing mail with queues and workers in place
    //const resetLink = `${config.CLIENT_URL}/reset-password?token=1234567890`;
    //const template:string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink);
    //emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail: 'conor31@ethereal.email', subject: 'Reset your password'});

    //Testing for password reset confimation
    // const templateParams: IResetPasswordParams = {
    //   username: existingUser.username,
    //   email: existingUser.email,
    //   ipaddress: publicIP.address(),
    //   date: moment().format('DD/MM/YYYY HH:mm')
    // };
    // const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    // emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: 'conor31@ethereal.email', subject: 'Password reset confirmation'});
 //#endregion
    response.status(HTTP_STATUS.OK).json({ message: 'user successfully loggedIn', user: userDocument, token: userJwt });
  }
}

