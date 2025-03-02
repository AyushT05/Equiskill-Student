"use client";
import React, { useEffect, useState } from "react";
import ReactCardFlip from "react-card-flip";

function FlashcardItem({ isFlipped, handleClick,flashcard }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent SSR mismatch

  return (
    <div >
      <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
        <div
          className="p-4 bg-primary text-white flex items-center shadow-lg justify-center rounded-lg cursor-pointer h-[250px] w-[200px] md:h-[350px] md:w-[250px]"
          onClick={handleClick}
        >
          <h2>{flashcard?.front}</h2>
        </div>

        <div
          className="p-4 bg-white shadow-lg text-primary flex items-center justify-center rounded-lg cursor-pointer h-[250px] w-[200px] md:h-[350px] md:w-[250px]"
          onClick={handleClick}
        >
          <h2>{flashcard?.back}</h2>
        </div>
      </ReactCardFlip>
    </div>
  );
}

export default FlashcardItem;
