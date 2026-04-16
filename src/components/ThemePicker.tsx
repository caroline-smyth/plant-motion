"use client";
import { useState, useEffect } from "react";

const themes = [
  { name: "cyan",   color: "#22d3ee" },
  { name: "rose",   color: "#fb7185" },
  { name: "amber",  color: "#fbbf24" },
  { name: "violet", color: "#a78bfa" },
];

export default function ThemePicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("card-theme");
    const i = themes.findIndex(t => t.name === saved);
    if (i >= 0) setIndex(i);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themes[index].name);
    localStorage.setItem("card-theme", themes[index].name);
  }, [index]);

  return (
    <button
      onClick={() => setIndex(i => (i + 1) % themes.length)}
      style={{ background: themes[index].color }}
      className="w-3.5 h-3.5 rounded-full transition-colors duration-500 cursor-pointer border-0 outline-none"
      aria-label="Switch color theme"
    />
  );
}
