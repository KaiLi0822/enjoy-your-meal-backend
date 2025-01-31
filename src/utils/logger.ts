import winston from "winston";
import path from "path";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Log level (info, error, warn, debug)
  format: logFormat,
  transports: [
    // new winston.transports.Console({ format: winston.format.colorize() }), // Logs to console
    new winston.transports.File({ filename: path.join(__dirname, "../logs/app.log") }) // Logs to file
  ]
});

export default logger;
