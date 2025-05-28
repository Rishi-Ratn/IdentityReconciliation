import express from "express";
import dotenv from "dotenv";
import db from "./config/db.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

db.getConnection((err, connection) => {
  if (err) {
    console.error("Failed to connect to MySQL:", err);
    process.exit(1);
  } else {
    console.log("Connected to MySQL database");
    connection.release();
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});