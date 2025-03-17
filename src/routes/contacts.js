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

router.use('/contacts/:id', (req, res, next) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    return next(createError(400, 'Invalid contact ID format'));
  }
  next();
});

router.get('/contacts/:id', getContactById);

router.post('/', addContact);

router.patch('/:contactId', patchContact);

router.delete('/:contactId', removeContact);

export default router;
