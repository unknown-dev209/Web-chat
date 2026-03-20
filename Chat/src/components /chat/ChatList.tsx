import React, { useState } from 'react';
import type { Chat } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Users, MessageCircle, MoreVertical, UserPlus, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onCreateGroup: () => void;
  onSearchUser: () => void;
  onLeaveGroup: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  onSelectChat,
  onCreateGroup,
  onSearchUser,
  onLeaveGroup
}) => {
  const { currentUser, userData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    if (chat.type === 'group') {
      return chat.name?.toLowerCase().includes(searchLower);
    } else {
      // For direct chats, search by other participant's name
      const otherParticipant = chat.participants.find(uid => uid !== currentUser?.uid);
      const otherUser = otherParticipant ? chat.participantDetails[otherParticipant] : null;
      return otherUser?.displayName?.toLowerCase().includes(searchLower) ||
             otherUser?.email?.toLowerCase().includes(searchLower);
    }
  });

  const getChatName = (chat: Chat): string => {
    if (chat.type === 'group') {
      return chat.name || 'Unnamed Group';
    }
    
    const otherParticipant = chat.participants.find(uid => uid !== currentUser?.uid);
    const otherUser = otherParticipant ? chat.participantDetails[otherParticipant] : null;
    return otherUser?.displayName || otherUser?.email || 'Unknown User';
  };

  const getChatPhoto = (chat: Chat): string | undefined => {
    if (chat.type === 'group') {
      return chat.photoURL || undefined;
    }
    
    const otherParticipant = chat.participants.find(uid => uid !== currentUser?.uid);
    const otherUser = otherParticipant ? chat.participantDetails[otherParticipant] : null;
    return otherUser?.photoURL || undefined;
  };

  const getChatInitials = (chat: Chat): string => {
    const name = getChatName(chat);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getOtherUserStatus = (chat: Chat): { isOnline: boolean; lastSeen?: Date } => {
    if (chat.type === 'group') return { isOnline: false };
    
    const otherParticipant = chat.participants.find(uid => uid !== currentUser?.uid);
    const otherUser = otherParticipant ? chat.participantDetails[otherParticipant] : null;
    return {
      isOnline: otherUser?.isOnline || false,
      lastSeen: otherUser?.lastSeen
    };
  };

  const getUnreadCount = (chat: Chat): number => {
    if (!currentUser) return 0;
    return chat.unreadCount[currentUser.uid] || 0;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userData?.photoURL || undefined} />
              <AvatarFallback>{userData?.displayName?.slice(0, 2).toUpperCase() || 'ME'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{userData?.displayName || 'Me'}</h2>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Online
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={onSearchUser}>
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onCreateGroup}>
            <Users className="h-4 w-4 mr-1" />
            Group
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
            <p>No chats yet</p>
            <p className="text-sm">Start a new conversation</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredChats.map((chat) => {
              const unreadCount = getUnreadCount(chat);
              const status = getOtherUserStatus(chat);
              
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={getChatPhoto(chat)} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {getChatInitials(chat)}
                        </AvatarFallback>
                      </Avatar>
                      {chat.type === 'direct' && status.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {getChatName(chat)}
                        </h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(chat.lastMessage.timestamp, { addSuffix: false })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                          {chat.type === 'group' && chat.lastMessage && (
                            <span className="text-gray-600 dark:text-gray-400">{chat.lastMessage.senderName}: </span>
                          )}
                          {chat.lastMessage?.text || 'No messages yet'}
                        </p>
                        {unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 bg-blue-600">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>

                      {chat.type === 'direct' && !status.isOnline && status.lastSeen && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last seen {formatDistanceToNow(status.lastSeen, { addSuffix: true })}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {chat.type === 'group' && (
                          <>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Add members */ }}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add Members
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                onLeaveGroup(chat.id); 
                              }}
                              className="text-red-600"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Leave Group
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatList;
