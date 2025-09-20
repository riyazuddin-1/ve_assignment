import isolatedDBRecordController from '../controllers/isolated_db_records.controller.js';
  
  import {
    authorizeByRole,
    authorizeByOwnership
  } from '../middlewares/authorize.middleware.js';  

import express from 'express';
const router = express.Router();

router.post('/create', authorizeByRole('EDITOR'), isolatedDBRecordController.createRecord);

router.post('/update', authorizeByRole('EDITOR') , isolatedDBRecordController.updateRecord);

router.post('/delete', authorizeByRole('EDITOR'), authorizeByOwnership('record'), isolatedDBRecordController.removeRecord);

router.get('/read/:recordId', isolatedDBRecordController.readRecord);

export default router;