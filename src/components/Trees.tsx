"use client";

import { useEffect, useRef } from "react";

type CrownShynessProps = {
  // We can add props later as we build up the effect
};

export default function CrownShyness({}: CrownShynessProps) {
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
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform sampler2D u_branches;
      
      // Simple hash for noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      // Smooth noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f); // smoothstep
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      // Fractal brownian motion for soft, layered clouds
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        
        // Sky gradient - soft blue, lighter at top
        vec3 skyBottom = vec3(0.85, 0.88, 0.91);
        vec3 skyTop = vec3(0.92, 0.93, 0.95);
        vec3 sky = mix(skyBottom, skyTop, uv.y);
        
        // Clouds - soft, drifting
        vec2 cloudUv = uv * vec2(2.0, 1.5);
        cloudUv.x += u_time * 0.02; // Slow drift to the right
        
        float cloud = fbm(cloudUv * 3.0);
        
        // Second layer of clouds, moving slightly differently
        vec2 cloudUv2 = uv * vec2(1.5, 1.0);
        cloudUv2.x += u_time * 0.015;
        cloudUv2.y += 0.5;
        float cloud2 = fbm(cloudUv2 * 2.5 + 100.0);
        
        // Combine cloud layers
        float clouds = cloud * 0.5 + cloud2 * 0.5;
        
        // Soft threshold - only show lighter parts as clouds
        // This creates soft, fuzzy edges rather than hard shapes
        float cloudMask = smoothstep(0.3, 0.55, clouds);
        
        // Cloud color - slightly cooler/darker than sky for contrast
        vec3 cloudColor = vec3(0.84, 0.87, 0.91);
        
        // Blend clouds into sky
        vec3 color = mix(sky, cloudColor, cloudMask * 0.4);

        // Wind displacement for branches
        vec2 windOffset = vec2(
        fbm(uv * 1.0 + u_time * 0.2) * 0.004,
        fbm(uv * 1.0 + u_time * 0.1 + 50.0) * 0.005
        );

        float zoom = 0.2;
        vec2 branchUv = vec2(uv.x, 1.0 - uv.y);
        branchUv = (branchUv - 0.5) * zoom + 0.4;
        branchUv += windOffset;

        // Sample branch texture with wind displacement
       // vec2 branchUv = vec2(uv.x, 1.0 - uv.y) + windOffset;
        vec4 branchTex = texture2D(u_branches, branchUv);
        float branchMask = 1.0 - branchTex.r;

        // Stipple effect - branches are made of noise, not solid
        float stipple = hash(uv * u_resolution * 2.0);

        // Only show a stipple dot if random value is below the branch density
        // This makes thick and thin branches both feel like scattered dots
        float stippleMask = step(stipple, branchMask * 0.7);

        vec3 branchColor = vec3(0.32, 0.33, 0.25);
        color = mix(color, branchColor, stippleMask);

        // Smooth edge fade
        vec2 edge = smoothstep(0.0, 0.01, uv) * smoothstep(0.0, 0.01, 1.0 - uv);
        float mask = edge.x * edge.y;

        vec3 paper = vec3(1.0);
        color = mix(paper, color, mask);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(s));
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
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const branchLoc = gl.getUniformLocation(program, "u_branches");

    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const branchTexture = gl.createTexture();
    const branchImage = new Image();

    branchImage.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, branchTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, branchImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    branchImage.src = "/branches.png";

    const posLoc = gl.getAttribLocation(program, "pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    let animationId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight || Math.round(width * 0.75);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
    };

    const render = (time: number) => {
      gl.uniform1f(timeLoc, time * 0.001);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, branchTexture);
      gl.uniform1i(branchLoc, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full aspect-[4/3]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}