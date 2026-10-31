const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, requestPasswordReset, verifyOtp, resetPassword, googleAuth, updateUserPhone } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getUserProfile);
router.put('/phone', protect, updateUserPhone);

module.exports = router;
