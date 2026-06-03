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

// Social login (Google/Facebook)
router.post('/social-login', async (req, res) => {
  try {
    const { email, name, provider } = req.body;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user with random password
      const randomPassword = Math.random().toString(36).slice(-16);
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        emailVerified: true,
      });
    }
    
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    user.refreshToken = refreshToken;
    await user.save();
    
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    res.json({ success: true, data: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



export default router;