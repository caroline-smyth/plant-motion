"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function isMatch(input: string, answer: string): boolean {
  const a = input.toLowerCase().trim();
  const b = answer.toLowerCase().trim();
  return levenshtein(a, b) <= 1;
}

type CardProps = {
  image?: string;
  painter: string;
  title: string;
  year: number;
  medium?: string;
  notes?: string;
};

export default function Card({ image, painter, title, year, medium, notes }: CardProps) {
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState("");
  const [mediumAnswer, setMediumAnswer] = useState("");
  const mediumRef = useRef<HTMLInputElement>(null);

  const parts = answer.split(",").map(p => p.trim());
  const painterCorrect = parts[0]?.length > 0 && isMatch(parts[0], painter);
  const titleCorrect = parts[1]?.length > 0 && isMatch(parts[1], title);
  const yearCorrect = parts[2]?.length > 0 && parts[2].trim() === String(year);
  const allCorrect = painterCorrect && titleCorrect && yearCorrect;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card */}
      <div
        style={{ perspective: 1000 }}
        className="relative w-96 h-72 cursor-pointer"
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front */}
        <motion.div
          className="absolute w-96 h-72 bg-cyan-400 rounded-2xl p-6 flex flex-col gap-3"
          initial={{ rotateX: 0 }}
          animate={{ rotateX: flipped ? 180 : 0 }}
          transition={{ type: "tween", duration: 0.6, ease: "easeInOut" }}
          style={{ backfaceVisibility: "hidden" }}
          whileTap={{ y: -2 }}
        >
          <div className="w-full flex-1 rounded-md overflow-hidden bg-cyan-300">
            {image && (
              <img src={image} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <p className="font-garamond text-sm text-cyan-900"></p>
        </motion.div>

        {/* Back */}
        <motion.div
          className="absolute w-96 h-72 bg-cyan-900 rounded-2xl p-8 flex flex-col justify-center gap-2"
          initial={{ rotateX: -180 }}
          animate={{ rotateX: flipped ? 0 : -180 }}
          transition={{ type: "tween", duration: 0.6, ease: "easeInOut" }}
          style={{ backfaceVisibility: "hidden" }}
          whileTap={{ y: -2 }}
        >
          <p className="font-garamond text-2xl text-cyan-100">{painter}, <em>{title}</em>, {year}</p>
          {medium && <p className="text-sm text-cyan-100 mt-1">{medium}</p>}
          {notes && <p className="text-sm text-cyan-300 leading-relaxed mt-2">{notes}</p>}
        </motion.div>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-3 w-96">
        <input
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === "Enter" && allCorrect && medium && mediumRef.current?.focus()}
          placeholder="Name, Title, Year"
          className={`outline-none bg-transparent text-sm placeholder:text-neutral-300 transition-colors duration-300 ${allCorrect ? "text-green-600" : "text-neutral-500"}`}
        />
        {medium && (
          <input
            ref={mediumRef}
            value={mediumAnswer}
            onChange={e => setMediumAnswer(e.target.value)}
            placeholder="Medium"
            className={`outline-none bg-transparent text-sm placeholder:text-neutral-300 transition-colors duration-300 ${mediumAnswer.length > 0 && isMatch(mediumAnswer, medium) ? "text-green-600" : "text-neutral-500"}`}
          />
        )}
      </div>
    </div>
  );
}
