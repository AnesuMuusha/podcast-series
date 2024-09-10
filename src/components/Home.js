import React from "react";
import Podcasts from "./Podcasts";

function Home() {
  return (
    <div className="px-8 bg-gradient-to-b from-gray-700 to-gray-900 min-h-screen">
      <div className="flex flex-col items-center space-y-2 pt-2">
        <h1 className="lg:text-3xl font-bold mb-4 text-orange-400 leading-tight text-center sm:text-xl">The 8 PM Podcast</h1>
      </div>
      <Podcasts/>
    </div>
  );
}

export default Home;
