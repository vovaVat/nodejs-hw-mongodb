import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Contact from '../models/contact.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function importContacts() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('Підключено до MongoDB');

    const __dirname = path.resolve();
    const contactsFilePath = path.join(__dirname, 'src', 'contacts.json');

    const contactsData = JSON.parse(fs.readFileSync(contactsFilePath, 'utf-8'));

    await Contact.insertMany(contactsData);
    console.log('Контакти імпортовано успішно!');

    mongoose.connection.close();
  } catch (error) {
    console.error('Помилка імпорту:', error);
  }
}

importContacts();
