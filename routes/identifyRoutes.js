import express from "express";
import { identifyUser } from "../controllers/identifyController.js";

const router = express.Router();

router.post("/identify", identifyUser);

export default router;
