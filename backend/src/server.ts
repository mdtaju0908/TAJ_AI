import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import { verifyTransporter } from './config/nodemailer';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { config } from './config';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Verify Nodemailer
verifyTransporter();

const app: Express = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Prevent NoSQL injections
app.use(mongoSanitize());

// Prevent HTTP Param Pollution
app.use(hpp());

// Enable CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Rate limiting
app.use('/api', apiLimiter);

// Routes
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import uploadRoutes from './routes/upload.routes';

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('TAJ AI API is running...');
});

// Error Handler
app.use(errorHandler);

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
