import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import Fuse from 'fuse.js';
import NavBar from './NavBar';

function Podcasts() {
  const [podcasts, setPodcasts] = useState([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortOption, setSortOption] = useState('title-asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const genres = [
    { id: 1, name: 'Personal Growth' },
    { id: 2, name: 'Investigative Journalism' },
    { id: 3, name: 'History' },
    { id: 4, name: 'Comedy' },
    { id: 5, name: 'Entertainment' },
    { id: 6, name: 'Business' },
    { id: 7, name: 'Fiction' },
    { id: 8, name: 'News' },
    { id: 9, name: 'Kids and Family' },
  ];

  const getGenreNameById = (id) => {
    const genre = genres.find((genre) => genre.id === id);
    return genre ? genre.name : 'Unknown Genre';
  };

  const fetchPodcasts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://podcast-api.netlify.app/shows');
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText} (status code: ${response.status})`);
      }
      const data = await response.json();
      setPodcasts(data);
      setFilteredPodcasts(data);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  useEffect(() => {
    let sortedPodcasts = [...podcasts];

    switch (sortOption) {
      case 'title-asc':
        sortedPodcasts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sortedPodcasts.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'updated-recent':
        sortedPodcasts.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        break;
      case 'updated-oldest':
        sortedPodcasts.sort((a, b) => new Date(a.updated) - new Date(b.updated));
        break;
      default:
        break;
    }

    if (selectedGenre) {
      sortedPodcasts = sortedPodcasts.filter((podcast) => podcast.genres.includes(selectedGenre));
    }

    if (searchQuery) {
      const fuse = new Fuse(sortedPodcasts, {
        keys: ['title', 'description'],
        includeScore: true,
        threshold: 0.4,
      });
      const results = fuse.search(searchQuery);
      setFilteredPodcasts(results.map((result) => result.item));
    } else {
      setFilteredPodcasts(sortedPodcasts);
    }
  }, [sortOption, selectedGenre, podcasts, searchQuery]);

  const getRandomPodcasts = (podcasts, count) => {
    const shuffled = podcasts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-800 min-h-screen">
      <NavBar onSelectGenre={setSelectedGenre} setSearchQuery={setSearchQuery} />
      {isLoading ? (
        <div className="text-orange-400 p-4  lg:text-10xl md:text-8xl sm:text-6xl animate-pulse">Loading...</div>
      ) : (
        <>
          <div className="container mx-auto p-4">
            {podcasts.length > 0 && (
              <Slider {...settings}>
                {getRandomPodcasts(podcasts, 6).map((podcast) => (
                  <div key={podcast.id} className="p-2">
                    <div className="bg-gray-700 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <Link to={`/podcast/${podcast.id}`}>
                        <img src={podcast.image} alt={podcast.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <h2 className="text-lg text-orange-400">{podcast.title}</h2>
                          <h3 className="text-md text-orange-300">
                            {podcast.genres.map((genreId) => getGenreNameById(genreId)).join(', ')}
                          </h3>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </Slider>
            )}

            <h1 className="text-2xl font-bold mt-8 mb-4 text-orange-400">Podcasts:</h1>
            <div className="mb-4 flex flex-col space-y-2">
  <select
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
    className="bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-500"
  >
    <option value="title-asc">Sort by Title A-Z</option>
    <option value="title-desc">Sort by Title Z-A</option>
    <option value="updated-recent">Sort by Most Recently Updated</option>
    <option value="updated-oldest">Sort by Oldest Updated</option>
  </select>
  
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-500"
    placeholder="Search for podcasts..."
  />
</div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {filteredPodcasts.map((podcast) => (
                <div key={podcast.id} className="bg-gray-700 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <Link to={`/podcast/${podcast.id}`}>
                    <img src={podcast.image} alt={podcast.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h2 className="text-lg text-orange-400">{podcast.title}</h2>
                      <h3 className="text-md text-orange-300">
                        {podcast.genres.map((genreId) => getGenreNameById(genreId)).join(', ')}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Podcasts;
