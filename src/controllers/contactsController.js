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
import { uploadToCloudinary } from '../utils/cloudinary.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { getEnvVar } from '../utils/getEnvVar.js';

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

const addContact = ctrlWrapper(async (req, res) => {
  const userId = req.user._id;
  const { error } = createContactSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: 400,
      message: 'Validation Error',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }
  const contactData = {
    ...req.body,
    userId,
  };

  if (req.file) {
    try {
      const useCloudinary = getEnvVar('ENABLE_CLOUDINARY') === 'true';
      const photoUrl = useCloudinary
        ? await saveFileToCloudinary(req.file)
        : await saveFileToUploadDir(req.file);

      contactData.photo = photoUrl;
      console.log('Photo URL:', photoUrl);
    } catch (fileError) {
      console.error('Error saving file:', fileError);
    }
  }

  const newContact = await createContact(contactData, userId);

  res.status(201).json({
    status: 201,
    message: 'Successfully created new contact',
    data: newContact,
  });
});

const patchContact = ctrlWrapper(async (req, res) => {
  const { contactId } = req.params;
  const photo = req.file;

  let photoUrl;

  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const result = await updateContact(contactId, {
    ...req.body,
    photo: photoUrl,
  });

  if (!result) {
    next(createHttpError(404, 'Student not found'));
    return;
  }

  res.json({
    status: 200,
    message: `Successfully patched a student!`,
    data: result,
  });
});

export { getContacts, addContact, patchContact, removeContact };
