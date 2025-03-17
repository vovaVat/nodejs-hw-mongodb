import {
  getAllContacts,
  getContactById as getById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import createError from 'http-errors';
import { Types } from 'mongoose';
import Contact from '../models/contact.js';

const getContacts = ctrlWrapper(async (req, res) => {
  const contacts = await getAllContacts();
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
});

export const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid contact ID format'));
    }

    const contact = await Contact.findById(id);

    if (!contact) {
      return next(createError(404, 'Contact not found'));
    }

    res.json({
      status: 200,
      message: 'Success',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

const addContact = ctrlWrapper(async (req, res) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;
  if (!name || !phoneNumber || !contactType) {
    throw createError(400, 'Missing required fields');
  }
  const newContact = await createContact({
    name,
    phoneNumber,
    email,
    isFavourite,
    contactType,
  });
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
});

const patchContact = ctrlWrapper(async (req, res) => {
  const { contactId } = req.params;

  if (!Types.ObjectId.isValid(contactId)) {
    return next(createError(400, 'Invalid contact ID format'));
  }

  const updatedContact = await updateContact(contactId, req.body);
  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
});

const removeContact = ctrlWrapper(async (req, res) => {
  const { contactId } = req.params;

  if (!Types.ObjectId.isValid(contactId)) {
    return next(createError(400, 'Invalid contact ID format'));
  }

  const deletedContact = await deleteContact(contactId);
  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }
  res.status(204).send();
});

export { getContacts, getContactById, addContact, patchContact, removeContact };
