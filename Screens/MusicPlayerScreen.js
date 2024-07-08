import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import SoundPlayer from 'react-native-sound-player';
import { useNavigation } from '@react-navigation/native';
import pauseImage from '../assets/images/pause.png';
import playImage from '../assets/images/play.png';
import nextImage from '../assets/images/next.png';
import previousImage from '../assets/images/previous.png';

const MusicPlayerScreen = ({ route }) => {
  const navigation = useNavigation();
  const {musicFiles, currentIndex } = route.params || {};
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(currentIndex);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    console.log('musicFiles:', JSON.stringify(musicFiles));
    console.log('currentIndex:', currentIndex);
    if (!musicFiles || !Array.isArray(musicFiles) || musicFiles.length === 0) {
      console.error('musicFiles is not defined or empty');
      return;
    }
    if (currentTrackIndex < 0 || currentTrackIndex >= musicFiles.length) {
      console.error('currentTrackIndex is out of bounds');
      return;
    }
    playSound(musicFiles[currentTrackIndex].path);

    const interval = setInterval(updateCurrentTime, 1000);

    return () => {
      SoundPlayer.stop();
      clearInterval(interval);
    };
  }, [currentTrackIndex, musicFiles]);

  useEffect(() => {
    if (!musicFiles || !musicFiles[currentTrackIndex]) {
      console.error('musicFiles or currentTrackIndex is undefined or out of bounds');
      return;
    }

    const interval = setInterval(updateCurrentTime, 1000);

    return () => {
      SoundPlayer.stop();
      clearInterval(interval);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (Math.floor(currentTime) === Math.floor(duration)) {
      if (duration) {
        handleNext();
      }
    }
  }, [currentTime]);

  const playSound = async (path) => {
    try {
      await SoundPlayer.playUrl(`file://${path}`);
      setIsPlaying(true);
      const info = await SoundPlayer.getInfo();
      setDuration(info.duration);
    } catch (error) {
      console.error('Failed to play the sound:', error.message);
    }
  };

  const updateCurrentTime = async () => {
    try {
      const info = await SoundPlayer.getInfo();
      setCurrentTime(info.currentTime);
    } catch (error) {
      console.error('Failed to get info:', error.message);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      SoundPlayer.pause();
      setIsPlaying(false);
    } else {
      SoundPlayer.resume();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < musicFiles.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleSliderValueChange = (value) => {
    SoundPlayer.seek(value);
    setCurrentTime(value);
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
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {/* {musicFiles[currentTrackIndex].name} */}
        </Text>
      </View>
      <Image style={styles.albumCover} source={require('../assets/images/music-note.png')} />

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={currentTime}
          onValueChange={handleSliderValueChange}
          minimumTrackTintColor="#FF007F"
          maximumTrackTintColor="#000000"
          thumbTintColor="#FF007F" />
        <Text style={styles.timeText}>{new Date(duration * 1000).toISOString().substr(14, 5)}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        {/* <Text style={[styles.title, { marginTop: 50 }]} numberOfLines={2}>{musicFiles[currentTrackIndex].name}</Text> */}
      </View>
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handlePrev} style={styles.controlButton} disabled={currentTrackIndex === 0}>
          <Image source={previousImage} style={styles.controlImage} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause} style={styles.playPauseButton}>
          <Image source={isPlaying ? pauseImage : playImage} style={styles.playPauseImage} />
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
