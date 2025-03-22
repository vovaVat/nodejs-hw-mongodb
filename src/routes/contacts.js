import express from 'express';
import {
  getContacts,
  getContactById,
  addContact,
  patchContact,
  removeContact,
} from '../controllers/contactsController.js';
import validateBody from '../middlewares/validateBody.js';
import { contactSchema, updateContactSchema } from '../validation/schemas.js';
import isValidId from '../middlewares/isValidId.js';

const router = express.Router();

router.get('/', getContacts);
router.get('/:contactId', isValidId, getContactById);
router.post('/', validateBody(contactSchema), addContact);
router.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  patchContact
);
router.delete('/:contactId', isValidId, removeContact);

export default router;
