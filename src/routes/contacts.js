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

const router = express.Router();

router.use(authenticate);

router.get('/', getContacts);
router.get('/:contactId', isValidId, getContactById);
router.post(
  '/',
  validateBody(contactSchema),
  upload.single('photo'),
  addContact
);
router.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  upload.single('photo'),
  patchContact
);
router.delete('/:contactId', isValidId, removeContact);

export default router;
