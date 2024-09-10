import React, { createContext, useState, useContext } from 'react';

const MusicPlayerContext = createContext();

export const MusicPlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playPause, setPlayPause] = useState(false);

  return (
    <MusicPlayerContext.Provider value={{ currentTrack, setCurrentTrack, playPause, setPlayPause }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => useContext(MusicPlayerContext);