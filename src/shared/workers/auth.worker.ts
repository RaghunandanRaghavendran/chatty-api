import { authService } from './../services/db/auth.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from 'src/config';

const logger: Logger = config.createLogger('authWorker');

class AuthWorker {
async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
  try{
    const {value} = job.data;
    //add method to send data to database
    authService.createAutUser(value);
    job.progress(100);
    done(null,job.data);
  }
  catch(error){
    logger.error(error);
    done(error as Error);
  }
}
}

export const authWorker: AuthWorker = new AuthWorker();
