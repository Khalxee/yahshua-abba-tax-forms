import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TaxpayerFormData {
  // Header Information
  birFormNo: string;
  revenuePeriod: string;
  taxIdentificationNumber: string;
  rdoCode: string;
  lineOfBusiness: string;
  
  // Taxpayer Information
  taxpayerName: string;
  tradeName: string;
  registeredAddress: string;
  zipCode: string;
  
  // Contact Information
  telFaxNo: string;
  emailAddress: string;
  
  // Compliance Checklist
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
  
  // Revenue Declarations
  revenueDeclarations: {
    monthlyRemittance: boolean;
    quarterlyRemittance: boolean;
    annualReturn: boolean;
    hasMonthlyFilings: boolean;
    hasQuarterlyFilings: boolean;
  };
  
  // Other Information
  businessInGood: boolean;
  businessRating: string;
  ownershipType: string;
  
  // Signature and Date Fields
  taxpayerSignature: string;
  authorizedRepSignature: string;
  dateAccomplished: string;
  taxMappedBy: string;
  dateTaxMapped: string;
  receivedBy: string;
  dateReceived: string;
}
// Function to generate text content for PDF (will be added later)
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: TaxpayerFormData = await req.json();
    console.log("Processing form data for:", formData.taxpayerName);

    // Generate text content for attachment
    const formText = generateFormText(formData);

    // Generate compliance checklist HTML for email body
    const complianceHtml = Object.entries(formData.complianceItems)
      .filter(([key]) => key !== 'otherSpecifyText')
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `<li>${label}: ${typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : value}</li>`;
      })
      .join('');

    // Generate revenue declarations HTML
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
            <h1>YAHSHUA-ABBA Taxpayer Form Submission</h1>
            <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Submission Time:</strong> ${new Date().toLocaleTimeString()}</p>
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
            <p><em>Complete form data attached as text file.</em></p>
            <p><strong>Note:</strong> PDF generation will be available in the next update.</p>
          </div>
        </body>
      </html>
    `;
    // Send email to support@abba.works with form attachment
    const emailResponse = await resend.emails.send({
      from: "YAHSHUA-ABBA Tax Forms <onboarding@resend.dev>", 
      to: ["support@abba.works"], 
      cc: formData.emailAddress ? [formData.emailAddress] : [], // Send copy to taxpayer if email provided
      subject: `Taxpayer Form Submission - ${formData.taxpayerName} (${formData.taxIdentificationNumber})`,
      html: emailHtml,
      attachments: [
        {
          filename: `taxpayer-form-${formData.taxpayerName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`,
          content: formText,
          contentType: 'text/plain'
        }
      ]
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Form submitted successfully via email with attachment. You should receive a confirmation copy.",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-taxpayer-form function:", error);
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