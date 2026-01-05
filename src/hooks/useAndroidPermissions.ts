// src/hooks/useAndroidPermissions.ts
import { useCallback, useEffect, useState } from "react";
import {
  PermissionsAndroid,
  PermissionsAndroidStatic,
  Platform,
} from "react-native";

type PermissionStatus = "unknown" | "granted" | "denied";

export interface AndroidPermissionsState {
  status: PermissionStatus;
  requestPermissions: () => Promise<PermissionStatus>;
}

/**
 * Request multiple Android permissions and expose current status.
 * On iOS it always returns "granted" and does nothing.
 */
export function useAndroidPermissions(
  permissions: (keyof PermissionsAndroidStatic["PERMISSIONS"])[]
): AndroidPermissionsState {
  const [status, setStatus] = useState<PermissionStatus>("unknown");

  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== "android") {
      setStatus("granted");
      return "granted";
    }

    try {
      const result = await PermissionsAndroid.requestMultiple(
        permissions.map((key) => PermissionsAndroid.PERMISSIONS[key]!)
      );

      const allGranted = permissions.every((key) => {
        const perm = PermissionsAndroid.PERMISSIONS[key]!;
        return result[perm] === PermissionsAndroid.RESULTS.GRANTED;
      });

      const finalStatus: PermissionStatus = allGranted ? "granted" : "denied";
      setStatus(finalStatus);
      return finalStatus;
    } catch (err) {
      console.warn("Permission request error", err);
      setStatus("denied");
      return "denied";
    }
  }, [permissions]);

  useEffect(() => {
    // Optionally auto-request on mount
    requestPermissions();
  }, [requestPermissions]);

  return { status, requestPermissions };
}
