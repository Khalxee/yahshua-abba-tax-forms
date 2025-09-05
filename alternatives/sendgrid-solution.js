// SendGrid Alternative - More Reliable than Resend
import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    // Set SendGrid API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: 'support@abba.works',
      cc: formData.emailAddress,
      from: {
        email: 'noreply@abba.works', // Use verified domain or default
        name: 'YAHSHUA Tax Forms'
      },
      subject: `📋 Taxpayer Form Submission - ${formData.taxpayerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1 style="color: #1e40af;">🏛️ YAHSHUA-ABBA TAXPAYER FORM</h1>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 4px;">
            <h3>Taxpayer Information</h3>
            <p><strong>Name:</strong> ${formData.taxpayerName}</p>
            <p><strong>Email:</strong> ${formData.emailAddress}</p>
            <p><strong>Tax ID:</strong> ${formData.taxIdentificationNumber}</p>
            <p><strong>Address:</strong> ${formData.registeredAddress}</p>
            <p><strong>Phone:</strong> ${formData.telFaxNo}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 4px; margin-top: 15px;">
            <h3>Form Details</h3>
            <p><strong>BIR Form:</strong> ${formData.birFormNo}</p>
            <p><strong>Revenue Period:</strong> ${formData.revenuePeriod}</p>
            <p><strong>Line of Business:</strong> ${formData.lineOfBusiness}</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);

    res.status(200).json({
      success: true,
      message: '✅ Email sent directly to support@abba.works via SendGrid!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SendGrid error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Setup Steps:
// 1. Go to https://sendgrid.com/
// 2. Sign up (free tier: 100 emails/day)
// 3. Verify sender identity (email or domain)
// 4. Create API key
// 5. Add to Vercel: SENDGRID_API_KEY=your-api-key
// 6. Install: npm install @sendgrid/mail