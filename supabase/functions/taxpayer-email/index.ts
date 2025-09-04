import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.json();
    console.log("Processing form for:", formData.taxpayerName);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">🏛️ YAHSHUA-ABBA TAXPAYER FORM SUBMISSION</h1>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Status:</strong> ✅ AUTOMATICALLY PROCESSED</p>
        
        <h3 style="color: #1e40af;">Taxpayer Information</h3>
        <ul>
          <li><strong>Name:</strong> ${formData.taxpayerName || 'N/A'}</li>
          <li><strong>Email:</strong> ${formData.emailAddress || 'N/A'}</li>
          <li><strong>Tax ID:</strong> ${formData.taxIdentificationNumber || 'N/A'}</li>
          <li><strong>Address:</strong> ${formData.registeredAddress || 'N/A'}</li>
          <li><strong>Phone:</strong> ${formData.telFaxNo || 'N/A'}</li>
        </ul>
        
        <h3 style="color: #1e40af;">Form Details</h3>
        <p><strong>BIR Form No:</strong> ${formData.birFormNo || 'N/A'}</p>
        <p><strong>Revenue Period:</strong> ${formData.revenuePeriod || 'N/A'}</p>
        <p><strong>Line of Business:</strong> ${formData.lineOfBusiness || 'N/A'}</p>
        
        <hr>
        <p style="color: #666;"><em>This email was sent automatically by the YAHSHUA-ABBA Tax Form System.</em></p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "YAHSHUA-ABBA Tax Forms <onboarding@resend.dev>", 
      to: ["support@abba.works"],
      cc: formData.emailAddress ? [formData.emailAddress] : [],
      subject: `📋 Taxpayer Form - ${formData.taxpayerName}`,
      html: emailHtml,
    });

    console.log("✅ Email sent to support@abba.works:", emailResponse.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "✅ Form submitted! Email sent to support@abba.works",
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
