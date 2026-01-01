import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import HomeScreen from "../screens/HomeScreen";
import BottomNavigation from "./BottomNavigation";

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("home");

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    // TODO: Navigate to different screens based on tab
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "saved":
        // TODO: Create SavedScreen
        return (
          <View style={styles.placeholder}>
            <Text>Saved Cars</Text>
          </View>
        );
      case "add":
        // TODO: Create AddListingScreen
        return (
          <View style={styles.placeholder}>
            <Text>Add Listing</Text>
          </View>
        );
      case "inbox":
        // TODO: Create InboxScreen
        return (
          <View style={styles.placeholder}>
            <Text>Inbox</Text>
          </View>
        );
      case "profile":
        // TODO: Create ProfileScreen
        return (
          <View style={styles.placeholder}>
            <Text>Profile</Text>
          </View>
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>{renderContent()}</View>
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MainLayout;
