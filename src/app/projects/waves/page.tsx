"use client";

import { useState, useRef } from "react";
import ShaderRect from "../../../components/Dots";
import Header from "../../../components/Header";

export default function Waves() {
    const lastEdited = new Date("2026-03-04");

    const [showShader, setShowShader] = useState(true);
    const [dotSize, setDotSize] = useState(3);
    const trackRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const update = (clientX: number) => {
        const r = trackRef.current?.getBoundingClientRect();
        if (!r) return;
        setDotSize(Math.round(1 + Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * 49));
        setShowShader(true);
    };

    const pct = ((dotSize - 1) / 49) * 100;

    return (
        <div className="flex flex-col">
            <h1 className="text-xl mb-5 text-center">First time playing with halftone</h1>
            {showShader ? <ShaderRect dotSize={dotSize} /> : <img src="/waves.jpg" className="w-full aspect-[4/3] object-cover" />}

            <div className="flex items-center justify-center mt-5">
                <div
                    ref={trackRef}
                    className="relative w-60 h-11 cursor-pointer touch-none select-none"
                    onPointerDown={e => { dragging.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); update(e.clientX); }}
                    onPointerMove={e => dragging.current && update(e.clientX)}
                    onPointerUp={() => { dragging.current = false; }}
                    onPointerCancel={() => { dragging.current = false; }}
                >
                    <div className="absolute top-2 inset-x-0 h-[1.5px] bg-neutral-400 -translate-y-1/2" />
                    <div className="absolute top-2 w-[1.5px] h-4 bg-neutral-700 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pct}%` }} />
                </div>
            </div>
        </div>
    );
}