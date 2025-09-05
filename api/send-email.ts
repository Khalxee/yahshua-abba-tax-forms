import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

interface FormData {
  taxpayerName: string;
  emailAddress: string;
  taxIdentificationNumber: string;
  registeredAddress: string;
  telFaxNo: string;
  birFormNo: string;
  revenuePeriod: string;
  lineOfBusiness: string;
  rdoCode: string;
  tradeName: string;
  zipCode: string;
  businessRating: string;
  ownershipType: string;
  businessInGood: boolean;
  taxpayerSignature: string;
  authorizedRepSignature: string;
  dateAccomplished: string;
  complianceItems?: Record<string, any>;
  revenueDeclarations?: Record<string, any>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const formData: FormData = req.body;
    console.log('Processing form submission for:', formData.taxpayerName);

    // Get Gmail credentials from environment variables
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!gmailUser || !gmailAppPassword) {
      throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in Vercel environment variables.');
    }

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });

    // Create professional email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background-color: #1e40af; 
              color: white; 
              padding: 20px; 
              border-radius: 8px; 
              text-align: center; 
              margin-bottom: 30px; 
            }
            .section { 
              margin-bottom: 25px; 
              padding: 15px; 
              border-left: 4px solid #1e40af; 
              background-color: #f8fafc; 
              border-radius: 4px;
            }
            .section h3 { 
              color: #1e40af; 
              margin-top: 0; 
              margin-bottom: 15px; 
            }
            .info-item { 
              background: white; 
              padding: 10px; 
              border-radius: 4px; 
              margin: 8px 0; 
              border: 1px solid #e2e8f0; 
            }
            .info-label { 
              font-weight: bold; 
              color: #475569; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 2px solid #e2e8f0; 
              color: #64748b; 
              font-size: 14px; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏛️ YAHSHUA-ABBA TAXPAYER FORM SUBMISSION</h1>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> ✅ DELIVERED VIA GMAIL SMTP</p>
          </div>

          <div class="section">
            <h3>📋 Form Information</h3>
            <div class="info-item"><span class="info-label">BIR Form No:</span> ${formData.birFormNo || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Revenue Period:</span> ${formData.revenuePeriod || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Tax ID Number:</span> ${formData.taxIdentificationNumber || 'N/A'}</div>
            <div class="info-item"><span class="info-label">RDO Code:</span> ${formData.rdoCode || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Line of Business:</span> ${formData.lineOfBusiness || 'N/A'}</div>
          </div>

          <div class="section">
            <h3>👤 Taxpayer Information</h3>
            <div class="info-item"><span class="info-label">Taxpayer Name:</span> ${formData.taxpayerName || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Trade Name:</span> ${formData.tradeName || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Registered Address:</span> ${formData.registeredAddress || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Zip Code:</span> ${formData.zipCode || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Phone:</span> ${formData.telFaxNo || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Email:</span> ${formData.emailAddress || 'N/A'}</div>
          </div>

          <div class="section">
            <h3>📝 Additional Information</h3>
            <div class="info-item"><span class="info-label">Business Rating:</span> ${formData.businessRating || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Ownership Type:</span> ${formData.ownershipType || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Business in Good Standing:</span> ${formData.businessInGood ? 'YES' : 'NO'}</div>
          </div>

          <div class="section">
            <h3>✍️ Signatures & Dates</h3>
            <div class="info-item"><span class="info-label">Taxpayer Signature:</span> ${formData.taxpayerSignature || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Authorized Rep:</span> ${formData.authorizedRepSignature || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Date Accomplished:</span> ${formData.dateAccomplished || 'N/A'}</div>
          </div>

          <div class="footer">
            <p><strong>📧 This email was sent automatically via Gmail SMTP</strong></p>
            <p>YAHSHUA-ABBA Tax Form System | Powered by Gmail + Nodemailer</p>
          </div>
        </body>
      </html>
    `;

    // Email configuration
    const mailOptions = {
      from: `"YAHSHUA Tax Forms" <${gmailUser}>`,
      to: 'support@abba.works',
      cc: formData.emailAddress || undefined,
      replyTo: 'yahshua.compliance@gmail.com',
      subject: `📋 Taxpayer Form Submission - ${formData.taxpayerName} (${formData.taxIdentificationNumber || 'No Tax ID'})`,
      html: emailHtml
    };

    // Send email via Gmail SMTP
    const emailInfo = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully via Gmail SMTP:', emailInfo.messageId);

    res.status(200).json({
      success: true,
      message: '✅ Form submitted successfully! Email sent directly to support@abba.works via Gmail SMTP',
      messageId: emailInfo.messageId,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Gmail SMTP error:', error);
    
    res.status(500).json({
      success: false,
      error: `Failed to send email via Gmail SMTP: ${error.message}`,
    });
  }
}