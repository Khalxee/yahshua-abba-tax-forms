// Copy this ENTIRE code into your Supabase Edge Function

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaxpayerFormData {
  birFormNo: string;
  revenuePeriod: string;
  taxIdentificationNumber: string;
  rdoCode: string;
  lineOfBusiness: string;
  taxpayerName: string;
  tradeName: string;
  registeredAddress: string;
  zipCode: string;
  telFaxNo: string;
  emailAddress: string;
  complianceItems: {
    registeredForCurrentYear: boolean;
    newBusinessRegistered: boolean;
    certificateOfRegistration: boolean;
    businessPermit: boolean;
    receiptIssuingMachine: boolean;
    businessCompliance: boolean;
    invoiceReceipt: boolean;
    salesInvoice: boolean;
    otherSpecify: boolean;
    otherSpecifyText: string;
    bookOfAccountsRegistered: boolean;
    recordsUpToDate: boolean;
    computerizedBookkeeping: boolean;
    manualBookkeeping: boolean;
    casMachinesRegistered: boolean;
    posMachinesRegistered: boolean;
  };
  revenueDeclarations: {
    monthlyRemittance: boolean;
    quarterlyRemittance: boolean;
    annualReturn: boolean;
    hasMonthlyFilings: boolean;
    hasQuarterlyFilings: boolean;
  };
  businessInGood: boolean;
  businessRating: string;
  ownershipType: string;
  taxpayerSignature: string;
  authorizedRepSignature: string;
  dateAccomplished: string;
  taxMappedBy: string;
  dateTaxMapped: string;
  receivedBy: string;
  dateReceived: string;
}

const generateFormText = (formData: TaxpayerFormData): string => {
  const complianceText = Object.entries(formData.complianceItems)
    .filter(([key]) => key !== 'otherSpecifyText')
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return `${label}: ${typeof value === 'boolean' ? (value ? 'YES' : 'NO') : value}`;
    })
    .join('\n');

  const revenueText = Object.entries(formData.revenueDeclarations)
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return `${label}: ${value ? 'YES' : 'NO'}`;
    })
    .join('\n');

  return `
YAHSHUA-ABBA TAXPAYER INFORMATION SHEET
======================================

FORM INFORMATION:
- BIR Form No: ${formData.birFormNo}
- Revenue Period: ${formData.revenuePeriod}
- Tax Identification Number: ${formData.taxIdentificationNumber}
- RDO Code: ${formData.rdoCode}
- Line of Business: ${formData.lineOfBusiness}

TAXPAYER INFORMATION:
- Taxpayer Name: ${formData.taxpayerName}
- Trade Name: ${formData.tradeName}
- Registered Address: ${formData.registeredAddress}
- Zip Code: ${formData.zipCode}
- Tel./Fax No.: ${formData.telFaxNo}
- Email Address: ${formData.emailAddress}

COMPLIANCE CHECKLIST:
${complianceText}
${formData.complianceItems.otherSpecifyText ? `Other Specification: ${formData.complianceItems.otherSpecifyText}` : ''}

REVENUE DECLARATIONS:
${revenueText}

ADDITIONAL INFORMATION:
- Business Rating: ${formData.businessRating}
- Type of Ownership: ${formData.ownershipType}
- Business in Good Standing: ${formData.businessInGood ? 'YES' : 'NO'}

SIGNATURE AND DATES:
- Taxpayer Signature: ${formData.taxpayerSignature}
- Authorized Representative: ${formData.authorizedRepSignature}
- Date Accomplished: ${formData.dateAccomplished}
- Tax Mapped By: ${formData.taxMappedBy}
- Date Tax Mapped: ${formData.dateTaxMapped}
- Received By: ${formData.receivedBy}
- Date Received: ${formData.dateReceived}

Submitted on: ${new Date().toLocaleString()}
  `.trim();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: TaxpayerFormData = await req.json();
    console.log("Processing automated email for:", formData.taxpayerName);

    const formText = generateFormText(formData);

    const complianceHtml = Object.entries(formData.complianceItems)
      .filter(([key]) => key !== 'otherSpecifyText')
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `<li>${label}: ${typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : value}</li>`;
      })
      .join('');

    const revenueHtml = Object.entries(formData.revenueDeclarations)
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `<li>${label}: ${value ? '✅ Yes' : '❌ No'}</li>`;
      })
      .join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Taxpayer Form Submission</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .section { margin: 20px 0; }
            .section h3 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
            ul { list-style-type: none; padding: 0; }
            li { padding: 5px 0; }
            .signature-section { background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏛️ YAHSHUA-ABBA Taxpayer Form Submission</h1>
            <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Submission Time:</strong> ${new Date().toLocaleTimeString()}</p>
            <p><strong>Status:</strong> ✅ AUTOMATICALLY PROCESSED</p>
          </div>

          <div class="section">
            <h3>Form Information</h3>
            <ul>
              <li><strong>BIR Form No:</strong> ${formData.birFormNo}</li>
              <li><strong>Revenue Period:</strong> ${formData.revenuePeriod}</li>
              <li><strong>Tax Identification Number:</strong> ${formData.taxIdentificationNumber}</li>
              <li><strong>RDO Code:</strong> ${formData.rdoCode}</li>
              <li><strong>Line of Business:</strong> ${formData.lineOfBusiness}</li>
            </ul>
          </div>

          <div class="section">
            <h3>Taxpayer Information</h3>
            <ul>
              <li><strong>Taxpayer Name:</strong> ${formData.taxpayerName}</li>
              <li><strong>Trade Name:</strong> ${formData.tradeName}</li>
              <li><strong>Registered Address:</strong> ${formData.registeredAddress}</li>
              <li><strong>Zip Code:</strong> ${formData.zipCode}</li>
            </ul>
          </div>

          <div class="section">
            <h3>Contact Information</h3>
            <ul>
              <li><strong>Tel./Fax No.:</strong> ${formData.telFaxNo}</li>
              <li><strong>Email Address:</strong> ${formData.emailAddress}</li>
            </ul>
          </div>

          <div class="section">
            <h3>Compliance Checklist</h3>
            <ul>
              ${complianceHtml}
              ${formData.complianceItems.otherSpecifyText ? `<li><strong>Other Specification:</strong> ${formData.complianceItems.otherSpecifyText}</li>` : ''}
            </ul>
          </div>

          <div class="section">
            <h3>Revenue Declarations</h3>
            <ul>
              ${revenueHtml}
            </ul>
          </div>

          <div class="section">
            <h3>Additional Information</h3>
            <ul>
              <li><strong>Business Rating:</strong> ${formData.businessRating}</li>
              <li><strong>Type of Ownership:</strong> ${formData.ownershipType}</li>
              <li><strong>Business in Good Standing:</strong> ${formData.businessInGood ? 'Yes' : 'No'}</li>
            </ul>
          </div>

          <div class="signature-section">
            <h3>Signature and Dates</h3>
            <ul>
              <li><strong>Taxpayer Signature:</strong> ${formData.taxpayerSignature}</li>
              <li><strong>Authorized Representative:</strong> ${formData.authorizedRepSignature}</li>
              <li><strong>Date Accomplished:</strong> ${formData.dateAccomplished}</li>
              <li><strong>Tax Mapped By:</strong> ${formData.taxMappedBy}</li>
              <li><strong>Date Tax Mapped:</strong> ${formData.dateTaxMapped}</li>
              <li><strong>Received By:</strong> ${formData.receivedBy}</li>
              <li><strong>Date Received:</strong> ${formData.dateReceived}</li>
            </ul>
          </div>
          
          <div class="section">
            <p><strong>📎 Complete form data attached as text file.</strong></p>
            <p><em>This email was sent automatically by the YAHSHUA-ABBA Tax Form System.</em></p>
          </div>
        </body>
      </html>
    `;

    // AUTOMATICALLY send email to support@abba.works
    const emailResponse = await resend.emails.send({
      from: "YAHSHUA-ABBA Tax Forms <onboarding@resend.dev>", 
      to: ["support@abba.works"], 
      cc: formData.emailAddress ? [formData.emailAddress] : [],
      subject: `✅ Taxpayer Form Submission - ${formData.taxpayerName} (${formData.taxIdentificationNumber})`,
      html: emailHtml,
      attachments: [
        {
          filename: `taxpayer-form-${formData.taxpayerName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`,
          content: formText,
          contentType: 'text/plain'
        }
      ]
    });

    console.log("✅ Automated email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "✅ Form automatically submitted via email! Sent to support@abba.works with confirmation copy.",
        emailId: emailResponse.data?.id,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ Automated email error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);