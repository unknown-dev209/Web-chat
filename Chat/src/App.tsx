import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';
import { useChats } from '@/hooks/useChats';
import Login from '@/components/auth/Login';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import CreateGroupDialog from '@/components/chat/CreateGroupDialog';
import UserSearchDialog from '@/components/chat/UserSearchDialog';
import type { Chat } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Main App Content Component
const AppContent: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { chats, createDirectChat, createGroupChat, leaveGroup, markAsRead } = useChats();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Check for dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    markAsRead(chat.id);
    if (isMobile) {
      setShowMobileChat(true);
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedChat(null);
  };

  const handleCreateGroup = async (name: string, participantIds: string[], photoURL?: string) => {
    try {
      await createGroupChat(name, participantIds, photoURL);
      toast.success(`Group "${name}" created successfully!`);
      // The new chat will appear in the list via the real-time listener
    } catch (error: any) {
      toast.error(error.message || 'Failed to create group');
      throw error;
    }
  };

  const handleStartChat = async (userId: string) => {
    try {
      await createDirectChat(userId);
      toast.success('Chat started!');
      // The new chat will appear in the list via the real-time listener
    } catch (error: any) {
      toast.error(error.message || 'Failed to start chat');
      throw error;
    }
  };

  const handleLeaveGroup = async (chatId: string) => {
    try {
      await leaveGroup(chatId);
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
        setShowMobileChat(false);
      }
      toast.success('Left the group');
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave group');
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!currentUser) {
    return (
      <>
        <Login />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List - Hidden on mobile when chat is open */}
        <div className={`${isMobile && showMobileChat ? 'hidden' : 'flex'} w-full md:w-80 lg:w-96 flex-shrink-0`}>
          <ChatList
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onCreateGroup={() => setCreateGroupOpen(true)}
            onSearchUser={() => setUserSearchOpen(true)}
            onLeaveGroup={handleLeaveGroup}
          />
        </div>

        {/* Chat Window */}
        <div className={`${isMobile && !showMobileChat ? 'hidden' : 'flex'} flex-1`}>
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              onBack={handleBackToList}
              isMobile={isMobile}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to Firebase Chat
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  Select a conversation from the list or start a new chat to begin messaging.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setUserSearchOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start New Chat
                  </button>
                  <button
                    onClick={() => setCreateGroupOpen(true)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onCreateGroup={handleCreateGroup}
      />

      <UserSearchDialog
        open={userSearchOpen}
        onOpenChange={setUserSearchOpen}
        onStartChat={handleStartChat}
      />

      <Toaster position="top-center" />
    </div>
  );
};

// Root App Component with Providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
