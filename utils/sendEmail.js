import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendEmail = async ({ to, subject, html, text }) => {
  const fromEmail = (process.env.SMTP_FROM && !process.env.SMTP_FROM.includes('yourverifieddomain.com'))
    ? process.env.SMTP_FROM
    : 'onboarding@resend.dev';

  // 1. Try Resend if configured
  if (resend && process.env.RESEND_API_KEY) {
    try {
      const { error } = await resend.emails.send({
        from: `ParkSmart <${fromEmail}>`,
        to,
        subject,
        html: html || text,
        text
      });

      if (!error) {
        console.log(`📧 Email sent to ${to} via Resend`);
        return;
      }
      console.warn('⚠️ Resend email delivery failed, trying SMTP fallback. Error:', error);
    } catch (resendError) {
      console.warn('⚠️ Resend connection failed, trying SMTP fallback. Error:', resendError.message);
    }
  }

  // 2. Try SMTP if configured
  if (process.env.SMTP_HOST) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `ParkSmart <${fromEmail}>`,
        to,
        subject,
        html,
        text
      });

      console.log(`📧 Email sent to ${to} via SMTP`);
      return;
    } catch (smtpError) {
      console.error('❌ SMTP Email service error:', smtpError.message);
    }
  }

  // 3. Development Fallback
  console.log('-----------------------------------------');
  console.log('🛠️  DEVELOPMENT FALLBACK:');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text || html.replace(/<[^>]*>/g, '')}`);
  console.log('-----------------------------------------');
};

export default sendEmail;

