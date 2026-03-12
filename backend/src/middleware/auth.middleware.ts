import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { config } from '../config';
import { User } from '../models/User.model';
import { AuthRequest } from '../types';

export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route');
  }

  try {
    const decoded: any = jwt.verify(token, config.jwtSecret);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized to access this route');
  }
});
