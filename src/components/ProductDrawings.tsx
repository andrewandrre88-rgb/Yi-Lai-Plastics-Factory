import type { CSSProperties } from 'react';

export type DrawingVariant =
  | 'trigger'
  | 'lotion'
  | 'mist'
  | 'foam'
  | 'caps'
  | 'other';

export function resolveDrawingVariant(categoryOrQuote: string): DrawingVariant {
  const val = categoryOrQuote.toLowerCase();
  if (val.includes('lotion') || val.includes('foundation')) return 'lotion';
  if (val.includes('mist')) return 'mist';
  if (val.includes('foam')) return 'foam';
  if (val.includes('cap')) return 'caps';
  if (val.includes('trigger') || val.includes('mini')) return 'trigger';
  return 'other';
}

interface ProductDrawingProps {
  variant: DrawingVariant;
  accentHex?: string;
  className?: string;
  label?: string;
}

export function ProductDrawing({
  variant,
  accentHex,
  className = 'w-24 h-32',
  label,
}: ProductDrawingProps) {
  const style = {
    '--part': accentHex || 'var(--blue)',
    '--part2': 'var(--red)',
  } as CSSProperties;

  return (
    <svg
      viewBox="0 0 120 160"
      className={className}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {variant === 'trigger' && (
        <>
          <rect x="14" y="30" width="14" height="14" rx="2" fill="var(--part2)" />
          <path d="M28 26H78Q92 26 92 40V62H64V48H28Z" fill="var(--part)" />
          <path d="M34 48H46L54 84Q55 89 50 89H47Q40 68 34 56Z" fill="var(--part2)" />
          <rect x="64" y="62" width="28" height="8" fill="var(--ink)" />
          <rect x="58" y="70" width="40" height="20" rx="2" fill="var(--part)" />
          <path
            d="M66 70V90M74 70V90M82 70V90M90 70V90"
            stroke="var(--surface)"
            strokeWidth="1.5"
            opacity=".5"
          />
          <line x1="78" y1="90" x2="78" y2="154" stroke="var(--ink)" strokeWidth="2" />
        </>
      )}

      {variant === 'lotion' && (
        <>
          <path d="M22 34Q22 22 34 22H80Q88 22 88 30V44H62V34H30V40H22Z" fill="var(--part)" />
          <rect x="68" y="44" width="10" height="14" fill="var(--ink)" />
          <rect x="54" y="58" width="38" height="8" rx="1" fill="var(--part2)" />
          <rect x="50" y="66" width="46" height="24" rx="2" fill="var(--part)" />
          <path
            d="M58 66V90M66 66V90M74 66V90M82 66V90M90 66V90"
            stroke="var(--surface)"
            strokeWidth="1.5"
            opacity=".5"
          />
          <line x1="73" y1="90" x2="73" y2="154" stroke="var(--ink)" strokeWidth="2" />
        </>
      )}

      {variant === 'mist' && (
        <>
          <circle cx="38" cy="34" r="2.5" fill="var(--part2)" />
          <circle cx="28" cy="28" r="2" fill="var(--part2)" />
          <circle cx="27" cy="40" r="2" fill="var(--part2)" />
          <circle cx="17" cy="34" r="1.5" fill="var(--part2)" />
          <rect x="50" y="24" width="26" height="20" rx="4" fill="var(--part)" />
          <circle cx="51" cy="34" r="2" fill="var(--ink)" />
          <rect x="60" y="44" width="6" height="10" fill="var(--ink)" />
          <rect x="48" y="54" width="30" height="6" rx="1" fill="var(--part2)" />
          <rect x="46" y="60" width="34" height="24" rx="2" fill="var(--part)" />
          <path
            d="M54 60V84M63 60V84M72 60V84"
            stroke="var(--surface)"
            strokeWidth="1.5"
            opacity=".5"
          />
          <line x1="63" y1="84" x2="63" y2="154" stroke="var(--ink)" strokeWidth="2" />
        </>
      )}

      {variant === 'foam' && (
        <>
          <path d="M20 36Q20 22 34 22H80Q90 22 90 32V50H58V38H30V44H20Z" fill="var(--part)" />
          <rect x="62" y="50" width="24" height="10" fill="var(--ink)" />
          <rect x="42" y="60" width="64" height="8" rx="1" fill="var(--part2)" />
          <rect x="38" y="68" width="72" height="26" rx="3" fill="var(--part)" />
          <path
            d="M48 68V94M58 68V94M68 68V94M78 68V94M88 68V94M98 68V94"
            stroke="var(--surface)"
            strokeWidth="1.5"
            opacity=".5"
          />
          <line x1="74" y1="94" x2="74" y2="154" stroke="var(--ink)" strokeWidth="2" />
        </>
      )}

      {variant === 'caps' && (
        <>
          <rect
            x="28"
            y="38"
            width="64"
            height="16"
            rx="5"
            fill="var(--part2)"
            transform="rotate(-32 92 66)"
          />
          <rect x="54" y="62" width="12" height="8" fill="var(--ink)" />
          <rect x="28" y="70" width="64" height="52" rx="5" fill="var(--part)" />
          <path
            d="M38 80V122M48 80V122M58 80V122M68 80V122M78 80V122"
            stroke="var(--surface)"
            strokeWidth="1.5"
            opacity=".5"
          />
        </>
      )}

      {variant === 'other' && (
        <>
          <rect
            x="26"
            y="30"
            width="68"
            height="100"
            rx="8"
            fill="none"
            stroke="var(--part)"
            strokeWidth="2.5"
            strokeDasharray="7 6"
          />
          <path
            d="M60 62V98M42 80H78"
            stroke="var(--part2)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
