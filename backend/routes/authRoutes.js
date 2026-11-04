const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  requestPasswordReset,
  verifyOtp,
  resetPassword,
  googleAuth,
  updateUserPhone,
  sendOtpForLogin,
  verifyOtpForLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/otp/send', sendOtpForLogin);
router.post('/otp/verify', verifyOtpForLogin);
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getUserProfile);
router.put('/phone', protect, updateUserPhone);

module.exports = router;
