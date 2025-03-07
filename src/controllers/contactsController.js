import {
  getAllContacts,
  getContactById as getContactFromDb,
} from '../services/contacts.js';

export async function getContacts(req, res) {
  try {
    console.log('Получен запрос на /contacts');
    const contacts = await getAllContacts();
    console.log('Контакты найдены:', contacts);

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to get contacts.',
    });
  }
}

export async function getContactById(req, res) {
  const { contactId } = req.params;
  try {
    const contact = await getContactFromDb(contactId);
    if (!contact) {
      return res.status(404).json({
        message: 'Contact not found',
      });
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to get contact.',
    });
  }
}
