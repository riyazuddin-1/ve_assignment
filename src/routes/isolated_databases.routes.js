import express from 'express';
const router = express.Router();
import { authorizeByRole, authorizeByOwnership } from '../middlewares/authorize.middleware.js';
import isolatedDatabaseController from '../controllers/isolated_databases.controller.js';

import isolatedDBRecordRoutes from './isolated_db_records.routes.js';

router.post('/create', authorizeByRole('ADMIN'), isolatedDatabaseController.createIsolatedDB);

router.post('/update', authorizeByRole('ADMIN'), isolatedDatabaseController.updateIsolatedDB);

router.post('/delete', authorizeByRole('ADMIN'), authorizeByOwnership('isolated_database'), isolatedDatabaseController.removeIsolatedDB);

router.get('/view/:dbId', isolatedDatabaseController.getIsolatedDBInfo);

// Isolated database records handling
router.use('/records', isolatedDBRecordRoutes);

export default router;