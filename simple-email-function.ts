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
    console.log("Processing automated email for:", formData.taxpayerName);

    // Create email content
    const emailHtml = `
      <h1>🏛️ YAHSHUA-ABBA Taxpayer Form Submission</h1>
      <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Status:</strong> ✅ AUTOMATICALLY PROCESSED</p>
      
      <h3>Taxpayer Information</h3>
      <ul>
        <li><strong>Name:</strong> ${formData.taxpayerName}</li>
        <li><strong>Email:</strong> ${formData.emailAddress}</li>
        <li><strong>Tax ID:</strong> ${formData.taxIdentificationNumber}</li>
        <li><strong>Address:</strong> ${formData.registeredAddress}</li>
      </ul>
      
      <p><em>Complete form data: ${JSON.stringify(formData, null, 2)}</em></p>
    `;

    // Send email automatically
    const emailResponse = await resend.emails.send({
      from: "YAHSHUA Tax Forms <onboarding@resend.dev>", 
      to: ["support@abba.works"], 
      cc: formData.emailAddress ? [formData.emailAddress] : [],
      subject: `✅ Taxpayer Form - ${formData.taxpayerName}`,
      html: emailHtml,
    });

    console.log("✅ Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "✅ Form automatically submitted! Email sent to support@abba.works"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("❌ Email error:", error);
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
};

serve(handler);