import express from 'express';
import { 
  register, login, logout, getMe, updateProfile, 
  changePassword, refreshToken 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation } from '../validations/authValidation.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/refresh-token', refreshToken);

export default router;