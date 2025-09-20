import logger from "../config/logger.js";

export const logError = (error, context = 'General') => {
    let message;

    if (error instanceof Error) {
        message = error.stack || error.message;
    } else if (typeof error === 'object') {
        try {
            message = JSON.stringify(error);
        } catch (jsonErr) {
            message = '[Unserializable error object]';
        }
    } else {
        message = String(error);
    }

    logger.error(`[${context}] ${message}`);
};

export const logWarning = ( message, context = 'General' ) => {
    logger.warn(`[${context}] ${message}`);
}

export const logInfo = ( message, context = 'General' ) => {
    logger.info(`[${context}] ${message}`);
}
