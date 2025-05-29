import {
  findContactsByEmailOrPhone,
  createContact,
  findAllRelatedContacts,
  updateContactToSecondary,
} from "../models/contactModel.js";

export const identifyUser = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ message: "Email or phone number required" });
    }

    const existingContacts = await findContactsByEmailOrPhone(email, phoneNumber);

    if (existingContacts.length === 0) {
      const newContact = await createContact(email, phoneNumber, null, "primary");
      return res.status(200).json({
        contact: {
          primaryContatctId: newContact.id,
          emails: [email],
          phoneNumbers: [phoneNumber],
          secondaryContactIds: [],
        },
      });
    }

    // Merge all related contacts via primary
    const allContactIds = new Set();
    existingContacts.forEach(c => {
      allContactIds.add(c.id);
      if (c.linkedId) allContactIds.add(c.linkedId);
    });

    const allRelatedContacts = await findAllRelatedContacts([...allContactIds]);

    // Finding the oldest primary contact
    let primaryContacts = allRelatedContacts.filter(c => c.linkPrecedence === "primary");
    let oldestPrimary = primaryContacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

    // to Update other primary contacts to secondary
    for (const contact of primaryContacts) {
      if (contact.id !== oldestPrimary.id) {
        await updateContactToSecondary(contact.id, oldestPrimary.id);
      }
    }

    // to Re-fetch after updates to get consistent view
    const finalContacts = await findAllRelatedContacts([oldestPrimary.id]);

    const emails = new Set();
    const phones = new Set();
    const secondaryIds = [];

    finalContacts.forEach(c => {
      if (c.email) emails.add(c.email);
      if (c.phoneNumber) phones.add(c.phoneNumber);
      if (c.linkPrecedence === "secondary") secondaryIds.push(c.id);
    });

    // Check if exact (email + phone) combo exists
    const hasExactMatch = finalContacts.some(
      c => c.email === email && c.phoneNumber === phoneNumber
    );

    if (!hasExactMatch) {
      const emailExists = finalContacts.some(c => c.email === email);
      const phoneExists = finalContacts.some(c => c.phoneNumber === phoneNumber);

      if (!emailExists || !phoneExists) {
        const newSecondary = await createContact(email, phoneNumber, oldestPrimary.id, "secondary");
        secondaryIds.push(newSecondary.id);
        if (email) emails.add(email);
        if (phoneNumber) phones.add(phoneNumber);
      }
    }

    res.status(200).json({
      contact: {
        primaryContatctId: oldestPrimary.id,
        emails: [...emails],
        phoneNumbers: [...phones],
        secondaryContactIds: secondaryIds,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
