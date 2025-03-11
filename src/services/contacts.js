import Contact from '../models/contact.js';

export async function getAllContacts() {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    throw new Error('Error fetching contacts');
  }
}

export async function getContactById(contactId) {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch (error) {
    throw new Error('Error fetching contact by ID');
  }
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
