import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  deleteMessage,
  editMessage,
  getMessages,
  markMessageAsRead,
  sendMessage,
} from "../config/firebase";
import { useAuthStore } from "../features/auth/auth.store";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: any;
  read: boolean;
  listingId?: string;
}

export const useMessaging = (otherUserId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  // Fetch messages between current user and other user
  useEffect(() => {
    if (!user || !otherUserId) return;

    const messagesQuery = getMessages(user.id.toString(), otherUserId);

    // Set up real-time listener for messages
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const fetchedMessages: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedMessages.push({
            id: doc.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message,
            timestamp: data.timestamp,
            read: data.read,
            listingId: data.listingId,
          });
        });

        // Sort messages by timestamp (oldest first for display)
        setMessages(fetchedMessages.reverse());
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching messages:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, otherUserId]);

  // Send a new message
  const sendNewMessage = async (messageText: string, listingId?: string) => {
    if (!user || !messageText.trim()) return;

    const result = await sendMessage(
      user.id.toString(),
      otherUserId,
      messageText.trim(),
      listingId
    );

    if (result.success) {
      // Message will appear in the snapshot automatically
    } else {
      console.error("Failed to send message:", result.error);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    await markMessageAsRead(messageId);
  };

  // Edit a message
  const editExistingMessage = async (messageId: string, newMessage: string) => {
    const result = await editMessage(messageId, newMessage);
    return result;
  };

  // Delete a message
  const deleteExistingMessage = async (messageId: string) => {
    const result = await deleteMessage(messageId);
    return result;
  };

  return {
    messages,
    loading,
    sendNewMessage,
    markAsRead,
    editExistingMessage,
    deleteExistingMessage,
  };
};
