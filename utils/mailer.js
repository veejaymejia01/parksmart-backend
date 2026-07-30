import { Resend } from 'resend';
import sendEmail from './sendEmail.js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendOTPEmail = async (toEmail, otp) => {
  const fromEmail = (process.env.SMTP_FROM && !process.env.SMTP_FROM.includes('yourverifieddomain.com'))
    ? process.env.SMTP_FROM
    : 'onboarding@resend.dev';

  if (!resend || !process.env.RESEND_API_KEY) {
    console.log('-----------------------------------------');
    console.log('🛠️  DEVELOPMENT FALLBACK (No Resend API Key):');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Your ParkSmart Verification Code`);
    console.log(`OTP Code: ${otp}`);
    console.log('-----------------------------------------');
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: `ParkSmart <${fromEmail}>`,
      to: toEmail,
      subject: 'Your ParkSmart Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">ParkSmart Verification</h2>
          <p>Use the OTP below to verify your account:</p>
          <div style="
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 12px;
            color: #4F46E5;
            background: #F3F4F6;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
          ">${otp}</div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 20px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.warn('⚠️ Resend email delivery failed. Falling back to terminal logging. Error:', error);
      console.log('-----------------------------------------');
      console.log('🛠️  DEVELOPMENT FALLBACK (Resend API Error):');
      console.log(`To: ${toEmail}`);
      console.log(`Subject: Your ParkSmart Verification Code`);
      console.log(`OTP Code: ${otp}`);
      console.log('-----------------------------------------');
    } else {
      console.log(`📧 OTP Email successfully sent to ${toEmail} via Resend`);
    }
  } catch (error) {
    console.warn('⚠️ Resend connection failed. Falling back to terminal logging. Error:', error.message);
    console.log('-----------------------------------------');
    console.log('🛠️  DEVELOPMENT FALLBACK (Resend Connection Error):');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Your ParkSmart Verification Code`);
    console.log(`OTP Code: ${otp}`);
    console.log('-----------------------------------------');
  }
};

export const sendVerificationLinkEmail = async (toEmail, name, token) => {
  const verifyUrl = `http://localhost:5173/verify-email/${token}`;
  
  const subject = 'Verify Your ParkSmart Account';
  const html = `
    <div style="font-family: 'Outfit', sans-serif, Arial; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 12px; background: linear-gradient(135deg, #0f766e, #0d9488); border-radius: 12px; color: #ffffff; font-weight: bold; font-size: 24px;">
          🚗 ParkSmart
        </div>
      </div>
      <h2 style="color: #111827; text-align: center; font-size: 22px; font-weight: 800; margin-top: 0;">Welcome, ${name}!</h2>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.6; text-align: center;">
        Thank you for joining ParkSmart! Please verify your email address to activate your account and start booking parking slots.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="
          display: inline-block;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: bold;
          color: #ffffff;
          background-color: #0d9488;
          text-decoration: none;
          border-radius: 10px;
          box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2);
        ">Confirm Verification</a>
      </div>
      <p style="color: #4b5563; font-size: 13px; line-height: 1.5; text-align: center;">
        Or copy and paste this URL into your browser:
      </p>
      <p style="color: #0d9488; font-size: 12px; word-break: break-all; text-align: center; font-family: monospace;">
        ${verifyUrl}
      </p>
      <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
        This verification link will expire in <strong>24 hours</strong>. If you did not create a ParkSmart account, please ignore this email.
      </p>
    </div>
  `;
  const text = `Hello ${name},\n\nPlease verify your ParkSmart account by visiting the following link:\n${verifyUrl}\n\nThank you!\nParkSmart Team`;

  await sendEmail({ to: toEmail, subject, html, text });
};

