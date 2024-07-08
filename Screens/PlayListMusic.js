import React, { useState, useEffect } from 'react';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, FlatList } from 'react-native';

export default function PlayListMusic({ route, navigation }) {
    const { playlists, index } = route.params;
    const [showModal, setShowModal] = useState(false);
    const [musicList, setMusicList] = useState([]);
    const [selectedSong, setSelectedSong] = useState([]);
    const [showTickIcon, setShowTickIcon] = useState(false);
    const [musicHistoryFiles, setMusicHistoryFiles] = useState([]);

    const path = RNFS.ExternalStorageDirectoryPath;

    useEffect(() => {
        loadPlaylists();
    }, []);

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

    const toggleModal = () => {
        setShowModal(!showModal);
        setShowTickIcon(false);
    };

    const handlePress = async (index) => {
        const selectedMusic = selectedSong[index];
        const isAlreadyInHistory = musicHistoryFiles.some(
            (existingFile) => existingFile.path === selectedMusic.path
        );
        if (!isAlreadyInHistory) {
            const updatedHistory = [...musicHistoryFiles, selectedMusic];
            setMusicHistoryFiles(updatedHistory);
        }
        await AsyncStorage.setItem("historyData", JSON.stringify(selectedMusic));
        console.log("musicFiles123245>>>"+JSON.stringify(selectedMusic));
        console.log("index>>>"+index);
        navigation.navigate('MusicPlayerScreen', { musicFiles: selectedMusic, currentIndex: index });
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setShowTickIcon(false);
    };

    const handleAddMusic = () => {
        const checkedSongs = musicList.filter(song => song.check);
        setSelectedSong(checkedSongs);
        setShowTickIcon(true);
        setShowModal(false);
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
                <Text style={styles.title}>Add new Song</Text>
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
                    <FlatList
                        data={musicList}
                        keyExtractor={(item, index) => item.id + index}
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
                    <TouchableOpacity onPress={handleAddMusic} style={styles.tickButton}>
                        <Image
                            source={require('../assets/images/tick.png')}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                </View>
            </Modal>

            <FlatList
                data={selectedSong}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.path}-${index}`}
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
        margin: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 50,
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
        alignSelf: 'flex-end',
        marginRight: 20,
        marginBottom: 20,
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
        color: 'black'
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    musicTitle2: {
        fontSize: 18,
        paddingEnd: 10,
        flex: 1,
        color: 'black'
    },
});
