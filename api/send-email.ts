import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';
import chromium from 'chrome-aws-lambda';

interface FormData {
  taxpayerName: string;
  emailAddress: string;
  taxIdentificationNumber: string;
  registeredAddress: string;
  telFaxNo: string;
  birFormNo?: string;
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

// Function to generate PDF from HTML using Puppeteer
const generatePDFFromHTML = async (formData: FormData): Promise<Buffer> => {
  let browser = null;

  try {
    // HTML template that looks like a professional form
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 0; 
              padding: 40px; 
              line-height: 1.4; 
              color: #333;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 3px solid #1e40af;
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #1e40af; 
              font-size: 28px; 
              margin: 0 0 10px 0; 
              font-weight: bold;
            }
            .header p { 
              color: #666; 
              margin: 5px 0; 
              font-size: 14px;
            }
            .form-section { 
              margin-bottom: 30px; 
              page-break-inside: avoid;
            }
            .section-title { 
              background-color: #1e40af; 
              color: white; 
              padding: 12px 20px; 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 15px;
              text-transform: uppercase;
            }
            .form-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 20px; 
              margin-bottom: 15px;
            }
            .form-row { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 20px; 
              margin-bottom: 15px;
            }
            .form-field { 
              border: 1px solid #ddd; 
              padding: 12px; 
              border-radius: 4px;
              background: #fafafa;
            }
            .form-field.full-width { 
              grid-column: 1 / -1; 
            }
            .field-label { 
              font-weight: bold; 
              color: #1e40af; 
              font-size: 12px; 
              text-transform: uppercase;
              display: block;
              margin-bottom: 6px;
            }
            .field-value { 
              color: #333; 
              font-size: 14px;
              min-height: 18px;
              word-wrap: break-word;
            }
            .signature-section {
              margin-top: 40px;
              border-top: 2px solid #eee;
              padding-top: 20px;
            }
            .footer { 
              margin-top: 50px; 
              text-align: center; 
              border-top: 2px solid #1e40af; 
              padding-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .checkbox { 
              display: inline-block; 
              width: 16px; 
              height: 16px; 
              border: 2px solid #1e40af; 
              margin-right: 8px;
              text-align: center;
              line-height: 12px;
              font-weight: bold;
              color: #1e40af;
            }
            @media print {
              body { margin: 20px; }
              .form-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>YAHSHUA-ABBA TAXPAYER FORM</h1>
            <p><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Document Status:</strong> OFFICIAL SUBMISSION</p>
          </div>

          <div class="form-section">
            <div class="section-title">Form Information</div>
            <div class="form-grid">
              <div class="form-field">
                <span class="field-label">Revenue Period</span>
                <div class="field-value">${formData.revenuePeriod || 'N/A'}</div>
              </div>
              <div class="form-field">
                <span class="field-label">Tax ID Number</span>
                <div class="field-value">${formData.taxIdentificationNumber || 'N/A'}</div>
              </div>
              <div class="form-field">
                <span class="field-label">RDO Code</span>
                <div class="field-value">${formData.rdoCode || 'N/A'}</div>
              </div>
              <div class="form-field">
                <span class="field-label">Line of Business</span>
                <div class="field-value">${formData.lineOfBusiness || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-title">Taxpayer Information</div>
            <div class="form-grid">
              <div class="form-field">
                <span class="field-label">Taxpayer Name</span>
                <div class="field-value">${formData.taxpayerName || 'N/A'}</div>
              </div>
              <div class="form-field">
                <span class="field-label">Trade Name</span>
                <div class="field-value">${formData.tradeName || 'N/A'}</div>
              </div>
              <div class="form-field">
                <span class="field-label">Email Address</span>
                <div class="field-value">${formData.emailAddress || 'N/A'}</div>
              </div>
              <div class="form-field">
                <span class="field-label">Phone/Fax Number</span>
                <div class="field-value">${formData.telFaxNo || 'N/A'}</div>
              </div>
              <div class="form-field">
                <span class="field-label">Zip Code</span>
                <div class="field-value">${formData.zipCode || 'N/A'}</div>
              </div>
            </div>
            <div class="form-field full-width">
              <span class="field-label">Registered Address</span>
              <div class="field-value">${formData.registeredAddress || 'N/A'}</div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-title">Business Information</div>
            <div class="form-grid">
              <div class="form-field">
                <span class="field-label">Business Rating</span>
                <div class="field-value">${formData.businessRating || 'N/A'}</div>
              </div>
              <div class="form-field">
                <span class="field-label">Ownership Type</span>
                <div class="field-value">${formData.ownershipType || 'N/A'}</div>
              </div>
              <div class="form-field full-width">
                <span class="field-label">Business in Good Standing</span>
                <div class="field-value">
                  <span class="checkbox">${formData.businessInGood ? '✓' : ''}</span> YES
                  <span class="checkbox">${!formData.businessInGood ? '✓' : ''}</span> NO
                </div>
              </div>
            </div>
          </div>

          ${formData.complianceItems && Object.keys(formData.complianceItems).length > 0 ? `
          <div class="form-section">
            <div class="section-title">Compliance Items</div>
            <div class="form-grid">
              ${Object.entries(formData.complianceItems).map(([key, value]) => `
                <div class="form-field">
                  <span class="field-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <div class="field-value">${value || 'N/A'}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          ${formData.revenueDeclarations && Object.keys(formData.revenueDeclarations).length > 0 ? `
          <div class="form-section">
            <div class="section-title">Revenue Declarations</div>
            <div class="form-grid">
              ${Object.entries(formData.revenueDeclarations).map(([key, value]) => `
                <div class="form-field">
                  <span class="field-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <div class="field-value">${value || 'N/A'}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="form-section signature-section">
            <div class="section-title">Signatures & Authorization</div>
            <div class="form-grid">
              <div class="form-field">
                <span class="field-label">Taxpayer Signature</span>
                <div class="field-value">${formData.taxpayerSignature || 'N/A'}</div>
              </div>
              <div class="form-field">
                <span class="field-label">Authorized Representative</span>
                <div class="field-value">${formData.authorizedRepSignature || 'N/A'}</div>
              </div>
              <div class="form-field full-width">
                <span class="field-label">Date Accomplished</span>
                <div class="field-value">${formData.dateAccomplished || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>YAHSHUA-ABBA Tax Form System</strong></p>
            <p>Document ID: ${Date.now()} | Generated: ${new Date().toLocaleString()}</p>
            <p>This is an official digital submission to support@abba.works</p>
          </div>
        </body>
      </html>
    `;

    // Launch browser
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return pdfBuffer;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

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

    // Generate PDF from HTML
    console.log('Generating professional PDF from HTML...');
    const pdfBuffer = await generatePDFFromHTML(formData);
    
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
            .info-item {
              margin: 8px 0;
              padding: 8px;
              background: white;
              border-radius: 4px;
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
            <h1>YAHSHUA-ABBA TAXPAYER FORM SUBMISSION</h1>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div class="content">
            <h3>New Taxpayer Form Submission</h3>
            
            <div class="info-item">
              <span class="info-label">Taxpayer:</span> ${formData.taxpayerName}
            </div>
            <div class="info-item">
              <span class="info-label">Tax ID:</span> ${formData.taxIdentificationNumber || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span> ${formData.emailAddress}
            </div>
            <div class="info-item">
              <span class="info-label">Line of Business:</span> ${formData.lineOfBusiness || 'N/A'}
            </div>
            
            <p style="margin-top: 20px;">
              <strong>Complete form details are attached as a professional PDF document.</strong>
            </p>
            
            <p>This submission has been automatically processed and is ready for review.</p>
          </div>

          <div class="footer">
            <p><strong>YAHSHUA-ABBA Tax Form System</strong></p>
            <p>Professional HTML-to-PDF conversion with Gmail SMTP delivery</p>
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
      subject: `Taxpayer Form Submission - ${formData.taxpayerName} (${formData.taxIdentificationNumber || 'No Tax ID'})`,
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
    console.log('Sending email with professional PDF attachment...');
    const emailInfo = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully via Gmail SMTP with HTML-to-PDF attachment:', emailInfo.messageId);

    res.status(200).json({
      success: true,
      message: '✅ Form submitted successfully! Professional PDF attachment sent directly to support@abba.works',
      messageId: emailInfo.messageId,
      pdfFileName: fileName,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Gmail SMTP or PDF generation error:', error);
    
    res.status(500).json({
      success: false,
      error: `Failed to send email via Gmail SMTP: ${error.message}`,
    });
  }
}