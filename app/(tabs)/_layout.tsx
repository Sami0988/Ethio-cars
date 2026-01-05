import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function TabLayout() {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the FAB
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const handleFabPressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.85,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 1,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFabPressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "135deg"],
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: `${theme.colors.onSurface}70`,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 75,
          paddingBottom: 12,
          paddingTop: 10,
          paddingHorizontal: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
          letterSpacing: 0.2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  {
                    transform: [
                      {
                        scale: focused ? 1.2 : 1,
                      },
                    ],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="home"
                  size={focused ? 24 : size}
                  color={color}
                />
              </Animated.View>
              {focused && (
                <View
                  style={[styles.activeIndicator, { backgroundColor: color }]}
                />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name="bookmark"
                  size={focused ? 24 : size}
                  color={color}
                />
              </View>
              {focused && (
                <View
                  style={[styles.activeIndicator, { backgroundColor: color }]}
                />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="like"
        options={{
          title: "Like",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name="heart"
                  size={focused ? 24 : size}
                  color={color}
                />
              </View>
              {focused && (
                <View
                  style={[styles.activeIndicator, { backgroundColor: color }]}
                />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.fabContainer}>
              <View style={styles.fab}>
                <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name="email"
                  size={focused ? 24 : size}
                  color={color}
                />
                {/* Notification badge */}
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: theme.colors.error },
                  ]}
                />
              </View>
              {focused && (
                <View
                  style={[styles.activeIndicator, { backgroundColor: color }]}
                />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name="account"
                  size={focused ? 24 : size}
                  color={color}
                />
              </View>
              {focused && (
                <View
                  style={[styles.activeIndicator, { backgroundColor: color }]}
                />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    flex: 1,
  },
  iconContainerActive: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    flex: 1,
    transform: [{ translateY: -4 }],
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  fabContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  fab: {
    width: 72,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowColor: "#000000",
    elevation: 8,
    zIndex: 10,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
