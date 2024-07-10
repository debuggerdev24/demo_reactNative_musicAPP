import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, InteractionManager, ActivityIndicator, Image, Modal } from 'react-native';
import RNFS from 'react-native-fs';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { check } from 'react-native-permissions';

const MusicListScreen = () => {
  const [musicFiles, setMusicFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const navigation = useNavigation();
  const [musicHistoryFiles, setMusicHistoryFiles] = useState([]);
  
  useEffect(() => {
    getData();
  }, [musicFiles]);

  useEffect(() => {
    const path = RNFS.ExternalStorageDirectoryPath;

    const fetchMusicFiles = async (path, currentDepth = 0) => {
      try {
        const result = await RNFS.readDir(path);
        const audioFiles = result.filter(file =>
          file.isFile() &&
          (file.name.endsWith('.mp3'))
        );

        const directories = result.filter(file => file.isDirectory());

        await Promise.all(directories.map(async directory => {
          await fetchMusicFiles(directory.path, currentDepth);
        }));
musicFiles: 
        setMusicFiles(prevState => [
          ...prevState,
          ...audioFiles.map(file => ({
            name: file.name,
            path: file.path,
            size: file.size,
            date: file.date,
            length: file.length,
            artist: file.artist,
            album: file.album,
          }))
        ]);
      } catch (error) {
        console.error('Directory Read Error: ', error);
      }
    };

    InteractionManager.runAfterInteractions(() => {
      fetchMusicFiles(path).then(() => setLoading(false));
    });
  }, []);

  const getData = async () => {
    try {
      await AsyncStorage.setItem("musicFiles", JSON.stringify(musicFiles));
    } catch (e) {
      console.error('Error getting history data:', e);
    }
  };

  const handlePress = async (index) => {
    const selectedMusic = musicFiles[index];

    const isAlreadyInHistory = musicHistoryFiles.some(
      (existingFile) => existingFile.path === selectedMusic.path
    );
  
    if (!isAlreadyInHistory) {
      const updatedHistory = [...musicHistoryFiles, selectedMusic];
      setMusicHistoryFiles(updatedHistory);
    }
    await AsyncStorage.setItem("historyData", JSON.stringify(selectedMusic));
    navigation.navigate('MusicPlayerScreen', { musicFiles, currentIndex: index });    
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity style={styles.item} onPress={() => handlePress(index)}>
      <Text style={styles.title}>{item.name}</Text>
      <TouchableOpacity onPress={() => { setShowPopup(true), setSelectedSong(item) }}>
        <Image style={styles.image} source={require("../assets/images/more.png")} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const filteredMusicFiles = musicFiles.filter(file =>
    file.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} />
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredMusicFiles}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.path}-${index}`}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={showPopup}
            onRequestClose={() => {
              setShowPopup(false);
            }}
          >
            <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={() => { setShowPopup(false) }}>
              <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
                <TouchableOpacity style={styles.modalContent} onPress={() => { setShowPopup(false), setShowDetailsPopup(true) }}>
                  <Text style={styles.modalText}>Get info</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={showDetailsPopup}
            onRequestClose={() => {
              setShowDetailsPopup(false);
            }}
          >
            <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={() => setShowDetailsPopup(false)}>
              <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
                <View style={styles.modalContent}>
                  {selectedSong && (
                    <View style={styles.modalContent}>
                      <Text style={styles.modalText}>Name: </Text>
                      <Text style={styles.songTitle}>{selectedSong.name}</Text>
                      <Text style={styles.modalText}>Size: </Text>
                      <Text style={styles.songTitle}>{selectedSong.size} bytes</Text>
                      <Text style={styles.modalText}>Path: </Text>
                      <Text style={styles.songTitle}>{selectedSong.path}</Text>
                      {/* <Text style={styles.modalText}>Date: </Text>
                      <Text style={styles.songTitle}>{selectedSong.date}</Text>
                      <Text style={styles.modalText}>Length: </Text>
                      <Text style={styles.songTitle}>{selectedSong.length}</Text>
                      <Text style={styles.modalText}>Artist: </Text>
                      <Text style={styles.songTitle}>{selectedSong.artist}</Text>
                      <Text style={styles.modalText}>Album: </Text>
                      <Text style={styles.songTitle}>{selectedSong.album}</Text> */}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    margin: 10,
    paddingHorizontal: 20
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 10
  },
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: '#f2f2f2'
  },
  filterText: {
    fontSize: 14,
    color: '#555'
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 18,
    paddingEnd: 10,
    flex: 1,
    color: 'black'
  },
  image: {
    width: 20,
    height: 20
  },
  currentlyPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc'
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  songInfo: {
    flex: 1,
    marginLeft: 10
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black'
  },
  songArtist: {
    fontSize: 14,
    color: '#777'
  },
  playButton: {
    padding: 10
  },
  playIcon: {
    width: 20,
    height: 20
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
  },
  modalContent: {    
   
    width: '100%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: 'black',
  },
});

export default MusicListScreen;