'use client';

import { motion, useAnimate } from 'framer-motion';
import { useState } from 'react';

const FW = 32, FH = 32, SC = 3;
const W = FW * SC;   // 96px per character
const H = FH * SC;   // 96px

const COLS = 13;
const ROWS = 3;
const GAP_X = 14;
const GAP_Y = 20;
const STEP_X = W + GAP_X;   // 110px
const STEP_Y = H + GAP_Y;   // 116px

const SCENE_W = COLS * STEP_X;                   // 1430px
const SCENE_H = ROWS * H + (ROWS - 1) * GAP_Y;  // 328px

const SPEED = 80;                  // px/s
const LOOP_DUR = SCENE_W / SPEED;  // ~17.9s per loop

// Walker renders one sprite-animated character at a fixed position within its row.
// scaleX(-1) mirrors the sprite to produce a left-facing walk — CSS animation only
// touches background-position-x, so there's no conflict with the transform.
function Walker({ x, facingRight, phaseDelay }: {
  x: number;
  facingRight: boolean;
  phaseDelay: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: W,
        height: H,
        backgroundImage: 'url(/walker.png)',
        backgroundSize: `${FW * 3 * SC}px ${H}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated' as const,
        transform: `scaleX(${facingRight ? 1 : -1})`,
        animation: `walk-sprite 0.45s steps(3, end) ${phaseDelay}s infinite`,
      }}
    />
  );
}

// Row scrolls a seamless band of walkers.
// Two copies of COLS walkers are placed side-by-side so the loop-reset jump
// always happens off-screen:
//   right-moving row — copy 0 at [0, SCENE_W), copy 1 at [-SCENE_W, 0)
//                       animate x: 0 → +SCENE_W
//   left-moving row  — copy 0 at [0, SCENE_W), copy 1 at [SCENE_W, 2·SCENE_W)
//                       animate x: 0 → -SCENE_W
function Row({ y, facingRight }: { y: number; facingRight: boolean }) {
  const walkers = [];
  for (let copy = 0; copy < 2; copy++) {
    const offset = facingRight
      ? (copy === 0 ? 0 : -SCENE_W)
      : (copy === 0 ? 0 : SCENE_W);
    for (let c = 0; c < COLS; c++) {
      const x = c * STEP_X + offset;
      const phase = facingRight
        ? -((c % 3) * 0.14)
        : -(((COLS - 1 - c) % 3) * 0.14);
      walkers.push(
        <Walker key={`${copy}-${c}`} x={x} facingRight={facingRight} phaseDelay={phase} />
      );
    }
  }

  return (
    <motion.div
      style={{ position: 'absolute', top: y, left: 0, height: H }}
      animate={{ x: facingRight ? [0, SCENE_W] : [0, -SCENE_W] }}
      transition={{ duration: LOOP_DUR, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
    >
      {walkers}
    </motion.div>
  );
}

const ZOOM_LEVELS = [1, 2, 4];

export default function MeandrosStrip() {
  const [sceneScope, animateScene] = useAnimate();
  const [zoomIndex, setZoomIndex] = useState(0);

  const zoomTo = (index: number) => {
    const scale = ZOOM_LEVELS[index];
    animateScene(sceneScope.current, { scale }, { duration: 1.2, ease: [0.4, 0, 0.2, 1] });
    setZoomIndex(index);
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{ width: '100%', height: SCENE_H, overflow: 'hidden', position: 'relative' }}>
        <motion.div
          ref={sceneScope}
          style={{
            width: SCENE_W,
            height: SCENE_H,
            position: 'absolute',
            left: `calc(50% - ${SCENE_W / 2}px)`,
            top: 0,
            transformOrigin: `${SCENE_W / 2}px ${SCENE_H / 2}px`,
          }}
        >
          {Array.from({ length: ROWS }, (_, r) => (
            <Row key={r} y={r * STEP_Y} facingRight={r % 2 === 0} />
          ))}
        </motion.div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingTop: 12 }}>
        <button
          onClick={() => zoomTo(Math.min(zoomIndex + 1, ZOOM_LEVELS.length - 1))}
          disabled={zoomIndex === ZOOM_LEVELS.length - 1}
          style={{ fontSize: 20, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', opacity: zoomIndex === ZOOM_LEVELS.length - 1 ? 0.3 : 1 }}
        >
          +
        </button>
        <button
          onClick={() => zoomTo(Math.max(zoomIndex - 1, 0))}
          disabled={zoomIndex === 0}
          style={{ fontSize: 20, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', opacity: zoomIndex === 0 ? 0.3 : 1 }}
        >
          −
        </button>
      </div>
    </div>
  );
}
