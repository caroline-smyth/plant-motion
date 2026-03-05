"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Window state: true = lit (yellow), false = off (dark)
const ROWS = 4;
const COLS = 5;

export default function BuildingScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [windows, setWindows] = useState<boolean[]>(() =>
    Array(ROWS * COLS).fill(false).map(() => Math.random() > 0.3)
  );
  const windowsRef = useRef(windows);
  const timeRef = useRef(0);

  useEffect(() => {
    windowsRef.current = windows;
  }, [windows]);

  const toggleWindow = useCallback((index: number) => {
    setWindows((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const width = canvas.width;
    const height = canvas.height;

    // Vertex shader
    const vertexShader = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader with glow effect
    const fragmentShader = `
      precision mediump float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_windows[${ROWS * COLS}];
      
      // Building dimensions (in UV space)
      const float BUILDING_LEFT = 0.15;
      const float BUILDING_RIGHT = 0.85;
      const float BUILDING_TOP = 0.08;
      const float BUILDING_BOTTOM = 0.95;
      
      const int ROWS = ${ROWS};
      const int COLS = ${COLS};
      
      // Colors
      vec3 SKY_COLOR = vec3(0.14, 0.25, 0.75);
      vec3 BRICK_COLOR = vec3(0.55, 0.22, 0.2);
      vec3 WINDOW_LIT = vec3(0.95, 0.8, 0.2);
      vec3 WINDOW_OFF = vec3(0.08, 0.08, 0.1);
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        uv.y = 1.0 - uv.y; // Flip Y so top is 0
        
        vec3 color = SKY_COLOR;
        
        // Subtle sky variation
        float skyNoise = random(uv * 10.0 + u_time * 0.01) * 0.03;
        color += skyNoise;
        
        // Check if inside building
        if (uv.x > BUILDING_LEFT && uv.x < BUILDING_RIGHT && 
            uv.y > BUILDING_TOP && uv.y < BUILDING_BOTTOM) {
          color = BRICK_COLOR;
        }
        
        // Window parameters
        float windowWidth = (BUILDING_RIGHT - BUILDING_LEFT) / float(COLS) * 0.6;
        float windowHeight = (BUILDING_BOTTOM - BUILDING_TOP) / float(ROWS) * 0.55;
        float cellWidth = (BUILDING_RIGHT - BUILDING_LEFT) / float(COLS);
        float cellHeight = (BUILDING_BOTTOM - BUILDING_TOP) / float(ROWS);
        
        // Calculate glow from all lit windows
        float totalGlow = 0.0;
        
        for (int i = 0; i < ROWS * COLS; i++) {
          int row = i / COLS;
          int col = i - row * COLS;
          
          // Window center
          float wx = BUILDING_LEFT + (float(col) + 0.5) * cellWidth;
          float wy = BUILDING_TOP + (float(row) + 0.5) * cellHeight;
          
          // Window bounds
          float wLeft = wx - windowWidth / 2.0;
          float wRight = wx + windowWidth / 2.0;
          float wTop = wy - windowHeight / 2.0;
          float wBottom = wy + windowHeight / 2.0;
          
          bool isLit = u_windows[i] > 0.5;
          
          // Inside window?
          if (uv.x > wLeft && uv.x < wRight && uv.y > wTop && uv.y < wBottom) {
            if (isLit) {
              // Subtle flicker
              float flicker = 0.95 + 0.05 * sin(u_time * 3.0 + float(i) * 1.5);
              color = WINDOW_LIT * flicker;
            } else {
              color = WINDOW_OFF;
            }
          }
          
          // Add glow for lit windows
          if (isLit) {
            float dist = distance(uv, vec2(wx, wy));
            float glow = 0.15 / (dist * 8.0 + 0.3);
            glow *= 0.95 + 0.05 * sin(u_time * 2.0 + float(i));
            totalGlow += glow;
          }
        }
        
        // Apply warm glow
        color += vec3(0.9, 0.6, 0.1) * totalGlow * 0.25;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Compile shaders
    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
      }
      return s;
    };

    const vs = compile(vertexShader, gl.VERTEX_SHADER);
    const fs = compile(fragmentShader, gl.FRAGMENT_SHADER);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Full-screen quad
    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const windowsLoc = gl.getUniformLocation(program, "u_windows");

    gl.viewport(0, 0, width, height);

    // Animation loop
    let animationId: number;
    const render = () => {
      timeRef.current += 0.016;
      
      gl.uniform2f(resLoc, width, height);
      gl.uniform1f(timeLoc, timeRef.current);
      gl.uniform1fv(windowsLoc, windowsRef.current.map((w) => (w ? 1.0 : 0.0)));

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, []);

  // Handle click - map canvas coordinates to window index
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Building bounds (must match shader)
    const BUILDING_LEFT = 0.15;
    const BUILDING_RIGHT = 0.85;
    const BUILDING_TOP = 0.08;
    const BUILDING_BOTTOM = 0.95;

    if (x < BUILDING_LEFT || x > BUILDING_RIGHT || y < BUILDING_TOP || y > BUILDING_BOTTOM) {
      return;
    }

    // Which cell?
    const col = Math.floor(((x - BUILDING_LEFT) / (BUILDING_RIGHT - BUILDING_LEFT)) * COLS);
    const row = Math.floor(((y - BUILDING_TOP) / (BUILDING_BOTTOM - BUILDING_TOP)) * ROWS);

    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
      const index = row * COLS + col;
      toggleWindow(index);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onClick={handleClick}
        style={{
          cursor: "pointer",
          borderRadius: 8,
        }}
      />
      <p className="text-sm text-neutral-500">Click windows to toggle lights</p>
    </div>
  );
}