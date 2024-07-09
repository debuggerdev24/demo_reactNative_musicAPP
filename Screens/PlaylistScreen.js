import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TextInput, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function PlaylistScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPlaylists();
    }, [])
  );

  const generateRandomId = () => {
    const datePart = new Date().getTime().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 5);
    return datePart + randomPart;
  };

  const loadPlaylists = async () => {
    try {
      const storedPlaylists = await AsyncStorage.getItem('playlists');
      if (storedPlaylists) {
        setPlaylists(JSON.parse(storedPlaylists));
      }
    } catch (error) {
      console.error('Failed to load playlists', error);
    }
  };

  const savePlaylists = async (newPlaylists) => {
    try {
      await AsyncStorage.setItem('playlists', JSON.stringify(newPlaylists));
    } catch (error) {
      console.error('Failed to save playlists', error);
    }
  };

  const handleYes = () => {
    if (!inputText.trim()) {
      setErrorMessage('Title cannot be empty');
      return;
    }

    const newPlaylist = {
      id: generateRandomId(),
      title: inputText.trim(),
    };
    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);
    setModalVisible(false);
    setInputText('');
    setErrorMessage('');
  };

  const handlePress = (index) => {
    console.log('Playlists:', playlists.map(item => ({ id: item.id, title: item.title })));
    const playlist = playlists[index];
    navigation.navigate('PlayListMusic', { playlistId: playlist.id, playlistTitle: playlist.title });
  };

  const renderPlaylistItem = async ({ item, index }) => {
    let storedSelectedSongs = [];
    try {
      const selectedSongs = await AsyncStorage.getItem(`selectedSongs_${item.id}`);
      if (selectedSongs) {
        storedSelectedSongs = JSON.parse(selectedSongs);
      }
    } catch (error) {
      console.error(`Failed to load selected songs for playlist ${item.id}`, error);
    }

    return (
      <TouchableOpacity style={styles.item} onPress={() => handlePress(index)}>
        <View style={styles.playlistItem}>
          <Image
            source={require('../assets/images/playlist.png')}
            style={styles.addMusicIcon}
          />
          <Text style={styles.playlistTitle}>{item.title}</Text>
          <Text style={styles.playlistCount}>{`${storedSelectedSongs.length} Music`}</Text>
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Playlists</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={require('../assets/images/add_music.png')}
            style={styles.addMusicIcon}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.playlistContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create new playlist</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Title"
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                setErrorMessage('');
              }}
            />
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleYes}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '800',
    color: 'black',
  },
  addMusicIcon: {
    width: 20,
    height: 20,
    margin: 10,
  },
  playlistContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    width:'100%'
  },
  playlistItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    padding: 10,
    // backgroundColor: '#f0f0f0',
    backgroundColor:'black',
    borderRadius: 5,
  },
  playlistTitle: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },
  playlistCount: {
    fontSize: 16,
    color: 'black',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: 'blue',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
