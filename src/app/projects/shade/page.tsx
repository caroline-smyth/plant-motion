"use client";

import { useState } from "react";
import ShaderRect from "../../../components/Dots";
import { ToggleLeft } from 'lucide-react';
import { ToggleRight } from 'lucide-react';


export default function Shade() {
    const [showShader, setShowShader] = useState(true);
    const [dotSize, setDotSize] = useState(3.0);
    const [inputValue, setInputValue] = useState("3");

    return (
        <div className="flex flex-col">
            <h1 className="text-xl mb-5 text-center">First time playing with halftone</h1>
            {showShader ? (
                <ShaderRect dotSize={dotSize} />
            ) : (
                <img src="/waves.jpg" className="w-full aspect-[4/3] object-cover" />
            )}
            
            {showShader}
            
            <div className="flex items-center justify-center">
                <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={dotSize}
                    onMouseDown={() => setShowShader(true)}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setDotSize(val);
                        setInputValue(Math.round(val).toString());
                        setShowShader(true);
                    }}
                    className="w-60 mt-5"
                />
            </div>
            
        </div>
    );
}