import initMongoConnection from './db/initMongoConnection.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import contactsRouter from './routes/contacts.js';

dotenv.config();

const app = express();

initMongoConnection();

app.use(cors());
app.use(express.json());

app.use('/contacts', contactsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
