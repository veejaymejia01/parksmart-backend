import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOTPEmail, sendVerificationLinkEmail } from '../utils/mailer.js';

// Generate 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      // Update existing unverified user
      user.name = name;
      user.phone = phone;
      user.password = password;
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      user.isVerified = false;
      await user.save();
    } else {
      user = await User.create({ 
        name, 
        email, 
        phone, 
        password, 
        otp,
        otpExpiresAt,
        isVerified: false 
      });
    }

    // Send OTP email in background (best-effort, won't block)
    sendOTPEmail(email, otp).catch((emailError) => {
      console.error('Background OTP email sending failed:', emailError.message);
    });

    // Include OTP in dev response so the frontend can auto-fill it
    // (Resend free tier only delivers to account owner email)
    res.status(201).json({ 
      message: 'Registration successful! A 6-digit verification code has been sent to your email.',
      otp 
    });

  } catch (err) {
    next(err);
  }
};

// ─── VERIFY OTP ─────────────────────────────────────────
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }

    // Clear OTP and mark verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Email verified successfully!',
      token,
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email,
        phone: user.phone,
        role: user.role 
      },
    });

  } catch (err) {
    next(err);
  }
};

// ─── RESEND OTP ──────────────────────────────────────────
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email in background (best-effort)
    sendOTPEmail(email, otp).catch((err) => {
      console.error('Resend OTP email failed:', err.message);
    });

    res.status(200).json({ message: 'New OTP sent to your email.', otp });

  } catch (err) {
    next(err);
  }
};

// ─── LOGIN ───────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email,
        phone: user.phone,
        role: user.role
      },
    });

  } catch (err) {
    next(err);
  }
};

// ─── ADMIN LOGIN ─────────────────────────────────────────
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!['superadmin', 'lot_operator'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role
      },
    });

  } catch (err) {
    next(err);
  }
};

// ─── FORGOT PASSWORD ─────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

// ─── RESET PASSWORD ─────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordOTP: hashedOTP,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// ─── VERIFY EMAIL LINK ──────────────────────────────────
export const verifyEmailLink = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      message: 'Your email has been successfully verified! You can now log in.'
    });

  } catch (err) {
    next(err);
  }
};
