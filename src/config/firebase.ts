// Import the functions you need from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  limit,
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
  storageBucket: "ethiocars-messaging.firebasestorage.app",
  messagingSenderId: "871913850490",
  appId: "1:871913850490:web:8ea21f833363d226521dc3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Export Firebase services
export { app, auth, firestore };

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
