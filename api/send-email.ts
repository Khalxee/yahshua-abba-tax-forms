import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

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

// Simple, reliable PDF generation using PDFKit
const generateReliablePDF = (formData: FormData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: 'YAHSHUA-ABBA Taxpayer Form',
          Author: 'YAHSHUA-ABBA Tax System',
          Subject: `Taxpayer Form - ${formData.taxpayerName}`,
          Creator: 'YAHSHUA-ABBA Tax Form System'
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(18)
         .fillColor('#1e40af')
         .text('YAHSHUA-ABBA TAXPAYER FORM', { align: 'center' });
      
      doc.fontSize(12)
         .fillColor('#666')
         .text(`Submission Date: ${new Date().toLocaleString()}`, { align: 'center' })
         .text('OFFICIAL SUBMISSION DOCUMENT', { align: 'center' })
         .moveDown(2);

      // Helper function to add a field (one column layout)
      const addField = (label: string, value: string | boolean) => {
        const displayValue = typeof value === 'boolean' ? (value ? 'YES' : 'NO') : (value || 'N/A');
        
        doc.fontSize(10)
           .fillColor('#1e40af')
           .text(label + ':', { continued: true, width: 150 })
           .fillColor('#333')
           .text(' ' + displayValue)
           .moveDown(0.3);
      };

      // Helper function to add section header
      const addSectionHeader = (title: string) => {
        doc.moveDown(0.5);
        doc.fontSize(12)
           .fillColor('#1e40af')
           .text(title, { underline: true })
           .moveDown(0.5);
      };

      // FORM INFORMATION SECTION
      addSectionHeader('FORM INFORMATION');
      addField('Revenue Period', formData.revenuePeriod);
      addField('Tax ID Number', formData.taxIdentificationNumber);
      addField('RDO Code', formData.rdoCode);
      addField('Line of Business', formData.lineOfBusiness);

      // TAXPAYER INFORMATION SECTION  
      addSectionHeader('TAXPAYER INFORMATION');
      addField('Taxpayer Name', formData.taxpayerName);
      addField('Trade Name', formData.tradeName);
      addField('Email Address', formData.emailAddress);
      addField('Phone/Fax Number', formData.telFaxNo);
      addField('Registered Address', formData.registeredAddress);
      addField('Zip Code', formData.zipCode);

      // BUSINESS INFORMATION SECTION
      addSectionHeader('BUSINESS INFORMATION');
      addField('Business Rating', formData.businessRating);
      addField('Ownership Type', formData.ownershipType);
      addField('Business in Good Standing', formData.businessInGood); // Will show YES or NO

      // COMPLIANCE ITEMS SECTION (if present)
      if (formData.complianceItems && Object.keys(formData.complianceItems).length > 0) {
        addSectionHeader('COMPLIANCE ITEMS');
        Object.entries(formData.complianceItems).forEach(([key, value]) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          addField(label, typeof value === 'boolean' ? (value ? 'YES' : 'NO') : value);
        });
      }

      // REVENUE DECLARATIONS SECTION (if present)
      if (formData.revenueDeclarations && Object.keys(formData.revenueDeclarations).length > 0) {
        addSectionHeader('REVENUE DECLARATIONS');
        Object.entries(formData.revenueDeclarations).forEach(([key, value]) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          addField(label, typeof value === 'boolean' ? (value ? 'YES' : 'NO') : value);
        });
      }

      // SIGNATURES & AUTHORIZATION SECTION
      addSectionHeader('SIGNATURES & AUTHORIZATION');
      addField('Taxpayer Signature', formData.taxpayerSignature);
      addField('Authorized Representative', formData.authorizedRepSignature);
      addField('Date Accomplished', formData.dateAccomplished);

      // ADDITIONAL INFORMATION (catch any other fields)
      const excludedFields = [
        'taxpayerName', 'emailAddress', 'taxIdentificationNumber', 'registeredAddress', 
        'telFaxNo', 'birFormNo', 'revenuePeriod', 'lineOfBusiness', 'rdoCode', 
        'tradeName', 'zipCode', 'businessRating', 'ownershipType', 'businessInGood',
        'taxpayerSignature', 'authorizedRepSignature', 'dateAccomplished',
        'complianceItems', 'revenueDeclarations'
      ];

      const additionalFields = Object.entries(formData).filter(([key, value]) => 
        !excludedFields.includes(key) && value !== undefined && value !== null && value !== ''
      );

      if (additionalFields.length > 0) {
        addSectionHeader('ADDITIONAL INFORMATION');
        additionalFields.forEach(([key, value]) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          addField(label, typeof value === 'boolean' ? (value ? 'YES' : 'NO') : value);
        });
      }

      // Footer
      doc.moveDown(3);
      doc.fontSize(8)
         .fillColor('#666')
         .text('================================================================================', { align: 'center' })
         .moveDown(0.5)
         .text('YAHSHUA-ABBA Tax Form System', { align: 'center' })
         .text(`Document ID: ${Date.now()}`, { align: 'center' })
         .text('This is an official digital submission to support@abba.works', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
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

    // Generate reliable PDF
    console.log('Generating reliable PDF with single column layout...');
    const pdfBuffer = await generateReliablePDF(formData);
    
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
            <div class="info-item">
              <span class="info-label">Business in Good Standing:</span> ${formData.businessInGood ? 'YES' : 'NO'}
            </div>
            
            <p style="margin-top: 20px;">
              <strong>Complete form details are attached as a PDF document.</strong>
            </p>
            
            <p>This submission has been automatically processed and is ready for review.</p>
          </div>

          <div class="footer">
            <p><strong>YAHSHUA-ABBA Tax Form System</strong></p>
            <p>Reliable PDF generation with Gmail SMTP delivery</p>
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
    console.log('Sending email with reliable PDF attachment...');
    const emailInfo = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully via Gmail SMTP with reliable PDF:', emailInfo.messageId);

    res.status(200).json({
      success: true,
      message: '✅ Form submitted successfully! Reliable PDF attachment sent directly to support@abba.works',
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