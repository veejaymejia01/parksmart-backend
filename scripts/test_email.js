// import 'dotenv/config';
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// const testEmail = async () => {
//   console.log('🔑 API Key:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'MISSING');
//   console.log('📧 SMTP_FROM:', process.env.SMTP_FROM);
  
//   const testTo = 'harmonjavier01@gmail.com'; // Your email
  
//   try {
//     const { data, error } = await resend.emails.send({
//       from: 'ParkSmart <onboarding@resend.dev>',
//       to: testTo,
//       subject: 'ParkSmart Test Email - OTP: 123456',
//       html: '<h2>Test OTP: 123456</h2><p>If you see this, email is working!</p>'
//     });

//     if (error) {
//       console.error('❌ Resend returned error:', JSON.stringify(error, null, 2));
//     } else {
//       console.log('✅ Resend returned success:', JSON.stringify(data, null, 2));
//     }
//   } catch (err) {
//     console.error('❌ Exception:', err.message);
//     console.error('Full error:', JSON.stringify(err, null, 2));
//   }
// };

// testEmail();
