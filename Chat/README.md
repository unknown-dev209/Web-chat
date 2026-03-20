# Firebase Chat App

A full-featured real-time messaging platform built with React, TypeScript, Tailwind CSS, and Firebase.

![Firebase Chat Preview](https://firebasestorage.googleapis.com/v0/b/firebase-chat-demo/preview.png)

## Features

### Core Features
- **Authentication**: Google/Gmail & Email/Password sign-in via Firebase Auth
- **One-on-one Chat**: Private messaging between users
- **Group Chat**: Create groups with multiple participants
- **Real-time Messaging**: Instant message delivery using Firebase Firestore
- **Message Timestamps**: See when messages were sent
- **Read Receipts**: Know when your messages are read
- **Typing Indicators**: See when someone is typing
- **Media Sharing**: Send images and files via Firebase Storage
- **Persistent Chat History**: All messages are saved and synced

### UI/UX Features
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Online/Offline Status**: See when users are online
- **User Avatars**: Profile pictures in chats
- **Message Bubbles**: Clean, modern chat interface
- **Unread Count Badges**: Know when you have new messages
- **Search**: Find users to start new conversations

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Build Tool**: Vite
- **Date Handling**: date-fns

## Quick Start

### Prerequisites
- Node.js 18+ 
- A Firebase project

### 1. Clone and Install

```bash
git clone <repository-url>
cd firebase-chat-app
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password and Google providers)
4. Create a **Firestore Database**
5. Enable **Storage** for media files
6. Get your Firebase config from Project Settings

### 3. Environment Configuration

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Firestore Security Rules

In Firebase Console, go to Firestore Database > Rules and paste:

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

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Starting a Chat
1. Click **"New Chat"** button in the sidebar
2. Search for a user by name or email
3. Click **"Chat"** to start a conversation

### Creating a Group
1. Click **"Group"** button in the sidebar
2. Enter a group name
3. Select members from the list
4. Optionally add a group photo
5. Click **"Create Group"**

### Sending Media
1. Click the **paperclip icon** in the message input
2. Select **"Send Image"** or **"Send File"**
3. Choose the file to upload (max 10MB)

### Dark Mode
- Toggle dark mode using the **sun/moon icon** in the header

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── Login.tsx              # Authentication UI
│   ├── chat/
│   │   ├── ChatList.tsx           # Chat list sidebar
│   │   ├── ChatWindow.tsx         # Main chat interface
│   │   ├── CreateGroupDialog.tsx  # Group creation modal
│   │   └── UserSearchDialog.tsx   # User search modal
│   └── common/
│       └── Header.tsx             # App header
├── context/
│   └── AuthContext.tsx            # Authentication state management
├── firebase/
│   ├── config.ts                  # Firebase configuration
│   ├── firestore.rules            # Firestore security rules
│   └── storage.rules              # Storage security rules
├── hooks/
│   ├── useChats.ts                # Chat management hook
│   ├── useMessages.ts             # Messages hook
│   └── useUsers.ts                # User search hook
├── types/
│   └── index.ts                   # TypeScript type definitions
├── App.tsx                        # Main app component
└── main.tsx                       # Entry point
```

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

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

## Troubleshooting

### Google Sign-In Not Working
1. Add `localhost` to authorized domains in Firebase Auth settings
2. Configure OAuth consent screen in Google Cloud Console
3. Check browser console for specific errors

### Messages Not Loading
1. Verify Firestore rules are published
2. Check that user is authenticated
3. Look for errors in browser console

### Media Uploads Failing
1. Check Storage rules are published
2. Verify file is under 10MB
3. Check file type is allowed (images, PDFs, documents)

## License

MIT License - feel free to use for personal or commercial projects.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please open an issue in the GitHub repository.

---

Built with React, Firebase, and Tailwind CSS.
