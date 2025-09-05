// Formspree Alternative - Contact Form Service (No Backend Required)

const sendViaFormspree = async (formData) => {
  try {
    // Formspree endpoint (replace with your form ID)
    const formspreeUrl = 'https://formspree.io/f/YOUR_FORM_ID';
    
    const response = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        _to: 'support@abba.works',
        _subject: `📋 Taxpayer Form Submission - ${formData.taxpayerName}`,
        _cc: formData.emailAddress,
        _template: 'table', // Uses nice HTML table format
        
        // Form fields
        'Taxpayer Name': formData.taxpayerName,
        'Email Address': formData.emailAddress,
        'Tax ID Number': formData.taxIdentificationNumber,
        'Registered Address': formData.registeredAddress,
        'Phone/Fax': formData.telFaxNo,
        'BIR Form No': formData.birFormNo,
        'Revenue Period': formData.revenuePeriod,
        'Line of Business': formData.lineOfBusiness,
        'RDO Code': formData.rdoCode,
        'Trade Name': formData.tradeName,
        'Zip Code': formData.zipCode,
        'Business Rating': formData.businessRating,
        'Ownership Type': formData.ownershipType,
        'Business in Good Standing': formData.businessInGood ? 'Yes' : 'No',
        'Taxpayer Signature': formData.taxpayerSignature,
        'Authorized Rep Signature': formData.authorizedRepSignature,
        'Date Accomplished': formData.dateAccomplished,
        'Submission Time': new Date().toLocaleString()
      })
    });

    if (response.ok) {
      return {
        success: true,
        message: '✅ Form submitted successfully! Email sent directly to support@abba.works via Formspree.'
      };
    } else {
      throw new Error('Formspree submission failed');
    }

  } catch (error) {
    console.error('Formspree error:', error);
    throw error;
  }
};

// Netlify Forms Alternative (if hosting on Netlify)
const sendViaNetlify = async (formData) => {
  try {
    const netlifyFormUrl = '/.netlify/functions/submit-form';
    
    const response = await fetch(netlifyFormUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'form-name': 'taxpayer-form',
        'email': 'support@abba.works',
        'subject': `Taxpayer Form - ${formData.taxpayerName}`,
        'message': JSON.stringify(formData, null, 2)
      })
    });

    return {
      success: true,
      message: 'Form submitted via Netlify Forms'
    };

  } catch (error) {
    console.error('Netlify error:', error);
    throw error;
  }
};

// Setup Steps for Formspree:
// 1. Go to https://formspree.io/
// 2. Sign up (free tier: 50 submissions/month)
// 3. Create new form
// 4. Copy form ID/endpoint
// 5. Verify email address (support@abba.works)
// 6. Replace YOUR_FORM_ID above

// Setup Steps for Netlify:
// 1. Deploy to Netlify
// 2. Add form in HTML with data-netlify="true"
// 3. Configure form notifications
// 4. Use endpoint above