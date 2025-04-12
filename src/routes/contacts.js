import express from 'express';
import {
  getContacts,
  getContactById,
  addContact,
  patchContact,
  removeContact,
} from '../controllers/contactsController.js';
import authenticate from '../middlewares/authenticate.js';
import validateBody from '../middlewares/validateBody.js';
import { contactSchema, updateContactSchema } from '../validation/schemas.js';
import isValidId from '../middlewares/isValidId.js';
import upload from '../middlewares/upload.js';
import { createContactSchema } from '../validation/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getContacts);
router.get('/:contactId', isValidId, getContactById);
router.post(
  '/',
  upload.single('photo'),
  validateBody(createContactSchema),
  ctrlWrapper(addContact)
);
router.patch(
  '/:contactId',
  isValidId,
  upload.single('photo'),
  validateBody(updateContactSchema),
  ctrlWrapper(patchContact)
);
router.delete('/:contactId', isValidId, removeContact);

export default router;
