"use client";
import React, { useEffect, useState } from "react";
import ReactCardFlip from "react-card-flip";

// Accepts either (isFlipped, handleClick) props [legacy] OR (flipped, setFlipped) from new page
function FlashcardItem({ flashcard, isFlipped, handleClick, flipped, setFlipped }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // Support both prop APIs
  const flippedState = flipped !== undefined ? flipped : isFlipped;
  const onFlip = setFlipped
    ? () => setFlipped(f => !f)
    : handleClick;

  return (
    <div className="flex justify-center">
      <ReactCardFlip isFlipped={flippedState} flipDirection="vertical">
        <div
          className="p-6 bg-primary text-white flex items-center shadow-lg justify-center rounded-2xl cursor-pointer h-[280px] w-[320px] md:h-[360px] md:w-[480px] text-center text-lg font-medium leading-relaxed select-none"
          onClick={onFlip}
        >
          <h2>{flashcard?.front}</h2>
        </div>

        <div
          className="p-6 bg-white text-gray-800 shadow-lg flex items-center justify-center rounded-2xl cursor-pointer h-[280px] w-[320px] md:h-[360px] md:w-[480px] text-center text-base leading-relaxed border border-primary/20 select-none"
          onClick={onFlip}
        >
          <h2>{flashcard?.back}</h2>
        </div>
      </ReactCardFlip>
    </div>
  );
}

export default FlashcardItem;
