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

// Function to generate proper PDF using PDFKit
const generatePDF = (formData: FormData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 40,
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

      let currentY = 60;

      // Title - Bold and centered
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#000')
         .text('YAHSHUA-ABBA TAXPAYER FORM', { align: 'center' });
      
      currentY += 30;
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Submission Date: ${new Date().toLocaleString()}`, { align: 'center' })
         .text('OFFICIAL SUBMISSION DOCUMENT', { align: 'center' });
      
      currentY += 40;

      // Helper function to add section with single column layout
      const addSection = (title: string, fields: Array<[string, string]>) => {
        // Section title - Bold
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#000')
           .text(title, 50, currentY);
        
        currentY += 20;
        
        // Draw section border
        doc.rect(50, currentY - 5, 495, (fields.length * 20) + 10)
           .stroke('#ccc');
        
        fields.forEach(([label, value]) => {
          // Field background
          doc.rect(55, currentY, 485, 18)
             .fillColor('#f8f9fa')
             .fill()
             .stroke('#ddd');
          
          // Label (bold)
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor('#1e40af')
             .text(`${label}:`, 60, currentY + 4, { width: 150 });
          
          // Value
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor('#000')
             .text(value || 'N/A', 220, currentY + 4, { width: 310, ellipsis: false });
          
          currentY += 20;
        });
        
        currentY += 15;
      };

      // Form Information Section (no BIR Form Number)
      addSection('FORM INFORMATION', [
        ['Revenue Period', formData.revenuePeriod],
        ['Tax ID Number', formData.taxIdentificationNumber],
        ['RDO Code', formData.rdoCode],
        ['Line of Business', formData.lineOfBusiness]
      ]);

      // Taxpayer Information Section
      addSection('TAXPAYER INFORMATION', [
        ['Taxpayer Name', formData.taxpayerName],
        ['Trade Name', formData.tradeName],
        ['Email Address', formData.emailAddress],
        ['Phone/Fax Number', formData.telFaxNo],
        ['Registered Address', formData.registeredAddress],
        ['Zip Code', formData.zipCode]
      ]);

      // Business Information Section
      addSection('BUSINESS INFORMATION', [
        ['Business Rating', formData.businessRating],
        ['Ownership Type', formData.ownershipType],
        ['Business in Good Standing', formData.businessInGood ? 'YES' : 'NO'] // Fixed checkbox logic
      ]);

      // Add Compliance Items if present
      if (formData.complianceItems && Object.keys(formData.complianceItems).length > 0) {
        const complianceFields = Object.entries(formData.complianceItems).map(([key, value]) => [
          key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          String(value)
        ]);
        addSection('COMPLIANCE ITEMS', complianceFields);
      }

      // Add Revenue Declarations if present
      if (formData.revenueDeclarations && Object.keys(formData.revenueDeclarations).length > 0) {
        const revenueFields = Object.entries(formData.revenueDeclarations).map(([key, value]) => [
          key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          String(value)
        ]);
        addSection('REVENUE DECLARATIONS', revenueFields);
      }

      // Signatures & Authorization Section
      addSection('SIGNATURES & AUTHORIZATION', [
        ['Taxpayer Signature', formData.taxpayerSignature],
        ['Authorized Representative', formData.authorizedRepSignature],
        ['Date Accomplished', formData.dateAccomplished]
      ]);

      // Footer
      currentY += 20;
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#666')
         .text('================================================================================', 50, currentY, { align: 'center' });
      
      currentY += 15;
      
      doc.text('YAHSHUA-ABBA Tax Form System', 50, currentY, { align: 'center' })
         .text(`Document ID: ${Date.now()}`, 50, currentY + 12, { align: 'center' })
         .text('This is an official digital submission to support@abba.works', 50, currentY + 24, { align: 'center' });

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

    // Generate proper PDF
    console.log('Generating professional single-column PDF...');
    const pdfBuffer = await generatePDF(formData);
    
    // Create professional email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Tahoma, Arial, sans-serif; 
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
            .header h1 {
              font-weight: bold;
              margin: 0 0 10px 0;
            }
            .content {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #1e40af;
            }
            .content h3 {
              font-weight: bold;
              color: #1e40af;
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
              <strong>Complete form details are attached as a professional PDF document.</strong>
            </p>
            
            <p>This submission has been automatically processed and is ready for review.</p>
          </div>

          <div class="footer">
            <p><strong>YAHSHUA-ABBA Tax Form System</strong></p>
            <p>Professional single-column PDF with Tahoma font</p>
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
    console.log('Sending email with single-column PDF attachment...');
    const emailInfo = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully via Gmail SMTP with proper PDF attachment:', emailInfo.messageId);

    res.status(200).json({
      success: true,
      message: '✅ Form submitted successfully! Professional single-column PDF sent directly to support@abba.works',
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