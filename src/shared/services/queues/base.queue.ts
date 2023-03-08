import { IAuthJob } from './../../../features/auth/interfaces/auth.interface';
import Logger from 'bunyan';
import Queue, { Job } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { config } from 'src/config';

type IBaseJobData =
| IAuthJob

let bullAdapters: BullAdapter[] = [];

export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue.Queue;
  logger: Logger;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    });

    this.logger = config.createLogger(`${queueName}Queue`);

    this.queue.on('completed', (job: Job) => {
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.logger.info(`Job ${jobId} completed`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
      this.logger.info(`Job ${jobId} is stalled`);
    });
  }

  protected addJob(name:string, data:IBaseJobData):void {
    this.queue.add(name,data,{attempts:3, backoff: {type: 'fixed', delay:5000}});
  }

  protected processJob(name:string, concurrency: number, callback:Queue.ProcessCallbackFunction<void>):void{
    this.queue.process(name,concurrency, callback);
  }
}