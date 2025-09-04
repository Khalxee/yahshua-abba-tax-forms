import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FileUpload from "./FileUpload";

interface FormData {
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

export default function TaxpayerForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    birFormNo: "0535",
    revenuePeriod: "",
    taxIdentificationNumber: "",
    rdoCode: "",
    lineOfBusiness: "",
    taxpayerName: "",
    tradeName: "",
    registeredAddress: "",
    zipCode: "",
    telFaxNo: "",
    emailAddress: "",
    complianceItems: {
      registeredForCurrentYear: false,
      newBusinessRegistered: false,
      certificateOfRegistration: false,
      businessPermit: false,
      receiptIssuingMachine: false,
      businessCompliance: false,
      invoiceReceipt: false,
      salesInvoice: false,
      otherSpecify: false,
      otherSpecifyText: "",
      bookOfAccountsRegistered: false,
      recordsUpToDate: false,
      computerizedBookkeeping: false,
      manualBookkeeping: false,
      casMachinesRegistered: false,
      posMachinesRegistered: false,
    },
    revenueDeclarations: {
      monthlyRemittance: false,
      quarterlyRemittance: false,
      annualReturn: false,
      hasMonthlyFilings: false,
      hasQuarterlyFilings: false,
    },
    businessInGood: false,
    businessRating: "",
    ownershipType: "",
    taxpayerSignature: "",
    authorizedRepSignature: "",
    dateAccomplished: "",
    taxMappedBy: "",
    dateTaxMapped: "",
    receivedBy: "",
    dateReceived: "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplianceChange = (field: keyof FormData['complianceItems'], value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      complianceItems: {
        ...prev.complianceItems,
        [field]: value
      }
    }));
  };

  const handleRevenueChange = (field: keyof FormData['revenueDeclarations'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      revenueDeclarations: {
        ...prev.revenueDeclarations,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log("🔍 DEBUG: Starting form submission...");
      
      // Temporary solution: Create email with all form data
      const emailBody = `YAHSHUA-ABBA TAXPAYER FORM SUBMISSION

Taxpayer Information:
- Name: ${formData.taxpayerName}
- Email: ${formData.emailAddress}  
- Tax ID: ${formData.taxIdentificationNumber}
- Address: ${formData.registeredAddress}
- Phone: ${formData.telFaxNo}

Form Details:
- BIR Form No: ${formData.birFormNo}
- Revenue Period: ${formData.revenuePeriod}
- Line of Business: ${formData.lineOfBusiness}
- RDO Code: ${formData.rdoCode}
- Trade Name: ${formData.tradeName}
- Zip Code: ${formData.zipCode}

Business Rating: ${formData.businessRating}
Ownership Type: ${formData.ownershipType}
Business in Good Standing: ${formData.businessInGood ? 'Yes' : 'No'}

Signatures:
- Taxpayer: ${formData.taxpayerSignature}
- Authorized Rep: ${formData.authorizedRepSignature}
- Date Accomplished: ${formData.dateAccomplished}

Submitted: ${new Date().toLocaleString()}`;

      const mailtoLink = `mailto:support@abba.works?subject=Taxpayer Form Submission - ${formData.taxpayerName}&body=${encodeURIComponent(emailBody)}`;
      
      console.log("📧 Opening email client with form data...");
      window.open(mailtoLink, '_blank');

      toast({
        title: "📧 Email Client Opened",
        description: "Please send the pre-filled email to submit your form. Working on automatic delivery!",
      });

      console.log("✅ Email client opened successfully!");
      
    } catch (error: any) {
      console.error('🔍 DEBUG: Submission error:', error);
      
      toast({
        title: "Submission Failed",
        description: `Error: ${error.message || "Failed to submit form. Please ensure Supabase is configured correctly."}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-form-section p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-form-background border-form-border shadow-lg">
          <div className="p-6">
            <Tabs defaultValue="form" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="form">Taxpayer Information</TabsTrigger>
                <TabsTrigger value="documents">Documents & Attachments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="form">
                <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Header Section */}
            <div className="bg-form-header text-form-header-foreground p-4 -m-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold">YAHSHUA-ABBA TAXPAYER INFORMATION SHEET</h1>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="text-form-header-foreground">Revenue Period</Label>
                  <Input
                    value={formData.revenuePeriod}
                    onChange={(e) => handleInputChange('revenuePeriod', e.target.value)}
                    className="mt-1 bg-form-input border-form-header-foreground text-form-label"
                    placeholder="Month/Year"
                  />
                </div>
                <div>
                  <Label className="text-form-header-foreground">Tax Identification Number</Label>
                  <Input
                    value={formData.taxIdentificationNumber}
                    onChange={(e) => handleInputChange('taxIdentificationNumber', e.target.value)}
                    className="mt-1 bg-form-input border-form-header-foreground text-form-label"
                    placeholder="XXX-XXX-XXX-XXX"
                  />
                </div>
                <div>
                  <Label className="text-form-header-foreground">RDO Code</Label>
                  <Input
                    value={formData.rdoCode}
                    onChange={(e) => handleInputChange('rdoCode', e.target.value)}
                    className="mt-1 bg-form-input border-form-header-foreground text-form-label"
                    placeholder="XXX"
                  />
                </div>
              </div>
            </div>

            {/* Taxpayer Details Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-form-label border-b border-form-border pb-2">
                TAXPAYER INFORMATION
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxpayerName" className="text-form-label">Taxpayer Name</Label>
                  <Input
                    id="taxpayerName"
                    value={formData.taxpayerName}
                    onChange={(e) => handleInputChange('taxpayerName', e.target.value)}
                    className="mt-1 border-form-input-border"
                    placeholder="Last Name, First Name, Middle Initial"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tradeName" className="text-form-label">Trade Name/Business Name</Label>
                  <Input
                    id="tradeName"
                    value={formData.tradeName}
                    onChange={(e) => handleInputChange('tradeName', e.target.value)}
                    className="mt-1 border-form-input-border"
                    placeholder="Business Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="registeredAddress" className="text-form-label">Registered Address</Label>
                  <Input
                    id="registeredAddress"
                    value={formData.registeredAddress}
                    onChange={(e) => handleInputChange('registeredAddress', e.target.value)}
                    className="mt-1 border-form-input-border"
                    placeholder="Complete Address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="zipCode" className="text-form-label">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="mt-1 border-form-input-border"
                    placeholder="XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telFaxNo" className="text-form-label">Tel./Fax No.</Label>
                  <Input
                    id="telFaxNo"
                    value={formData.telFaxNo}
                    onChange={(e) => handleInputChange('telFaxNo', e.target.value)}
                    className="mt-1 border-form-input-border"
                    placeholder="Contact Number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="emailAddress" className="text-form-label">Email Address</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                    className="mt-1 border-form-input-border"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="lineOfBusiness" className="text-form-label">Line of Business</Label>
                <Input
                  id="lineOfBusiness"
                  value={formData.lineOfBusiness}
                  onChange={(e) => handleInputChange('lineOfBusiness', e.target.value)}
                  className="mt-1 border-form-input-border"
                  placeholder="Describe your business activity"
                />
              </div>
            </div>

            <Separator />

            {/* Compliance Checklist */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-form-label border-b border-form-border pb-2">
                COMPLIANCE CHECKLIST
              </h2>
              
              <div className="bg-form-section p-4 rounded-lg border border-form-border">
                <p className="text-sm text-form-label mb-4">
                  This taxpayer must be subjected to Registration Ins for the current year:
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="registeredForCurrentYear"
                      checked={formData.complianceItems.registeredForCurrentYear}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('registeredForCurrentYear', checked as boolean)
                      }
                    />
                    <Label htmlFor="registeredForCurrentYear" className="text-sm text-form-label">
                      Is the taxpayer Registered for the current year?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newBusinessRegistered"
                      checked={formData.complianceItems.newBusinessRegistered}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('newBusinessRegistered', checked as boolean)
                      }
                    />
                    <Label htmlFor="newBusinessRegistered" className="text-sm text-form-label">
                      Is the new business registered?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="certificateOfRegistration"
                      checked={formData.complianceItems.certificateOfRegistration}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('certificateOfRegistration', checked as boolean)
                      }
                    />
                    <Label htmlFor="certificateOfRegistration" className="text-sm text-form-label">
                      Is a Certificate of Registration (COR) validated or renewed?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="businessPermit"
                      checked={formData.complianceItems.businessPermit}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('businessPermit', checked as boolean)
                      }
                    />
                    <Label htmlFor="businessPermit" className="text-sm text-form-label">
                      Is Business Permit obtained?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="receiptIssuingMachine"
                      checked={formData.complianceItems.receiptIssuingMachine}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('receiptIssuingMachine', checked as boolean)
                      }
                    />
                    <Label htmlFor="receiptIssuingMachine" className="text-sm text-form-label">
                      Is Receipt Issuing Machine (RIM) or CAS/POS Machines registered?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="businessCompliance"
                      checked={formData.complianceItems.businessCompliance}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('businessCompliance', checked as boolean)
                      }
                    />
                    <Label htmlFor="businessCompliance" className="text-sm text-form-label">
                      Is business in compliance with BIR requirements?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="invoiceReceipt"
                      checked={formData.complianceItems.invoiceReceipt}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('invoiceReceipt', checked as boolean)
                      }
                    />
                    <Label htmlFor="invoiceReceipt" className="text-sm text-form-label">
                      Are Invoices/Receipts available?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="salesInvoice"
                      checked={formData.complianceItems.salesInvoice}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('salesInvoice', checked as boolean)
                      }
                    />
                    <Label htmlFor="salesInvoice" className="text-sm text-form-label">
                      Are Sales Invoices/Official Receipts available?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bookOfAccountsRegistered"
                      checked={formData.complianceItems.bookOfAccountsRegistered}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('bookOfAccountsRegistered', checked as boolean)
                      }
                    />
                    <Label htmlFor="bookOfAccountsRegistered" className="text-sm text-form-label">
                      Are Books of Accounts Registered?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recordsUpToDate"
                      checked={formData.complianceItems.recordsUpToDate}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('recordsUpToDate', checked as boolean)
                      }
                    />
                    <Label htmlFor="recordsUpToDate" className="text-sm text-form-label">
                      Are accounting records up to date?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="computerizedBookkeeping"
                      checked={formData.complianceItems.computerizedBookkeeping}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('computerizedBookkeeping', checked as boolean)
                      }
                    />
                    <Label htmlFor="computerizedBookkeeping" className="text-sm text-form-label">
                      Is taxpayer using computerized bookkeeping?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="manualBookkeeping"
                      checked={formData.complianceItems.manualBookkeeping}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('manualBookkeeping', checked as boolean)
                      }
                    />
                    <Label htmlFor="manualBookkeeping" className="text-sm text-form-label">
                      Is taxpayer using manual bookkeeping?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="casMachinesRegistered"
                      checked={formData.complianceItems.casMachinesRegistered}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('casMachinesRegistered', checked as boolean)
                      }
                    />
                    <Label htmlFor="casMachinesRegistered" className="text-sm text-form-label">
                      Are CAS Machines registered with permit?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="posMachinesRegistered"
                      checked={formData.complianceItems.posMachinesRegistered}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('posMachinesRegistered', checked as boolean)
                      }
                    />
                    <Label htmlFor="posMachinesRegistered" className="text-sm text-form-label">
                      Are POS Machines registered?
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="otherSpecify"
                      checked={formData.complianceItems.otherSpecify}
                      onCheckedChange={(checked) => 
                        handleComplianceChange('otherSpecify', checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="otherSpecify" className="text-sm text-form-label">
                        Others (Please specify):
                      </Label>
                      <Input
                        value={formData.complianceItems.otherSpecifyText}
                        onChange={(e) => handleComplianceChange('otherSpecifyText', e.target.value)}
                        className="mt-1 border-form-input-border text-sm"
                        placeholder="Specify other compliance items"
                        disabled={!formData.complianceItems.otherSpecify}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Revenue Declarations Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-form-label border-b border-form-border pb-2">
                REVENUE DECLARATIONS
              </h2>
              
              <div className="bg-form-section p-4 rounded-lg border border-form-border">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="monthlyRemittance"
                      checked={formData.revenueDeclarations.monthlyRemittance}
                      onCheckedChange={(checked) => 
                        handleRevenueChange('monthlyRemittance', checked as boolean)
                      }
                    />
                    <Label htmlFor="monthlyRemittance" className="text-sm text-form-label">
                      Monthly remittance filed?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="quarterlyRemittance"
                      checked={formData.revenueDeclarations.quarterlyRemittance}
                      onCheckedChange={(checked) => 
                        handleRevenueChange('quarterlyRemittance', checked as boolean)
                      }
                    />
                    <Label htmlFor="quarterlyRemittance" className="text-sm text-form-label">
                      Quarterly return filed?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="annualReturn"
                      checked={formData.revenueDeclarations.annualReturn}
                      onCheckedChange={(checked) => 
                        handleRevenueChange('annualReturn', checked as boolean)
                      }
                    />
                    <Label htmlFor="annualReturn" className="text-sm text-form-label">
                      Annual return filed?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasMonthlyFilings"
                      checked={formData.revenueDeclarations.hasMonthlyFilings}
                      onCheckedChange={(checked) => 
                        handleRevenueChange('hasMonthlyFilings', checked as boolean)
                      }
                    />
                    <Label htmlFor="hasMonthlyFilings" className="text-sm text-form-label">
                      Has monthly filings?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasQuarterlyFilings"
                      checked={formData.revenueDeclarations.hasQuarterlyFilings}
                      onCheckedChange={(checked) => 
                        handleRevenueChange('hasQuarterlyFilings', checked as boolean)
                      }
                    />
                    <Label htmlFor="hasQuarterlyFilings" className="text-sm text-form-label">
                      Has quarterly filings?
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-form-label border-b border-form-border pb-2">
                ADDITIONAL INFORMATION
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessRating" className="text-form-label">Business Rating</Label>
                  <Input
                    id="businessRating"
                    value={formData.businessRating}
                    onChange={(e) => handleInputChange('businessRating', e.target.value)}
                    className="mt-1 border-form-input-border"
                    placeholder="Business rating/classification"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ownershipType" className="text-form-label">Type of Ownership</Label>
                  <Input
                    id="ownershipType"
                    value={formData.ownershipType}
                    onChange={(e) => handleInputChange('ownershipType', e.target.value)}
                    className="mt-1 border-form-input-border"
                    placeholder="Sole Proprietorship, Corporation, etc."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="businessInGood"
                  checked={formData.businessInGood}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, businessInGood: checked as boolean }))
                  }
                />
                <Label htmlFor="businessInGood" className="text-form-label">
                  Is taxpayer/business in good standing?
                </Label>
              </div>
            </div>

            <Separator />

            {/* Signature and Date Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-form-label border-b border-form-border pb-2">
                SIGNATURE AND DATES
              </h2>
              
              <div className="bg-form-section p-4 rounded-lg border border-form-border">
                <p className="text-sm text-form-label mb-4">
                  I hereby affirm that the information furnished in this form is true and correct to the best of my knowledge and belief.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="taxpayerSignature" className="text-form-label">Taxpayer Signature</Label>
                    <Input
                      id="taxpayerSignature"
                      value={formData.taxpayerSignature}
                      onChange={(e) => handleInputChange('taxpayerSignature', e.target.value)}
                      className="mt-1 border-form-input-border"
                      placeholder="Type your full name"
                    />
                    <p className="text-xs text-form-label mt-1">Signature Over Printed Name of Taxpayer</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="authorizedRepSignature" className="text-form-label">Authorized Representative</Label>
                    <Input
                      id="authorizedRepSignature"
                      value={formData.authorizedRepSignature}
                      onChange={(e) => handleInputChange('authorizedRepSignature', e.target.value)}
                      className="mt-1 border-form-input-border"
                      placeholder="Type representative's full name"
                    />
                    <p className="text-xs text-form-label mt-1">Signature Over Printed Name of Authorized Representative</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <Label htmlFor="dateAccomplished" className="text-form-label">Date Accomplished</Label>
                    <Input
                      id="dateAccomplished"
                      type="date"
                      value={formData.dateAccomplished}
                      onChange={(e) => handleInputChange('dateAccomplished', e.target.value)}
                      className="mt-1 border-form-input-border"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="taxMappedBy" className="text-form-label">Tax Mapped by</Label>
                    <Input
                      id="taxMappedBy"
                      value={formData.taxMappedBy}
                      onChange={(e) => handleInputChange('taxMappedBy', e.target.value)}
                      className="mt-1 border-form-input-border"
                      placeholder="Name of person who mapped tax"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="dateTaxMapped" className="text-form-label">Date Tax Mapped</Label>
                    <Input
                      id="dateTaxMapped"
                      type="date"
                      value={formData.dateTaxMapped}
                      onChange={(e) => handleInputChange('dateTaxMapped', e.target.value)}
                      className="mt-1 border-form-input-border"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="receivedBy" className="text-form-label">Received By</Label>
                    <Input
                      id="receivedBy"
                      value={formData.receivedBy}
                      onChange={(e) => handleInputChange('receivedBy', e.target.value)}
                      className="mt-1 border-form-input-border"
                      placeholder="Name of receiving officer"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dateReceived" className="text-form-label">Date Received</Label>
                    <Input
                      id="dateReceived"
                      type="date"
                      value={formData.dateReceived}
                      onChange={(e) => handleInputChange('dateReceived', e.target.value)}
                      className="mt-1 border-form-input-border"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Submit Section */}
            <div className="pt-6">
              <div className="bg-form-section p-4 rounded-lg border border-form-border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <Button 
                    type="submit" 
                    className="bg-form-header text-form-header-foreground hover:bg-form-header/90 px-8 py-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending Email..." : "Submit Form (Auto Email)"}
                  </Button>
                  
                  <div className="text-sm text-form-label">
                    <p className="font-medium">Form will be automatically emailed to:</p>
                    <p className="text-form-header font-semibold">support@abba.works</p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      ⚡ Automatic email with PDF attachment
                    </p>
                  </div>
                </div>
              </div>
            </div>
                </form>
              </TabsContent>
              
              <TabsContent value="documents">
                <FileUpload />
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
}
