import React, { useState, useCallback } from 'react';
import type { User } from '@/types';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, UserPlus, Loader2, MessageCircle } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface UserSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChat: (userId: string) => Promise<void>;
}

const UserSearchDialog: React.FC<UserSearchDialogProps> = ({
  open,
  onOpenChange,
  onStartChat
}) => {
  const { searchUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const results = await searchUsers(term);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    }, 300),
    [searchUsers]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleStartChat = async (userId: string) => {
    setStartingChat(userId);
    try {
      await onStartChat(userId);
      onOpenChange(false);
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to start chat:', error);
    } finally {
      setStartingChat(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Start New Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <ScrollArea className="h-64 border rounded-lg">
            {!searchTerm.trim() ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Search className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">Type to search for users</p>
              </div>
            ) : searching ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No users found</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {searchResults.map(user => (
                  <div
                    key={user.uid}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {user.displayName?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.displayName || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {user.isOnline ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Online
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Offline</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartChat(user.uid)}
                      disabled={startingChat === user.uid}
                    >
                      {startingChat === user.uid ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchDialog;
