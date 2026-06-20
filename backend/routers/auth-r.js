import express from 'express';
import * as authController from '../controllers/auth-c.js';
import { protect } from '../middlewares/auth-mw.js';
import { validate } from '../middlewares/validate-mw.js';
import { loginSchema, signupSchema } from '../validators/auth-schema.js';


const router = express.Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.me);

export default router;