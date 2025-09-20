import express from 'express';
const router = express.Router();
import {
    authorized,
    authorizeByRole,
    authorizeByOwnership,
    authorizeByMembership
  } from '../middlewares/authorize.middleware.js';
  
  import tenantController from '../controllers/tenants.controller.js';
  

import isolatedDatabasesRoutes from './isolated_databases.routes.js';

const resourceType = 'tenant';

// Tenant CRUD
router.post('/create', authorized, tenantController.createTenant);

router.post('/update', authorizeByMembership, authorizeByRole('ADMIN'), tenantController.updateTenant);

router.post('/delete', authorizeByMembership, authorizeByRole('ADMIN'), authorizeByOwnership(resourceType), tenantController.removeTenant);

router.post('/invite-contributor', authorizeByMembership, authorizeByRole('ADMIN'), tenantController.inviteContributor);

router.post('/update-contributor', authorizeByMembership, authorizeByRole('ADMIN'), tenantController.updateContributor);

router.post('/remove-contributor', authorizeByMembership, authorizeByRole('ADMIN'), authorizeByOwnership(resourceType), tenantController.removeContributor);

router.get('/info/:tenantId', authorizeByMembership, tenantController.getTenantInfo);

router.get('/join/:tenantId', authorized, tenantController.acceptInvitation);

// Tenant databases/items management
router.use('/isolated-databases', authorizeByMembership, isolatedDatabasesRoutes);

export default router;