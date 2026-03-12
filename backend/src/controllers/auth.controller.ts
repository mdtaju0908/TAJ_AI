import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { User } from '../models/User.model';
import { sendEmail } from '../services/email.service';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  const user = await User.create({
    name,
    email,
    password,
    otp,
    otpExpires,
  });

  // Send OTP email
  const message = `Your OTP is ${otp}. It expires in 10 minutes.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'TAJ AI - Email Verification OTP',
      message,
    });
  } catch (error) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'Email could not be sent');
  }

  res.status(201).json(new ApiResponse(201, null, 'User registered. Please verify email.'));
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = (user as any).getSignedJwtToken();

  res.status(200).json(new ApiResponse(200, { token, user }, 'Email verified successfully'));
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide an email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await (user as any).matchPassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  if (!user.isVerified) {
      throw new ApiError(401, 'Please verify your email first');
  }

  const token = (user as any).getSignedJwtToken();

  res.status(200).json(new ApiResponse(200, { token, user }, 'Logged in successfully'));
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user.id);
  res.status(200).json(new ApiResponse(200, user, 'User data retrieved'));
});

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save({ validateBeforeSave: false });

  const message = `Your password reset OTP is ${otp}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'TAJ AI - Password Reset Token',
      message,
    });

    res.status(200).json(new ApiResponse(200, null, 'Email sent'));
  } catch (error) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'Email could not be sent');
  }
});

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  user.password = password;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = (user as any).getSignedJwtToken();

  res.status(200).json(new ApiResponse(200, { token, user }, 'Password updated successfully'));
});
