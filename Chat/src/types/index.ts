export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isOnline: boolean;
  lastSeen: Date;
}

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL: string | null;
  text: string;
  type: 'text' | 'image' | 'file';
  mediaURL?: string;
  mediaName?: string;
  timestamp: Date;
  readBy: string[];
}

export type Chat = {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  photoURL?: string | null;
  participants: string[];
  participantDetails: { [uid: string]: User };
  lastMessage?: Message;
  unreadCount: { [uid: string]: number };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type TypingIndicator = {
  userId: string;
  chatId: string;
  timestamp: Date;
}

export type Notification = {
  id: string;
  userId: string;
  chatId: string;
  messageId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

