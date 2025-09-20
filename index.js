import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './src/config/db.js';
import app from './src/app.js';
import initGraphQL from './src/graphql/index.js';
import { logError, logInfo } from './src/utils/logger.js';

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await connectDB();

        initGraphQL();

        app.listen(PORT, () => {
            logInfo(`App listening on port ${PORT}`, 'APP');
        });
    } catch (err) {
        logError(err, "Failed to start server");
        process.exit(1);
    }
})();
