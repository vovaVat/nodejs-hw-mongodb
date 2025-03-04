import express from 'express';
import contactsController from '../controllers/contactsController.js';

const router = express.Router();

router.get('/', contactsController.getContacts);

router.get('/:contactId', contactsController.getContactById);

export default router;
