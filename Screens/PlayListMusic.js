import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, FlatList } from 'react-native';

export default function PlayListMusic({ route, navigation }) {
    const { playlistId, playlistTitle } = route.params;
    const [showModal, setShowModal] = useState(false);
    const [musicList, setMusicList] = useState([]);
    const [selectedSong, setSelectedSong] = useState([]);
    const [showTickIcon, setShowTickIcon] = useState(false);
    const [musicHistoryFiles, setMusicHistoryFiles] = useState([]);

    useEffect(() => {
        loadPlaylists();
        loadSelectedSongs(playlistId);
    }, [playlistId]);

    const loadPlaylists = async () => {
        try {
            const storedPlaylists = await AsyncStorage.getItem('musicFiles');
            if (storedPlaylists) {
                setMusicList(JSON.parse(storedPlaylists));
            }
        } catch (error) {
            console.error('Failed to load playlists', error);
        }
    };

    const loadSelectedSongs = async (id) => {
        try {
            const storedSelectedSongs = await AsyncStorage.getItem(`selectedSongs_${id}`);
            if (storedSelectedSongs) {
                setSelectedSong(JSON.parse(storedSelectedSongs));
            } else {
                setSelectedSong([]);
            }
        } catch (error) {
            console.error('Failed to load selected songs', error);
        }
    };

    const toggleModal = () => {
        setShowModal(!showModal);
        setShowTickIcon(false);
    };

    const handlePress = async (index) => {
        const selectedMusic = selectedSong[index];
        delete selectedMusic.check;
        const isAlreadyInHistory = musicHistoryFiles.some(
            (existingFile) => existingFile.path === selectedMusic.path
        );
        if (!isAlreadyInHistory) {
            const updatedHistory = [...musicHistoryFiles, selectedMusic];
            setMusicHistoryFiles(updatedHistory);
        }
        navigation.navigate('MusicPlayerScreen', { musicFiles: selectedSong, currentIndex: index });
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setShowTickIcon(false);
    };

    const handleAddMusic = async () => {
        const checkedSongs = musicList.filter(song => song.check);

        const storedSelectedSongs = await AsyncStorage.getItem(`selectedSongs_${playlistId}`);
        let existingSelectedSongs = [];
        if (storedSelectedSongs) {
            existingSelectedSongs = JSON.parse(storedSelectedSongs);
        }

        const updatedSelectedSongs = [...existingSelectedSongs, ...checkedSongs];

        const uniqueSelectedSongs = updatedSelectedSongs.filter((song, index, self) =>
            index === self.findIndex((s) => (
                s.path === song.path
            ))
        );

        setSelectedSong(uniqueSelectedSongs);
        setShowTickIcon(true);
        setShowModal(false);

        try {
            await AsyncStorage.setItem(`selectedSongs_${playlistId}`, JSON.stringify(uniqueSelectedSongs));
        } catch (error) {
            console.error('Failed to save selected songs', error);
        }
    };

    const toggleCheck = (index) => {
        const newList = [...musicList];
        newList[index].check = !newList[index].check;
        setMusicList(newList);
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity style={styles.item} onPress={() => handlePress(index)}>
            <Text style={styles.musicTitle2}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{playlistTitle}</Text>
                <TouchableOpacity onPress={toggleModal}>
                    {showTickIcon ? (
                        <Image
                            source={require('../assets/images/add_music.png')}
                            style={styles.icon}
                        />
                    ) : (
                        <Image
                            source={require('../assets/images/add_music.png')}
                            style={styles.icon}
                        />
                    )}
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={toggleModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.ModalTop}>
                        <Text style={[styles.title]}>Add music</Text>
                        <TouchableOpacity onPress={handleAddMusic} style={styles.tickButton}>
                            <Image
                                source={require('../assets/images/tick.png')}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={musicList}
                        keyExtractor={(item) => item.path}
                        renderItem={({ item, index }) => (
                            <View style={styles.musicItem}>
                                <Text style={styles.musicTitle}>{item.name}</Text>
                                <TouchableOpacity onPress={() => toggleCheck(index)}>
                                    <Image
                                        source={item.check ? require('../assets/images/fillcheckbox.png') : require('../assets/images/emptycheckbox.png')}
                                        style={styles.icon}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            </Modal>

            <FlatList
                data={selectedSong}
                renderItem={renderItem}
                keyExtractor={(item) => item.path}
            />
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
    icon: {
        width: 20,
        height: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 10,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginRight: 20,
    },
    closeButtonText: {
        fontSize: 18,
        color: 'blue',
    },
    tickButton: {
        marginRight: 10,
    },
    musicItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    musicTitle: {
        fontSize: 16,
        color: 'black',
        width: '90%',
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    musicTitle2: {
        fontSize: 18,
        paddingEnd: 10,
        flex: 1,
        color: 'black',
    },
    ModalTop: {
        justifyContent: "space-between",
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: "row",
        alignItems: "center"
    }
});
