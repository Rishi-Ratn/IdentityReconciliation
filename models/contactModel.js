import db from "../config/db.js";

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