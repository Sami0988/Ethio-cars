import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function ModalScreen() {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        This is a modal
      </Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={[styles.linkText, { color: theme.colors.primary }]}>
          Go to home screen
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
