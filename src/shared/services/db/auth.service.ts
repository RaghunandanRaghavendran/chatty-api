import { ExtensionMetod } from './../../globals/helpers/extention-methods';
import { IAuthDocument } from 'src/features/auth/interfaces/auth.interface';
import { AuthModel } from 'src/features/auth/models/auth.schema';

class AuthService {
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      //check the db and not the redis
      $or: [{ username: ExtensionMetod.firstLetterUppercase(username) }, { email: ExtensionMetod.lowercase(email) }]
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }

  public async createAutUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
}

export const authService: AuthService = new AuthService();
