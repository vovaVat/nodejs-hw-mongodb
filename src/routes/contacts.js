const express = require('express');
const contactsController = require('../controllers/contactsController');

const router = express.Router();

router.get('/', contactsController.getContacts);

router.get('/:contactId', contactsController.getContactById);

module.exports = router;
