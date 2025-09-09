import { Button, StyleSheet, Text, View, Image } from "react-native";
import {
  CameraView,
  CameraType,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import { useEffect, useRef, useState } from "react";
import * as MediaLibrary from "expo-media-library";

export default function App() {
  // Permission
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<
    boolean | null
  >(false);

  // States
  const [image, setImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");

  // Camera reference
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    const requestPermission = async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission(); // ✅ ขอ permission กล้องจริงๆ
      }
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === "granted");
    };
    requestPermission();
  }, [cameraPermission]);

  // Loading while permission not ready
  if (!cameraPermission) {
    return (
      <View style={styles.center}>
        <Text>Checking camera permissions...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
        <Button title="Grant Permission" onPress={requestCameraPermission} />
      </View>
    );
  }

  if (!hasMediaLibraryPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting media library permission...</Text>
      </View>
    );
  }

  // Save to gallery
  const handleSaveToGallery = async () => {
    if (image && hasMediaLibraryPermission) {
      try {
        await MediaLibrary.createAssetAsync(image);
        setImage(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Take picture
  const handleTakePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const newPhoto = await cameraRef.current.takePictureAsync();
        setImage(newPhoto.uri);
      } catch (err) {
        console.error("Take picture error:", err);
      }
    } else {
      console.log("Camera not ready yet...");
    }
  };

  // When image exists -> show preview
  if (image) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: image }} style={{ flex: 1, width: "100%" }} />
        <Button title="Retake" onPress={() => setImage(null)} />
        <Button title="Save to Gallery" onPress={handleSaveToGallery} />
      </View>
    );
  }

  // Camera View
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1, width: "100%" }}
        facing={facing}
        flash={flash}
        onCameraReady={() => setIsCameraReady(true)} // ✅ รอจนกล้องพร้อม
      />
      <View style={styles.controls}>
        <Button title="📸 Take Picture" onPress={handleTakePicture} />
        <Button
          title="🔄 Switch Camera"
          onPress={() => setFacing(facing === "back" ? "front" : "back")}
        />
        <Button
          title={`⚡ Flash (${flash === "off" ? "Off" : "On"})`}
          onPress={() => setFlash(flash === "off" ? "on" : "off")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "flex-end",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
