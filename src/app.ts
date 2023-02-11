import { config } from './config';
import express, { Express } from 'express';
import { ChattyServer } from './setup-server';
import databaseConnection from './setup-database'; //class named as default and hence we can import to any name

class MainApplication {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
  }
}

const application: MainApplication = new MainApplication();
application.initialize();
