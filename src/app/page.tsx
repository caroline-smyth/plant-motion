"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  return (
    <div>
      <p className="text-2xl">Sketchbook</p>
      <p>
        I feel very drawn to beautiful things in nature and on the internet
        <br></br>
        I want to figure out if there's a throughline in what excites me and better understand how to create
        new stuff along that axis
        <br></br>This will be an exercise in
        </p>
        <ul className="indent-4">
          <li>Looking</li>
          <li>Unfamiliar design technologies</li>
          <li>Interactivity, motion, and elegance</li>
        </ul>
      <p>
      All based in <Link href="/manifesto">what I see around me</Link> and what I like</p>
      <br></br>
      <Link href="projects/waves" className="underline">Halftone waves</Link>
      <br></br>
      <Link href="projects/crown" className="underline">Trees</Link>
    </div>
  );
}