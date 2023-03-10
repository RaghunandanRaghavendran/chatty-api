import mongoose from 'mongoose';
import Logger from 'bunyan';
import { redisConnection } from '@service/redis/redis.connection';
import { config } from './config';

const log: Logger = config.createLogger('database');
// We are going to export as a default method and hence we can import as any name we want in the app.ts
export default () => {
  const connect = () => {
    mongoose.set('strictQuery', true); // This was needed for suppressing the warning additionally added
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        log.info('Successfully connected to database.');
        redisConnection.connect(); // Redis connection created lately was referenced here
      })
      .catch((error) => {
        log.error('Error connecting to the database', error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect); // if the connection is disconncted it will try connecting.
};
