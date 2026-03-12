import dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/taj_ai_db',
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
};
