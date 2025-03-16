import Contact from '../models/contact.js';

export async function getAllContacts() {
  return await Contact.find();
}

export async function getContactById(contactId) {
  return await Contact.findById(contactId);
}

export async function createContact(data) {
  return await Contact.create(data);
}

export async function updateContact(contactId, data) {
  return await Contact.findByIdAndUpdate(contactId, data, { new: true });
}

export async function deleteContact(contactId) {
  return await Contact.findByIdAndDelete(contactId);
}
