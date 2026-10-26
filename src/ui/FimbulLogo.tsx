import { useId } from 'react';

/** Logo Fimbul : la tête de Fenrir (boss final) devant le soleil noir, version simplifiée de sa gravure. */
export function FimbulLogo({ size = 64 }: { size?: number }) {
  const id = `${useId().replace(/:/g, '')}-glow`;
  const glow = `url(#${id})`;
  return (
    <svg width={size} height={size} viewBox="20 12 160 172" aria-hidden="true">
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.6" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        <circle cx="100" cy="92" r="76" stroke="var(--color-frost-deep)" strokeWidth="3.5" />
        <path
          d="M100 176 L76 160 L56 150 L60 142 L40 132 L50 124 L36 108 L52 104 L46 88 L60 86 L58 72 L84 66 L100 64 L116 66 L142 72 L140 86 L154 88 L148 104 L164 108 L150 124 L160 132 L140 142 L144 150 L124 160 Z"
          fill="var(--color-surface-raised)"
          stroke="var(--color-frost)"
          strokeWidth="3"
        />
        <path
          d="M84 66 L62 26 L58 84 Z M116 66 L138 26 L142 84 Z"
          fill="var(--color-surface)"
          stroke="var(--color-frost)"
          strokeWidth="3.5"
        />
        <path
          d="M77 63 L66 42 L65 75 Z M123 63 L134 42 L135 75 Z"
          fill="var(--color-frost-deep)"
          stroke="none"
        />
        <path
          d="M84 66 Q100 58 116 66 L140 86 L146 106 L132 124 L120 150 L100 164 L80 150 L68 124 L54 106 L60 86 Z"
          fill="var(--color-surface)"
          stroke="var(--color-frost)"
          strokeWidth="3.5"
        />
        <path
          d="M90 100 L100 96 L110 100 L114 134 L100 146 L86 134 Z"
          fill="var(--color-surface-raised)"
          stroke="var(--color-frost)"
          strokeWidth="3"
        />
        <path
          d="M93 127 L107 127 L100 135 Z"
          fill="var(--color-bg)"
          stroke="var(--color-text)"
          strokeWidth="2.5"
        />
        <path
          d="M86 140 Q100 158 114 140"
          fill="var(--color-bg)"
          stroke="var(--color-frost)"
          strokeWidth="3"
        />
        <path
          d="M90 143 L92.5 153 L95.5 146 Z M110 143 L107.5 153 L104.5 146 Z"
          fill="var(--color-text)"
          stroke="var(--color-text)"
          strokeWidth="1.5"
        />
        <path d="M64 89 L92 98 M136 89 L108 98" stroke="var(--color-text)" strokeWidth="4" />
        <circle cx="82" cy="100" r="10" fill={glow} stroke="none" />
        <circle cx="118" cy="100" r="10" fill={glow} stroke="none" />
        <path
          d="M72 97 L91 101.5 L77 104.5 Z M128 97 L109 101.5 L123 104.5 Z"
          fill="var(--color-accent)"
          stroke="var(--color-accent)"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}
