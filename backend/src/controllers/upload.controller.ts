import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadToCloudinary } from '../services/cloudinary.service';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

// @desc    Upload file
// @route   POST /api/upload
// @access  Private
export const uploadFile = asyncHandler(async (req: any, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a file');
  }

  const result = await uploadToCloudinary(req.file.buffer, 'taj_ai_uploads');

  res.status(200).json(new ApiResponse(200, {
    url: result.secure_url,
    public_id: result.public_id,
    type: req.file.mimetype
  }, 'File uploaded successfully'));
});
