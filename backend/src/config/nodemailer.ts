import nodemailer from 'nodemailer';
import { config } from './index';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('Server is ready to take our messages');
  } catch (error) {
    console.error('Nodemailer verification error:', error);
  }
};
