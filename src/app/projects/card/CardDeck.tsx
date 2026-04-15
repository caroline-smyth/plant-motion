"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../../../components/Card";

type CardData = {
  id: number;
  image?: string;
  painter: string;
  title: string;
  year: number;
  medium?: string;
  notes?: string;
};

export default function CardDeck({ cards }: { cards: CardData[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => setCurrentIndex(i => Math.min(i + 1, cards.length - 1));
  const goPrev = () => setCurrentIndex(i => Math.max(i - 1, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.key === "Enter" || e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <p className="font-garamond text-neutral-400">{currentIndex + 1}/{cards.length}</p>
      <div className="relative">
        <Card key={currentIndex} {...cards[currentIndex]} onComplete={goNext} />

        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute top-36 -translate-y-1/2 -left-10 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {currentIndex < cards.length - 1 && (
          <button
            onClick={goNext}
            className="absolute top-36 -translate-y-1/2 -right-10 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
