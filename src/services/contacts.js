const Contact = require('../models/contact');

async function getAllContacts() {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    throw new Error('Error fetching contacts');
  }
}

async function getContactById(contactId) {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch (error) {
    throw new Error('Error fetching contact by ID');
  }
}

module.exports = {
  getAllContacts,
  getContactById,
};
