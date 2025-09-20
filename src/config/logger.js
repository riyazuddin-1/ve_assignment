import winston from "winston";

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // minimum log level to capture
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // output to console
    new winston.transports.File({ filename: 'app.log' }) // output to file
  ],
});

export default logger;