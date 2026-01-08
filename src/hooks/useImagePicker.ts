// src/hooks/useImagePicker.ts
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { buildImagePayload, isUnder10MB } from "../utils/imageProcessor";

export type ImageType =
  | "exterior"
  | "interior"
  | "damage"
  | "document"
  | "other";

interface PickedImage {
  uri: string;
  payload?: { data: string; type: ImageType };
}

/**
 * Hook around expo-image-picker for picking an image,
 * plus optional resize + base64 payload for API.
 */
export function useImagePicker() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestMediaPermission = useCallback(async () => {
    if (Platform.OS === "web") return true;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("Permission to access photos was denied");
      return false;
    }
    return true;
  }, []);

  const requestCameraPermission = useCallback(async () => {
    if (Platform.OS === "web") return true;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setError("Permission to access camera was denied");
      return false;
    }
    return true;
  }, []);

  const handleResult = useCallback(
    async (
      result: ImagePicker.ImagePickerResult,
      type: ImageType = "exterior"
    ) => {
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset?.uri) return;

      try {
        setIsPicking(true);
        setError(null);
        setImageUri(asset.uri);

        // resize + compress + to base64 + wrap { data, type }
        const payload = await buildImagePayload(asset.uri, type);

        if (!isUnder10MB(payload.data)) {
          setError("Image is larger than 10MB after encoding");
          return;
        }

        setPickedImage({ uri: asset.uri, payload });
      } catch (e) {
        console.warn("Image processing error", e);
        setError("Failed to process image");
      } finally {
        setIsPicking(false);
      }
    },
    []
  );

  const pickFromLibrary = useCallback(
    async (type: ImageType = "exterior") => {
      setError(null);
      const ok = await requestMediaPermission();
      if (!ok) return;

      try {
        setIsPicking(true);
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

        await handleResult(result, type);
      } catch (e) {
        console.warn("pickFromLibrary error", e);
        setError("Failed to pick image");
      } finally {
        setIsPicking(false);
      }
    },
    [requestMediaPermission, handleResult]
  );

  const takePhoto = useCallback(
    async (type: ImageType = "exterior") => {
      setError(null);
      const ok = await requestCameraPermission();
      if (!ok) return;

      try {
        setIsPicking(true);
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

        await handleResult(result, type);
      } catch (e) {
        console.warn("takePhoto error", e);
        setError("Failed to take photo");
      } finally {
        setIsPicking(false);
      }
    },
    [requestCameraPermission, handleResult]
  );

  const reset = useCallback(() => {
    setImageUri(null);
    setPickedImage(null);
    setError(null);
  }, []);

  return {
    imageUri,
    pickedImage,
    isPicking,
    error,
    pickFromLibrary,
    takePhoto,
    reset,
  };
}
