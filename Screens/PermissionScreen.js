import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { requestMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions'; 
import { PermissionsAndroid } from 'react-native';

const PermissionScreen = ({ navigation }) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

const requestReadStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Cool Audio App Storage Permission',
          message:
            'Cool Audio App needs access to your storage ' +
            'to read audio files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can read external storage');
        navigation.navigate('MyTabs');
      } else {
        console.log('Storage permission denied');
        Alert.alert('Permission Denied', 'Storage permission denied');
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Permission Error', err.message);
    }
  };


  useEffect(() => {
    requestReadStoragePermission();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Requesting Permissions...</Text>
      {!permissionsGranted && (
        <Button title="Retry" onPress={requestReadStoragePermission} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default PermissionScreen;
