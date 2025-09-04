import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    // Get Resend API key from environment variable
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured in Vercel environment variables');
    }

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
            <p><strong>Status:</strong> ✅ AUTOMATICALLY PROCESSED</p>
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
            <p><strong>📧 This email was sent automatically by the YAHSHUA-ABBA Tax Form System</strong></p>
            <p>Powered by Vercel Functions + Resend API</p>
          </div>
        </body>
      </html>
    `;

    // Send email with YAHSHUA Compliance branding to verified address
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'YAHSHUA Compliance <onboarding@resend.dev>',
        to: ['yahshua.babidabb@gmail.com'], // Only verified address that works
        subject: `📋 FORWARD TO: support@abba.works - Taxpayer Form - ${formData.taxpayerName} (${formData.taxIdentificationNumber || 'No Tax ID'})`,
        html: emailHtml + `
          <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
            <h4 style="color: #15803d; margin-top: 0;">📧 ACTION: Forward to support@abba.works</h4>
            <p><strong>Please forward this email to: support@abba.works</strong></p>
            <p><strong>From YAHSHUA Compliance:</strong> yahshua.compliance@gmail.com</p>
            <p><em>Reply-to is set to yahshua.compliance@gmail.com for direct responses</em></p>
          </div>
        `,
        reply_to: 'yahshua.compliance@gmail.com'
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(`Resend API error: ${emailResult.message || 'Unknown error'}`);
    }

    console.log('✅ Email sent successfully:', emailResult.id);

    res.status(200).json({
      success: true,
      message: '✅ Form submitted successfully! Email sent from YAHSHUA Compliance - please forward to support@abba.works',
      emailId: emailResult.id,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Email submission error:', error);
    
    res.status(500).json({
      success: false,
      error: `Failed to send email: ${error.message}`,
    });
  }
}