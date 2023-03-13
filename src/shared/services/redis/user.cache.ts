import { ServerError } from '@global/helpers/error-handler';
import { ExtensionMetod } from '@global/helpers/extention-methods';
import { config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';
import { BaseCache } from './base.cache';

const logger: Logger = config.createLogger('userCache');

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;
    const firstList: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'createdAt',
      `${createdAt}`,
      'postsCount',
      `${postsCount}`
    ];
    const secondList: string[] = [
      'blocked',
      JSON.stringify(blocked),
      'blockedBy',
      JSON.stringify(blockedBy),
      'profilePicture',
      `${profilePicture}`,
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'notifications',
      JSON.stringify(notifications),
      'social',
      JSON.stringify(social)
    ];
    const thirdList: string[] = [
      'work',
      `${work}`,
      'location',
      `${location}`,
      'school',
      `${school}`,
      'quote',
      `${quote}`,
      'bgImageVersion',
      `${bgImageVersion}`,
      'bgImageId',
      `${bgImageId}`
    ];
    const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.zAdd('user', { score: parseInt(userUId, 10), value: `${key}` });
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
      response.createdAt = new Date(ExtensionMetod.parseJson(`${response.createdAt}`));
      response.postsCount = ExtensionMetod.parseJson(`${response.postsCount}`);
      response.blocked = ExtensionMetod.parseJson(`${response.blocked}`);
      response.blockedBy = ExtensionMetod.parseJson(`${response.blockedBy}`);
      response.notifications = ExtensionMetod.parseJson(`${response.notifications}`);
      response.social = ExtensionMetod.parseJson(`${response.social}`);
      response.followersCount = ExtensionMetod.parseJson(`${response.followersCount}`);
      response.followingCount = ExtensionMetod.parseJson(`${response.followingCount}`);
      response.bgImageId = ExtensionMetod.parseJson(`${response.bgImageId}`);
      response.bgImageVersion = ExtensionMetod.parseJson(`${response.bgImageVersion}`);
      response.profilePicture = ExtensionMetod.parseJson(`${response.profilePicture}`);
      response.work = ExtensionMetod.parseJson(`${response.work}`);
      response.school = ExtensionMetod.parseJson(`${response.school}`);
      response.location = ExtensionMetod.parseJson(`${response.location}`);
      response.quote = ExtensionMetod.parseJson(`${response.quote}`);

      return response;
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
