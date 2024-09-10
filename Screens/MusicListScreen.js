import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, InteractionManager, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import RNFS from 'react-native-fs';
import pauseImage from '../assets/images/pause.png';
import playImage from '../assets/images/play.png';
import stopImage from '../assets/images/stop_button.png';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player';

const MusicListScreen = () => {
  const [musicFiles, setMusicFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const navigation = useNavigation();
  const [musicHistoryFiles, setMusicHistoryFiles] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [dateClick, setDateClick] = useState(false)
  const [nameClick, setNameClick] = useState(false)
  const [sizeClick, setSizeClick] = useState(false)
  const [ascendingClick, setAscendingClick] = useState(false)
  const [descendingClick, setDescendingClick] = useState(false)
  const [shortingSong, setShortingSong] = useState('');
  const [shortingAseSong, setShortingAseSong] = useState('');
  const playbackState = usePlaybackState();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playPause, setPlayPause] = useState(false);

  useEffect(() => {
    playPauseButtonSet();
  }, []);

  const playPauseButtonSet = async () => {
    const currentState = await TrackPlayer.getState();
    if (currentState === State.Playing) {
      setPlayPause(false);
    } else {
      setPlayPause(true);
    }
  }

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

  useEffect(() => {
    saveData();
  }, [musicFiles, shortingSong, shortingAseSong, dateClick, nameClick, sizeClick, ascendingClick, descendingClick]);

  useEffect(() => {
    loadData();
  }, []);

  // useEffect(() => {
  //   const fetchCurrentTrack = async () => {
  //     const track = await TrackPlayer.getCurrentTrack();
  //     // const trackDetails = await TrackPlayer.getTrack(track);
  //     // setCurrentTrack(trackDetails);
  //   };

  //   fetchCurrentTrack();

  //   const playbackStateListener = TrackPlayer.addEventListener('playback-state', fetchCurrentTrack);

  //   return () => {
  //     playbackStateListener.remove();
  //   };
  // }, [playbackState]);

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("musicFiles", JSON.stringify(musicFiles));
      await AsyncStorage.setItem("shortingSong", shortingSong);
      await AsyncStorage.setItem("shortingAseSong", shortingAseSong);
      await AsyncStorage.setItem("dateClick", JSON.stringify(dateClick));
      await AsyncStorage.setItem("nameClick", JSON.stringify(nameClick));
      await AsyncStorage.setItem("sizeClick", JSON.stringify(sizeClick));
      await AsyncStorage.setItem("ascendingClick", JSON.stringify(ascendingClick));
      await AsyncStorage.setItem("descendingClick", JSON.stringify(descendingClick));
    } catch (e) {
      console.error('Error saving data:', e);
    }
  };

  const MusicPlayerBar = ({ song, onPause, onStop }) => {
    return (
      <View style={styles.musicPlayerBarContainer}>
        {/* <Image source={{ uri: song.cover }} style={styles.coverImage} /> */}
        <View style={styles.details}>
          <Text style={styles.songTitle}>{song?.title || "No song"}</Text>
          <Text style={styles.artist}>{song?.artist || "Unknown Artist"}</Text>
        </View>
        <TouchableOpacity onPress={onPause} style={styles.controlButton}>
          <Image source={playPause ? playImage : pauseImage} style={styles.controlIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onStop} style={styles.controlButton}>
          <Image source={stopImage} style={styles.controlIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const loadData = async () => {
    try {
      const musicFiles = await AsyncStorage.getItem("musicFiles");
      const shortingSong = await AsyncStorage.getItem("shortingSong");
      const shortingAseSong = await AsyncStorage.getItem("shortingAseSong");
      const dateClick = await AsyncStorage.getItem("dateClick");
      const nameClick = await AsyncStorage.getItem("nameClick");
      const sizeClick = await AsyncStorage.getItem("sizeClick");
      const ascendingClick = await AsyncStorage.getItem("ascendingClick");
      const descendingClick = await AsyncStorage.getItem("descendingClick");

      if (shortingSong) setShortingSong(shortingSong);
      if (shortingAseSong) setShortingAseSong(shortingAseSong);
      if (dateClick) setDateClick(JSON.parse(dateClick));
      if (nameClick) setNameClick(JSON.parse(nameClick));
      if (sizeClick) setSizeClick(JSON.parse(sizeClick));
      if (ascendingClick) setAscendingClick(JSON.parse(ascendingClick));
      if (descendingClick) setDescendingClick(JSON.parse(descendingClick));

      // applySorting();
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  const handlePause = async () => {
    const currentState = await TrackPlayer.getState();
    if (currentState === State.Playing) {
      setPlayPause(true);
      await TrackPlayer.pause();
    } else {
      setPlayPause(false);
      await TrackPlayer.play();
    }
  };

  const handleStop = () => {
    TrackPlayer.reset();
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

  const handleFilterSelect = (filter) => {
    setShortingSong(filter)
    let updatedFilters;
    let dateClickValue = false;
    let nameClickValue = false;
    let sizeClickValue = false;

    if (selectedFilters.includes(filter)) {
      updatedFilters = selectedFilters.filter((f) => f !== filter);
    } else {
      updatedFilters = [filter];
    }
    setSelectedFilters(updatedFilters);

    if (filter === 'Date') {
      dateClickValue = true;
      nameClickValue = false;
      sizeClickValue = false;
    } else if (filter === 'Name') {
      nameClickValue = true;
      sizeClickValue = false;
      dateClickValue = false;
    } else if (filter === 'Size') {
      sizeClickValue = true;
      dateClickValue = false;
      nameClickValue = false;
    }

    setDateClick(dateClickValue);
    setNameClick(nameClickValue);
    setSizeClick(sizeClickValue);
  };

  const handleOrderSelect = (order) => {
    setShortingAseSong(order)
    let ascendingClickValue = false;
    let descendingClickValue = false;

    if (order === 'Ascending') {
      ascendingClickValue = true;
      descendingClickValue = false;
    } else if (order === 'Descending') {
      descendingClickValue = true;
      ascendingClickValue = false;
    }

    setAscendingClick(ascendingClickValue);
    setDescendingClick(descendingClickValue);

    applySorting();
  };

  const applySorting = () => {

    let sortedMusicFiles = [...musicFiles];

    if (shortingSong === 'Date') {
      sortedMusicFiles.sort((a, b) => {
        if (shortingAseSong === 'Ascending') {
          return new Date(a.dateAdded) - new Date(b.dateAdded);
        } else {
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        }
      });
    } else if (shortingSong === 'Name') {
      sortedMusicFiles.sort((a, b) => {
        if (shortingAseSong === 'Ascending') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
    } else if (shortingSong === 'Size') {
      sortedMusicFiles.sort((a, b) => {
        if (shortingAseSong === 'Ascending') {
          return a.size - b.size;
        } else {
          return b.size - a.size;
        }
      });
    }

    setMusicFiles(sortedMusicFiles);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} />
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
          <View style={styles.filterRow}>
            <Text style={styles.filterText}>ALL music</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(true)}>
              <Image style={styles.filterIcon} source={require('../assets/images/filtar_icon.png')} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchBar}
            placeholder="Search music"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={'#ccc'}
          />
          <FlatList
            data={filteredMusicFiles}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.path}-${index}`}
          />

          {currentTrack && (
            <MusicPlayerBar song={currentTrack} onPause={handlePause} onStop={handleStop} />
          )}

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

          <Modal
            animationType="slide"
            transparent={true}
            visible={showFilterModal}
            onRequestClose={() => setShowFilterModal(false)}
          >
            <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
              <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>Sort By</Text>
                  {/* jyare date par click karavanu hoy tyare view kadhi ne Touchable kari nakhje */}
                  {/* <TouchableOpacity>                   */}
                  <View
                    style={styles.filterOption}
                    onPress={() => handleFilterSelect('Date')}
                  >
                    <Text style={styles.filterOptionText}>Date</Text>
                    <Text style={styles.title}>             N/A</Text>
                    <Image
                      source={dateClick ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                      style={styles.filterIcon}
                    />

                  </View>
                  {/* </TouchableOpacity> */}
                  <TouchableOpacity
                    style={styles.filterOption}
                    onPress={() => handleFilterSelect('Name')}
                  >
                    <Text style={styles.filterOptionText}>Name</Text>
                    <Image
                      source={nameClick ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                      style={styles.filterIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.filterOption}
                    onPress={() => handleFilterSelect('Size')}
                  >
                    <Text style={styles.filterOptionText}>Size</Text>
                    <Image
                      source={sizeClick ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                      style={styles.filterIcon}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>Order</Text>
                  <TouchableOpacity
                    style={styles.filterOption}
                    onPress={() => handleOrderSelect('Ascending')}
                  >
                    <Text style={styles.filterOptionText}>Ascending</Text>
                    <Image
                      source={ascendingClick ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                      style={styles.filterIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.filterOption}
                    onPress={() => handleOrderSelect('Descending')}
                  >
                    <Text style={styles.filterOptionText}>Descending</Text>
                    <Image
                      source={descendingClick ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                      style={styles.filterIcon}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => { applySorting(); setShowFilterModal(false); }}
                  >
                    <Text style={styles.applyButtonText}>OK</Text>
                  </TouchableOpacity>
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
    paddingHorizontal: 10,
    color: 'black'
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalContent: {
    paddingBottom: 5,
    paddingTop: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black',
    fontWeight: '800'
  },
  filterOption: {
    paddingVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterOptionText: {
    fontSize: 16,
    color: 'black'
  },
  applyButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 5,
  },
  applyButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    // borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center'
  },
  filterIcon: {
    width: 25,
    height: 25
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black'
  },
  musicPlayerBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  coverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  artist: {
    fontSize: 14,
    color: '#777',
  },
  controlButton: {
    padding: 10,
  },
  controlIcon: {
    width: 24,
    height: 24,
  },
});

export default MusicListScreen;
