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
  const [showMore, setShowMore] = useState({});
  const [showMoreAll, setShowMoreAll] = useState(false);


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
  const toggleShowMore = (genre) => {
    setShowMore((prev) => ({ ...prev, [genre]: !prev[genre] }));
  };

  const MAX_PODCASTS = 6;

  
  const groupPodcastsByGenre = (podcasts) => {
    return podcasts.reduce((acc, podcast) => {
      podcast.genres.forEach((genre) => {
        const genreName = getGenreNameById(genre);
        if (!acc[genreName]) {
          acc[genreName] = [];
        }
        acc[genreName].push(podcast);
      });
      return acc;
    }, {});
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
    slidesToShow: 6, 
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024, 
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
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

  // Create grouped podcasts
  const groupedPodcasts = groupPodcastsByGenre(filteredPodcasts);

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="bg-black min-h-screen container mx-auto p-4 mb-10">
      <div className="sticky top-0 z-50">
        <NavBar onSelectGenre={setSelectedGenre} setSearchQuery={setSearchQuery} />
      </div>

      {isLoading ? (
       <div className="flex items-center justify-center text-white p-4 lg:text-20xl md:text-8xl sm:text-6xl animate-bounce min-h-screen">
       Loading...
     </div>   ) : (
        <>
          <div className="">
          <div className="relative z-10">
  <div className="text-white p-4 lg:text-10xl md:text-8xl sm:text-6xl font-bold bg-gradient-to-b from-green-600 to-green-800 rounded-t-lg">
    Podcasts
  </div>
  {podcasts.length > 0 && (
    <Slider {...settings}>
      {getRandomPodcasts(podcasts, 6).map((podcast) => (
        <div key={podcast.id} className="p-2 bg-gradient-to-b from-green-900 to-black">
          <div className="bg-gray-900 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link to={`/podcast/${podcast.id}`}>
              <img src={podcast.image} alt={podcast.title} className="w-full h-48 object-cover" />
              <div className="p-2 flex flex-col justify-between">
                <h2 className="text-lg text-white truncate">{podcast.title}</h2>
                <h3 className="text-md text-gray-400 truncate">
                  {podcast.genres.map((genreId) => getGenreNameById(genreId)).join(', ')}
                </h3>
              </div>
            </Link>
          </div>
        </div>
      ))}
    </Slider>
  )}
</div>

             <div className="">
            <h1 className="text-white text-3xl font-bold my-4 pt-4">Podcasts by Genre</h1>

            {Object.keys(groupedPodcasts).map((genre) => (
              <div key={genre} className="mb-8">
                <h2 className="text-white text-2xl font-semibold mb-4">{genre}</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {(showMore[genre]
                    ? groupedPodcasts[genre]
                    : groupedPodcasts[genre].slice(0, MAX_PODCASTS)
                  ).map((podcast) => (
                    <div key={podcast.id} className="bg-gray-900 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <Link to={`/podcast/${podcast.id}`}>
                        <img src={podcast.image} alt={podcast.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <h3 className="text-lg text-white">{podcast.title}</h3>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {groupedPodcasts[genre].length > MAX_PODCASTS && (
                  <button
                    onClick={() => toggleShowMore(genre)}
                    className="mt-4 text-white bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                  >
                    {showMore[genre] ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            ))}
          </div>

            <div className="mb-4 flex items-center justify-between flex-col lg:flex-row lg:space-x-4 space-y-2 lg:space-y-0">
              <h1 className="text-2xl font-bold mt-8 mb-4 text-white">Podcasts (ALL):</h1>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-gray-900 text-white py-2 px-4 rounded-full w-full sm:w-64 hover:bg-gray-800"
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
                className="bg-gray-900 text-white py-2 px-4 rounded-full w-full sm:w-64 hover:bg-gray-800"
                placeholder="Search for podcasts..."
              />
            </div>

            <div className='text-2xl font-bold mt-8 mb-4 text-white mb-30'>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-2">
  {(showMoreAll ? filteredPodcasts : filteredPodcasts.slice(0, MAX_PODCASTS)).map((podcast) => (
    <div key={podcast.id} className="bg-gray-900 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/podcast/${podcast.id}`}>
        <img src={podcast.image} alt={podcast.title} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h2 className="text-lg text-white">{podcast.title}</h2>
          <h3 className="text-md text-gray-400">
            {podcast.genres.map((genreId) => getGenreNameById(genreId)).join(', ')}
          </h3>
        </div>
      </Link>
    </div>
  ))}
</div>

{filteredPodcasts.length > MAX_PODCASTS && (
  <button
    onClick={() => setShowMoreAll((prev) => !prev)}
    className=" text-white bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
  >
    {showMoreAll ? 'Show Less' : 'Show More'}
  </button>
)}
          </div>
        </>
      )}
      <div className='text-2xl font-bold mt-8 mb-4 text-white mb-30'>
        
      </div>
      
    </div>
  );
}

export default Podcasts;
