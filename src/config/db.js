import mongoose from 'mongoose';
import { logError, logInfo } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(uri, { dbName: 'notion' });

        const db = mongoose.connection;

        db.on('open', () => {
            logInfo('Database connected!', 'Database');
        });

        db.on('error', (err) => {
            logError(err, 'Database connection error');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logInfo('MongoDB connection closed due to app termination (SIGINT)', 'Database');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            logInfo('MongoDB connection closed due to app termination (SIGTERM)', 'Database');
            process.exit(0);
        });

    } catch (err) {
        logError(err, 'MongoDB connection failed');
    }
};

export { connectDB };
