import db from "../config/db.js";

// This function fetches all contacts from the database where the email OR phone number matches the given input.
export const findContactsByEmailOrPhone = (email, phone) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM Contact
      WHERE email = ? OR phoneNumber = ?
    `;
    db.query(query, [email, phone], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};


// This function inserts a new contact into the Contact table.
export const createContact = (email, phone, linkedId, linkPrecedence) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [email, phone, linkedId, linkPrecedence], (err, result) => {
      if (err) reject(err);
      else resolve({ id: result.insertId, email, phoneNumber: phone });
    });
  });
};


// This function fetches all contacts related to a list of primary contact IDs.
export const findAllRelatedContacts = (ids) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM Contact
      WHERE id IN (?) OR linkedId IN (?)
    `;
    db.query(query, [ids, ids], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};


// This function updates a contact to become a secondary contact
export const updateContactToSecondary = (contactId, newLinkedId) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE Contact SET linkPrecedence = 'secondary', linkedId = ?
      WHERE id = ?
    `;
    db.query(query, [newLinkedId, contactId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};
