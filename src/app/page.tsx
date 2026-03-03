"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  return (
    <div>
      <p className="text-2xl">Tinkering</p>
      <p>
        I want to explore the aesthetics that excite me and develop a style/thesis about what makes good design
      <br></br>Somewhat based in art historical looking
      <br></br>Somewhat based in design technologies and randomness
      <br></br>All based in <Link href="/manifesto">what I see around me</Link> and what I like</p>
      <br></br>
      <Link href="projects/shade" className="underline">Halftone waves</Link>
      <br></br>
    </div>
  );
}