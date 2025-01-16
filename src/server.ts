// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import app from "./app";

// Load SSL Certificate and Key
import fs from "fs";
import path from "path";
const options = {
    key: fs.readFileSync(path.join(__dirname, '../certs', 'localhost.key')),
    cert: fs.readFileSync(path.join(__dirname, '../certs', 'localhost.crt')),
  };

const PORT = process.env.PORT || 3000;

import https from "https";
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});