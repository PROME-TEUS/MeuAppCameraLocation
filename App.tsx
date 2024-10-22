import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } else {
        console.error('Permissão de localização não concedida');
      }
    })();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos da sua permissão para mostrar a câmera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }
  async function takePicture() {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true };
      try {
        const photoData = await cameraRef.current.takePictureAsync(options);
        // Verifique se photoData não é indefinido
        if (photoData && photoData.uri) {
          setPhoto(photoData.uri);
        } else {
          console.error('Erro ao capturar a foto: photoData é indefinido');
        }
      } catch (error) {
        console.error('Erro ao tirar foto:', error);
      }
    }
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.buttonText}>Virar Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.buttonText}>Tirar Foto</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      {location && (
        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>Localização:</Text>
          <Text style={styles.locationDetail}>Latitude: {location.coords.latitude.toFixed(6)}</Text>
          <Text style={styles.locationDetail}>Longitude: {location.coords.longitude.toFixed(6)}</Text>
        </View>
      )}
      {photo && (
        <Image source={{ uri: photo }} style={styles.capturedImage} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 18,
    color: '#333',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#6200ee',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  locationCard: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    elevation: 5,
    margin: 20,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  locationDetail: {
    fontSize: 16,
    color: '#666',
  },
  capturedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    margin: 20,
  },
});