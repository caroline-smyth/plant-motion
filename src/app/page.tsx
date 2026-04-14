"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  return (
    <div>
      <p className="text-5xl mb-4">Spring sketchbook</p>
      <p>Growing <a href="list" className="underline" >list</a> of inspiration
      </p>
      <a href="projects/books" className="text-2xl underline">Book cover archive</a>
    </div>

  );
}