import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import HomeScreen from "../../screens/HomeScreen";
import ProfileScreen from "../../screens/main/ProfileScreen";
import BottomNavigation from "../navigation/BottomNavigation";

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("home");

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
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
        return <ProfileScreen />;
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
