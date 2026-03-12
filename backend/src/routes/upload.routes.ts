import express from 'express';
import { uploadFile } from '../controllers/upload.controller';
import { protect } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadFile);

export default router;
