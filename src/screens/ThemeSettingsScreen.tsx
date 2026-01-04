import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { RadioButton, Text, useTheme } from "react-native-paper";
import { useThemeStore } from "../features/theme/theme.store";

const ThemeSettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeStore();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Theme Preference
        </Text>

        <RadioButton.Group
          onValueChange={(value) =>
            setThemeMode(value as "light" | "dark" | "system")
          }
          value={themeMode}
        >
          <View style={styles.radioItem}>
            <RadioButton value="light" />
            <Text
              style={[styles.radioLabel, { color: theme.colors.onSurface }]}
            >
              Light Mode
            </Text>
          </View>

          <View style={styles.radioItem}>
            <RadioButton value="dark" />
            <Text
              style={[styles.radioLabel, { color: theme.colors.onSurface }]}
            >
              Dark Mode
            </Text>
          </View>

          <View style={styles.radioItem}>
            <RadioButton value="system" />
            <Text
              style={[styles.radioLabel, { color: theme.colors.onSurface }]}
            >
              System Default
            </Text>
          </View>
        </RadioButton.Group>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          About
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          Choose your preferred theme mode. Light mode uses bright colors for
          daytime use, while dark mode uses darker colors that are easier on the
          eyes in low-light conditions.
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          System default automatically switches between light and dark based on
          your device settings.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default ThemeSettingsScreen;
