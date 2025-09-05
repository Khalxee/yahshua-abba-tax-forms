# API Reference - YAHSHUA-ABBA Tax Forms Interactive

## 🔌 **API Overview**

The YAHSHUA-ABBA Tax Forms Interactive system provides a RESTful API for form submission and email processing. The API is built on Vercel serverless functions and handles automated email delivery through the Resend service.

### **Base URL**
```
Production: https://yahshua-abba-tax-forms.vercel.app/api
Development: http://localhost:5173/api (when running locally)
```

### **API Characteristics**
- **Architecture**: RESTful API design
- **Runtime**: Node.js 18.x on Vercel Edge Functions  
- **Authentication**: API key-based (server-side only)
- **Response Format**: JSON
- **CORS**: Enabled for web browser requests
- **Rate Limiting**: Inherits from Resend API limits (100 emails/day free tier)

---

## 📧 **Send Email Endpoint**

### **POST /api/send-email**

Processes tax form data and sends formatted email to the support team.

#### **Request**

**HTTP Method**: `POST`

**Headers**:
```http
Content-Type: application/json
```

**Request Body Schema**:
```typescript
interface EmailRequest {
  // Header Information
  birFormNo: string;                    // BIR form number
  revenuePeriod: string;               // Tax revenue period
  taxIdentificationNumber: string;      // Taxpayer TIN
  rdoCode: string;                     // Revenue District Office code
  lineOfBusiness: string;              // Primary business activity
  
  // Taxpayer Information  
  taxpayerName: string;                // Legal name of taxpayer
  tradeName?: string;                  // Business/trade name (optional)
  registeredAddress: string;           // Complete business address
  zipCode: string;                     // Postal code
  telFaxNo?: string;                   // Phone/fax number (optional)
  emailAddress: string;                // Contact email address
  
  // Business Information
  businessRating?: string;             // Business rating classification
  ownershipType?: string;              // Type of business ownership
  businessInGood: boolean;             // Business compliance status
  
  // Compliance Items
  complianceItems?: {
    registeredForCurrentYear?: boolean;
    newBusinessRegistered?: boolean;
    certificateOfRegistration?: boolean;
    businessPermit?: boolean;
    receiptIssuingMachine?: boolean;
    businessCompliance?: boolean;
    invoiceReceipt?: boolean;
    salesInvoice?: boolean;
    otherSpecify?: boolean;
    otherSpecifyText?: string;
    bookOfAccountsRegistered?: boolean;
    recordsUpToDate?: boolean;
    computerizedBookkeeping?: boolean;
    manualBookkeeping?: boolean;
    casMachinesRegistered?: boolean;
    posMachinesRegistered?: boolean;
  };
  
  // Revenue Declarations
  revenueDeclarations?: {
    q1Revenue?: string;                // Q1 revenue amount
    q2Revenue?: string;                // Q2 revenue amount  
    q3Revenue?: string;                // Q3 revenue amount
    q4Revenue?: string;                // Q4 revenue amount
  };
  
  // Signatures and Authorization
  taxpayerSignature: string;           // Digital signature of taxpayer
  authorizedRepSignature?: string;     // Representative signature (optional)
  dateAccomplished: string;            // Form completion date (ISO string)
}
```

**Example Request**:
```bash
curl -X POST https://yahshua-abba-tax-forms.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "birFormNo": "BIR Form 1901",
    "revenuePeriod": "2024 Q3",
    "taxIdentificationNumber": "123-456-789-000",
    "rdoCode": "001",
    "lineOfBusiness": "Software Development",
    "taxpayerName": "Juan Dela Cruz",
    "tradeName": "JDC Tech Solutions",
    "registeredAddress": "123 Rizal Street, Makati City, Metro Manila",
    "zipCode": "1200",
    "telFaxNo": "+63-2-8123-4567",
    "emailAddress": "juan@jdctech.com",
    "businessRating": "Medium",
    "ownershipType": "Sole Proprietorship",
    "businessInGood": true,
    "taxpayerSignature": "Juan Dela Cruz",
    "dateAccomplished": "2024-09-04T13:45:00.000Z"
  }'
```

#### **Response**

**Success Response (HTTP 200)**:
```typescript
interface EmailSuccessResponse {
  success: true;
  message: string;                     // Human-readable success message
  emailId: string;                     // Unique email delivery ID from Resend
  timestamp: string;                   // ISO timestamp of processing
}
```

**Example Success Response**:
```json
{
  "success": true,
  "message": "✅ Form submitted successfully! Email sent from YAHSHUA Compliance - please forward to support@abba.works",
  "emailId": "b5680e27-8a61-421d-a077-dc8a12aa5a54",
  "timestamp": "2024-09-04T13:45:30.123Z"
}
```

**Error Response (HTTP 4xx/5xx)**:
```typescript
interface EmailErrorResponse {
  success: false;
  error: string;                       // Error description
  details?: string;                    // Additional error details (optional)
}
```

**Example Error Responses**:
```json
// Missing API Key (HTTP 500)
{
  "success": false,
  "error": "Failed to send email: RESEND_API_KEY not configured in Vercel environment variables"
}

// Invalid Email Format (HTTP 400)  
{
  "success": false,
  "error": "Failed to send email: Invalid email address format"
}

// Resend API Error (HTTP 403)
{
  "success": false,
  "error": "Failed to send email: Resend API error: You can only send testing emails to your own email address"
}

// Network/Service Error (HTTP 500)
{
  "success": false,
  "error": "Failed to send email: Service temporarily unavailable"
}
```

#### **Status Codes**

| Code | Description | Response Type |
|------|-------------|---------------|
| 200  | Email sent successfully | EmailSuccessResponse |
| 400  | Invalid request data/format | EmailErrorResponse |
| 403  | Authentication/authorization error | EmailErrorResponse |
| 405  | Method not allowed (only POST accepted) | EmailErrorResponse |
| 500  | Internal server error | EmailErrorResponse |
| 503  | Service temporarily unavailable | EmailErrorResponse |

---

## 🌐 **CORS Configuration**

### **Allowed Origins**
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### **Preflight Requests**
The API handles CORS preflight requests via the OPTIONS method:

**OPTIONS /api/send-email**
```bash
curl -X OPTIONS https://yahshua-abba-tax-forms.vercel.app/api/send-email \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

**Response**:
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS  
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📊 **Rate Limiting**

### **Current Limits**

**Resend API Limits (Free Tier)**:
- **Daily Limit**: 100 emails per day
- **Monthly Limit**: 3,000 emails per month
- **Rate Limit**: No explicit per-second limit
- **Recipient Limit**: 50 recipients per email

**Vercel Function Limits**:
- **Execution Time**: 10 seconds max (hobby plan)
- **Memory**: 1024 MB max
- **Request Size**: 4.5 MB max
- **Concurrent Executions**: 1000 max

### **Rate Limit Headers**

The API doesn't currently return rate limit headers, but they may be added in future versions:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95  
X-RateLimit-Reset: 1640995200
```

### **Exceeding Limits**

When limits are exceeded, you'll receive an error response:

```json
{
  "success": false,
  "error": "Failed to send email: Daily sending limit exceeded"
}
```

---

## 🔐 **Authentication & Security**

### **API Key Authentication**

The API uses server-side API key authentication with the Resend service. No client-side authentication is required.

**Server Configuration**:
```typescript
const resendApiKey = process.env.RESEND_API_KEY;
```

**Security Headers**:
```http
Authorization: Bearer re_your_resend_api_key
Content-Type: application/json
```

### **Security Measures**

**Input Validation**:
- All request data is validated server-side
- Type checking for all required fields
- Email format validation
- String length limits enforced
- XSS prevention through input sanitization

**Data Privacy**:
- No persistent storage of form data
- Data only exists during request processing
- No logging of sensitive personal information
- HTTPS-only communication

---

## 📋 **Field Validation Rules**

### **Required Fields**
```typescript
const requiredFields = [
  'birFormNo',           // Must not be empty
  'taxpayerName',        // Must not be empty  
  'emailAddress',        // Must be valid email format
  'taxIdentificationNumber', // Must not be empty
  'taxpayerSignature',   // Must not be empty
  'dateAccomplished'     // Must be valid ISO date string
];
```

### **Field Constraints**

| Field | Type | Min Length | Max Length | Format |
|-------|------|------------|------------|--------|
| taxpayerName | string | 1 | 100 | Text |
| emailAddress | string | 5 | 254 | Valid email |
| taxIdentificationNumber | string | 9 | 20 | Alphanumeric |
| birFormNo | string | 1 | 50 | Text |
| registeredAddress | string | 1 | 500 | Text |
| zipCode | string | 4 | 10 | Numeric |
| telFaxNo | string | 0 | 20 | Phone format |
| dateAccomplished | string | - | - | ISO 8601 date |

### **Email Format Validation**
```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

### **Date Format Validation**
```typescript
// Accepted formats
"2024-09-04T13:45:00.000Z"  // ISO 8601 with timezone
"2024-09-04T13:45:00"       // ISO 8601 without timezone
"2024-09-04"                // Date only
```

---

## 🧪 **Testing the API**

### **Using cURL**

**Basic Test**:
```bash
curl -X POST https://yahshua-abba-tax-forms.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "birFormNo": "TEST-001",
    "taxpayerName": "Test User",
    "emailAddress": "test@example.com", 
    "taxIdentificationNumber": "123456789",
    "taxpayerSignature": "Test User",
    "dateAccomplished": "2024-09-04T13:45:00.000Z"
  }'
```

**Complete Test**:
```bash
curl -X POST https://yahshua-abba-tax-forms.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -H "User-Agent: API-Test/1.0" \
  -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  -d @test-form-data.json
```

### **Using JavaScript**

**Fetch API**:
```javascript
const testApiCall = async () => {
  try {
    const response = await fetch('https://yahshua-abba-tax-forms.vercel.app/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birFormNo: 'TEST-001',
        taxpayerName: 'Test User',
        emailAddress: 'test@example.com',
        taxIdentificationNumber: '123456789',
        taxpayerSignature: 'Test User',
        dateAccomplished: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    console.log('API Response:', result);
    
  } catch (error) {
    console.error('API Error:', error);
  }
};
```

**Axios**:
```javascript
const axios = require('axios');

const testData = {
  birFormNo: 'TEST-001',
  taxpayerName: 'Test User', 
  emailAddress: 'test@example.com',
  taxIdentificationNumber: '123456789',
  taxpayerSignature: 'Test User',
  dateAccomplished: new Date().toISOString()
};

axios.post('https://yahshua-abba-tax-forms.vercel.app/api/send-email', testData)
  .then(response => {
    console.log('Success:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response?.data || error.message);
  });
```

### **Using Python**

**Requests Library**:
```python
import requests
import json
from datetime import datetime

url = 'https://yahshua-abba-tax-forms.vercel.app/api/send-email'

data = {
    'birFormNo': 'TEST-001',
    'taxpayerName': 'Test User',
    'emailAddress': 'test@example.com',
    'taxIdentificationNumber': '123456789',
    'taxpayerSignature': 'Test User',
    'dateAccomplished': datetime.now().isoformat()
}

headers = {
    'Content-Type': 'application/json'
}

response = requests.post(url, json=data, headers=headers)

if response.status_code == 200:
    result = response.json()
    print(f"Success: {result['message']}")
    print(f"Email ID: {result['emailId']}")
else:
    error = response.json()
    print(f"Error: {error['error']}")
```

---

## 🔄 **Webhook Integration (Future)**

### **Planned Webhook Support**

Future versions may include webhook support for real-time notifications:

**Webhook Events**:
- `form.submitted` - Form successfully submitted
- `email.delivered` - Email successfully delivered
- `email.failed` - Email delivery failed
- `form.validated` - Form validation completed

**Webhook Payload Example**:
```json
{
  "event": "email.delivered",
  "timestamp": "2024-09-04T13:45:30.123Z",
  "data": {
    "emailId": "b5680e27-8a61-421d-a077-dc8a12aa5a54",
    "taxpayerName": "Juan Dela Cruz",
    "emailAddress": "juan@jdctech.com",
    "deliveryStatus": "delivered"
  }
}
```

---

## 📈 **API Analytics**

### **Monitoring Endpoints (Future)**

Planned endpoints for API usage analytics:

**GET /api/analytics/usage**
```json
{
  "totalSubmissions": 1250,
  "successRate": 99.2,
  "averageResponseTime": 1.8,
  "dailySubmissions": 45,
  "monthlySubmissions": 890
}
```

**GET /api/analytics/errors**
```json
{
  "errorCount": 12,
  "commonErrors": [
    {
      "error": "Invalid email format",
      "count": 8,
      "percentage": 66.7
    },
    {
      "error": "Missing required field",
      "count": 4,
      "percentage": 33.3
    }
  ]
}
```

---

## 🛠️ **SDK Development**

### **Planned SDKs**

Future development may include official SDKs for popular languages:

**JavaScript/TypeScript SDK**:
```typescript
import { YahshuaTaxForms } from 'yahshua-tax-forms-sdk';

const client = new YahshuaTaxForms({
  baseUrl: 'https://yahshua-abba-tax-forms.vercel.app/api'
});

const result = await client.submitForm({
  taxpayerName: 'Juan Dela Cruz',
  emailAddress: 'juan@example.com',
  // ... other form data
});
```

**Python SDK**:
```python
from yahshua_tax_forms import YahshuaTaxFormsClient

client = YahshuaTaxFormsClient(
    base_url='https://yahshua-abba-tax-forms.vercel.app/api'
)

result = client.submit_form({
    'taxpayerName': 'Juan Dela Cruz',
    'emailAddress': 'juan@example.com',
    # ... other form data
})
```

---

## 📞 **API Support**

### **Support Channels**

**Technical Issues**:
- **Email**: yahshua.compliance@gmail.com
- **Response Time**: 4-24 hours during business days

**API Documentation Issues**:
- **GitHub Issues**: Create issue in repository
- **Email**: Include "API Documentation" in subject line

### **SLA (Service Level Agreement)**

**Uptime**: 99.9% (inherited from Vercel platform)
**Response Time**: < 3 seconds for 95% of requests
**Error Rate**: < 1% under normal conditions

---

*This API reference is maintained by the development team and updated with each API version.*

**API Version**: 1.0  
**Documentation Version**: 1.0  
**Last Updated**: September 2025  
**Next Review**: December 2025