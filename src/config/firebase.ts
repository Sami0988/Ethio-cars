// serc/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import {
  addDoc,
  and,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  limit,
  or,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "ethiocars-messaging",
  apiKey: "AIzaSyCYT3-sZSEWiCZ7zMH-JYQ7nAjjqzoW_nQ",
  authDomain: "ethiocars-messaging.firebaseapp.com",
  databaseURL: "https://ethiocars-messaging-default-rtdb.firebaseio.com/",
  storageBucket: "ethiocars-messaging.firebasestorage.app",
  messagingSenderId: "871913850490",
  appId: "1:871913850490:web:8ea21f833363d226521dc3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);

// Export Firebase services
export { app, auth, database, firestore };

// Helper functions for messaging
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  message: string,
  listingId?: string
) => {
  try {
    const messageRef = collection(firestore, "messages");
    await addDoc(messageRef, {
      senderId,
      receiverId,
      message,
      listingId,
      timestamp: serverTimestamp(),
      read: false,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error };
  }
};

export const getMessages = (userId1: string, userId2: string) => {
  const messagesRef = collection(firestore, "messages");
  return query(
    messagesRef,
    where("senderId", "in", [userId1, userId2]),
    where("receiverId", "in", [userId1, userId2]),
    orderBy("timestamp", "desc"),
    limit(50)
  );
};

// New function to get messages for a specific user (only messages from other user)
export const getMessagesFromUser = (
  currentUserId: string,
  otherUserId: string
) => {
  const messagesRef = collection(firestore, "messages");
  return query(
    messagesRef,
    or(
      and(
        where("senderId", "==", otherUserId),
        where("receiverId", "==", currentUserId)
      ),
      and(
        where("senderId", "==", currentUserId),
        where("receiverId", "==", otherUserId)
      )
    ),
    orderBy("timestamp", "desc"),
    limit(50)
  );
};

export const markMessageAsRead = async (messageId: string) => {
  try {
    const messageRef = doc(firestore, "messages", messageId);
    await updateDoc(messageRef, {
      read: true,
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking message as read:", error);
    return { success: false, error };
  }
};

export const editMessage = async (messageId: string, newMessage: string) => {
  try {
    const messageRef = doc(firestore, "messages", messageId);
    await updateDoc(messageRef, {
      message: newMessage,
      edited: true,
      editedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error editing message:", error);
    return { success: false, error };
  }
};

export const deleteMessage = async (messageId: string) => {
  try {
    const messageRef = doc(firestore, "messages", messageId);
    await deleteDoc(messageRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { success: false, error };
  }
};
