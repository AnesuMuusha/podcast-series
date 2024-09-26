import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import NavBar from './NavBar';

function Favorite() {
  const [favoriteEpisodes, setFavoriteEpisodes] = useState([]);
  const [sortOption, setSortOption] = useState('title-asc');
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({}); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const storedFavorites = [];
    for (const key in localStorage) {
      if (key.startsWith('favorites-')) {
        const podcastId = key.split('-')[1];
        const favorites = JSON.parse(localStorage.getItem(key)) || [];

        const response = await fetch(`https://podcast-api.netlify.app/id/${podcastId}`);
        const data = await response.json();

        favorites.forEach((favorite) => {
          const season = data.seasons ? data.seasons[favorite.seasonIndex] : null;
          const episode = season ? season.episodes[favorite.episodeIndex] : null;

          if (episode) {
            const addedAt = favorite.addedAt || new Date().toISOString(); // Set current date if missing

            // Update localStorage to ensure consistency
            favorite.addedAt = addedAt;
            localStorage.setItem(key, JSON.stringify(favorites));

            storedFavorites.push({
              ...episode,
              podcastTitle: data.title,
              podcastId,
              seasonIndex: favorite.seasonIndex,
              episodeIndex: favorite.episodeIndex,
              addedAt,
              updated: data.updated || episode.updated,
            });
          } else {
            console.error(`Episode not found for podcastId: ${podcastId}, seasonIndex: ${favorite.seasonIndex}, episodeIndex: ${favorite.episodeIndex}`);
          }
        });
      }
    }

    setFavoriteEpisodes(storedFavorites);
    setLoading(false);
  };

  const sortFavorites = useCallback(() => {
    if (!favoriteEpisodes.length) return;

    const sortedFavorites = [...favoriteEpisodes];
    switch (sortOption) {
      case 'title-asc':
        sortedFavorites.sort((a, b) => a.podcastTitle.localeCompare(b.podcastTitle));
        break;
      case 'title-desc':
        sortedFavorites.sort((a, b) => b.podcastTitle.localeCompare(a.podcastTitle));
        break;
      case 'updated-recent':
        sortedFavorites.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        break;
      case 'updated-oldest':
        sortedFavorites.sort((a, b) => new Date(a.updated) - new Date(b.updated));
        break;
      default:
        break;
    }

    setFavoriteEpisodes(sortedFavorites);
  }, [favoriteEpisodes, sortOption]);

  useEffect(() => {
    sortFavorites();
  }, [sortOption, sortFavorites]);

  const removeFavorite = async (podcastId, seasonIndex, episodeIndex) => {
    const key = `favorites-${podcastId}`;
    const storedFavorites = JSON.parse(localStorage.getItem(key)) || [];
  
    // Track which item is being removed
    setRemoving((prev) => ({
      ...prev,
      [`${podcastId}-${seasonIndex}-${episodeIndex}`]: true,
    }));
  
    const updatedFavorites = storedFavorites.filter(
      (fav) => fav.seasonIndex !== seasonIndex || fav.episodeIndex !== episodeIndex
    );
  
    // Update the favoriteEpisodes state immediately
    setFavoriteEpisodes((prevFavorites) =>
      prevFavorites.filter(
        (fav) =>
          fav.podcastId !== podcastId ||
          fav.seasonIndex !== seasonIndex ||
          fav.episodeIndex !== episodeIndex
      )
    );
  
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
  
    if (updatedFavorites.length > 0) {
      localStorage.setItem(key, JSON.stringify(updatedFavorites));
    } else {
      localStorage.removeItem(key);
    }
  
    // Refetch favorites to ensure the latest data is displayed
    fetchFavorites();
    };

  const handleGoToPodcast = (podcastId) => {
    setLoading(true);
    navigate(`/podcast/${podcastId}`);
  };

  return (
    <div className="bg-gray-900 min-h-screen px-10px sm:text-2xl">
      
      <div className="container mx-auto">
      <div className='sticky top-0 z-5'>
      {/* <NavBar/> */}
      </div>
     <div className='p-4'>
      <div className='mt-5 flex items-center space-x-4 pt-4 bg-gradient-to-b from-sky-500 to-transparent rounded-t '>

      <h1 className="text-2xl lg:text-4xl mb-4 text-white py-2 px-4 ">Favorite Episodes</h1>

      </div>
       
       {loading ? (
        <div className="flex items-center justify-center text-white p-4 lg:text-20xl md:text-8xl sm:text-6xl animate-bounce">
        Loading...
      </div>
) : (
         <>
           <div className="mb-4 flex space-x-2">
             <select
               value={sortOption}
               onChange={(e) => setSortOption(e.target.value)}
               className="bg-gray-800 text-white py-2 px-4 rounded-full hover:bg-gray-700"
             >
               <option value="title-asc">Sort by Title A-Z</option>
               <option value="title-desc">Sort by Title Z-A</option>
               <option value="updated-recent">Sort by Most Recently Updated</option>
               <option value="updated-oldest">Sort by Oldest Updated</option>
             </select>
           </div>

           <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10 ">
             {favoriteEpisodes.length > 0 ? (
               favoriteEpisodes.map((favorite, index) => (
                 <li key={index} className="bg-gray-800 p-4 rounded shadow">
                   <div className="flex justify-between">
                     <div>
                       <h3 className="text-lg text-white">{favorite.podcastTitle}</h3>
                       <p className="text-white">
                         Season {favorite.seasonIndex + 1}, Episode {favorite.episodeIndex + 1}
                       </p>
                       <p className="text-gray-400 text-sm">
                         Added on: {new Date().toLocaleDateString()}
                 </p>
                       <p className="text-gray-400 text-sm">
                         Last Updated: {new Date(favorite.updated).toLocaleDateString()}
                       </p>
                     </div>
                     <div className="flex items-center space-x-4">
                       <button
                         onClick={() => handleGoToPodcast(favorite.podcastId)}
                         className="text-white hover:text-gray-300"
                       >
                         Go to Podcast
                       </button>
                       <button
                         onClick={() => removeFavorite(favorite.podcastId, favorite.seasonIndex, favorite.episodeIndex)}
                         className="text-white hover:text-gray-300"
                         disabled={removing[`${favorite.podcastId}-${favorite.seasonIndex}-${favorite.episodeIndex}`]}
                       >
                         {removing[`${favorite.podcastId}-${favorite.seasonIndex}-${favorite.episodeIndex}`] ? 'Removing...' : 'Remove'}
                       </button>
                     </div>
                   </div>
                 </li>
               ))
             ) : (
               <div className="text-white">No favorites found.</div>
             )}
           </ul>
         </>
       )}

      </div> 
       
       
             </div>
    </div>
  );
}

export default Favorite;
