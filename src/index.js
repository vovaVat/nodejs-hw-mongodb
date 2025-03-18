import initMongoConnection from './db/initMongoConnection.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import contactsRouter from './routes/contacts.js';
import setupServer from './server.js';

dotenv.config();

const app = express();

initMongoConnection();

setupServer();
