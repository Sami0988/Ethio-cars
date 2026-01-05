// src/hooks/useAndroidBackHandler.ts
import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";

/**
 * Handle Android hardware back button.
 * Return true from the handler to indicate the event is handled (prevent default),
 * or false to let the system / navigation handle it.
 */
export function useAndroidBackHandler(handler: () => boolean): void {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handler
    );

    return () => {
      subscription.remove();
    };
  }, [handler]);
}
