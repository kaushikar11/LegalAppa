# ⚖️ LegalAppa

**AI-Powered Legal Document Drafting Platform**

LegalAppa is a modern web application that helps lawyers and legal professionals draft, edit, and manage legal documents efficiently using AI assistance. Stop spending hours on one document—draft hundreds in just 10 minutes!

## ✨ Features

### 🎯 Core Features

- **AI-Powered Document Generation**: Generate legal documents using Google Gemini 2.5 Flash
- **Document Upload & Management**: Upload DOCX files to Supabase Storage
- **Intelligent Document Editing**: Modify documents with AI assistance and version control
- **Voice Input Support**: Speak your instructions instead of typing (Web Speech API)
- **Version History**: Navigate through document versions with full history tracking
- **AI Chatbot Assistant**: Get legal document drafting help from LegalAppa AI assistant
- **Template Management**: View and manage all uploaded document templates
- **Dark/Light Mode**: Beautiful UI with theme switching (Cream/Blue theme)

### 🚀 Advanced Features

- **Real-time Document Editing**: Edit documents directly in the browser
- **LaTeX to DOCX Conversion**: Convert AI-generated LaTeX to professional DOCX files
- **Protected Routes**: Secure authentication with Firebase Auth
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Professional UI**: Apple-inspired glass morphism header with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **React Router 6** - Navigation
- **Styled Components** - CSS-in-JS styling
- **Tailwind CSS** - Utility-first CSS

### Backend & Services
- **Firebase Authentication** - User authentication
- **Supabase Storage** - Document storage
- **Google Gemini 2.5 Flash** - AI document generation and chatbot
- **LaTeX to DOCX API** - Document conversion service

### Libraries
- **Mammoth** - DOCX text extraction
- **PDF.js** - PDF text extraction
- **Axios** - HTTP requests
- **Web Speech API** - Voice input

## 📋 Prerequisites

- Node.js 16+ and npm
- Firebase project with Authentication enabled
- Supabase project with Storage bucket configured
- Google Gemini API key

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LegalAppa
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Google Gemini API Keys
REACT_APP_GEMINI=your_gemini_api_key_1
REACT_APP_GEMINI2=your_gemini_api_key_2

# Firebase Configuration
REACT_APP_FIREBASE_apiKey=your_firebase_api_key
REACT_APP_FIREBASE_authDomain=your_project.firebaseapp.com
REACT_APP_FIREBASE_projectId=your_project_id
REACT_APP_FIREBASE_storageBucket=your_project.firebasestorage.app
REACT_APP_FIREBASE_messagingSenderId=your_messaging_sender_id
REACT_APP_FIREBASE_appId=your_app_id
REACT_APP_FIREBASE_measurementId=your_measurement_id

# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Configure Supabase Storage

1. Create a storage bucket named `documents` in your Supabase dashboard
2. Set the bucket to **public** (or configure RLS policies for private access)
3. Ensure the bucket allows uploads from authenticated users

### 5. Run the Application

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
LegalAppa/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Login/Register components
│   │   ├── Chatbot.js    # AI assistant chatbot
│   │   ├── DocumentEditor.js  # Document editing with version control
│   │   ├── FileUpload.js  # Document upload component
│   │   ├── Home.js       # Landing page
│   │   ├── Navbar.js     # Navigation header
│   │   ├── TemplateList.js  # Template management
│   │   └── VoiceInput.js # Voice input component
│   ├── contexts/         # React contexts
│   │   ├── authContext/  # Authentication context
│   │   └── themeContext/ # Theme context
│   ├── firebase/         # Firebase configuration
│   │   ├── auth.js       # Auth utilities
│   │   ├── firebase.js   # Firebase config
│   │   └── gemini.js     # Gemini API key
│   ├── storage/         # Storage utilities
│   │   └── supabase.js   # Supabase storage functions
│   ├── App.js           # Main app component
│   └── index.js         # Entry point
├── .env                 # Environment variables (not in git)
└── package.json         # Dependencies
```

## 🎮 Usage Guide

### Uploading Documents

1. Navigate to `/upload` (requires authentication)
2. Drag and drop a DOCX file or click to browse
3. File is uploaded to Supabase Storage
4. Document appears in your templates list

### Editing Documents

1. Go to `/templates` to view all uploaded documents
2. Click on a document to open the editor
3. **Modify Document**:
   - Enter editing instructions (or use voice input)
   - Click "Modify Document" to generate updated content
   - Updated content appears in the left panel
4. **Version History**:
   - Use Previous/Next buttons to navigate versions
   - Each modification creates a new version
5. **Download**:
   - Click "Download DOCX" when ready
   - Document is converted from LaTeX to DOCX and downloaded

### Using the Chatbot

1. The chatbot appears on `/upload`, `/templates`, and `/edit` pages
2. Ask questions about legal document drafting
3. Use voice input to speak your questions
4. Get AI-powered assistance from LegalAppa

### Voice Input

- Click the microphone button to start voice input
- Speak your instructions clearly
- Text is automatically transcribed and added to the input field
- Works in both Document Editor and Chatbot

## 🔐 Authentication

- **Sign Up**: Create a new account with email/password or Google
- **Sign In**: Login with existing credentials
- **Protected Routes**: `/upload`, `/templates`, `/edit` require authentication
- **Public Routes**: `/`, `/login`, `/register` are publicly accessible

## 🎨 Theming

The app supports two themes:
- **Light Mode**: Cream background with blue accents
- **Dark Mode**: Dark blue background with light accents

Toggle theme using the theme switcher in the navbar.

## 📦 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any static hosting service:
- Netlify
- AWS Amplify
- Firebase Hosting
- GitHub Pages

**Important**: Ensure all environment variables are set in your hosting platform.

## 🔧 Troubleshooting

### Firebase Authentication Errors

- Verify all Firebase environment variables are correct
- Ensure Firebase Authentication is enabled in Firebase Console
- Check that email/password and Google sign-in providers are enabled

### Supabase Storage Errors

- Verify Supabase URL and anon key are correct
- Ensure the `documents` bucket exists
- Check bucket permissions (public or RLS policies)

### Gemini API Errors

- Verify API keys are valid and have quota remaining
- Check that the model name is correct (`gemini-2.5-flash`)
- Ensure API keys are not rate-limited

### Voice Input Not Working

- Use Chrome, Edge, or Safari (Firefox doesn't support Web Speech API)
- Allow microphone permissions in browser settings
- Ensure you're on HTTPS (required for microphone access)

## 📝 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For issues or feature requests, please contact the development team.

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Supabase for storage infrastructure
- Firebase for authentication
- React community for excellent tools and libraries

---

**Built with ❤️ for legal professionals**
