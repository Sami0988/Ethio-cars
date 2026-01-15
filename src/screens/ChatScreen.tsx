import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuthStore } from "../features/auth/auth.store";
import { Message, useMessaging } from "../services/messaging.service";

// Helper function to generate consistent colors from strings
const stringToHslColor = (
  str: string,
  saturation: number = 70,
  lightness: number = 60
) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

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
  const router = useRouter();
  const { otherUserId, otherUserName, listingId } = route.params;
  const [messageText, setMessageText] = useState("");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const theme = useTheme();
  const {
    messages: initialMessages,
    loading,
    editExistingMessage,
    deleteExistingMessage,
    sendNewMessage,
  } = useMessaging(otherUserId, otherUserName);
  const { user } = useAuthStore();

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallScreen = width < 375;
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;
  const isLandscape = width > height;

  // Calculate responsive values
  const getResponsiveValue = (
    phone: number,
    tablet: number,
    largeTablet?: number
  ) => {
    if (isLargeTablet && largeTablet) return largeTablet;
    return isTablet ? tablet : phone;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(50))[0];

  // Responsive dimensions
  const headerHeight = getResponsiveValue(60, 70, 80);
  const inputHeight = getResponsiveValue(60, 70, 80);
  const inputExtra = getResponsiveValue(16, 18, 20);
  const totalInputHeight = inputHeight + inputExtra + insets.bottom;
  const messageMaxWidth = isTablet
    ? isLargeTablet
      ? "70%"
      : "75%"
    : isLandscape
      ? "60%"
      : "85%";

  useEffect(() => {
    setMessages(initialMessages || []);
    if (initialMessages.length > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [initialMessages]);

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

  const handleTyping = (text: string) => {
    setMessageText(text);
    setIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
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

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "Sending...";
    const messageDate = new Date(timestamp);
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === user?.id.toString();
    const showAvatar =
      index === 0 || messages[index - 1]?.senderId !== item.senderId;

    return (
      <Animated.View
        style={[
          styles.messageWrapper,
          isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideUpAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, index * 3],
                }),
              },
            ],
            maxWidth: messageMaxWidth,
            marginHorizontal: isTablet ? "auto" : 0,
          },
        ]}
      >
        {!isOwnMessage && showAvatar && (
          <View
            style={[
              styles.avatarContainer,
              { marginRight: getResponsiveValue(8, 12, 16) },
            ]}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: stringToHslColor(
                    otherUserId || otherUserName || "user"
                  ),
                  width: getResponsiveValue(32, 40, 48),
                  height: getResponsiveValue(32, 40, 48),
                  borderRadius: getResponsiveValue(16, 20, 24),
                },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  { fontSize: getResponsiveValue(14, 16, 18) },
                ]}
              >
                {otherUserName?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onLongPress={() => handleLongPress(item)}
          activeOpacity={0.8}
          delayLongPress={300}
          style={[
            isOwnMessage
              ? styles.ownMessageWrapper
              : styles.otherMessageWrapper,
            { maxWidth: "100%" },
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isOwnMessage
                ? styles.ownMessageBubble
                : styles.otherMessageBubble,
              {
                paddingHorizontal: getResponsiveValue(12, 16, 20),
                paddingVertical: getResponsiveValue(10, 12, 14),
                borderRadius: getResponsiveValue(18, 20, 22),
                backgroundColor: isOwnMessage
                  ? theme.colors.primary
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                {
                  color: isOwnMessage
                    ? theme.colors.onPrimary
                    : theme.colors.onSurface,
                  fontSize: getResponsiveValue(16, 17, 18),
                  lineHeight: getResponsiveValue(22, 24, 26),
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
                      ? theme.colors.onPrimary + "AA"
                      : theme.colors.onSurfaceVariant,
                    fontSize: getResponsiveValue(11, 12, 13),
                  },
                ]}
              >
                {formatTimestamp(item.timestamp)}
              </Text>

              {isOwnMessage && (
                <View style={styles.readStatus}>
                  <MaterialCommunityIcons
                    name={item.read ? "check-all" : "check"}
                    size={getResponsiveValue(12, 14, 16)}
                    color={item.read ? "#4CAF50" : "#FFFFFF80"}
                    style={styles.readIcon}
                  />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View
      style={[
        styles.header,
        {
          height: headerHeight,
          paddingTop: getResponsiveValue(6, 8, 10),
          paddingHorizontal: getResponsiveValue(16, 24, 32),
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons
          name="chevron-left"
          size={getResponsiveValue(24, 28, 32)}
          color={theme.colors.primary}
        />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <View style={styles.headerUserInfo}>
          <View
            style={[
              styles.headerAvatar,
              {
                backgroundColor: stringToHslColor(
                  otherUserId || otherUserName || "user"
                ),
                width: getResponsiveValue(40, 48, 56),
                height: getResponsiveValue(40, 48, 56),
                borderRadius: getResponsiveValue(20, 24, 28),
                marginRight: getResponsiveValue(12, 16, 20),
              },
            ]}
          >
            <Text
              style={[
                styles.headerAvatarText,
                { fontSize: getResponsiveValue(18, 20, 22) },
              ]}
            >
              {otherUserName?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.headerName,
                {
                  color: theme.colors.onSurface,
                  fontSize: getResponsiveValue(16, 18, 20),
                },
              ]}
            >
              {otherUserName || "Unknown User"}
            </Text>
            <Text
              style={[
                styles.headerStatus,
                {
                  color: theme.colors.primary,
                  fontSize: getResponsiveValue(13, 14, 15),
                },
              ]}
            >
              {isTyping ? "Typing..." : "Online"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator
          size={isTablet ? "large" : "small"}
          color={theme.colors.primary}
        />
        <Text
          style={[
            styles.loadingText,
            {
              color: theme.colors.onSurface,
              fontSize: getResponsiveValue(16, 18, 20),
              marginTop: getResponsiveValue(16, 20, 24),
            },
          ]}
        >
          Loading conversation...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? headerHeight + insets.top : 0
        }
      >
        {renderHeader()}

        <FlatList
          data={messages}
          ref={flatListRef}
          renderItem={renderMessage}
          keyExtractor={(item) =>
            item.id || `${item.timestamp}-${Math.random()}`
          }
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContainer,
            {
              paddingHorizontal: getResponsiveValue(8, 16, 24),
              paddingTop: getResponsiveValue(16, 20, 24),
              paddingBottom: totalInputHeight + getResponsiveValue(8, 10, 12),
            },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
          ListEmptyComponent={
            <View
              style={[styles.emptyChatContainer, { marginTop: height * 0.3 }]}
            >
              <MaterialCommunityIcons
                name="message-text-outline"
                size={getResponsiveValue(64, 80, 96)}
                color={theme.colors.onSurfaceVariant}
                style={{ opacity: 0.5 }}
              />
              <Text
                style={[
                  styles.emptyChatText,
                  {
                    color: theme.colors.onSurfaceVariant,
                    fontSize: getResponsiveValue(18, 20, 22),
                    marginTop: getResponsiveValue(16, 20, 24),
                  },
                ]}
              >
                Start a conversation with {otherUserName}
              </Text>
              <Text
                style={[
                  styles.emptyChatSubtext,
                  {
                    color: theme.colors.onSurfaceVariant,
                    fontSize: getResponsiveValue(14, 16, 18),
                  },
                ]}
              >
                Send a message to begin chatting
              </Text>
            </View>
          }
        />

        <View
          style={[
            styles.inputWrapper,
            {
              height: inputHeight + getResponsiveValue(16, 18, 20),
              bottom: 0,
              paddingBottom: 0,
              paddingHorizontal: getResponsiveValue(12, 16, 20),
            },
          ]}
        >
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: getResponsiveValue(25, 30, 35),
                paddingHorizontal: getResponsiveValue(12, 16, 20),
              },
            ]}
          >
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.onSurface,
                  fontSize: getResponsiveValue(16, 17, 18),
                  height: getResponsiveValue(56, 64, 72),
                  borderRadius: getResponsiveValue(20, 24, 28),
                  paddingHorizontal: getResponsiveValue(16, 20, 24),
                },
              ]}
              value={messageText}
              onChangeText={handleTyping}
              placeholder={`Message ${otherUserName}...`}
              placeholderTextColor={theme.colors.onSurfaceVariant + "80"}
              multiline
              maxLength={500}
            />

            {messageText.trim() ? (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: theme.colors.primary,
                    width: getResponsiveValue(40, 48, 56),
                    height: getResponsiveValue(40, 48, 56),
                    borderRadius: getResponsiveValue(20, 24, 28),
                    marginLeft: getResponsiveValue(4, 6, 8),
                  },
                ]}
                onPress={handleSendMessage}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="send"
                  size={getResponsiveValue(20, 24, 28)}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.emojiButton,
                  { marginLeft: getResponsiveValue(6, 8, 10) },
                ]}
                onPress={() => setShowEmojiPicker(true)}
              >
                <MaterialCommunityIcons
                  name="emoticon-outline"
                  size={getResponsiveValue(24, 28, 32)}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Emoji Picker Modal */}
        <Modal
          visible={showEmojiPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEmojiPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowEmojiPicker(false)}
          >
            <View
              style={{
                backgroundColor: theme.colors.surface,
                position: "absolute",
                bottom: inputHeight + 10,
                left: getResponsiveValue(12, 16, 20),
                right: getResponsiveValue(12, 16, 20),
                borderRadius: getResponsiveValue(12, 14, 16),
                padding: getResponsiveValue(12, 16, 20),
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                {[
                  "😀",
                  "😃",
                  "😂",
                  "😍",
                  "👍",
                  "🔥",
                  "🙏",
                  "🎉",
                  "🤔",
                  "😅",
                  "😢",
                  "😎",
                ].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => {
                      setMessageText((s) => s + emoji);
                      setShowEmojiPicker(false);
                    }}
                    style={{
                      padding: getResponsiveValue(8, 10, 12),
                      width: "25%",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: getResponsiveValue(20, 24, 28) }}>
                      {emoji}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Edit Message Modal */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: theme.colors.surface,
                  width: isTablet ? (isLargeTablet ? "40%" : "50%") : "90%",
                  maxWidth: 500,
                  borderRadius: getResponsiveValue(20, 24, 28),
                  padding: getResponsiveValue(20, 24, 28),
                },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: theme.colors.onSurface,
                    fontSize: getResponsiveValue(18, 20, 22),
                    marginBottom: getResponsiveValue(16, 20, 24),
                  },
                ]}
              >
                Edit Message
              </Text>
              <TextInput
                style={[
                  styles.editInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant + "40",
                    color: theme.colors.onSurface,
                    fontSize: getResponsiveValue(16, 17, 18),
                    minHeight: getResponsiveValue(100, 120, 140),
                    borderRadius: getResponsiveValue(12, 14, 16),
                    padding: getResponsiveValue(16, 20, 24),
                    marginBottom: getResponsiveValue(20, 24, 28),
                  },
                ]}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
                placeholder="Edit your message..."
                placeholderTextColor={theme.colors.onSurfaceVariant + "80"}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                    {
                      borderColor: theme.colors.outline,
                      padding: getResponsiveValue(12, 14, 16),
                      borderRadius: getResponsiveValue(8, 10, 12),
                    },
                  ]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      {
                        color: theme.colors.onSurface,
                        fontSize: getResponsiveValue(14, 16, 18),
                      },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    {
                      backgroundColor: theme.colors.primary,
                      padding: getResponsiveValue(12, 14, 16),
                      borderRadius: getResponsiveValue(8, 10, 12),
                    },
                  ]}
                  onPress={handleEditMessage}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      {
                        color: "#FFFFFF",
                        fontSize: getResponsiveValue(14, 16, 18),
                      },
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerAvatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  headerName: {
    fontWeight: "700",
  },
  headerStatus: {
    fontWeight: "500",
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    flexGrow: 1,
  },
  messageWrapper: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  ownMessageWrapper: {
    alignSelf: "flex-end",
  },
  otherMessageWrapper: {
    alignSelf: "flex-start",
  },
  avatarContainer: {
    marginBottom: 4,
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  messageBubble: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ownMessageBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    flexWrap: "wrap",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  timestamp: {
    opacity: 0.7,
  },
  readStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  readIcon: {
    marginLeft: 4,
  },
  emptyChatContainer: {
    alignItems: "center",
  },
  emptyChatText: {
    fontWeight: "600",
    opacity: 0.7,
    textAlign: "center",
  },
  emptyChatSubtext: {
    opacity: 0.5,
    textAlign: "center",
    marginTop: 8,
  },
  inputWrapper: {
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    paddingVertical: 8,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  emojiButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontWeight: "700",
    textAlign: "center",
  },
  editInput: {
    borderWidth: 1,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  cancelButton: {
    borderWidth: 1,
    alignItems: "center",
  },
  saveButton: {
    alignItems: "center",
  },
  modalButtonText: {
    fontWeight: "600",
  },
});

export default ChatScreen;
