import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { ExtensionMetod } from './../../../shared/globals/helpers/extention-methods';
import { ISignUpData } from './../interfaces/auth.interface';
import { authService } from './../../../shared/services/db/auth.service';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from 'src/shared/globals/decorators/joi-validation.decorators';
import { signupSchema } from '../schemes/signup';
import { IAuthDocument } from '../interfaces/auth.interface';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';
import { upload } from 'src/shared/globals/helpers/cloudinary-upload';

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;

    // We need to check if user name exists or not to avoid inserting duplicates
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('User name or email is already taken.');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${ExtensionMetod.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      //We cannot call this.signup
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });
    const result: UploadApiResponse = (await upload(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;

    // The reason for sending the userObject is coz .https://res.cloudinary.com/123/userObjecId/
    // else cloudinary will generate new id's for all cases

    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occured. Try again');
    }

    res.status(HTTP_STATUS.CREATED).json({message: 'User created successfully', authData});
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: ExtensionMetod.firstLetterUppercase(username),
      email: ExtensionMetod.lowercase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }
}
