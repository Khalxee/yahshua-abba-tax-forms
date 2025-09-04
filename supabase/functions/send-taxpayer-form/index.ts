import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.json();
    console.log("Processing taxpayer form submission for:", formData.taxpayerName);

    // Generate comprehensive form data text
    const complianceText = Object.entries(formData.complianceItems || {})
      .filter(([key]) => key !== 'otherSpecifyText')
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `        • ${label}: ${typeof value === 'boolean' ? (value ? 'YES' : 'NO') : value}`;
      })
      .join('\n');

    const revenueText = Object.entries(formData.revenueDeclarations || {})
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `        • ${label}: ${value ? 'YES' : 'NO'}`;
      })
      .join('\n');

    // Create professional email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e40af; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; padding: 15px; border-left: 4px solid #1e40af; background-color: #f8fafc; }
            .section h3 { color: #1e40af; margin-top: 0; margin-bottom: 15px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .info-item { background: white; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; }
            .info-label { font-weight: bold; color: #475569; }
            .compliance-list { background: white; padding: 15px; border-radius: 4px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 14px; }
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
            <div class="info-grid">
              <div class="info-item"><span class="info-label">BIR Form No:</span> ${formData.birFormNo || 'N/A'}</div>
              <div class="info-item"><span class="info-label">Revenue Period:</span> ${formData.revenuePeriod || 'N/A'}</div>
              <div class="info-item"><span class="info-label">Tax ID Number:</span> ${formData.taxIdentificationNumber || 'N/A'}</div>
              <div class="info-item"><span class="info-label">RDO Code:</span> ${formData.rdoCode || 'N/A'}</div>
            </div>
            <div class="info-item"><span class="info-label">Line of Business:</span> ${formData.lineOfBusiness || 'N/A'}</div>
          </div>

          <div class="section">
            <h3>👤 Taxpayer Information</h3>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Taxpayer Name:</span> ${formData.taxpayerName || 'N/A'}</div>
              <div class="info-item"><span class="info-label">Trade Name:</span> ${formData.tradeName || 'N/A'}</div>
            </div>
            <div class="info-item"><span class="info-label">Registered Address:</span> ${formData.registeredAddress || 'N/A'}</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Zip Code:</span> ${formData.zipCode || 'N/A'}</div>
              <div class="info-item"><span class="info-label">Phone:</span> ${formData.telFaxNo || 'N/A'}</div>
            </div>
            <div class="info-item"><span class="info-label">Email:</span> ${formData.emailAddress || 'N/A'}</div>
          </div>

          <div class="section">
            <h3>✅ Compliance Checklist</h3>
            <div class="compliance-list">
              <pre>${complianceText}</pre>
              ${formData.complianceItems?.otherSpecifyText ? `<p><strong>Other Specification:</strong> ${formData.complianceItems.otherSpecifyText}</p>` : ''}
            </div>
          </div>

          <div class="section">
            <h3>💰 Revenue Declarations</h3>
            <div class="compliance-list">
              <pre>${revenueText}</pre>
            </div>
          </div>

          <div class="section">
            <h3>📝 Additional Information</h3>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Business Rating:</span> ${formData.businessRating || 'N/A'}</div>
              <div class="info-item"><span class="info-label">Ownership Type:</span> ${formData.ownershipType || 'N/A'}</div>
            </div>
            <div class="info-item"><span class="info-label">Business in Good Standing:</span> ${formData.businessInGood ? 'YES' : 'NO'}</div>
          </div>

          <div class="section">
            <h3>✍️ Signatures & Dates</h3>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Taxpayer Signature:</span> ${formData.taxpayerSignature || 'N/A'}</div>
              <div class="info-item"><span class="info-label">Authorized Rep:</span> ${formData.authorizedRepSignature || 'N/A'}</div>
              <div class="info-item"><span class="info-label">Date Accomplished:</span> ${formData.dateAccomplished || 'N/A'}</div>
              <div class="info-item"><span class="info-label">Tax Mapped By:</span> ${formData.taxMappedBy || 'N/A'}</div>
              <div class="info-item"><span class="info-label">Date Tax Mapped:</span> ${formData.dateTaxMapped || 'N/A'}</div>
              <div class="info-item"><span class="info-label">Received By:</span> ${formData.receivedBy || 'N/A'}</div>
            </div>
          </div>

          <div class="footer">
            <p><strong>📧 This email was sent automatically by the YAHSHUA-ABBA Tax Form System</strong></p>
            <p>Form submitted via: ${req.headers.get('origin') || 'Tax Form Application'}</p>
          </div>
        </body>
      </html>
    `;

    // Send email to support@abba.works with copy to taxpayer
    const emailResponse = await resend.emails.send({
      from: "YAHSHUA-ABBA Tax Forms <onboarding@resend.dev>", 
      to: ["support@abba.works"],
      cc: formData.emailAddress ? [formData.emailAddress] : [],
      subject: `📋 Taxpayer Form Submission - ${formData.taxpayerName} (${formData.taxIdentificationNumber || 'No Tax ID'})`,
      html: emailHtml,
    });

    console.log("✅ Email sent successfully to support@abba.works:", emailResponse.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "✅ Form submitted successfully! Email sent to support@abba.works with confirmation copy to you.",
        emailId: emailResponse.data?.id,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Email submission error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send email: " + error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);