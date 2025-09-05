// EmailJS - Direct Frontend Email Sending (No Vercel Function Needed)
import emailjs from '@emailjs/browser';

const sendEmailViaEmailJS = async (formData) => {
  try {
    const result = await emailjs.send(
      'YOUR_SERVICE_ID',           // Gmail/Outlook service
      'YOUR_TEMPLATE_ID',          // Email template
      {
        to_email: 'support@abba.works',
        from_name: 'YAHSHUA Tax Forms',
        taxpayer_name: formData.taxpayerName,
        email_address: formData.emailAddress,
        tax_id: formData.taxIdentificationNumber,
        form_data: JSON.stringify(formData, null, 2)
      },
      'YOUR_PUBLIC_KEY'            // EmailJS public key
    );
    
    console.log('✅ Email sent directly to support@abba.works!');
    return { success: true, emailId: result.text };
  } catch (error) {
    console.error('❌ EmailJS error:', error);
    throw error;
  }
};

// Setup Steps:
// 1. Go to https://www.emailjs.com/
// 2. Sign up (free)
// 3. Add Gmail/Outlook service
// 4. Create email template
// 5. Copy service ID, template ID, public key
// 6. Replace in code above