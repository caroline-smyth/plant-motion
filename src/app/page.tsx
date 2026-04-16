"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  return (
    <div>
      <p className="text-4xl mb-4 font-garamond">Spring sketchbook</p>
      {/*<p>Growing <a href="list" className="underline leading-relaxed" >list</a> of inspiration
      </p>
      <a href="projects/books" className="underline">Book cover archive</a>
      */}
      <a href="projects/card" className="underline">Art history flashcards</a>
    </div>

  );
}