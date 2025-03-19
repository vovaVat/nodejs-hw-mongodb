import express from 'express';
import {
  getContacts,
  getContactById,
  addContact,
  patchContact,
  removeContact,
} from '../controllers/contactsController.js';

const router = express.Router();

router.get('/', getContacts);

router.get('/:id', getContactById);

router.post('/', addContact);

router.patch('/:contactId', patchContact);

router.delete('/:contactId', removeContact);

export default router;
