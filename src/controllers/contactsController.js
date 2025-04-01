import {
  getAllContacts,
  getContactById as getById, // 🟢 Используем getById
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import createError from 'http-errors';
import { Types } from 'mongoose';
import Contact from '../models/contact.js';

const getContacts = ctrlWrapper(async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id });

    res.json({
      status: 'success',
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
});

export const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contact) {
      throw createError(404, 'Contact not found');
    }

    res.json({
      status: 'success',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

const addContact = ctrlWrapper(async (req, res) => {
  try {
    const { name, email, phoneNumber, isFavourite, contactType } = req.body;

    const newContact = await Contact.create({
      name,
      email,
      phoneNumber,
      isFavourite,
      contactType,
      userId: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Contact created successfully',
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
});

const patchContact = ctrlWrapper(async (req, res) => {
  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!updatedContact) {
      throw createError(404, 'Contact not found');
    }

    res.json({
      status: 'success',
      message: 'Contact updated successfully',
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
});

const removeContact = ctrlWrapper(async (req, res) => {
  try {
    const deletedContact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedContact) {
      throw createError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export { getContacts, addContact, patchContact, removeContact };
