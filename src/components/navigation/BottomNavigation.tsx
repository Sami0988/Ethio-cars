import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Surface, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const theme = useTheme();

  const tabs = [
    { id: "home", icon: "home", label: "Home" },
    { id: "saved", icon: "heart", label: "Saved" },
    { id: "add", icon: "plus", label: "Add", isSpecial: true },
    { id: "inbox", icon: "message", label: "Inbox" },
    { id: "profile", icon: "account", label: "Profile" },
  ];

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      elevation={4}
    >
      <View style={styles.content}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              tab.isSpecial && styles.specialTab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                tab.isSpecial && styles.specialIconContainer,
                activeTab === tab.id &&
                  !tab.isSpecial &&
                  styles.activeIconContainer,
              ]}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={tab.isSpecial ? 28 : 24}
                color={
                  activeTab === tab.id
                    ? tab.isSpecial
                      ? "#FFFFFF"
                      : theme.colors.primary
                    : tab.isSpecial
                      ? "#FFFFFF"
                      : "#6B7280"
                }
              />
            </View>
            {!tab.isSpecial && (
              <Text
                style={[
                  styles.label,
                  activeTab === tab.id && styles.activeLabel,
                  {
                    color:
                      activeTab === tab.id ? theme.colors.primary : "#6B7280",
                  },
                ]}
              >
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    paddingTop: 8,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minHeight: 60,
  },
  specialTab: {
    flex: 0,
    minHeight: 56,
  },
  activeTab: {
    // Style for active tab
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  specialIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000000",
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  activeIconContainer: {
    // Additional styling for active icon if needed
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  activeLabel: {
    fontWeight: "600",
  },
});

export default BottomNavigation;
