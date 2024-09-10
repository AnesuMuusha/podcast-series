import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import PodcastDetails from './components/PodcastDetails';
import GlobalAudioPlayer from './components/GlobalAudioPlayer';
import Favorite from './components/Favorite';

function App() {
  const [playingEpisode, setPlayingEpisode] = useState(null);

  const handlePlayEpisode = (episode) => {
    setPlayingEpisode(episode);
  };

  const handlePlayPause = (isPlaying) => {
    if (!isPlaying) {
      setPlayingEpisode(null);
    }
  };

  const handleTimeUpdate = (event) => {
    const currentTime = event.target.currentTime;
    localStorage.setItem(`podcast-${playingEpisode.podcastId}-episode-${playingEpisode.episodeIndex}`, currentTime);
  };

  const handleLoadedMetadata = (event) => {
    const savedTime = localStorage.getItem(`podcast-${playingEpisode.podcastId}-episode-${playingEpisode.episodeIndex}`);
    if (savedTime) {
      event.target.currentTime = savedTime;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/podcast/:id" element={<PodcastDetails onPlayEpisode={handlePlayEpisode} />} />
        
        <Route path="/favorite" element={<Favorite />} />  
      </Routes>
     <GlobalAudioPlayer
        playingEpisode={playingEpisode}
        onPlayPause={handlePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </Router>
  );
}

export default App;
