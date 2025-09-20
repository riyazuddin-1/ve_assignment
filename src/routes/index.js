import express from 'express';
const router = express.Router();

import userRoutes from './users.routes.js';
import tenantRoutes from './tenants.routes.js';

router.get('/', (req, res) => {
    res.send('Hello there!');
})

router.use('/user', userRoutes);
router.use('/tenant', tenantRoutes);

export default router;