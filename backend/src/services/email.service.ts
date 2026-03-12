import { transporter } from '../config/nodemailer';
import { config } from '../config';

export const sendEmail = async (options: { email: string; subject: string; message: string }) => {
  const message = {
    from: `${config.email.user}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};
