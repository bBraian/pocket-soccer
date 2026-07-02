import { useEffect, useRef } from 'react';
import type { BallSkin, GrassSkin, MatchConfig, MatchResult } from '../types';
import { FIELD_H, FIELD_W } from '../engine/constants';
import { GameEngine } from '../engine/engine';
import { useMatchStore } from '../store/matchStore';

interface Props {
  config: MatchConfig;
  grass: GrassSkin;
  ball: BallSkin;
  paused: boolean;
  onMatchEnd: (result: MatchResult) => void;
}

// Bridges the imperative engine to React: instantiates the engine, runs the
// rAF loop, forwards pointer input, and pushes engine events into matchStore.
// React never re-renders at 60fps — only on the discrete engine callbacks.
export function GameCanvas({ config, grass, ball, paused, onMatchEnd }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = FIELD_W * dpr;
    canvas.height = FIELD_H * dpr;

    const store = useMatchStore.getState();
    const engine = new GameEngine(
      config,
      { grass, ball },
      {
        onScore: (score, side) => {
          store.setScore(score);
          store.startCelebration(side, score);
        },
        onCelebrationEnd: () => store.endCelebration(),
        onTurnChange: (turn) => store.setTurn(turn),
        onClock: (sec) => store.setClock(sec),
        onTurnClock: (sec) => store.setTurnClock(sec),
        onGolden: () => store.setGolden(),
        onMatchEnd: (result) => {
          store.finish(result);
          onMatchEnd(result);
        },
      },
    );
    engineRef.current = engine;
    engine.start(performance.now());

    // ---- pointer input (unified mouse + touch) ----
    const toField = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * FIELD_W,
        y: ((e.clientY - rect.top) / rect.height) * FIELD_H,
      };
    };
    const onDown = (e: PointerEvent) => {
      if (pausedRef.current) return;
      const p = toField(e);
      engine.pointerDown(p.x, p.y);
    };
    const onMove = (e: PointerEvent) => {
      const p = toField(e);
      engine.pointerMove(p.x, p.y);
    };
    const onUp = () => engine.pointerUp();

    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    let raf = 0;
    const loop = (now: number) => {
      if (!pausedRef.current) engine.update(now);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.render(ctx);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-update skins without recreating the engine.
  useEffect(() => {
    engineRef.current?.updateSettings({ grass, ball });
  }, [grass, ball]);

  return <canvas ref={canvasRef} className="game-canvas" />;
}
