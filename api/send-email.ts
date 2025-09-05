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

// Function to generate a professional form-style PDF using PDFKit
const generateFormStylePDF = (formData: FormData): Promise<Buffer> => {
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

      // Colors and styling
      const primaryColor = '#1e40af';
      const fieldBgColor = '#f8fafc';
      const borderColor = '#d1d5db';

      // Helper function to draw a bordered field
      const drawField = (x: number, y: number, width: number, height: number, label: string, value: string) => {
        // Field border
        doc.rect(x, y, width, height)
           .fillAndStroke(fieldBgColor, borderColor);
        
        // Label
        doc.fontSize(8)
           .fillColor(primaryColor)
           .text(label.toUpperCase(), x + 5, y + 3, { width: width - 10 });
        
        // Value
        doc.fontSize(10)
           .fillColor('#000')
           .text(value || 'N/A', x + 5, y + 15, { width: width - 10, height: height - 20 });
      };

      // Helper function to draw section header
      const drawSectionHeader = (x: number, y: number, width: number, title: string) => {
        doc.rect(x, y, width, 25)
           .fillAndStroke(primaryColor, primaryColor);
        
        doc.fontSize(12)
           .fillColor('white')
           .text(title.toUpperCase(), x + 10, y + 8, { width: width - 20 });
        
        return y + 25;
      };

      let currentY = 60;

      // Header
      doc.fontSize(18)
         .fillColor(primaryColor)
         .text('YAHSHUA-ABBA TAXPAYER FORM', { align: 'center' });

      currentY += 30;
      
      doc.fontSize(10)
         .fillColor('#666')
         .text(`Submission Date: ${new Date().toLocaleString()}`, { align: 'center' })
         .text('OFFICIAL SUBMISSION DOCUMENT', { align: 'center' });

      currentY += 40;

      // Form Information Section
      currentY = drawSectionHeader(40, currentY, 515, 'FORM INFORMATION');
      currentY += 5;

      // Two columns for form info
      drawField(40, currentY, 255, 35, 'Revenue Period', formData.revenuePeriod);
      drawField(300, currentY, 255, 35, 'Tax ID Number', formData.taxIdentificationNumber);
      currentY += 40;

      drawField(40, currentY, 255, 35, 'RDO Code', formData.rdoCode);
      drawField(300, currentY, 255, 35, 'Line of Business', formData.lineOfBusiness);
      currentY += 50;

      // Taxpayer Information Section
      currentY = drawSectionHeader(40, currentY, 515, 'TAXPAYER INFORMATION');
      currentY += 5;

      drawField(40, currentY, 255, 35, 'Taxpayer Name', formData.taxpayerName);
      drawField(300, currentY, 255, 35, 'Trade Name', formData.tradeName);
      currentY += 40;

      drawField(40, currentY, 255, 35, 'Email Address', formData.emailAddress);
      drawField(300, currentY, 255, 35, 'Phone/Fax Number', formData.telFaxNo);
      currentY += 40;

      drawField(40, currentY, 255, 35, 'Zip Code', formData.zipCode);
      drawField(300, currentY, 255, 35, '', ''); // Empty field for spacing
      currentY += 40;

      // Full width address field
      drawField(40, currentY, 515, 35, 'Registered Address', formData.registeredAddress);
      currentY += 50;

      // Business Information Section
      currentY = drawSectionHeader(40, currentY, 515, 'BUSINESS INFORMATION');
      currentY += 5;

      drawField(40, currentY, 255, 35, 'Business Rating', formData.businessRating);
      drawField(300, currentY, 255, 35, 'Ownership Type', formData.ownershipType);
      currentY += 40;

      // Business in Good Standing with checkbox style
      doc.rect(40, currentY, 515, 35)
         .fillAndStroke(fieldBgColor, borderColor);
      
      doc.fontSize(8)
         .fillColor(primaryColor)
         .text('BUSINESS IN GOOD STANDING', 45, currentY + 3);
      
      // Draw checkboxes
      const checkboxY = currentY + 18;
      
      // YES checkbox
      doc.rect(45, checkboxY, 12, 12)
         .stroke(borderColor);
      if (formData.businessInGood) {
        doc.fontSize(10)
           .fillColor(primaryColor)
           .text('✓', 47, checkboxY + 1);
      }
      doc.fontSize(10)
         .fillColor('#000')
         .text('YES', 65, checkboxY + 2);
      
      // NO checkbox
      doc.rect(110, checkboxY, 12, 12)
         .stroke(borderColor);
      if (!formData.businessInGood) {
        doc.fontSize(10)
           .fillColor(primaryColor)
           .text('✓', 112, checkboxY + 1);
      }
      doc.fontSize(10)
         .fillColor('#000')
         .text('NO', 130, checkboxY + 2);

      currentY += 50;

      // Compliance Items (if present)
      if (formData.complianceItems && Object.keys(formData.complianceItems).length > 0) {
        currentY = drawSectionHeader(40, currentY, 515, 'COMPLIANCE ITEMS');
        currentY += 5;

        const complianceEntries = Object.entries(formData.complianceItems);
        for (let i = 0; i < complianceEntries.length; i += 2) {
          const [key1, value1] = complianceEntries[i];
          const [key2, value2] = complianceEntries[i + 1] || ['', ''];
          
          const label1 = key1.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          const label2 = key2 ? key2.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : '';
          
          drawField(40, currentY, 255, 35, label1, String(value1 || 'N/A'));
          if (key2) {
            drawField(300, currentY, 255, 35, label2, String(value2 || 'N/A'));
          }
          currentY += 40;
        }
        currentY += 10;
      }

      // Revenue Declarations (if present)
      if (formData.revenueDeclarations && Object.keys(formData.revenueDeclarations).length > 0) {
        currentY = drawSectionHeader(40, currentY, 515, 'REVENUE DECLARATIONS');
        currentY += 5;

        const revenueEntries = Object.entries(formData.revenueDeclarations);
        for (let i = 0; i < revenueEntries.length; i += 2) {
          const [key1, value1] = revenueEntries[i];
          const [key2, value2] = revenueEntries[i + 1] || ['', ''];
          
          const label1 = key1.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          const label2 = key2 ? key2.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : '';
          
          drawField(40, currentY, 255, 35, label1, String(value1 || 'N/A'));
          if (key2) {
            drawField(300, currentY, 255, 35, label2, String(value2 || 'N/A'));
          }
          currentY += 40;
        }
        currentY += 10;
      }

      // Signatures & Authorization Section
      currentY = drawSectionHeader(40, currentY, 515, 'SIGNATURES & AUTHORIZATION');
      currentY += 5;

      drawField(40, currentY, 255, 35, 'Taxpayer Signature', formData.taxpayerSignature);
      drawField(300, currentY, 255, 35, 'Authorized Representative', formData.authorizedRepSignature);
      currentY += 40;

      // Full width date field
      drawField(40, currentY, 515, 35, 'Date Accomplished', formData.dateAccomplished);
      currentY += 50;

      // Footer
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

    // Generate form-style PDF
    console.log('Generating professional form-style PDF...');
    const pdfBuffer = await generateFormStylePDF(formData);
    
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
            <p>Professional form-style PDF with Gmail SMTP delivery</p>
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
    console.log('Sending email with professional form-style PDF...');
    const emailInfo = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully via Gmail SMTP with form-style PDF:', emailInfo.messageId);

    res.status(200).json({
      success: true,
      message: '✅ Form submitted successfully! Professional form-style PDF sent directly to support@abba.works',
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