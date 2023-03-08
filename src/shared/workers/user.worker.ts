import { userService } from './../services/db/user.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from 'src/config';

const logger: Logger = config.createLogger('userWorker');

class UserWorker {
  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      //add method to send data to database
      userService.addUserData(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      logger.error(error);
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
