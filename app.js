import express from "express";
import dotenv from "dotenv";
import db from "./config/db.js";
import identifyRoutes from "./routes/identifyRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Routes
app.use("/", identifyRoutes);

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