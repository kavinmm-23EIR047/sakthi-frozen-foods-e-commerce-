const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { dispatchNotification } = require('../services/notificationService');

// Generate JWT Token
const generateToken = (id, role, sessionVersion = 0) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ id, role, sessionVersion }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Helper to sanitize and validate 10-digit Indian phone numbers
const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
};

const isValidMobileNumber = (phone) => {
  const cleaned = cleanPhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  try {
    if (!name || !email || !password || !phone || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Name, email, mobile number, and an 8-character password are required' });
    }

    const cleanedPhone = cleanPhoneNumber(phone);
    if (!isValidMobileNumber(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if email or phone is already registered
    const userExists = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: cleanedPhone }],
    }).select('_id email phone').lean();

    if (userExists) {
      if (userExists.email === normalizedEmail) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists' });
      }
      return res.status(400).json({ success: false, message: 'An account with this mobile number already exists' });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      phone: cleanedPhone,
      address: String(address || '').trim(),
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          token: generateToken(user._id, user.role, user.sessionVersion),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user registration data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token (Login via Mobile Number or Email)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, phone, identifier, password } = req.body;

  try {
    const rawInput = String(identifier || email || phone || '').trim();
    if (!rawInput || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your mobile number or email and password',
      });
    }

    const cleanedPhone = cleanPhoneNumber(rawInput);
    const isMobile = isValidMobileNumber(cleanedPhone);
    const normalizedEmail = rawInput.toLowerCase();

    // Query user by phone or email
    let user;
    if (isMobile) {
      user = await User.findOne({
        $or: [{ phone: cleanedPhone }, { phone: `+91${cleanedPhone}` }, { phone: `91${cleanedPhone}` }],
      });
    } else {
      user = await User.findOne({ email: normalizedEmail });
    }

    // If still not found, try fallback search by exact raw string
    if (!user) {
      user = await User.findOne({
        $or: [{ email: normalizedEmail }, { phone: rawInput }],
      });
    }

    if (user && (await user.matchPassword(password))) {
      // Ensure user has a valid mobile number associated
      if (!user.phone || !isValidMobileNumber(user.phone)) {
        // If legacy user missing valid mobile, check if rawInput was a mobile or block until updated
        if (isMobile) {
          user.phone = cleanedPhone;
          await user.save();
        } else {
          return res.status(403).json({
            success: false,
            message: 'Mobile number verification required. Please register with your 10-digit mobile number.',
          });
        }
      }

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          token: generateToken(user._id, user.role, user.sessionVersion),
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: isMobile
          ? 'Incorrect mobile number or password'
          : 'Incorrect email or password',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestPasswordReset = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const genericResponse = { success: true, message: 'If an account exists, password reset instructions have been sent.' };
    if (!email) return res.json(genericResponse);

    const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt');
    if (!user) return res.json(genericResponse);

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL || ''}/reset-password?token=${token}`;
    void dispatchNotification({
      notificationKey: `password-reset:${user._id}:${user.passwordResetTokenHash}`,
      eventType: 'password.reset.requested',
      channel: 'customer-email',
      recipient: user.email,
      subject: 'Reset your Sakthi Frozen Foods password',
      message: `Use this link within 15 minutes to reset your password: ${resetUrl}`,
    });
    return res.json(genericResponse);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const token = String(req.body?.token || '');
    const password = String(req.body?.password || '');
    if (token.length < 32 || password.length < 8) return res.status(400).json({ success: false, message: 'A valid token and 8-character password are required' });
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: new Date() } },
      {
        $set: { password: passwordHash },
        $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
        $inc: { sessionVersion: 1 },
      },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(400).json({ success: false, message: 'Reset token is invalid or expired' });
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  requestPasswordReset,
  resetPassword,
};
