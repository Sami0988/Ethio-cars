import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../features/auth/auth.store";
import { Message, useMessaging } from "../services/messaging.service";

interface ChatScreenProps {
  route: {
    params: {
      otherUserId: string;
      otherUserName: string;
      listingId?: string;
    };
  };
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { otherUserId, otherUserName, listingId } = route.params;
  const [messageText, setMessageText] = useState("");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const theme = useTheme();
  const {
    messages,
    loading,
    sendNewMessage,
    markAsRead,
    editExistingMessage,
    deleteExistingMessage,
  } = useMessaging(otherUserId);
  const { user } = useAuthStore();

  // Get screen dimensions for responsive keyboard offset
  const screenHeight = Dimensions.get("window").height;
  const keyboardOffset =
    Platform.OS === "ios" ? screenHeight * 0.18 : screenHeight * 0.05; // 18% for iOS, 5% for Android

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      await sendNewMessage(messageText.trim(), listingId);
      setMessageText("");
    }
  };

  const handleLongPress = (message: Message) => {
    const isOwnMessage = message.senderId === user?.id.toString();

    if (isOwnMessage) {
      Alert.alert(
        "Message Options",
        "What would you like to do with this message?",
        [
          {
            text: "Edit",
            onPress: () => {
              setEditingMessage(message.id);
              setEditText(message.message);
              setShowEditModal(true);
            },
          },
          {
            text: "Delete",
            onPress: () => handleDeleteMessage(message.id),
            style: "destructive",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    }
  };

  const handleEditMessage = async () => {
    if (editingMessage && editText.trim()) {
      const result = await editExistingMessage(editingMessage, editText.trim());
      if (result.success) {
        setShowEditModal(false);
        setEditingMessage(null);
        setEditText("");
      } else {
        console.error("Failed to edit message:", result.error);
        Alert.alert("Error", "Failed to edit message. Please try again.");
      }
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const result = await deleteExistingMessage(messageId);
            if (result.success) {
              // Message will be removed from the list automatically via real-time listener
            } else {
              console.error("Failed to delete message:", result.error);
              Alert.alert(
                "Error",
                "Failed to delete message. Please try again."
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.id.toString();

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessage : styles.otherMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isOwnMessage ? "#FFFFFF" : theme.colors.onSurface,
              },
            ]}
          >
            {item.message}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.timestamp,
                {
                  color: isOwnMessage
                    ? "#FFFFFF80"
                    : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {new Date(
                item.timestamp?.toDate?.() || item.timestamp
              ).toLocaleTimeString()}
            </Text>
            {isOwnMessage && (
              <MaterialCommunityIcons
                name={item.read ? "check-all" : "check"}
                size={14}
                color={item.read ? "#4CAF50" : "#FFFFFF80"}
                style={styles.readIcon}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.onSurface }}>
          Loading messages...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: theme.colors.onSurface }]}>
            Chat with {otherUserName}
          </Text>
        </View>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
        />

        <View
          style={[
            styles.inputContainer,
            { borderTopColor: theme.colors.outline },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              },
            ]}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Edit Message Modal */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Message</Text>
              <TextInput
                style={[
                  styles.editInput,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.outline,
                  },
                ]}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.outline },
                  ]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleEditMessage}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2196F3",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F5F5",
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 20 : 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 120,
    minHeight: 50,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  readIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChatScreen;
