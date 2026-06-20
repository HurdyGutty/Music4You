import express from 'express';
import * as userController from '../controllers/user-c.js';
import { protect } from '../middlewares/auth-mw.js';

const router = express.Router();

router.get('/profile', protect, userController.getProfile);

export default router;