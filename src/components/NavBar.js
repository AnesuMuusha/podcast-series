import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function NavBar({ onSelectGenre, setSearchQuery }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleGenreChange = (event) => {
    onSelectGenre(parseInt(event.target.value, 10));
  };

  return (
    <nav className="bg-gray-800 text-white p-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
         
          <select
            onChange={handleGenreChange}
            className="bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-500 sm:w-64"
          >
            <option value="">Select Genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="sm:hidden focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
            ></path>
          </svg>
        </button>
        <div className="hidden sm:flex space-x-4">
          <Link to="/" className="bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-500">
            Home 🏠
          </Link>

          <Link to="/favorite" className="bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-500">
            Favorites ⭐
          </Link>
        </div>
      </div>
      {isMenuOpen && (
        <div className="flex flex-col mt-4 sm:hidden">
          <Link to="/" className="bg-gray-600 text-white mb-2 py-2 px-4 rounded-full hover:bg-gray-500">
            Home 🏠
          </Link>
          <Link to="/favorite" className="bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-500">
            Favorites ⭐
          </Link>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
