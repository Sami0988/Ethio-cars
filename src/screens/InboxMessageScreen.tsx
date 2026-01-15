import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useAuthStore } from "../features/auth/auth.store";
import {
  getInboxOnce,
  Message,
  subscribeToInbox,
} from "../services/messaging.service";

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

const InboxMessageScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [inbox, setInbox] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;

  // Calculate responsive values
  const getResponsiveValue = (
    phone: number,
    tablet: number,
    largeTablet?: number
  ) => {
    if (isLargeTablet && largeTablet) return largeTablet;
    return isTablet ? tablet : phone;
  };

  useEffect(() => {
    if (!user?.id) {
      setInbox([]);
      setLoading(false);
      return;
    }

    loadMessages();

    const unsubscribe = subscribeToInbox(user.id.toString(), (items) => {
      setInbox(items);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [user]);

  const loadMessages = () => {
    if (!user?.id) return;

    getInboxOnce(user.id.toString())
      .then((items) => {
        setInbox(items);
        setLoading(false);
        setRefreshing(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const displayName = item.senderName || item.senderId || "Unknown User";
    const hasUnread = !item.read;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50 * (index + 1), 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("chat", {
              otherUserId: item.senderId,
              otherUserName: displayName,
              listingId: item.listingId,
            })
          }
          activeOpacity={0.7}
          style={[
            styles.messageCard,
            {
              backgroundColor: theme.colors.surface,
              borderLeftColor: hasUnread ? theme.colors.primary : "transparent",
              shadowColor: theme.colors.shadow || "#000",
              padding: getResponsiveValue(16, 20, 24),
              marginBottom: getResponsiveValue(12, 16, 20),
              borderRadius: getResponsiveValue(16, 20, 24),
              borderLeftWidth: getResponsiveValue(4, 5, 6),
            },
          ]}
        >
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: stringToHslColor(
                    item.senderId || displayName
                  ),
                  width: getResponsiveValue(50, 60, 70),
                  height: getResponsiveValue(50, 60, 70),
                  borderRadius: getResponsiveValue(25, 30, 35),
                },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  { fontSize: getResponsiveValue(18, 20, 22) },
                ]}
              >
                {displayName?.charAt(0).toUpperCase()}
              </Text>
            </View>
            {hasUnread && (
              <View
                style={[
                  styles.unreadBadge,
                  {
                    backgroundColor: theme.colors.primary,
                    width: getResponsiveValue(12, 14, 16),
                    height: getResponsiveValue(12, 14, 16),
                    borderRadius: getResponsiveValue(6, 7, 8),
                  },
                ]}
              />
            )}
          </View>

          <View
            style={[
              styles.messageContent,
              { marginRight: getResponsiveValue(8, 12, 16) },
            ]}
          >
            <View style={styles.messageHeader}>
              <Text
                style={[
                  styles.senderName,
                  {
                    color: theme.colors.onSurface,
                    fontWeight: hasUnread ? "700" : "500",
                    fontSize: getResponsiveValue(16, 18, 20),
                  },
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  {
                    color: theme.colors.onSurfaceVariant,
                    fontSize: getResponsiveValue(12, 13, 14),
                  },
                ]}
              >
                {item.timestamp ? formatTime(item.timestamp) : ""}
              </Text>
            </View>

            <Text
              numberOfLines={isTablet ? 3 : 2}
              style={[
                styles.messagePreview,
                {
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: hasUnread ? "500" : "400",
                  fontSize: getResponsiveValue(14, 15, 16),
                  lineHeight: getResponsiveValue(18, 20, 22),
                },
              ]}
            >
              {item.message}
            </Text>

            {item.listingId && (
              <View style={styles.listingTag}>
                <Ionicons
                  name="cube-outline"
                  size={getResponsiveValue(12, 14, 16)}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.listingText,
                    {
                      color: theme.colors.primary,
                      fontSize: getResponsiveValue(12, 13, 14),
                    },
                  ]}
                >
                  Related to listing
                </Text>
              </View>
            )}
          </View>

          <View style={styles.chevronContainer}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={getResponsiveValue(20, 24, 28)}
              color={theme.colors.onSurfaceVariant}
              style={{ opacity: 0.5 }}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.loadingContent}>
          <ActivityIndicator
            size={isTablet ? "large" : "small"}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.loadingText,
              {
                color: theme.colors.onSurfaceVariant,
                fontSize: getResponsiveValue(14, 16, 18),
                marginTop: getResponsiveValue(16, 20, 24),
              },
            ]}
          >
            Loading conversations...
          </Text>
        </View>
      </View>
    );
  }

  if (!inbox.length) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.emptyContent}>
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor: theme.colors.surfaceVariant,
                width: getResponsiveValue(120, 150, 180),
                height: getResponsiveValue(120, 150, 180),
                borderRadius: getResponsiveValue(60, 75, 90),
              },
            ]}
          >
            <MaterialCommunityIcons
              name="message-outline"
              size={getResponsiveValue(64, 80, 96)}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
          <Text
            style={[
              styles.emptyTitle,
              {
                color: theme.colors.onSurface,
                fontSize: getResponsiveValue(24, 28, 32),
                marginTop: getResponsiveValue(16, 20, 24),
              },
            ]}
          >
            No messages yet
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              {
                color: theme.colors.onSurfaceVariant,
                fontSize: getResponsiveValue(16, 18, 20),
                lineHeight: getResponsiveValue(22, 24, 26),
                marginTop: getResponsiveValue(8, 10, 12),
              },
            ]}
          >
            Start a conversation by messaging a seller or buyer
          </Text>
          <TouchableOpacity
            style={[
              styles.browseButton,
              {
                backgroundColor: theme.colors.primary,
                paddingHorizontal: getResponsiveValue(24, 32, 40),
                paddingVertical: getResponsiveValue(12, 16, 20),
                borderRadius: getResponsiveValue(25, 30, 35),
                marginTop: getResponsiveValue(16, 20, 24),
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.browseButtonText,
                {
                  color: theme.colors.onPrimary,
                  fontSize: getResponsiveValue(16, 18, 20),
                },
              ]}
            >
              Browse Listings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: getResponsiveValue(60, 70, 80),
            paddingBottom: getResponsiveValue(20, 24, 28),
            paddingHorizontal: getResponsiveValue(20, 24, 32),
            borderBottomLeftRadius: getResponsiveValue(24, 28, 32),
            borderBottomRightRadius: getResponsiveValue(24, 28, 32),
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.onSurface,
              fontSize: getResponsiveValue(32, 36, 40),
            },
          ]}
        >
          Messages
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            {
              color: theme.colors.primary,
              fontSize: getResponsiveValue(14, 16, 18),
              marginTop: getResponsiveValue(4, 6, 8),
            },
          ]}
        >
          {inbox.filter((item) => !item.read).length} unread
        </Text>
      </View>

      <FlatList
        data={inbox}
        keyExtractor={(item) => item.id || `${item.senderId}-${item.timestamp}`}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: getResponsiveValue(16, 24, 32),
            paddingTop: getResponsiveValue(16, 20, 24),
            paddingBottom: getResponsiveValue(30, 40, 50),
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            size={isTablet ? "large" : ("default" as any)}
          />
        }
        ListHeaderComponent={
          <Text
            style={[
              styles.inboxCount,
              {
                color: theme.colors.onSurfaceVariant,
                fontSize: getResponsiveValue(12, 13, 14),
                marginBottom: getResponsiveValue(16, 20, 24),
              },
            ]}
          >
            {inbox.length} conversation{inbox.length !== 1 ? "s" : ""}
          </Text>
        }
      />
    </View>
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
  loadingContent: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyContent: {
    alignItems: "center",
    maxWidth: 400,
  },
  emptyIcon: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  browseButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  browseButtonText: {
    fontWeight: "600",
  },
  header: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontWeight: "600",
    opacity: 0.9,
  },
  listContent: {
    flexGrow: 1,
  },
  inboxCount: {
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontWeight: "600",
  },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    borderWidth: 2,
    borderColor: "white",
  },
  messageContent: {
    flex: 1,
    gap: 4,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  senderName: {
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    flexShrink: 0,
  },
  messagePreview: {
    flex: 1,
  },
  listingTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  listingText: {
    fontWeight: "500",
  },
  chevronContainer: {
    marginLeft: 8,
  },
});

export default InboxMessageScreen;
