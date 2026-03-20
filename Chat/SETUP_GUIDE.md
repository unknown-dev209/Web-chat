# Firebase Chat App - Setup Guide

## Overview
A full-featured real-time messaging platform built with React, TypeScript, Tailwind CSS, and Firebase.

## Features
- ✅ Google/Gmail & Email/Password Authentication
- ✅ One-on-one and Group Chat
- ✅ Real-time messaging with Firestore
- ✅ Message timestamps and read receipts
- ✅ Typing indicators
- ✅ Media sharing (images/files)
- ✅ Persistent chat history
- ✅ Responsive design (desktop + mobile)
- ✅ Dark mode support
- ✅ Online/offline status

---

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "firebase-chat-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Authentication
1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password**: Enable "Email/Password" provider
   - **Google**: Enable "Google" provider
     - Select your project support email
     - Click "Save"

### 1.3 Create Firestore Database
1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode"
4. Select a location closest to your users
5. Click "Enable"

### 1.4 Set Up Storage (for media files)
1. Go to **Build > Storage**
2. Click "Get started"
3. Choose "Start in production mode" or "Start in test mode"
4. Select a location
5. Click "Done"

### 1.5 Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Under "Your apps", click the **</>** icon to add a web app
3. Register app with nickname (e.g., "chat-web")
4. Copy the Firebase configuration object

---

## Step 2: Configure the App

### 2.1 Set Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials from Step 1.5:
   ```env
   VITE_FIREBASE_API_KEY=your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### 2.2 Update Firestore Security Rules
1. In Firebase Console, go to **Firestore Database > Rules**
2. Replace with the rules from `src/firebase/firestore.rules`:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isAuthenticated() {
         return request.auth != null;
       }
       
       function isOwner(userId) {
         return isAuthenticated() && request.auth.uid == userId;
       }
       
       match /users/{userId} {
         allow read: if isAuthenticated();
         allow write: if isOwner(userId);
       }
       
       match /chats/{chatId} {
         allow read: if isAuthenticated() && 
           request.auth.uid in resource.data.participants;
         allow create: if isAuthenticated();
         allow update: if isAuthenticated() && 
           request.auth.uid in resource.data.participants;
       }
     }
   }
   ```
3. Click "Publish"

### 2.3 Update Storage Security Rules
1. Go to **Storage > Rules**
2. Replace with rules from `src/firebase/storage.rules`
3. Click "Publish"

---

## Step 3: Run the Application

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3.3 Build for Production
```bash
npm run build
```

---

## Step 4: Configure Google Sign-In (Important!)

### 4.1 Add Authorized Domain
1. In Firebase Console, go to **Authentication > Settings > Authorized domains**
2. Click "Add domain"
3. Add your domain:
   - For local development: `localhost`
   - For production: your actual domain (e.g., `your-app.vercel.app`)

### 4.2 Configure OAuth Consent Screen (if using Google Sign-In)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services > OAuth consent screen**
4. Configure the consent screen:
   - User Type: External
   - App name: Your app name
   - User support email: Your email
   - Developer contact information: Your email
5. Click "Save and Continue"
6. Add scopes: `email`, `profile`, `openid`
7. Add test users if in testing mode

---

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── Login.tsx           # Authentication component
│   ├── chat/
│   │   ├── ChatList.tsx        # Chat list sidebar
│   │   ├── ChatWindow.tsx      # Main chat interface
│   │   ├── CreateGroupDialog.tsx  # Group creation
│   │   └── UserSearchDialog.tsx   # User search
│   └── common/
│       └── Header.tsx          # App header
├── context/
│   └── AuthContext.tsx         # Authentication state
├── firebase/
│   ├── config.ts               # Firebase configuration
│   ├── firestore.rules         # Firestore security rules
│   └── storage.rules           # Storage security rules
├── hooks/
│   ├── useChats.ts             # Chat management hook
│   ├── useMessages.ts          # Messages hook
│   └── useUsers.ts             # User search hook
├── types/
│   └── index.ts                # TypeScript types
├── App.tsx                     # Main app component
└── main.tsx                    # Entry point
```

---

## Usage

### Starting a Chat
1. Click "New Chat" button
2. Search for a user by name or email
3. Click "Chat" to start a conversation

### Creating a Group
1. Click "Group" button
2. Enter group name
3. Select members from the list
4. Click "Create Group"

### Sending Media
1. Click the paperclip icon in the message input
2. Select "Send Image" or "Send File"
3. Choose the file to upload

### Dark Mode
- Toggle dark mode using the sun/moon icon in the header

---

## Troubleshooting

### Google Sign-In Not Working
1. Check that `localhost` is in authorized domains
2. Verify OAuth consent screen is configured
3. Check browser console for specific errors

### Messages Not Loading
1. Check Firestore rules are published
2. Verify user is authenticated
3. Check browser console for errors

### Media Uploads Failing
1. Check Storage rules are published
2. Verify file size is under 10MB
3. Check file type is allowed

---

## Deployment

### Deploy to Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---

## License
MIT License - feel free to use for personal or commercial projects.
