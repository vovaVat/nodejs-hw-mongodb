// src/importContacts.js
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Contact from './models/contact.js';

dotenv.config();

const initMongoConnection = async () => {
  const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } =
    process.env;
  const mongoUri = `mongodb+srv://vovavat97:1UnefWeSbIjCQI2r@cluster0.gpceq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

  try {
    await mongoose.connect(mongoUri);
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.error('Mongo connection error:', error);
    process.exit(1);
  }
};

const importContacts = async () => {
  try {
    const contactsData = JSON.parse(fs.readFileSync('contacts.json', 'utf8'));

    const contacts = await Contact.insertMany(contactsData);
    console.log('Contacts imported successfully!', contacts);
  } catch (error) {
    console.error('Error importing contacts:', error);
  } finally {
    mongoose.connection.close();
  }
};

const start = async () => {
  await initMongoConnection();
  await importContacts();
};

start();
