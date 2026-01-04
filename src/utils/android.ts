import { Alert, PermissionsAndroid, Platform } from "react-native";

/**
 * Android-specific utilities for EthioCars app
 */

// Android version check
export const isAndroid = Platform.OS === "android";
export const isIOS = Platform.OS === "ios";

// Get Android version
export const getAndroidVersion = (): number => {
  if (Platform.OS === "android") {
    return Platform.Version as number;
  }
  return 0;
};

// Check if Android version supports certain features
export const supportsAndroidVersion = (requiredVersion: number): boolean => {
  return getAndroidVersion() >= requiredVersion;
};

// Request camera permissions
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    const cameraResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    const storageResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );

    return (
      cameraResult === PermissionsAndroid.RESULTS.GRANTED &&
      storageResult === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (error) {
    console.error("Error requesting camera permission:", error);
    return false;
  }
};

// Request storage permissions
export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    const writeResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    const readResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );

    return (
      writeResult === PermissionsAndroid.RESULTS.GRANTED &&
      readResult === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (error) {
    console.error("Error requesting storage permission:", error);
    return false;
  }
};

// Request location permissions
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    const fineResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    const coarseResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    );

    return (
      fineResult === PermissionsAndroid.RESULTS.GRANTED ||
      coarseResult === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (error) {
    console.error("Error requesting location permission:", error);
    return false;
  }
};

// Check if permission is granted
export const checkPermission = async (
  permission: keyof typeof PermissionsAndroid.PERMISSIONS
): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS[permission]
    );
    return result;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
};

// Show Android-specific alert
export const showAndroidAlert = (
  title: string,
  message: string,
  onConfirm?: () => void,
  onCancel?: () => void
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: "Cancel",
        style: "cancel",
        onPress: onCancel,
      },
      {
        text: "OK",
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
};

// Android back handler utilities
export const handleAndroidBack = (callback: () => boolean | void): void => {
  if (Platform.OS === "android") {
    // This would be used with BackHandler from react-native
    // Implementation depends on where this is called
    callback();
  }
};

// Android share functionality
export const shareOnAndroid = async (
  title: string,
  message: string,
  url?: string
): Promise<void> => {
  if (Platform.OS === "android") {
    try {
      const { Share } = await import("react-native");
      await Share.share({
        title,
        message: url ? `${message} ${url}` : message,
      });
    } catch (error) {
      console.error("Error sharing on Android:", error);
    }
  }
};

// Android-specific image picker options
export const getAndroidImagePickerOptions = () => {
  return {
    mediaType: "photo" as const,
    quality: 0.8,
    includeBase64: false,
    includeExtra: true,
  };
};

// Check if device has camera
export const hasCamera = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    return result;
  } catch (error) {
    console.error("Error checking camera availability:", error);
    return false;
  }
};

// Android-specific deep link handling
export const handleAndroidDeepLink = (url: string): boolean => {
  if (Platform.OS === "android") {
    // Handle deep links specific to Android
    // Implementation depends on your deep linking strategy
    console.log("Handling Android deep link:", url);
    return true;
  }
  return false;
};

// Get device info for Android
export const getAndroidDeviceInfo = () => {
  if (Platform.OS === "android") {
    return {
      platform: "android",
      version: Platform.Version,
      isEmulator: false, // Simplified for now
    };
  }
  return null;
};
