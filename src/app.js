import express from 'express';
import routes from './routes/index.js';

const app = express();

// Middleware (add body parsers, CORS, etc. here)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

export default app;
