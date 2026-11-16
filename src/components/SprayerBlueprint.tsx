import { useCallback, useEffect, useRef, useState } from 'react';

interface SprayerBlueprintProps {
  heroContainerRef: React.RefObject<HTMLElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  hintLabel: string;
  sprayLabel: string;
  streamLabel: string;
  figLabel: string;
  strokesLabel: string;
}

interface MistParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
}

export function SprayerBlueprint({
  heroContainerRef,
  canvasRef,
  hintLabel,
  sprayLabel,
  streamLabel,
  figLabel,
  strokesLabel,
}: SprayerBlueprintProps) {
  const [mode, setMode] = useState<'spray' | 'stream'>('spray');
  const [pulled, setPulled] = useState(false);
  const [strokes, setStrokes] = useState(0);

  const nozzleRef = useRef<SVGCircleElement | null>(null);
  const particlesRef = useRef<MistParticle[]>([]);
  const rafRef = useRef<number | null>(null);
  const pullTimerRef = useRef<number | null>(null);
  const burstTimerRef = useRef<number | null>(null);
  const dimsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const modeRef = useRef<'spray' | 'stream'>(mode);
  modeRef.current = mode;

  const syncCanvasSize = useCallback(() => {
    const hero = heroContainerRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dimsRef.current = { w: rect.width, h: rect.height };
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, [canvasRef, heroContainerRef]);

  useEffect(() => {
    syncCanvasSize();
    window.addEventListener('resize', syncCanvasSize);
    return () => {
      window.removeEventListener('resize', syncCanvasSize);
    };
  }, [syncCanvasSize]);

  const emitBurst = useCallback(
    (count: number) => {
      const hero = heroContainerRef.current;
      const nozzle = nozzleRef.current;
      if (!hero || !nozzle) return;
      const hRect = hero.getBoundingClientRect();
      const nRect = nozzle.getBoundingClientRect();
      const ox = nRect.left - hRect.left;
      const oy = nRect.top - hRect.top + nRect.height / 2;
      const scale = Math.max(0.55, Math.min(1.25, dimsRef.current.w / 1100));
      const isStream = modeRef.current === 'stream';

      for (let i = 0; i < count; i++) {
        const angleSpread = isStream ? 0.06 : 0.62;
        const a = Math.PI + (Math.random() - 0.5) * angleSpread;
        const speed = (isStream ? 11 + Math.random() * 6 : 5 + Math.random() * 10) * scale;
        particlesRef.current.push({
          x: ox,
          y: oy,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          r: isStream ? 1.8 + Math.random() * 1.4 : 1 + Math.random() * 2.6,
          life: 0,
          max: isStream ? 55 + Math.random() * 35 : 70 + Math.random() * 80,
        });
      }
    },
    [heroContainerRef]
  );

  const runLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rafRef.current = null;
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      rafRef.current = null;
      return;
    }

    const { w, h } = dimsRef.current;
    ctx.clearRect(0, 0, w, h);
    const mistColor =
      getComputedStyle(document.documentElement).getPropertyValue('--mist').trim() || '#1648C9';
    ctx.fillStyle = mistColor;

    const list = particlesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.life += 1;
      p.vx *= 0.972;
      p.vy = p.vy * 0.972 + 0.018;
      p.x += p.vx;
      p.y += p.vy;
      p.r += 0.02;
      if (p.life > p.max || p.x < -20) {
        list.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = (1 - p.life / p.max) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (list.length > 0) {
      rafRef.current = requestAnimationFrame(runLoop);
    } else {
      rafRef.current = null;
    }
  }, [canvasRef]);

  const pressTrigger = useCallback(() => {
    setStrokes((prev) => prev + 1);
    setPulled(true);
    if (pullTimerRef.current) {
      window.clearTimeout(pullTimerRef.current);
    }
    pullTimerRef.current = window.setTimeout(() => setPulled(false), 240);

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (burstTimerRef.current) {
      window.clearInterval(burstTimerRef.current);
    }

    let step = 0;
    const perTick = reduce ? 4 : 14;
    emitBurst(perTick);
    burstTimerRef.current = window.setInterval(() => {
      step += 1;
      emitBurst(perTick);
      if (step >= 9 && burstTimerRef.current) {
        window.clearInterval(burstTimerRef.current);
        burstTimerRef.current = null;
      }
    }, 22);

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(runLoop);
    }
  }, [emitBurst, runLoop]);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let t1: number | null = null;
    let t2: number | null = null;
    if (!reduce) {
      t1 = window.setTimeout(() => pressTrigger(), 650);
      t2 = window.setTimeout(() => pressTrigger(), 1200);
    }

    return () => {
      if (t1) window.clearTimeout(t1);
      if (t2) window.clearTimeout(t2);
      if (pullTimerRef.current) window.clearTimeout(pullTimerRef.current);
      if (burstTimerRef.current) window.clearInterval(burstTimerRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [pressTrigger]);

  return (
    <div dir="ltr" className="relative justify-self-center w-full max-w-[360px] mx-auto">
      {/* Compact top mode selector + stroke readout */}
      <div className="flex items-center justify-between gap-2 mb-2 font-mono-spec text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
        <span>{figLabel}</span>
        <div className="inline-flex border border-[var(--line)] rounded bg-[var(--surface)] overflow-hidden">
          <button
            type="button"
            onClick={() => setMode('spray')}
            aria-pressed={mode === 'spray'}
            className={`px-2 py-1 text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
              mode === 'spray'
                ? 'bg-[var(--blue)] text-[var(--btn-ink)] font-medium'
                : 'text-[var(--muted)] hover:text-[var(--blue)]'
            }`}
          >
            {sprayLabel}
          </button>
          <button
            type="button"
            onClick={() => setMode('stream')}
            aria-pressed={mode === 'stream'}
            className={`px-2 py-1 text-[10px] uppercase tracking-wider border-l border-[var(--line)] transition-colors cursor-pointer ${
              mode === 'stream'
                ? 'bg-[var(--blue)] text-[var(--btn-ink)] font-medium'
                : 'text-[var(--muted)] hover:text-[var(--blue)]'
            }`}
          >
            {streamLabel}
          </button>
        </div>
      </div>

      {/* Interactive engineering rig SVG */}
      <svg
        viewBox="0 0 380 470"
        onClick={pressTrigger}
        role="img"
        aria-label={hintLabel}
        className="block w-full h-auto cursor-pointer overflow-visible select-none"
      >
        {/* Bottle outline */}
        <path
          d="M176 272Q112 292 112 356V470M284 272Q348 292 348 356V470"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <line x1="230" y1="272" x2="230" y2="452" stroke="var(--ink)" strokeWidth="5" />

        {/* Sprayer nozzle + head */}
        <rect x="40" y="96" width="46" height="40" rx="6" fill="var(--red)" />
        <circle ref={nozzleRef} cx="40" cy="116" r="3" fill="var(--ink)" />
        <path d="M84 82H228Q272 82 272 126V190H190V150H84Z" fill="var(--blue)" />
        <path
          className={`yl-trigger-arm ${pulled ? 'is-pulled' : ''}`}
          d="M96 150H132L152 252Q154 264 142 264H133Q114 204 96 172Z"
          fill="var(--red)"
        />
        <rect x="190" y="190" width="82" height="26" fill="var(--ink)" />
        <rect x="176" y="216" width="108" height="56" rx="6" fill="var(--blue)" />
        <path
          d="M192 216V272M208 216V272M224 216V272M240 216V272M256 216V272M272 216V272"
          stroke="var(--bg)"
          strokeWidth="2"
          opacity=".45"
        />

        {/* Dimension callouts */}
        <path
          d="M176 60H284M176 54V66M284 54V66"
          stroke="var(--muted)"
          strokeWidth="1"
          fill="none"
        />
        <text
          x="230"
          y="48"
          textAnchor="middle"
          className="font-mono-spec"
          fontSize="11"
          fill="var(--muted)"
          letterSpacing="0.06em"
        >
          NECK 28/410
        </text>
        <path
          d="M366 272V452M360 272H372M360 452H372"
          stroke="var(--muted)"
          strokeWidth="1"
          fill="none"
        />
        <text
          x="356"
          y="366"
          textAnchor="end"
          className="font-mono-spec"
          fontSize="11"
          fill="var(--muted)"
          letterSpacing="0.06em"
        >
          TUBE CUT
        </text>
        <text
          x="356"
          y="381"
          textAnchor="end"
          className="font-mono-spec"
          fontSize="11"
          fill="var(--muted)"
          letterSpacing="0.06em"
        >
          TO ORDER
        </text>
        <text
          x="130"
          y="440"
          textAnchor="start"
          className="font-mono-spec"
          fontSize="11"
          fill="var(--muted)"
          letterSpacing="0.06em"
        >
          YOUR BOTTLE
        </text>
      </svg>

      {/* Bottom trigger action & cycle counter */}
      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={pressTrigger}
          className="inline-flex items-center gap-2 bg-[var(--blue)] text-[var(--btn-ink)] font-semibold text-sm px-4 py-2.5 rounded-[4px] hover:-translate-y-px active:translate-y-px transition-transform cursor-pointer"
        >
          <span>{hintLabel}</span>
        </button>

        <div className="font-mono-spec text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          <span>{strokesLabel}: </span>
          <strong className="text-[var(--red)] font-semibold">
            {String(strokes).padStart(3, '0')}
          </strong>
        </div>
      </div>
    </div>
  );
}
