import express from 'express';
import { register, logout } from '../controllers/authController.js';
import { login, refreshSession } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshSession);
router.post('/logout', logout);

export default router;
