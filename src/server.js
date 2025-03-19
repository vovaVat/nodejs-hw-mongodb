import express from 'express';
import cors from 'cors';
import pino from 'pino';
import dotenv from 'dotenv';
import createError from 'http-errors';

import contactsRouter from './routes/contacts.js';
import errorHandler from './middlewares/errorHandler.js';

dotenv.config();

function setupServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  const logger = pino();

  app.use(cors());
  app.use(express.json());

  app.use('/contacts', contactsRouter);

  app.use((req, res, next) => {
    next(createError(404, 'Route not found'));
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
  });
}

export default setupServer;
