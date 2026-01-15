// src/screens/ChatScreen.tsx
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useRef, useState } from "react";
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
import {
  commonFontSizes,
  commonSpacing,
  isSmallScreen,
  isTablet,
} from "../utils/responsive";

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
    messages: initialMessages,
    loading,
    editExistingMessage,
    deleteExistingMessage,
    sendNewMessage,
  } = useMessaging(otherUserId, otherUserName);
  const { user } = useAuthStore();

  // Get screen dimensions for responsive keyboard offset
  const screenHeight = Dimensions.get("window").height;
  const keyboardOffset =
    Platform.OS === "ios" ? screenHeight * 0.18 : screenHeight * 0.05;

  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList<Message> | null>(null);

  // Use messages directly from Firebase as they are stored (oldest first)
  useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      try {
        const result = await sendNewMessage(messageText.trim(), listingId);
        if (result!.success) {
          setMessageText("");
        } else {
          Alert.alert(
            "Error",
            result!.error || "Failed to send message. Please try again."
          );
        }
      } catch (error) {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
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
              if (message.id) {
                setEditingMessage(message.id);
                setEditText(message.message);
                setShowEditModal(true);
              }
            },
          },
          {
            text: "Delete",
            onPress: () => {
              if (message.id) {
                handleDeleteMessage(message.id);
              }
            },
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
            if (!result.success) {
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

  // Format timestamp for display
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "Sending...";

    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return messageDate.toLocaleDateString();
  };

  const renderMessage = ({ item }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === user?.id.toString();

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
        style={[
          styles.messageWrapper,
          isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper,
        ]}
      >
        {!isOwnMessage && (
          <Text
            style={[
              styles.senderName,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {item.senderName || otherUserName}
          </Text>
        )}
        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessage : styles.otherMessage,
            !isOwnMessage && { backgroundColor: theme.colors.surfaceVariant },
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
          <View
            style={[
              styles.messageFooter,
              isOwnMessage
                ? styles.ownMessageFooter
                : styles.otherMessageFooter,
            ]}
          >
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
              {formatTimestamp(item.timestamp)}
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
        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 12,
            marginTop: 8,
          }}
        >
          Debug: User {user?.id || "Not logged in"} chatting with {otherUserId}
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
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.outline,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Text style={[styles.headerText, { color: theme.colors.onSurface }]}>
            Chat with {otherUserName || "Unknown User"}
          </Text>
        </View>

        <FlatList
          data={messages}
          ref={flatListRef}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id || Math.random().toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
          onLayout={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />

        <View
          style={[
            styles.inputContainer,
            {
              borderTopColor: theme.colors.outline,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surfaceVariant,
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
              {
                backgroundColor: messageText.trim()
                  ? theme.colors.primary
                  : theme.colors.outline,
                opacity: messageText.trim() ? 1 : 0.5,
              },
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
          <View
            style={[
              styles.modalOverlay,
              { backgroundColor: "rgba(0, 0, 0, 0.5)" },
            ]}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[styles.modalTitle, { color: theme.colors.onSurface }]}
              >
                Edit Message
              </Text>
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
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: theme.colors.onPrimary },
                    ]}
                  >
                    Save
                  </Text>
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
    paddingVertical: 0,
    paddingHorizontal: commonSpacing.medium,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: commonFontSizes.title,
    fontWeight: "bold",
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: commonSpacing.medium,
    paddingTop: 0,
    paddingBottom: 0,
  },
  messageWrapper: {
    marginBottom: commonSpacing.small / 2, // Half spacing for tight layout
  },
  ownMessageWrapper: {
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  otherMessageWrapper: {
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  messageContainer: {
    paddingHorizontal: commonSpacing.medium,
    paddingVertical: commonSpacing.small / 2,
    borderRadius: isSmallScreen ? 16 : 18,
    minWidth: 50,
  },
  ownMessage: {
    backgroundColor: "#0084FF",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: commonFontSizes.small,
    fontWeight: "600",
    marginBottom: 2,
  },
  messageText: {
    fontSize: commonFontSizes.medium,
    lineHeight: commonFontSizes.medium + 6,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  ownMessageFooter: {
    justifyContent: "flex-end",
  },
  otherMessageFooter: {
    justifyContent: "flex-start",
  },
  timestamp: {
    fontSize: commonFontSizes.small - 1,
    opacity: 0.8,
  },
  readIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 0,
    paddingHorizontal: commonSpacing.small,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: isSmallScreen ? 18 : 20,
    paddingHorizontal: commonSpacing.medium,
    paddingVertical: commonSpacing.small + 2,
    marginRight: commonSpacing.medium,
    maxHeight: 100,
    minHeight: isSmallScreen ? 36 : 40,
    fontSize: commonFontSizes.medium,
    lineHeight: commonFontSizes.medium + 4,
  },
  sendButton: {
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    borderRadius: isSmallScreen ? 18 : 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: isSmallScreen ? 10 : 12,
    padding: commonSpacing.medium,
    width: isTablet ? "60%" : "90%",
    maxWidth: isTablet ? 500 : 400,
  },
  modalTitle: {
    fontSize: commonFontSizes.large,
    fontWeight: "bold",
    marginBottom: commonSpacing.medium,
    textAlign: "center",
  },
  editInput: {
    borderWidth: 1,
    borderRadius: isSmallScreen ? 6 : 8,
    padding: commonSpacing.medium,
    fontSize: commonFontSizes.medium,
    minHeight: isSmallScreen ? 72 : 80,
    marginBottom: commonSpacing.medium,
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
