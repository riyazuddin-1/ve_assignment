import userController from '../controllers/users.controller.js';

import { authorized } from '../middlewares/authorize.middleware.js';  

import express from 'express';
const router = express.Router();

router.post('/login', userController.login);

router.post('/register', userController.register);

router.get('/dashboard', authorized, userController.dashboard);

/**
 * user verification with a special id(user's _id)
 */
router.get('/verify/:code', userController.verify);

export default router;