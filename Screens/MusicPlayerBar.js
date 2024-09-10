import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import pauseImage from '../assets/images/pause.png';
import playImage from '../assets/images/play.png';
import stopImage from '../assets/images/stop_button.png';
import TrackPlayer, { State } from 'react-native-track-player';

const MusicPlayerBar = () => {
  const { currentTrack, playPause, setPlayPause } = useMusicPlayer();

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

  const handleStop = async () => {
    await TrackPlayer.reset();
  };

  return (
    currentTrack && (
      <View style={styles.musicPlayerBarContainer}>
        <View style={styles.details}>
          <Text style={styles.songTitle}>{currentTrack.title || "No song"}</Text>
          <Text style={styles.artist}>{currentTrack.artist || "Unknown Artist"}</Text>
        </View>
        <TouchableOpacity onPress={handlePause} style={styles.controlButton}>
          <Image source={playPause ? playImage : pauseImage} style={styles.controlIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleStop} style={styles.controlButton}>
          <Image source={stopImage} style={styles.controlIcon} />
        </TouchableOpacity>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  musicPlayerBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#ccc',
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

export default MusicPlayerBar;
