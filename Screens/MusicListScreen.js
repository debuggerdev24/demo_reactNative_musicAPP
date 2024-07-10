import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, InteractionManager, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import RNFS from 'react-native-fs';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MusicListScreen = () => {
  const [musicFiles, setMusicFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(''); 
  const navigation = useNavigation();
  const [musicHistoryFiles, setMusicHistoryFiles] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [dateClick, setDateClick] = useState(false)
  const [NameClick, setNameClick] = useState(false)
  const [sizeClick, setSizeClick] = useState(false)
  const [ascendingClick, setAscendingClick] = useState(false)
  const [descendingClick, setDescendingClick] = useState(false)
  const [shortingSong, setShortingSong] = useState(''); 
  const [shortingAseSong, setShortingAseSong] = useState(''); 
  
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

  const renderItemForModal = ({item}) => {
    return(
      <TouchableOpacity style={styles.filterContainer} >
        <Text style={styles.filterModalText} >{item.text}</Text>
      </TouchableOpacity>
    )
  }

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
    setSelectedOrder(order);
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
            onRequestClose={() => {
              setShowFilterModal(false);
            }}
          >
            {/* <FlatList data={modalItems} renderItem={renderItemForModal} /> */}
            <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
              <TouchableOpacity style={styles.filterModalContainer} activeOpacity={1}>
                <View style={styles.modalContent}>
                  <View style={{flexDirection:'row'}}>                 
                    <Text style={styles.filterModalText}>Date</Text>
                    <TouchableOpacity onPress={() => handleFilterSelect('Date')}>
                      <Image
                        source={dateClick ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                        style={styles.filterIcon}
                      />
                  </TouchableOpacity>
                  </View>
                  <View style={{flexDirection:'row'}}>                
                    <Text style={styles.filterModalText}>Name</Text>
                    <TouchableOpacity onPress={() => handleFilterSelect('Name')}>
                    <Image
                        source={NameClick ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                        style={styles.filterIcon}
                      />
                  </TouchableOpacity>
                  </View>
                  <View style={{flexDirection:'row'}}>
                    <Text style={styles.filterModalText}>Size</Text>
                  <TouchableOpacity onPress={() => handleFilterSelect('Size')}>
                  <Image
                        source={sizeClick ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                        style={styles.filterIcon}
                      />
                  </TouchableOpacity>
                  </View>
                  {/* <View style={{flexDirection:'row'}}>
                    <Text style={styles.filterModalText}>Length</Text>
                  <TouchableOpacity onPress={() => handleFilterSelect('Length')}>
                  <Image
                        source={selectedFilters.includes('Length') ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                        style={styles.filterIcon}
                      />
                  </TouchableOpacity>
                  </View> */}
                </View>
                <View style={styles.modalContent2}>
                <View style={{flexDirection:'row'}}>
                    <Text style={styles.filterModalText}>Ascending</Text>
                  <TouchableOpacity onPress={() => handleOrderSelect('Ascending')}>
                  <Image
                        source={ascendingClick ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                        style={styles.filterIcon}
                      />
                  </TouchableOpacity>
                  </View>
                  <View style={{flexDirection:'row'}}>
                    <Text style={styles.filterModalText}>Descending</Text>
                  <TouchableOpacity onPress={() => handleOrderSelect('Descending')}>
                    <Image
                        source={descendingClick ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                        style={styles.filterIcon}
                      />
                  </TouchableOpacity>
                   </View>
                </View>
                <View style={styles.filterModalActions}>
                  <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                    <Text style={styles.okButtonText}>OK</Text>
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
    paddingHorizontal: 20,
    color: 'black'
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
    color: 'gray'
  },
  playPauseButton: {
    padding: 10
  },
  playPauseIcon: {
    width: 30,
    height: 30
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
    paddingTop :5,
    borderBottomColor : '#ccc',
    borderBottomWidth: 1,
  },
  modalContent2: {
    paddingBottom: 5,
    paddingTop :5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black'
  },
  filterModalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  filterModalText: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black',
    width : '90%'
  },
  filterModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  cancelButtonText: {
    fontSize: 18,
    color: 'red'
  },
  okButtonText: {
    fontSize: 18,
    color: 'green'
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center'
  },
  filterIcon: {
    width: 25,
    height: 25
  },
});

export default MusicListScreen;
