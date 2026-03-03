"use client";

import { useEffect, useRef } from "react";

export default function ShaderRect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vertexShader = `
      attribute vec2 pos;
      void main() {
        gl_Position = vec4(pos, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
        precision mediump float;
        #extension GL_OES_standard_derivatives : enable
        uniform vec2 u_resolution;
        
        void main() {
            float dotSize = 10.0;
            vec2 pixel = gl_FragCoord.xy;
            
            vec2 fullCells = floor(u_resolution / dotSize);
            vec2 usableArea = fullCells * dotSize;
            
            if (pixel.x > usableArea.x || pixel.y > usableArea.y) {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                return;
            }
            vec2 uv = pixel / u_resolution;
            float luma = uv.x;

            vec2 cell = fract(pixel / dotSize);
            float dist = length(cell - 0.5);

            //float softness = 0.25 / dotSize;
            //float radius = 0.35;
            //float d = 1.0 - smoothstep(radius - softness, radius + softness, dist);
            //float d = 1.0 - step(radius, dist);

            float baseRadius = 0.1;
            float maxRadius = 0.45;
            float radius = mix(maxRadius, baseRadius, luma); 

            float edgeWidth = fwidth(dist) * 0.5;
            //float radius = 0.35;
            float circle = smoothstep(radius - edgeWidth, radius + edgeWidth, dist);
            
            vec3 background = vec3(1.0);
            vec3 dotColor = vec3(0.0);
            vec3 color = mix(dotColor, background, circle);
            
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const ext = gl.getExtension('OES_standard_derivatives');
    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vs = compile(vertexShader, gl.VERTEX_SHADER);
    const fs = compile(fragmentShader, gl.FRAGMENT_SHADER);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);
    const resLoc = gl.getUniformLocation(program, "u_resolution");

    const verts = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resize = () => {
        const width = container.clientWidth;
        const height = Math.round(width * 0.75);
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        gl.uniform2f(resLoc, width, height); 
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}