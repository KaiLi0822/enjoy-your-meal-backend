import express from "express";
import { uploadFile } from "../controllers/s3Controller";
import upload from "../middlewares/upload";
import { authenticate } from "../middlewares/auth";

const s3Routes = express.Router();

// Route for user login
s3Routes.post("/upload", authenticate, upload.single("file"), uploadFile);


export default s3Routes;
