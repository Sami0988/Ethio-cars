import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ComingSoon: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <MaterialCommunityIcons
          name="clock-outline"
          size={32}
          color={theme.colors.primary}
        />
      </View>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      <Text
        style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
      >
        {description}
      </Text>
      <View style={styles.badge}>
        <Text style={[styles.badgeText, { color: theme.colors.onPrimary }]}>
          Coming Soon
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  badge: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
});

export default ComingSoon;
