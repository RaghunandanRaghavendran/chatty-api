import { authQueue } from './../../../shared/services/queues/auth.queue';
import { UserCache } from './../../../shared/services/redis/user.cache';
import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { ExtensionMetod } from './../../../shared/globals/helpers/extention-methods';
import { ISignUpData } from './../interfaces/auth.interface';
import { authService } from './../../../shared/services/db/auth.service';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from 'src/shared/globals/decorators/joi-validation.decorators';
import { signupSchema } from '../schemas/signup';
import { IAuthDocument } from '../interfaces/auth.interface';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';
import { upload } from 'src/shared/globals/helpers/cloudinary-upload';
import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { config } from 'src/config';
import { omit } from 'lodash';
import { userQueue } from 'src/shared/services/queues/user.queue';
import JWT from 'jsonwebtoken';

const userCache: UserCache = new UserCache();

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;

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
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occured. Try again');
    }

    // Add to redis cache
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = `https://res.cloudinary.com/${config.CLOUDINARY_NAME}/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    //Add to database
    omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
    authQueue.addAuthUserJob('addAuthUserToDB', {value: userDataForCache});
    userQueue.addUserJob('addUserToDB', {value: userDataForCache});

    const userJwt:string = SignUp.prototype.signToken(authData,userObjectId);
    req.session = {jwt: userJwt};

    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: userDataForCache, token: userJwt });
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

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: ExtensionMetod.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
  }
}
