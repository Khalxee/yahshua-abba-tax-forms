    // After domain verification, use this configuration:
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'YAHSHUA Compliance <noreply@abba.works>', // Use verified domain
        to: ['support@abba.works'], // Direct delivery!
        cc: formData.emailAddress ? [formData.emailAddress] : [],
        subject: `📋 Taxpayer Form Submission - ${formData.taxpayerName}`,
        html: emailHtml,
        reply_to: 'yahshua.compliance@gmail.com'
      }),
    });