// Nodemailer with Gmail SMTP - Vercel Function Alternative
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,     // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD  // Gmail App Password
      }
    });

    // Email content
    const mailOptions = {
      from: `"YAHSHUA Tax Forms" <${process.env.GMAIL_USER}>`,
      to: 'support@abba.works',
      cc: formData.emailAddress,
      subject: `📋 Taxpayer Form - ${formData.taxpayerName}`,
      html: `
        <h2>🏛️ YAHSHUA-ABBA TAXPAYER FORM SUBMISSION</h2>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        
        <h3>Taxpayer Information</h3>
        <ul>
          <li><strong>Name:</strong> ${formData.taxpayerName}</li>
          <li><strong>Email:</strong> ${formData.emailAddress}</li>
          <li><strong>Tax ID:</strong> ${formData.taxIdentificationNumber}</li>
          <li><strong>Address:</strong> ${formData.registeredAddress}</li>
        </ul>
        
        <p>Complete form data: ${JSON.stringify(formData, null, 2)}</p>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: '✅ Email sent directly to support@abba.works via Gmail SMTP!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Gmail SMTP error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Setup Steps:
// 1. Enable 2FA on Gmail account
// 2. Generate App Password: https://myaccount.google.com/apppasswords
// 3. Add to Vercel Environment Variables:
//    GMAIL_USER=your-email@gmail.com
//    GMAIL_APP_PASSWORD=your-16-digit-app-password
// 4. Install: npm install nodemailer