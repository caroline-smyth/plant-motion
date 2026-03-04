"use client";

import { useEffect, useRef, useState } from "react";

type ShaderRectProps = {
  dotSize?: number;
};

export default function ShaderRect({ dotSize = 3.0 }: ShaderRectProps) {
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
      uniform sampler2D u_image;
      uniform float u_dotSize;
      
      void main() {
        float dotSize = u_dotSize;
        vec2 pixel = gl_FragCoord.xy;
        vec2 uv = pixel / u_resolution;
        
        // Flip Y for image coordinates
        vec2 imageUv = vec2(uv.x, 1.0 - uv.y);
        
        vec2 fullCells = floor(u_resolution / dotSize);
        vec2 usableArea = fullCells * dotSize;
        
        if (pixel.x > usableArea.x || pixel.y > usableArea.y) {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
          return;
        }
        
        // Sample image at cell center for consistent color per dot
        vec2 cellIndex = floor(pixel / dotSize);
        vec2 cellCenter = (cellIndex + 0.5) * dotSize;
        vec2 cellCenterUv = vec2(cellCenter.x / u_resolution.x, 1.0 - cellCenter.y / u_resolution.y);
        vec4 texColor = texture2D(u_image, cellCenterUv);
        
        // Calculate luma from the image
        float luma = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
        
        vec2 cell = fract(pixel / dotSize);
        float dist = length(cell - 0.5);
        
        float row = floor(pixel.y / dotSize);
        float offset = mod(row, 2.0) * dotSize * 0.5;
        vec2 adjustedPixel = vec2(pixel.x - offset, pixel.y);
        // Luma-based radius: dark = big dots, bright = small dots
        float baseRadius = 0.05;
        float maxRadius = 0.45;
        float radius = mix(maxRadius, baseRadius, luma);
        
        float edgeWidth = fwidth(dist) * 0.5;
        float circle = smoothstep(radius - edgeWidth, radius + edgeWidth, dist);
        
        vec3 background = vec3(1.0);
        vec3 dotColor = texColor.rgb;
        // Or use the image color: vec3 dotColor = texColor.rgb;
        vec3 color = mix(dotColor, background, circle);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const ext = gl.getExtension('OES_standard_derivatives');
    
    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s));
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
    
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const imageLoc = gl.getUniformLocation(program, "u_image");
    const dotSizeLoc = gl.getUniformLocation(program, "u_dotSize");

    const verts = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    const image = new Image();
    image.crossOrigin = "anonymous";
    
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      
      // Handle non-power-of-2 images
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(imageLoc, 0);
      
      resize();
    };

    image.onerror = () => {
        console.error('Failed to load image');
      };
    
    image.src = "/waves.jpg";

    const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        const width = container.clientWidth;
        const height = Math.round(width * 0.75);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        gl.viewport(0, 0, width * dpr, height * dpr);
        gl.uniform2f(resLoc, width * dpr, height * dpr);
        gl.uniform1f(dotSizeLoc, dotSize);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [dotSize]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}