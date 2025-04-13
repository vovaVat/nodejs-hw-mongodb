import initMongoConnection from './db/initMongoConnection.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import contactsRouter from './routes/contacts.js';
import setupServer from './server.js';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from './constants/index.js';
import { createDirIfNotExists } from './utils/createDirIfNotExists.js';

dotenv.config();

const app = express();

const bootstrap = async () => {
  await initMongoConnection();
  await createDirIfNotExists(TEMP_UPLOAD_DIR);
  await createDirIfNotExistss(UPLOAD_DIR);
  await setupServer();
};

void bootstrap();
