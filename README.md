# Gastronomy Manager - Bilingual SaaS App

A comprehensive bilingual (Spanish/English) SaaS application for gastronomy commerce managers to manage providers, stock, orders, and payments with spreadsheet-style interfaces and WhatsApp integration.

## 🌟 Features

### 🔐 Authentication & User Management
- **Firebase Authentication** with email/password and Google sign-in
- **Role-based access control** (admin, editor, viewer)
- **Bilingual interface** (Spanish/English) with language toggle
- **Responsive design** for desktop and mobile

### 👥 Provider Database
- **Spreadsheet-style editing** with inline cell editing
- **CSV import/export** functionality
- **Copy/paste from Excel/Sheets** support
- **Provider information management**:
  - Contact details (name, email, phone, address)
  - Bank information (IBAN, SWIFT, account number)
  - Categories and tags
  - Notes and additional information
- **Catalog management** with PDF upload support

### 📦 Stock Management
- **Stock needs tracking** with spreadsheet interface
- **Low stock alerts** and status indicators
- **Restock frequency** management
- **Provider associations** for each product
- **Current stock levels** and minimum quantities
- **Order scheduling** based on restock frequency

### 🛒 Order Workflow via WhatsApp
- **Order generation** from stock needs
- **WhatsApp integration** for sending orders to providers
- **PDF receipt upload** and processing
- **Automatic data extraction** from receipts:
  - Total amount
  - Due date
  - Invoice number
  - Bank information
- **Order status tracking** (pending, sent, confirmed, delivered)

### 💰 Payment Management
- **Bulk payment export** to XLSX/CSV for accounting teams
- **Payment status tracking** (pending, paid, overdue)
- **Bank information management**
- **WhatsApp confirmation** sending
- **Multi-select export** functionality

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **React Data Grid** for spreadsheet functionality
- **Lucide React** for icons

### Backend & Services
- **Firebase** for backend services:
  - **Authentication** (Firebase Auth)
  - **Database** (Firestore)
  - **File Storage** (Firebase Storage)
- **Twilio** for WhatsApp API integration
- **SheetJS (xlsx)** for Excel export functionality

### Internationalization
- **react-i18next** for translations
- **Spanish and English** language support
- **Automatic language detection**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Twilio account (for WhatsApp integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gastronomy-saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
gastronomy-saas/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── providers/         # Provider management
│   │   ├── stock/             # Stock management
│   │   ├── orders/            # Order management
│   │   └── payments/          # Payment management
│   ├── components/            # Reusable components
│   │   ├── AuthProvider.tsx   # Authentication context
│   │   ├── Navigation.tsx     # Main navigation
│   │   └── DataGrid.tsx       # Spreadsheet component
│   ├── lib/                   # Utility libraries
│   │   ├── firebase.ts        # Firebase configuration
│   │   └── i18n.ts           # Internationalization setup
│   ├── locales/              # Translation files
│   │   ├── en.json           # English translations
│   │   └── es.json           # Spanish translations
│   └── types/                # TypeScript type definitions
│       └── index.ts          # All type definitions
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # TailwindCSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Set up Firebase Storage
5. Add your Firebase config to `.env.local`

### WhatsApp Integration (Twilio)
1. Create a Twilio account
2. Set up WhatsApp Business API
3. Configure webhook endpoints
4. Add Twilio credentials to environment variables

## 📱 Usage Guide

### Provider Management
1. Navigate to the Providers page
2. Use the spreadsheet interface to add/edit provider information
3. Import CSV files for bulk provider addition
4. Export data for backup or analysis
5. Upload provider catalogs as PDF files

### Stock Management
1. Go to the Stock page
2. Add stock items with quantities and units
3. Set minimum quantities for low stock alerts
4. Associate products with multiple providers
5. Track restock frequency and scheduling

### Order Workflow
1. Create orders from stock needs
2. Send orders via WhatsApp to providers
3. Upload PDF receipts when received
4. Extract payment data automatically
5. Review and confirm extracted information

### Payment Management
1. View all pending payments
2. Select payments for bulk export
3. Export to XLSX for accounting teams
4. Mark payments as completed
5. Send confirmation messages to providers

## 🌐 Internationalization

The application supports both Spanish and English languages:

- **Language toggle** in the navigation bar
- **Automatic language detection** based on browser settings
- **Complete translation coverage** for all UI elements
- **Date and number formatting** according to locale

### Adding New Languages
1. Create a new translation file in `src/locales/`
2. Add the language to the i18n configuration
3. Update the language selector component

## 🔒 Security Features

- **Firebase Authentication** with secure token management
- **Role-based access control** for different user types
- **Input validation** and sanitization
- **Secure file upload** with type and size restrictions
- **Environment variable** protection for sensitive data

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔮 Future Enhancements

- **Provider self-onboarding** portal
- **Advanced analytics** and reporting
- **Mobile app** development
- **API integrations** with accounting software
- **Advanced PDF parsing** with AI/ML
- **Multi-currency** support
- **Advanced workflow** automation

---

**Built with ❤️ for gastronomy businesses worldwide** 