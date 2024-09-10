import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, AppState } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, { Capability, useProgress, State } from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import pauseImage from '../assets/images/pause.png';
import playImage from '../assets/images/play.png';
import nextImage from '../assets/images/next.png';
import previousImage from '../assets/images/previous.png';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MusicPlayerScreen = ({ route }) => {
  const navigation = useNavigation();
  const { musicFiles, currentIndex } = route.params || {};
  const { position, duration } = useProgress();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(currentIndex);
  const [appState, setAppState] = useState(AppState.currentState);
  const [playPause, setPlayPause] = useState(false);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    updateHistory();
  }, []);

  useEffect(() => {
    updateHistory();
  }, [currentTrackIndex]);

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
    
    const setupPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          stopWithApp: false,
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
          ],
        });

        if (musicFiles && musicFiles?.length > 0) {
          loadTrack(currentTrackIndex);
        }
      } catch (error) {
        console.error('Error setting up player:', error);
      }
    };

    setupPlayer();

    // return () => {
    //   // TrackPlayer.destroy();
    // };
  }, []);

  useEffect(() => {
    loadTrack(currentTrackIndex);
  }, [currentTrackIndex]);

  const loadTrack = async (index) => {
    if (!musicFiles || index < 0 || index >= musicFiles?.length) {
      console.error('Invalid track index or music files');
      return;
    }

    try {
      const track = musicFiles[index];
      if (!track) {
        console.error(`Track at index ${index} is null`);
        return;
      }

      const trackId = track?.id || `track-${index}-${new Date().getTime()}`;

      if (!track.name) {
        console.error(`Track at index ${index} is name: ${JSON.stringify(track)}`);
        return;
      }

      if (!track.path) {
        console.error(`Track at index ${index} is missing path: ${JSON.stringify(track)}`);
        return;
      }

      const lastIndex = await AsyncStorage.getItem('lastTrack');

      if (lastIndex !== null && lastIndex === index.toString()) {
        console.log('Track is already playing');
        return;
      }
      
      console.log("Loading track at index:", index);

      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: trackId,
        url: `file://${track.path}`,
        title: track.name,
        artist: 'unknown',
      });
      await TrackPlayer.play();

      await AsyncStorage.setItem('lastTrack', index.toString());
    } catch (error) {
      console.error('Failed to play the track:', error);
    }
  };

  const updateHistory = async () => {
    try {
      const historyMusic = musicFiles[currentTrackIndex];
      const jsonValue = await AsyncStorage.getItem('historyData');
      let historyData = jsonValue !== null ? JSON.parse(jsonValue) : [];
      historyData.push(historyMusic);
      const uniqueHistory = Array.from(new Set(historyData.map((item) => item.path))).map((path) =>
        historyData.find((item) => item.path === path)
      );
      console.log("updateHistory>>>>",historyMusic);
      
      await AsyncStorage.setItem('historyData', JSON.stringify(uniqueHistory));
    } catch (e) {
      console.error('Error updating history data:', e);
    }
  };

  const handlePlayPause = async () => {
    const currentState = await TrackPlayer.getState();
    if (currentState === State.Playing) {
      setPlayPause(true);
      await TrackPlayer.pause();
    } else {
      setPlayPause(false);
      await TrackPlayer.play();
    }
  };

  const handleNext = async () => {
    if (currentTrackIndex < musicFiles.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handlePrev = async () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleSliderValueChange = async (value) => {
    await TrackPlayer.seekTo(value);
  };

  const handleTrackEnd = async () => {
    if (currentTrackIndex < musicFiles.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  if (!musicFiles || musicFiles.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', marginBottom: '40%' }}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {musicFiles[currentTrackIndex].name}
        </Text>
      </View>
      <Image style={styles.albumCover} source={require('../assets/images/music-note.png')} />

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{new Date(position * 1000).toISOString().substr(14, 5)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onValueChange={handleSliderValueChange}
          minimumTrackTintColor="#FF007F"
          maximumTrackTintColor="#000000"
          thumbTintColor="#FF007F"
        />
        <Text style={styles.timeText}>{new Date(duration * 1000).toISOString().substr(14, 5)}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <Text style={[styles.title, { marginTop: 50 }]} numberOfLines={2}>
          {musicFiles[currentTrackIndex].name}
        </Text>
      </View>
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handlePrev} style={styles.controlButton} disabled={currentTrackIndex === 0}>
          <Image source={previousImage} style={styles.controlImage} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause} style={styles.playPauseButton}>
          <Image source={playPause ? playImage : pauseImage} style={styles.playPauseImage} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.controlButton} disabled={currentTrackIndex === musicFiles.length - 1}>
          <Image source={nextImage} style={styles.controlImage} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FF007F',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  albumCover: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  slider: {
    width: '80%',
    height: 25,
    alignContent: 'center',
    justifyContent: 'center'
  },
  timeContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginTop: '20%'
  },
  controlButton: {
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    padding: 15,
    borderRadius: 30,

    justifyContent: 'center',
    alignItems: 'center',
  },
  controlImage: {
    width: 24,
    height: 24,
  },
  playPauseImage: {
    width: 36,
    height: 36,
  },
});

export default MusicPlayerScreen;
