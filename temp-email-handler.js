  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log("🔍 DEBUG: Using temporary email solution...");
      
      // Create mailto link with form data
      const subject = `Taxpayer Form Submission - ${formData.taxpayerName} (${formData.taxIdentificationNumber})`;
      const body = `
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
${Object.entries(formData.complianceItems)
  .filter(([key]) => key !== 'otherSpecifyText')
  .map(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `- ${label}: ${typeof value === 'boolean' ? (value ? 'YES' : 'NO') : value}`;
  }).join('\n')}
${formData.complianceItems.otherSpecifyText ? `- Other Specification: ${formData.complianceItems.otherSpecifyText}` : ''}

REVENUE DECLARATIONS:
${Object.entries(formData.revenueDeclarations)
  .map(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `- ${label}: ${value ? 'YES' : 'NO'}`;
  }).join('\n')}

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

      // Create mailto URL
      const mailtoUrl = `mailto:support@abba.works?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open default email client
      window.open(mailtoUrl, '_blank');

      toast({
        title: "Email Draft Created",
        description: "Your default email client will open with the form data. Please send the email to complete the submission.",
      });

      console.log("🔍 DEBUG: Mailto URL created successfully");
      
    } catch (error: any) {
      console.error('🔍 DEBUG: Mailto error:', error);
      
      // Fallback: Copy to clipboard
      const formText = `Form data ready to copy:\n\n${JSON.stringify(formData, null, 2)}`;
      navigator.clipboard.writeText(formText).then(() => {
        toast({
          title: "Form Data Copied",
          description: "Form data copied to clipboard. Please email it manually to support@abba.works",
        });
      }).catch(() => {
        toast({
          title: "Please Copy Form Data",
          description: "Please manually copy the form data from the console and email to support@abba.works",
        });
        console.log("📋 FORM DATA TO COPY:", formText);
      });
    } finally {
      setIsSubmitting(false);
    }
  };