// Webhook.site Alternative - Instant Setup (No API Keys Required)
// This creates a webhook that automatically forwards to support@abba.works

const sendViaWebhook = async (formData) => {
  try {
    // Option 1: Use Webhook.site for instant setup
    const webhookUrl = 'https://webhook.site/your-unique-id'; // Get from webhook.site
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forward-To': 'support@abba.works' // Custom header for forwarding
      },
      body: JSON.stringify({
        type: 'taxpayer_form_submission',
        timestamp: new Date().toISOString(),
        data: formData,
        recipient: 'support@abba.works',
        subject: `📋 Taxpayer Form - ${formData.taxpayerName}`
      })
    });

    return {
      success: true,
      message: 'Form data sent via webhook - will be forwarded to support@abba.works'
    };

  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
};

// Alternative: Zapier Integration
const sendViaZapier = async (formData) => {
  try {
    const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/YOUR_HOOK_ID/';
    
    const response = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taxpayer_name: formData.taxpayerName,
        email_address: formData.emailAddress,
        tax_id: formData.taxIdentificationNumber,
        form_data: JSON.stringify(formData),
        recipient: 'support@abba.works'
      })
    });

    return {
      success: true,
      message: 'Form submitted via Zapier - email will be sent to support@abba.works'
    };

  } catch (error) {
    console.error('Zapier error:', error);
    throw error;
  }
};

// Setup Steps for Webhook.site:
// 1. Go to https://webhook.site/
// 2. Copy your unique URL
// 3. Set up email forwarding rule
// 4. Replace webhookUrl above

// Setup Steps for Zapier:
// 1. Go to https://zapier.com/
// 2. Create new Zap: Webhook → Gmail/Email
// 3. Copy webhook URL
// 4. Configure email template
// 5. Test and activate