import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from "./NavBar";

function PodcastDetails({ onPlayEpisode }) {
  const { id } = useParams();
  const [podcast, setPodcast] = useState(null);
  const [error, setError] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [expandedSeason, setExpandedSeason] = useState(null);
  const [favoriteEpisodes, setFavoriteEpisodes] = useState([]);
  const [fullyListenedEpisodes, setFullyListenedEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPodcastDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://podcast-api.netlify.app/id/${id}`);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText} (status code: ${response.status})`);
        }
        const data = await response.json();
        setPodcast(data);

        const storedFavorites = JSON.parse(localStorage.getItem(`favorites-${id}`)) || [];
        setFavoriteEpisodes(storedFavorites);

        const storedFullyListened = JSON.parse(localStorage.getItem(`fullyListened-${id}`)) || [];
        setFullyListenedEpisodes(storedFullyListened);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPodcastDetails();
  }, [id]);

  const handleToggleFavoriteEpisode = (seasonIndex, episodeIndex) => {
    const existingFavorite = favoriteEpisodes.find(
      (fav) => fav.seasonIndex === seasonIndex && fav.episodeIndex === episodeIndex
    );

    let updatedFavorites;
    if (existingFavorite) {
      updatedFavorites = favoriteEpisodes.filter(
        (fav) => !(fav.seasonIndex === seasonIndex && fav.episodeIndex === episodeIndex)
      );
    } else {
      const episode = {
        seasonIndex,
        episodeIndex,
        podcastTitle: podcast.title,
        podcastId: id,
        addedAt: new Date().toLocaleString(),
      };
      updatedFavorites = [...favoriteEpisodes, episode];
    }

    setFavoriteEpisodes(updatedFavorites);
    localStorage.setItem(`favorites-${id}`, JSON.stringify(updatedFavorites));
  };

  const handleEpisodeEnd = (seasonIndex, episodeIndex) => {
    const episode = {
      seasonIndex,
      episodeIndex,
      podcastId: id,
    };

    if (!fullyListenedEpisodes.some(ep => ep.seasonIndex === seasonIndex && ep.episodeIndex === episodeIndex)) {
      const updatedFullyListened = [...fullyListenedEpisodes, episode];
      setFullyListenedEpisodes(updatedFullyListened);
      localStorage.setItem(`fullyListened-${id}`, JSON.stringify(updatedFullyListened));
    }
  };

  const handlePlayEpisode = (seasonIndex, episodeIndex) => {
    const episode = {
      seasonIndex,
      episodeIndex,
      podcastId: id,
      podcastTitle: podcast.title,
      title: `Season ${seasonIndex + 1} Episode ${episodeIndex + 1}`,
      audioSrc: "https://podcast-api.netlify.app/placeholder-audio.mp3",
    };
  
    const isFullyListened = fullyListenedEpisodes.some(
      (ep) => ep.seasonIndex === seasonIndex && ep.episodeIndex === episodeIndex
    );
  
    if (isFullyListened) {
      episode.savedPosition = 0; 
    } else {
      const savedPosition = localStorage.getItem(`playback-${id}-${seasonIndex}-${episodeIndex}`);
      if (savedPosition) {
        episode.savedPosition = parseFloat(savedPosition);
      }
    }
  
    onPlayEpisode(episode);
  
  
    setTimeout(() => handleEpisodeEnd(seasonIndex, episodeIndex), 3000);
  };

  const handleResetListenedHistory = () => {
    setFullyListenedEpisodes([]);
    localStorage.removeItem(`fullyListened-${id}`);
    podcast.seasons.forEach((season, seasonIndex) => {
      season.episodes.forEach((episode, episodeIndex) => {
        localStorage.removeItem(`playback-${id}-${seasonIndex}-${episodeIndex}`);
      });
    });
  };

  const truncateDescription = (description, wordLimit) => {
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
  };

  const handleToggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const handleToggleSeason = (index) => {
    setExpandedSeason(expandedSeason === index ? null : index);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!podcast) {
    return <div className="text-white p-4">Loading...</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto p-4 lg:p-8">
        
        {isLoading ? (
          <div className="text-white p-4  lg:text-10xl md:text-8xl sm:text-6xl animate-bounce">Loading...</div>
        ) : (
          <div>
             <div className='sticky top-0 z-5'>
          {/* <NavBar/> */}
          </div>
          <div>
            
          </div>
            <div className=" mt-5 flex items-center space-x-4 pt-4 bg-gradient-to-b from-sky-500 to-transparent rounded-t ">
              <img src={podcast.image} alt={podcast.title} className=" mx-5 w-40 h-1/4 lg:h40 object-cover shadow-lg  rounded" />
              <div className=' mx-5'>
                <h1 className="text-2xl lg:text-4xl font-bold text-white">
                  {podcast.title} 
                </h1>
                <h1 className="text-xl lg:text-2xl text-white">{podcast.seasons.length} Seasons</h1>
                <p className="text-white text-sm mt-2">
                  Last Updated: {podcast.updated ? formatDate(podcast.updated) : 'N/A'}
                </p>
              </div>
            </div>
            {/* <div className='bg-gradient-to-b from-sky-500 to-transparent'>
            <h1 className="pt-4 text-xl lg:text-2xl font-bold text-white  mx-5">About</h1>
            <p className="mt-4 text-white text-sm lg:text-base  mx-5">
              {isDescriptionExpanded
                ? podcast.description
                : truncateDescription(podcast.description, 100)}
              <span
                onClick={handleToggleDescription}
                className="text-white cursor-pointer ml-2"
              >
                {isDescriptionExpanded ? 'Show Less' : 'Show More'}
              </span>
            </p>
            </div> */}
            {fullyListenedEpisodes.length > 0 && (
  <button
    onClick={handleResetListenedHistory}
    className="mt-4 bg-gray-500 text-white p-2 rounded-full"
  >
    Reset Listened History
  </button>
)}
            <div className="mt-8">
              <div className='grid lg:grid-cols-2 gap-4'>
              <div className=''>
            <h1 className="pt-4 text-xl lg:text-2xl font-bold text-white  mx-5">About</h1>
            <p className="mt-4 text-white text-sm lg:text-base  mx-5">
              {isDescriptionExpanded
                ? podcast.description
                : truncateDescription(podcast.description, 100)}
              <span
                onClick={handleToggleDescription}
                className="text-white cursor-pointer ml-2"
              >
                {isDescriptionExpanded ? 'Show Less' : 'Show More'}
              </span>
            </p>
            </div> 
                <div>
              {podcast.seasons.map((season, seasonIndex) => (
                <div key={seasonIndex} className="mb-6">
                  <div className=' flex items-center space-x-4 pt-4 cursor-pointer' onClick={() => handleToggleSeason(seasonIndex)}>

                  <img src={season.image} alt={`Season ${seasonIndex + 1}`} className="w-40 h-1/4 lg:h40 object-cover mt-4 mb-4 shadow-lg rounded" />
                 <div>
                  <h2
                    className="text-xl font-semibold  text-xl lg:text-2xl text-white"
                    
                  >
                    Season {seasonIndex + 1} 
                  </h2>
                  <p className='text-white text-sm mt-2'>{season.episodes.length} Episodes</p>
                  </div>
                  </div>
                  {expandedSeason === seasonIndex && (
                    <div>
                      <ul className="mt-4 space-y-4">
                        {season.episodes.map((episode, episodeIndex) => {
                          const isFavorite = favoriteEpisodes.some(
                            (fav) => fav.seasonIndex === seasonIndex && fav.episodeIndex === episodeIndex
                          );
                          const isListened = fullyListenedEpisodes.some(
                            (ep) => ep.seasonIndex === seasonIndex && ep.episodeIndex === episodeIndex
                          );

                          return (
                            <li key={episodeIndex} className="bg-gray-800 p-4 rounded shadow">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg text-white">
                                    Episode {episodeIndex + 1}: {episode.title}
                                   </h3>
                                     </div>
                                      <div className="flex items-center">
                                        <button
                                    onClick={() => handleToggleFavoriteEpisode(seasonIndex, episodeIndex)}
                                    className={`min-w-[100px] text-white ml-2 p-2 rounded-full ${isFavorite ? 'bg-gray-500' : 'bg-gray-400'}`}
                                      >
                                    {isFavorite ? 'Unfavorite' : 'Favorite'}
                                  </button>
                                  <button
                                    onClick={() => handlePlayEpisode(seasonIndex, episodeIndex)}
                                    className="min-w-[100px] ml-2 p-2 bg-gray-500 text-white rounded-full"
                                  >
                                    {isListened ? 'Re-listen' : 'Play'}
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
             
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PodcastDetails;
