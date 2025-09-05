import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import htmlPdf from 'html-pdf-node';

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
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });

    // Create PDF content
    const pdfHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.4; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
              font-size: 12px;
            }
            .header { 
              background-color: #1e40af; 
              color: white; 
              padding: 20px; 
              text-align: center; 
              margin-bottom: 30px; 
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .section { 
              margin-bottom: 25px; 
              page-break-inside: avoid;
            }
            .section h2 { 
              color: #1e40af; 
              border-bottom: 2px solid #1e40af;
              padding-bottom: 5px;
              font-size: 16px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .info-item { 
              border: 1px solid #e2e8f0;
              padding: 8px;
              border-radius: 4px;
            }
            .info-label { 
              font-weight: bold; 
              color: #475569; 
              display: block;
              margin-bottom: 4px;
            }
            .info-value {
              color: #1f2937;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 2px solid #e2e8f0; 
              color: #64748b; 
              font-size: 10px; 
            }
            @media print {
              body { font-size: 11px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏛️ YAHSHUA-ABBA TAXPAYER FORM</h1>
            <p><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Document Status:</strong> OFFICIAL SUBMISSION</p>
          </div>

          <div class="section">
            <h2>📋 Form Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">BIR Form Number:</span>
                <span class="info-value">${formData.birFormNo || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Revenue Period:</span>
                <span class="info-value">${formData.revenuePeriod || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tax ID Number:</span>
                <span class="info-value">${formData.taxIdentificationNumber || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">RDO Code:</span>
                <span class="info-value">${formData.rdoCode || 'N/A'}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">Line of Business:</span>
              <span class="info-value">${formData.lineOfBusiness || 'N/A'}</span>
            </div>
          </div>

          <div class="section">
            <h2>👤 Taxpayer Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Taxpayer Name:</span>
                <span class="info-value">${formData.taxpayerName || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Trade Name:</span>
                <span class="info-value">${formData.tradeName || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email Address:</span>
                <span class="info-value">${formData.emailAddress || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone/Fax:</span>
                <span class="info-value">${formData.telFaxNo || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Zip Code:</span>
                <span class="info-value">${formData.zipCode || 'N/A'}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">Registered Address:</span>
              <span class="info-value">${formData.registeredAddress || 'N/A'}</span>
            </div>
          </div>

          <div class="section">
            <h2>📝 Business Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Business Rating:</span>
                <span class="info-value">${formData.businessRating || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Ownership Type:</span>
                <span class="info-value">${formData.ownershipType || 'N/A'}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">Business in Good Standing:</span>
              <span class="info-value">${formData.businessInGood ? 'YES' : 'NO'}</span>
            </div>
          </div>

          <div class="section">
            <h2>✍️ Signatures & Authorization</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Taxpayer Signature:</span>
                <span class="info-value">${formData.taxpayerSignature || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Authorized Representative:</span>
                <span class="info-value">${formData.authorizedRepSignature || 'N/A'}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">Date Accomplished:</span>
              <span class="info-value">${formData.dateAccomplished || 'N/A'}</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>YAHSHUA-ABBA Tax Form System</strong></p>
            <p>Generated: ${new Date().toLocaleString()} | Document ID: ${Date.now()}</p>
            <p>This is an official digital submission to support@abba.works</p>
          </div>
        </body>
      </html>
    `;

    // Generate PDF
    console.log('Generating PDF attachment...');
    const pdfOptions = { 
      format: 'A4', 
      border: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
      type: 'pdf',
      quality: '75'
    };
    
    const pdfBuffer = await htmlPdf.generatePdf({ content: pdfHtml }, pdfOptions);
    
    // Create professional email content (simpler since PDF has details)
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
              max-width: 600px; 
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
            .content {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #1e40af;
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
          </div>

          <div class="content">
            <h3>📋 New Taxpayer Form Submission</h3>
            <p><strong>Taxpayer:</strong> ${formData.taxpayerName}</p>
            <p><strong>Tax ID:</strong> ${formData.taxIdentificationNumber || 'N/A'}</p>
            <p><strong>Email:</strong> ${formData.emailAddress}</p>
            <p><strong>BIR Form:</strong> ${formData.birFormNo || 'N/A'}</p>
            
            <p>📎 <strong>Complete form details are attached as a PDF document.</strong></p>
            
            <p>This submission has been automatically processed and is ready for review.</p>
          </div>

          <div class="footer">
            <p><strong>📧 YAHSHUA-ABBA Tax Form System</strong></p>
            <p>Automated submission via Gmail SMTP</p>
          </div>
        </body>
      </html>
    `;

    // Email configuration
    const fileName = `Taxpayer-Form-${formData.taxpayerName.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.pdf`;
    
    const mailOptions = {
      from: `"YAHSHUA Tax Forms" <${gmailUser}>`,
      to: 'support@abba.works',
      cc: formData.emailAddress || undefined,
      subject: `📋 Taxpayer Form Submission - ${formData.taxpayerName} (${formData.taxIdentificationNumber || 'No Tax ID'})`,
      html: emailHtml,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email via Gmail SMTP
    console.log('Sending email with PDF attachment...');
    const emailInfo = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully via Gmail SMTP with PDF attachment:', emailInfo.messageId);

    res.status(200).json({
      success: true,
      message: '✅ Form submitted successfully! Email with PDF attachment sent directly to support@abba.works',
      messageId: emailInfo.messageId,
      pdfFileName: fileName,
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