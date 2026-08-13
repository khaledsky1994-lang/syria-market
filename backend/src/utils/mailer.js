const nodemailer = require('nodemailer');

// If SMTP credentials are set in .env, real emails are sent.
// Otherwise, the verification link is printed to the terminal so you can
// test the flow immediately without setting up an email account.
const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

let transporter = null;
if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendVerificationEmail(toEmail, toName, verifyUrl) {
  const subject = 'تأكيد حسابك في سوق سوريا | Verify your Syria Market account';
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#0B7A3D;">سوق سوريا | Syria Market</h2>
      <p>مرحباً ${toName}،</p>
      <p>يرجى الضغط على الزر التالي لتأكيد بريدك الإلكتروني:</p>
      <p><a href="${verifyUrl}" style="background:#0B7A3D;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">تأكيد الحساب / Verify Account</a></p>
      <p style="color:#888;font-size:12px;">إذا لم يعمل الزر، انسخ هذا الرابط: ${verifyUrl}</p>
    </div>
  `;

  if (!transporter) {
    console.log('\n========================================');
    console.log('📧 SMTP غير مُعدّ — رابط التأكيد (Verification link):');
    console.log(verifyUrl);
    console.log('========================================\n');
    return { simulated: true };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject,
    html,
  });
  return { simulated: false };
}

module.exports = { sendVerificationEmail, smtpConfigured };
