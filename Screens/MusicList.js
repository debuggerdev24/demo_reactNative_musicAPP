import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundFetch from 'react-native-background-fetch';
const MusicList = () => {
  const [musicFiles, setMusicFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Register the background fetch task
    BackgroundFetch.configure({
      minimumFetchInterval: 0.1, // Fetch every 15 minutes
    }, async (taskId) => {
      // Fetch music files in background
      await fetchMusicFiles();
      BackgroundFetch.finish(taskId);
    }, (taskId) => {
      BackgroundFetch.finish(taskId);
    });
    // Load cached music files
    loadCachedMusicFiles();
  }, []);
  const loadCachedMusicFiles = async () => {
    try {
      const cachedFiles = await AsyncStorage.getItem('musicFiles');
      if (cachedFiles) {
        setMusicFiles(JSON.parse(cachedFiles));
        setLoading(false);
      } else {
        await fetchMusicFiles();
      }
    } catch (error) {
      console.error(error);
      await fetchMusicFiles();
    }
  };
  const fetchMusicFiles = async () => {
    setLoading(true);
    try {
      const files = await getFiles(RNFS.ExternalStorageDirectoryPath,10);
      setMusicFiles(files);
      await AsyncStorage.setItem('musicFiles', JSON.stringify(files));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const getFiles = async (dir, depth, currentDepth = 0) => {
    if (currentDepth > depth) {
      return [];
    }
    let results = [];
    const items = await RNFS.readDir(dir);
    for (const item of items) {
      if (item.isDirectory()) {
        const files = await getFiles(item.path, depth, currentDepth + 1);
        results = results.concat(files);
      } else if (isMusicFile(item.path)) {
        results.push(item);
      }
    }
    return results;
  };
  const isMusicFile = (path) => {
    const musicExtensions = ['.mp3', '.wav', '.aac', '.flac', '.m4a'];
    return musicExtensions.some((ext) => path.endsWith(ext));
  };
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  return (
    <View>
      <FlatList
        data={musicFiles}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            {/* <Text>{item.path}</Text> */}
          </View>
        )}
      />
    </View>
  );
};
export default MusicList;