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
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const perPageNumber = parseInt(perPage, 10);
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  const validSortFields = ['name', 'email', 'phoneNumber'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';

  const contactsQuery = Contact.find({ userId: req.user._id });

  const totalItems = await Contact.find().merge(contactsQuery).countDocuments();
  const totalPages = Math.ceil(totalItems / perPageNumber);

  const contacts = await Contact.find({ userId: req.user._id })
    .sort({ [sortField]: sortDirection })
    .skip((pageNumber - 1) * perPageNumber)
    .limit(perPageNumber);

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts,
      page: pageNumber,
      perPage: perPageNumber,
      totalItems,
      totalPages,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
    },
  });
});

export const getContactById = async (req, res, next) => {
  const contact = await Contact.findOne({
    _id: req.params.contactId,
    userId: req.user._id,
  });

  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    data: contact,
  });
};

const addContact = ctrlWrapper(async (req, res) => {
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
    status: 201,
    message: 'Contact created successfully',
    data: newContact,
  });
});

const patchContact = ctrlWrapper(async (req, res) => {
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: req.params.contactId, userId: req.user._id },
    req.body,
    { new: true }
  );

  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: 'Contact updated successfully',
    data: updatedContact,
  });
});

const removeContact = ctrlWrapper(async (req, res) => {
  const deletedContact = await Contact.findOneAndDelete({
    _id: req.params.contactId,
    userId: req.user._id,
  });

  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).end();
});

export { getContacts, addContact, patchContact, removeContact };
