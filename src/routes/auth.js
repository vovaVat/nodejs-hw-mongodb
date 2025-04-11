import express from 'express';
import {
  register,
  logout,
  requestResetEmailController,
} from '../controllers/authController.js';
import { login, refreshSession } from '../controllers/authController.js';
import { requestResetEmailSchema } from '../validation/authValidation.js';
import { resetPasswordSchema } from '../validation/authValidation.js';
import { resetPasswordController } from '../controllers/authController.js';
import validateBody from '../middlewares/validateBody.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshSession);
router.post('/logout', logout);
router.post(
  '/send-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController)
);
router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController)
);

export default router;
