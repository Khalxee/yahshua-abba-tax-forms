# YAHSHUA-ABBA Tax Forms Interactive Application

A modern, interactive taxpayer information form application with automated email submission capabilities.

## ✅ Status: FULLY OPERATIONAL

- 🎯 **Live Application**: Running with automated email system
- 📧 **Email Integration**: Working with Resend API
- 🏛️ **Professional Forms**: Complete BIR-compliant taxpayer forms
- ⚡ **Automated Processing**: Forms automatically emailed to support@abba.works

## 🚀 Features

- **Interactive Form**: Complete taxpayer information collection
- **Automated Email System**: Forms automatically sent to support@abba.works
- **Professional Templates**: Styled HTML email with complete form data
- **Confirmation Copies**: Taxpayers receive confirmation emails
- **Real-time Validation**: Form validation and error handling
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Compliance Checklist**: Comprehensive BIR compliance tracking
- **Revenue Declarations**: Complete revenue reporting section

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase Edge Functions
- **Email**: Resend API for automated email delivery
- **Hosting**: Vercel (frontend) + Supabase (backend)

## 🏗️ Project Structure

```
yahshua-abba-tax-forms/
├── src/
│   ├── components/
│   │   ├── TaxpayerForm.tsx         # Main form component
│   │   ├── FileUpload.tsx           # File upload functionality
│   │   └── ui/                      # shadcn/ui components
│   ├── pages/
│   │   ├── Index.tsx                # Home page
│   │   └── NotFound.tsx             # 404 page
│   ├── integrations/supabase/       # Supabase client setup
│   └── lib/utils.ts                 # Utility functions
├── supabase/
│   └── functions/
│       └── send-taxpayer-form/      # Email automation function
├── public/                          # Static assets
└── docs/                           # Documentation files
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Resend account (for email)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Khalxee/yahshua-abba-tax-forms.git
   cd yahshua-abba-tax-forms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_PROJECT_ID="your-project-id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-public-key"
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Production Deployment

#### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

#### Backend (Supabase)
1. Deploy Edge Function via Supabase dashboard
2. Add `RESEND_API_KEY` to Supabase Secrets
3. Function automatically handles email sending

## 📧 Email System

The application uses Supabase Edge Functions with Resend API for automated email delivery:

- **Primary Recipient**: support@abba.works
- **CC Copy**: Sent to form submitter
- **Professional Templates**: Styled HTML emails with complete form data
- **Error Handling**: Robust error management and logging

### Email Configuration

1. **Supabase Edge Function**: `send-taxpayer-form`
2. **Resend API**: For reliable email delivery
3. **Environment Variables**: 
   - `RESEND_API_KEY`: Set in Supabase Secrets

## 🎨 Form Features

### Taxpayer Information
- Legal name and trade name
- Tax identification details
- Complete address information
- Contact details

### Compliance Checklist
- Business registration status
- Certificate validations
- Permit verifications
- Records and bookkeeping status
- Machine registrations

### Revenue Declarations
- Monthly/quarterly filings
- Annual return status
- Income source declarations

### Additional Information
- Business ratings and classifications
- Ownership type specifications
- Signature and date fields

## 🚀 Live Demo

- **Application URL**: [Deployed on Vercel]
- **Repository**: https://github.com/Khalxee/yahshua-abba-tax-forms
- **Status**: Production Ready ✅

## 📱 Mobile Responsive

The application is fully responsive and works seamlessly across:
- 💻 Desktop computers
- 📱 Mobile phones  
- 📱 Tablets
- 🖥️ Large displays

## 🔒 Security

- Environment variables properly configured
- API keys stored securely in Supabase Secrets
- CORS headers properly set
- Input validation and sanitization
- Secure email transmission

## 📊 Performance

- **Fast Loading**: Vite build optimization
- **Modern React**: React 18 with latest features
- **Efficient Styling**: Tailwind CSS for minimal bundle size
- **Edge Functions**: Fast serverless email processing

## 🤝 Contributing

This is a production application for YAHSHUA-ABBA tax form processing. For support or modifications, please contact the development team.

## 📄 License

This project is proprietary software for YAHSHUA-ABBA tax form processing.

---

**Built with ❤️ for efficient tax form processing**