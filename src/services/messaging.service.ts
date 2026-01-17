//src/services/messaging.service.ts
import {
  child,
  get,
  onValue,
  push,
  ref,
  remove,
  update,
} from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../config/firebase";
import { useAuthStore } from "../features/auth/auth.store";

// Debug: Check database URL
console.log("Database URL:", database.app.options.databaseURL);

export interface Message {
  id?: string;
  senderId: string;
  senderName?: string; // added
  receiverId: string;
  receiverName?: string; // added
  message: string;
  timestamp: any;
  read: boolean;
  listingId?: string;
}

const MESSAGES_REF = "messages/";

// Send a new message to the database
export const sendMessage = async (
  senderId: string,
  senderName: string,
  receiverId: string,
  receiverName: string,
  message: string,
  listingId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("Sending message:", {
      senderId,
      senderName,
      receiverId,
      receiverName,
      message,
      listingId,
    });
    const messagesRef = ref(database, MESSAGES_REF);
    console.log("Messages ref path:", messagesRef.toString());
    const newMessageRef = await push(messagesRef, {
      senderId,
      senderName,
      receiverId,
      receiverName,
      message,
      listingId,
      read: false,
      timestamp: new Date().toISOString(),
    });
    console.log("Message sent successfully:", newMessageRef.key);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error sending message:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Subscribe to messages in real-time
export const subscribeToMessages = (
  currentUserId: string,
  otherUserId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  const messagesRef = ref(database, MESSAGES_REF);
  const unsubscribe = onValue(
    messagesRef,
    (snapshot) => {
      try {
        const data = snapshot.val();
        const messages: Message[] = data
          ? Object.entries(data).map(([id, value]: [string, any]) => {
              const ts = value?.timestamp ?? new Date().toISOString();
              return {
                id,
                senderId: value?.senderId ?? "",
                senderName: value?.senderName ?? value?.senderId, // map name
                receiverId: value?.receiverId ?? "",
                receiverName: value?.receiverName ?? value?.receiverId, // map name
                message: value?.message ?? "",
                timestamp: typeof ts === "string" ? ts : String(ts),
                read: !!value?.read,
                listingId: value?.listingId,
              } as Message;
            })
          : [];

        const filtered = messages.filter(
          (msg) =>
            (msg.senderId === currentUserId &&
              msg.receiverId === otherUserId) ||
            (msg.senderId === otherUserId && msg.receiverId === currentUserId)
        );

        // Firebase stores messages in chronological order, so no sorting needed
        callback(filtered);
      } catch (e) {
        console.error("subscribeToMessages processing error:", e);
        callback([]);
      }
    },
    (error) => {
      console.error("subscribeToMessages onValue error:", error);
      callback([]);
    }
  );

  // onValue returns an unsubscribe function; forward it
  return unsubscribe;
};

// Subscribe to the inbox (messages where receiverId === currentUserId).
// Returns an unsubscribe function.
export const subscribeToInbox = (
  currentUserId: string,
  callback: (inboxItems: Message[]) => void
): (() => void) => {
  const messagesRef = ref(database, MESSAGES_REF);
  const unsubscribe = onValue(
    messagesRef,
    (snapshot) => {
      try {
        const data = snapshot.val();
        const messages: Message[] = data
          ? Object.entries(data).map(([id, value]: [string, any]) => {
              const ts = value?.timestamp ?? new Date().toISOString();
              return {
                id,
                senderId: value?.senderId ?? "",
                senderName: value?.senderName ?? value?.senderId, // map name
                receiverId: value?.receiverId ?? "",
                receiverName: value?.receiverName ?? value?.receiverId, // map name
                message: value?.message ?? "",
                timestamp: typeof ts === "string" ? ts : String(ts),
                read: !!value?.read,
                listingId: value?.listingId,
              } as Message;
            })
          : [];

        const received = messages.filter((m) => m.receiverId === currentUserId);

        const latestBySender = received.reduce<Record<string, Message>>(
          (acc, msg) => {
            const existing = acc[msg.senderId];
            const msgTime = new Date(msg.timestamp).getTime();
            const existingTime = existing
              ? new Date(existing.timestamp).getTime()
              : 0;
            if (!existing || msgTime > existingTime) acc[msg.senderId] = msg;
            return acc;
          },
          {}
        );

        const inboxItems = Object.values(latestBySender).sort((a, b) => {
          return (
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() // Newest first
          );
        });

        callback(inboxItems);
      } catch (e) {
        console.error("subscribeToInbox processing error:", e);
        callback([]);
      }
    },
    (error) => {
      console.error("subscribeToInbox onValue error:", error);
      callback([]);
    }
  );

  return unsubscribe;
};

// One-time fetch of inbox items (latest per sender)
// use get(child(...)) to ensure a single read
export const getInboxOnce = async (
  currentUserId: string
): Promise<Message[]> => {
  try {
    const snap = await get(child(ref(database), MESSAGES_REF));
    const data = snap.val();
    const messages: Message[] = data
      ? Object.entries(data).map(([id, value]: [string, any]) => {
          const ts = value?.timestamp ?? new Date().toISOString();
          return {
            id,
            senderId: value?.senderId ?? "",
            senderName: value?.senderName ?? value?.senderId, // map name
            receiverId: value?.receiverId ?? "",
            receiverName: value?.receiverName ?? value?.receiverId, // map name
            message: value?.message ?? "",
            timestamp: typeof ts === "string" ? ts : String(ts),
            read: !!value?.read,
            listingId: value?.listingId,
          } as Message;
        })
      : [];

    const received = messages.filter((m) => m.receiverId === currentUserId);

    const latestBySender = received.reduce<Record<string, Message>>(
      (acc, msg) => {
        const existing = acc[msg.senderId];
        const msgTime = new Date(msg.timestamp).getTime();
        const existingTime = existing
          ? new Date(existing.timestamp).getTime()
          : 0;
        if (!existing || msgTime > existingTime) acc[msg.senderId] = msg;
        return acc;
      },
      {}
    );

    const inboxItems = Object.values(latestBySender).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return inboxItems;
  } catch (error) {
    console.error("getInboxOnce error:", error);
    return [];
  }
};

// Messaging hook for managing messages
export const useMessaging = (otherUserId: string, otherUserName?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || !otherUserId) return;

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      setLoading(false); // fallback if DB never responds
    }, 8000);

    const unsubscribe = subscribeToMessages(
      user.id.toString(),
      otherUserId,
      (msgs) => {
        if (!timedOut) {
          setMessages(msgs);
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [user, otherUserId]);

  return {
    messages,
    loading,
    sendNewMessage: async (messageText: string, listingId?: string) => {
      if (!user || !messageText.trim()) return;
      return await sendMessage(
        user.id.toString(),
        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          "Unknown User",
        otherUserId,
        otherUserName || "Unknown User",
        messageText.trim(),
        listingId
      );
    },
    editExistingMessage: async (messageId: string, newMessage: string) => {
      if (!messageId || !newMessage.trim()) {
        return { success: false, error: "Invalid message ID or message text" };
      }

      try {
        const messageRef = ref(database, `${MESSAGES_REF}${messageId}`);
        await update(messageRef, {
          message: newMessage.trim(),
          timestamp: new Date().toISOString(), // Update timestamp to show when edited
        });
        console.log("Message edited successfully:", messageId);
        return { success: true };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error editing message:", errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    deleteExistingMessage: async (messageId: string) => {
      if (!messageId) {
        return { success: false, error: "Invalid message ID" };
      }

      try {
        const messageRef = ref(database, `${MESSAGES_REF}${messageId}`);
        await remove(messageRef);
        console.log("Message deleted successfully:", messageId);
        return { success: true };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error deleting message:", errorMessage);
        return { success: false, error: errorMessage };
      }
    },
  };
};
