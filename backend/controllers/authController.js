const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const cacheService = require('../services/cacheService');
const { dispatchNotification } = require('../services/notificationService');
const { sendOtpEmail } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');

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

// Generate 6-digit OTP
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

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

    // Targeted indexed lookup for maximum query speed
    let user = null;
    if (isMobile) {
      user = await User.findOne({
        $or: [
          { phone: cleanedPhone },
          { phone: `+91${cleanedPhone}` },
          { phone: `91${cleanedPhone}` },
        ]
      });
    }
    if (!user) {
      user = await User.findOne({ email: normalizedEmail });
    }
    if (!user && rawInput && rawInput !== cleanedPhone && rawInput !== normalizedEmail) {
      user = await User.findOne({ phone: rawInput });
    }

    if (user && (await user.matchPassword(password))) {
      // Background migration for legacy non-bcrypt passwords
      if (!/^\$2[aby]\$/.test(user.password || '')) {
        user.password = password;
        user.markModified('password');
        await user.save().catch(() => {});
        cacheService.del(`sakthi:auth:user:${user._id}`);
      }

      // Ensure user has a valid mobile number associated
      if (!user.phone || !isValidMobileNumber(user.phone)) {
        if (isMobile) {
          user.phone = cleanedPhone;
          await User.updateOne({ _id: user._id }, { $set: { phone: cleanedPhone } }).catch(() => {});
          cacheService.del(`sakthi:auth:user:${user._id}`);
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

// ─── OTP-BASED FORGOT PASSWORD ─────────────────────────────────────────────

// @desc    Request OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const requestPasswordReset = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const genericResponse = { success: true, message: 'If an account exists, a 6-digit OTP has been sent to your email.' };
    if (!email) return res.json(genericResponse);

    const user = await User.findOne({ email }).select('+otpHash +otpExpiresAt +otpAttempts');
    if (!user) return res.json(genericResponse);

    // Rate limit: Max 3 OTP requests per 15 minutes
    if (user.otpExpiresAt && user.otpExpiresAt > new Date() && user.otpAttempts >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait a few minutes before trying again.',
      });
    }

    // Generate 6-digit OTP
    const otp = generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    await user.save();

    // Send OTP via email
    try {
      await sendOtpEmail(user.email, user.name, otp);
    } catch (emailError) {
      console.error('OTP email sending failed:', emailError.message);
      // Still return success to avoid leaking info about which emails exist
    }

    // Also keep notification dispatch for tracking
    await dispatchNotification({
      notificationKey: `otp-reset:${user._id}:${otpHash}`,
      eventType: 'password.otp.requested',
      channel: 'customer-email',
      recipient: user.email,
      subject: `${otp} is your Sakthi Frozen Foods password reset OTP`,
      message: `Your OTP for password reset is: ${otp}. Valid for 10 minutes. Do not share this with anyone.`,
    }).catch(() => {});

    return res.json(genericResponse);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();

    if (!email || !otp || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Valid email and 6-digit OTP are required' });
    }

    const user = await User.findOne({ email }).select('+otpHash +otpExpiresAt +otpAttempts');
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'No OTP request found. Please request a new OTP.' });
    }

    // Check if OTP is expired
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (otpHash !== user.otpHash) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
    }

    // OTP is valid — generate a temporary reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetTokenHash = resetTokenHash;
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    // Clear OTP fields
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    return res.json({
      success: true,
      message: 'OTP verified successfully. You can now set a new password.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
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
        $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1, otpHash: 1, otpExpiresAt: 1, otpAttempts: 1 },
        $inc: { sessionVersion: 1 },
      },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(400).json({ success: false, message: 'Reset token is invalid or expired' });
    cacheService.del(`sakthi:auth:user:${user._id}`);
    return res.json({ success: true, message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth Login / Sign Up
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  const { code, idToken, credential } = req.body;

  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured on the server (missing GOOGLE_CLIENT_ID).',
      });
    }

    const oauthClient = new OAuth2Client(
      googleClientId,
      googleClientSecret,
      'postmessage'
    );

    let tokenToVerify = idToken || credential;

    // If an authorization code was provided, exchange it for tokens
    if (!tokenToVerify && code) {
      try {
        const tokenResponse = await oauthClient.getToken({
          code,
          redirect_uri: 'postmessage',
        });
        tokenToVerify = tokenResponse.tokens.id_token;
      } catch (exchangeError) {
        console.error('Failed to exchange Google authorization code:', exchangeError.message);
        return res.status(400).json({
          success: false,
          message: 'Failed to exchange Google authorization code. Please try again.',
        });
      }
    }

    if (!tokenToVerify) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication credential or code is required',
      });
    }

    // Verify Google ID token cryptographically
    let ticket;
    try {
      ticket = await oauthClient.verifyIdToken({
        idToken: tokenToVerify,
        audience: googleClientId,
      });
    } catch (verifyError) {
      console.error('Google ID token verification failed:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google authentication credentials.',
      });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Failed to retrieve user profile from Google token.',
      });
    }

    const { sub: googleId, email, email_verified, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'No email address found in your Google profile.',
      });
    }

    // Validate email verification status
    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Your Google email address is not verified. Please verify your email with Google first.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = String(name || payload.given_name || 'Google User').trim();
    const avatar = String(picture || '').trim();

    // Check whether the user already exists by googleId or email
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email: normalizedEmail });

      if (user) {
        // Safe account linking: Existing email/password user logging in with Google
        let needsSave = false;
        if (!user.googleId) {
          user.googleId = googleId;
          needsSave = true;
        }
        if (!user.avatar && avatar) {
          user.avatar = avatar;
          needsSave = true;
        }
        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
          needsSave = true;
        }
        if (!user.authProvider) {
          user.authProvider = 'google';
          needsSave = true;
        }
        if (needsSave) {
          await user.save();
          cacheService.del(`sakthi:auth:user:${user._id}`);
        }
      } else {
        // User does not exist, create a new account
        user = await User.create({
          name: cleanName,
          email: normalizedEmail,
          phone: '',
          googleId,
          avatar,
          authProvider: 'google',
          isEmailVerified: true,
          role: 'Customer',
          totalOrders: 0,
          totalSpent: 0,
          joinedDate: new Date().toISOString().split('T')[0],
          address: '',
          sessionVersion: 0,
        });
      }
    } else {
      // User found by googleId: Keep avatar and email verification up to date
      let needsSave = false;
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        needsSave = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
        cacheService.del(`sakthi:auth:user:${user._id}`);
      }
    }

    const token = generateToken(user._id, user.role, user.sessionVersion || 0);

    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        avatar: user.avatar || '',
        authProvider: user.authProvider || 'google',
        token,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Google authentication failed',
    });
  }
};

// @desc    Update current user's phone number
// @route   PUT /api/auth/phone
// @access  Private
const updateUserPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const cleanedPhone = cleanPhoneNumber(phone);

    if (!isValidMobileNumber(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)',
      });
    }

    // Check if another account is already using this phone number
    const duplicate = await User.findOne({
      phone: cleanedPhone,
      _id: { $ne: req.user._id },
    }).select('_id').lean();

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number is already associated with another account. Please use a different number.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.phone = cleanedPhone;
    await user.save();
    cacheService.del(`sakthi:auth:user:${user._id}`);

    return res.json({
      success: true,
      message: 'Mobile number updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar || '',
        authProvider: user.authProvider || 'local',
      },
    });
  } catch (error) {
    console.error('Update phone error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update phone number' });
  }
};

// @desc    Send OTP for Login or Signup
// @route   POST /api/auth/otp/send
// @access  Public
const sendOtpForLogin = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const name = String(req.body?.name || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const otp = generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ email }).select('+otpHash +otpExpiresAt +otpAttempts');
    let displayName = name || 'Customer';

    if (user) {
      if (user.otpExpiresAt && user.otpExpiresAt > new Date() && (user.otpAttempts || 0) >= 5) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please wait a few minutes before requesting another code.',
        });
      }
      user.otpHash = otpHash;
      user.otpExpiresAt = otpExpiresAt;
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      displayName = user.name || displayName;
      await user.save();
    } else {
      displayName = name || email.split('@')[0];
      user = await User.create({
        name: displayName,
        email,
        phone: '',
        role: 'Customer',
        isEmailVerified: false,
        authProvider: 'local',
        otpHash,
        otpExpiresAt,
        otpAttempts: 1,
        totalOrders: 0,
        totalSpent: 0,
        joinedDate: new Date().toISOString().split('T')[0],
        address: '',
        sessionVersion: 0,
      });
    }

    try {
      await sendOtpEmail(email, displayName, otp);
    } catch (err) {
      console.error('Failed to send OTP email:', err.message);
    }

    return res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for Login or Signup
// @route   POST /api/auth/otp/verify
// @access  Public
const verifyOtpForLogin = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    const name = String(req.body?.name || '').trim();
    const rawPhone = String(req.body?.phone || '').trim();

    if (!email || !otp || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Please enter your email and the 6-digit verification code.' });
    }

    const user = await User.findOne({ email }).select('+otpHash +otpExpiresAt +otpAttempts +sessionVersion');
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'No verification code found. Please request a new code.' });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: 'The verification code has expired. Please request a new one.' });
    }

    const submittedHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (submittedHash !== user.otpHash) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code. Please check your email and try again.' });
    }

    user.isEmailVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;

    if (name && (!user.name || user.name === email.split('@')[0])) {
      user.name = name;
    }

    if (rawPhone) {
      const cleanPhone = cleanPhoneNumber(rawPhone);
      if (isValidMobileNumber(cleanPhone)) {
        const duplicatePhone = await User.findOne({ phone: cleanPhone, _id: { $ne: user._id } }).select('_id').lean();
        if (!duplicatePhone) {
          user.phone = cleanPhone;
        }
      }
    }

    await user.save();

    const token = generateToken(user._id, user.role, user.sessionVersion || 0);

    return res.json({
      success: true,
      message: 'Signed in successfully!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        avatar: user.avatar || '',
        authProvider: user.authProvider || 'local',
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
