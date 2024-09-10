import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const History = () => {
    const [historyData, setHistoryData] = useState([]);
    const navigation = useNavigation();
    const [showPopup, setShowPopup] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);

    const getData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("historyData");
            if (jsonValue !== null) {
                const parsedData = JSON.parse(jsonValue);
                setHistoryData(parsedData);
            }
        } catch (e) {
            console.error('Error getting history data:', e);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getData();
        });
        return unsubscribe;
    }, [navigation]);

    const handlePress = (index) => {
        console.log("Pressed item at index:", index);
        navigation.navigate('MusicPlayerScreen', { musicFiles:historyData.reverse(), currentIndex: index });
    };

    const handleRemove = async () => {
        const updatedData = historyData.reverse().filter((_, index) => index !== selectedIndex);
        setHistoryData(updatedData);
        await AsyncStorage.setItem("historyData", JSON.stringify(updatedData));
        setShowPopup(false)
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity style={styles.item} onPress={() => handlePress(index)}>
            <Text style={styles.title}>{item.name}</Text>
            <TouchableOpacity onPress={() => { setSelectedIndex(index); setShowPopup(true); }}>
                <Image style={styles.image} source={require("../assets/images/more.png")} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList 
                data={historyData.slice().reverse()}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.path}-${index}`}
                ListEmptyComponent={<Text>No History Data</Text>}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={showPopup}
                onRequestClose={() => {
                    setShowPopup(false);
                }}
            >
                <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={() => { setShowPopup(false); }}>
                    <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
                        <TouchableOpacity style={styles.modalContent} onPress={() => handleRemove()}>
                            <Text style={styles.modalText}>Remove from History</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
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

export default History;