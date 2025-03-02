import initMongoConnection from './db/initMongoConnection.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pino from 'pino';

dotenv.config();

const app = express();

initMongoConnection();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
