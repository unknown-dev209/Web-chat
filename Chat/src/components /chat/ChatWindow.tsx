import React, { useEffect, useRef, useState } from 'react';
import type { Chat, Message } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  MoreVertical, 
  Phone, 
  Video,
  ArrowLeft,
  Check,
  CheckCheck,
  Smile,
  X
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ChatWindowProps {
  chat: Chat;
  onBack?: () => void;
  isMobile?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, onBack, isMobile = false }) => {
  const { currentUser } = useAuth();
  const { messages, typingUsers, loading, sendMessage, markMessagesAsRead, setTyping } = useMessages(chat.id);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  // Mark messages as read when chat opens
  useEffect(() => {
    markMessagesAsRead();
  }, [chat.id, messages.length]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    
    try {
      await sendMessage(messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    setTyping();
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to clear typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      // Typing will auto-clear on backend
    }, 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await sendMessage(type === 'image' ? 'Sent an image' : `Sent: ${file.name}`, type, file);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getChatName = (): string => {
    if (chat.type === 'group') {
      return chat.name || 'Unnamed Group';
    }
    
    const otherParticipant = chat.participants.find(uid => uid !== currentUser?.uid);
    const otherUser = otherParticipant ? chat.participantDetails[otherParticipant] : null;
    return otherUser?.displayName || otherUser?.email || 'Unknown User';
  };

  const getChatPhoto = (): string | undefined => {
    if (chat.type === 'group') {
      return chat.photoURL || undefined;
    }
    
    const otherParticipant = chat.participants.find(uid => uid !== currentUser?.uid);
    const otherUser = otherParticipant ? chat.participantDetails[otherParticipant] : null;
    return otherUser?.photoURL || undefined;
  };

  const getOtherUserStatus = (): { isOnline: boolean; lastSeen?: Date } => {
    if (chat.type === 'group') return { isOnline: false };
    
    const otherParticipant = chat.participants.find(uid => uid !== currentUser?.uid);
    const otherUser = otherParticipant ? chat.participantDetails[otherParticipant] : null;
    return {
      isOnline: otherUser?.isOnline || false,
      lastSeen: otherUser?.lastSeen
    };
  };

  const status = getOtherUserStatus();
  const chatName = getChatName();

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(message.timestamp, 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as { [key: string]: Message[] });

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getChatPhoto()} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {chatName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {chat.type === 'direct' && status.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{chatName}</h3>
            <p className="text-xs text-gray-500">
              {chat.type === 'group' ? (
                `${chat.participants.length} members`
              ) : status.isOnline ? (
                <span className="text-green-600">Online</span>
              ) : status.lastSeen ? (
                `Last seen ${format(status.lastSeen, 'MMM d, h:mm a')}`
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Phone className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Video className="h-5 w-5 text-gray-600" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Block</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Send className="h-8 w-8 opacity-50" />
            </div>
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex justify-center mb-4">
                  <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </span>
                </div>

                <div className="space-y-3">
                  {dateMessages.map((message, index) => {
                    const isOwn = message.senderId === currentUser?.uid;
                    const showAvatar = index === 0 || dateMessages[index - 1].senderId !== message.senderId;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          {!isOwn && (
                            <div className="w-8">
                              {showAvatar ? (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={message.senderPhotoURL || undefined} />
                                  <AvatarFallback className="text-xs bg-gray-300">
                                    {message.senderName.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="w-8" />
                              )}
                            </div>
                          )}

                          {/* Message bubble */}
                          <div
                            className={`relative group ${
                              isOwn
                                ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-bl-sm'
                            } px-4 py-2 shadow-sm`}
                          >
                            {/* Sender name for group chats */}
                            {!isOwn && chat.type === 'group' && showAvatar && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {message.senderName}
                              </p>
                            )}

                            {/* Message content */}
                            {message.type === 'image' && message.mediaURL ? (
                              <img
                                src={message.mediaURL}
                                alt="Shared image"
                                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedImage(message.mediaURL!)}
                              />
                            ) : message.type === 'file' ? (
                              <a
                                href={message.mediaURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 ${isOwn ? 'text-white' : 'text-blue-600'}`}
                              >
                                <Paperclip className="h-4 w-4" />
                                <span className="underline">{message.mediaName || 'Download file'}</span>
                              </a>
                            ) : (
                              <p className="whitespace-pre-wrap">{message.text}</p>
                            )}

                            {/* Timestamp and read status */}
                            <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                              <span className="text-xs">
                                {format(message.timestamp, 'h:mm a')}
                              </span>
                              {isOwn && (
                                message.readBy.length > 1 ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {typingUsers.length === 1 ? 'typing...' : `${typingUsers.length} people typing...`}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Paperclip className="h-5 w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Send Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-4 w-4 mr-2" />
                Send File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'image')}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleFileUpload(e, 'file')}
          />

          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <Smile className="h-5 w-5 text-gray-400" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || isUploading}
            className="shrink-0 bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          {selectedImage && (
            <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[80vh] object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatWindow;
