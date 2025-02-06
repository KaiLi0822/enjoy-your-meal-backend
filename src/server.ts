// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import http from "http";
import logger from "./utils/logger";
import "./utils/secretsClient";
import { loadJWTSecret } from "./utils/secretsClient";
import { config } from "./utils/config";

// Load SSL Certificate and Key
// import https from "https";
// import fs from "fs";
// import path from "path";
// const options = {
//     key: fs.readFileSync(path.join(__dirname, '../certs', 'localhost.key')),
//     cert: fs.readFileSync(path.join(__dirname, '../certs', 'localhost.crt')),
//   };

const PORT = Number(process.env.PORT)|| 3000;
const HOST = process.env.HOST || "127.0.0.1"; // Ensure external access

// Start server after loading secret
loadJWTSecret().then(() => {
  http.createServer(app).listen(PORT, HOST, () => {
    logger.info(config.jwtSecret);
    logger.info(`Server is running on http://${HOST}:${PORT}`);
  });
});