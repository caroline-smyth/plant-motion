"use client";
import { useState, useRef, useEffect } from "react";
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
  onComplete?: () => void;
};

export default function Card({ image, painter, title, year, medium, notes, onComplete }: CardProps) {
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState("");
  const [mediumAnswer, setMediumAnswer] = useState("");
  const answerRef = useRef<HTMLInputElement>(null);
  const mediumRef = useRef<HTMLInputElement>(null);

  const yearMatch = answer.match(/\b(\d{4})\b/);
  const yearStr = yearMatch?.[0] ?? "";
  const withoutYear = answer.replace(/\b\d{4}\b/, "").trim();
  const delimIdx = withoutYear.search(/[, ]/);
  const painterStr = (delimIdx >= 0 ? withoutYear.slice(0, delimIdx) : withoutYear).trim();
  const titleStr = delimIdx >= 0
    ? withoutYear.slice(delimIdx).replace(/^[,\s]+/, "").replace(/[,\s]+$/, "").trim()
    : "";
  const parts = [painterStr, titleStr, yearStr];
  const painterCorrect = parts[0]?.length > 0 && isMatch(parts[0], painter);
  const titleCorrect = parts[1]?.length > 0 && isMatch(parts[1], title);
  const yearCorrect = parts[2]?.length > 0 && parts[2].trim() === String(year);
  const allCorrect = painterCorrect && titleCorrect && yearCorrect;
  const mediumCorrect = !medium || (mediumAnswer.length > 0 && isMatch(mediumAnswer, medium));
  const allComplete = allCorrect && mediumCorrect;

  useEffect(() => {
    if (!allComplete || !onComplete) return;
    const t = setTimeout(onComplete, 400);
    return () => clearTimeout(t);
  }, [allComplete]);

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
          <div className="h-2"></div>
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
          ref={answerRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === "Enter" && allCorrect && medium && mediumRef.current?.focus()}
          placeholder="Name, Title, Year"
          className={`outline-none bg-transparent text-sm placeholder:text-neutral-400 transition-colors duration-300 ${allCorrect ? "text-green-600" : "text-neutral-500"}`}
        />
        {medium && (
          <input
            ref={mediumRef}
            value={mediumAnswer}
            onChange={e => setMediumAnswer(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Backspace" && mediumAnswer === "") {
                e.preventDefault();
                const el = answerRef.current;
                if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
              }
            }}
            placeholder="Medium"
            className={`outline-none bg-transparent text-sm placeholder:text-neutral-400 transition-colors duration-300 ${mediumAnswer.length > 0 && isMatch(mediumAnswer, medium) ? "text-green-600" : "text-neutral-500"}`}
          />
        )}
      </div>
    </div>
  );
}
