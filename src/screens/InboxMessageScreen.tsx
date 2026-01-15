import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useAuthStore } from "../features/auth/auth.store";
import {
  getInboxOnce,
  Message,
  subscribeToInbox,
} from "../services/messaging.service";

const InboxMessageScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [inbox, setInbox] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setInbox([]);
      setLoading(false);
      return;
    }

    // initial load
    getInboxOnce(user.id.toString())
      .then((items) => {
        setInbox(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // realtime updates
    const unsubscribe = subscribeToInbox(user.id.toString(), (items) => {
      setInbox(items);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [user]);

  const renderItem = ({ item }: { item: Message }) => {
    const displayName = item.senderName || item.senderId;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("chat" /* adjust name if different */, {
            otherUserId: item.senderId,
            otherUserName: displayName,
            listingId: item.listingId,
          })
        }
        style={[styles.card, { borderColor: theme.colors.outline }]}
      >
        <View style={styles.row}>
          <View style={styles.content}>
            <Text style={[styles.sender, { color: theme.colors.onSurface }]}>
              {displayName}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
            >
              {item.message}
            </Text>
          </View>
          <View style={styles.meta}>
            <Text
              style={[styles.time, { color: theme.colors.onSurfaceVariant }]}
            >
              {item.timestamp
                ? new Date(item.timestamp).toLocaleTimeString()
                : ""}
            </Text>
            {!item.read && (
              <View
                style={[
                  styles.unreadDot,
                  { backgroundColor: theme.colors.primary },
                ]}
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
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!inbox.length) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          No messages
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={inbox}
        keyExtractor={(item) => item.id || `${item.senderId}-${item.timestamp}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  row: { flexDirection: "row", alignItems: "center" },
  content: { flex: 1 },
  sender: { fontWeight: "600", fontSize: 16, marginBottom: 4 },
  message: { fontSize: 14 },
  meta: { alignItems: "flex-end", marginLeft: 8 },
  time: { fontSize: 12 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
});

export default InboxMessageScreen;
