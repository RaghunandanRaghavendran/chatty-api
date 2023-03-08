import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { UserModel } from 'src/features/user/models/user.schema';

class UserService {
  public async addUserData(data: IUserDocument):Promise<void>{
    await UserModel.create(data);
  }
}

export const userService: UserService = new UserService();
