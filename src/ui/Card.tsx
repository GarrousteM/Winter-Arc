import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'plain' | 'raised';
  accentToken?: string;
};

/** Carte simple : surface, filet de 1 px, aucune ombre. Filet gauche optionnel en couleur de catégorie. */
export function Card({ variant = 'plain', accentToken, className, style, ...rest }: CardProps) {
  const accentStyle: CSSProperties | undefined = accentToken
    ? { borderLeftColor: `var(${accentToken})` }
    : undefined;
  return (
    <div
      className={cn(
        'rounded border border-border p-4',
        variant === 'raised' ? 'bg-surface-raised' : 'bg-surface',
        accentToken && 'border-l-rule',
        className,
      )}
      style={{ ...accentStyle, ...style }}
      {...rest}
    />
  );
}

type CarvedCardProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Couleur des filets, sous forme de token CSS. */
  ruleToken?: string;
};

// Décalages successifs des calques : filet 1 px, écart, filet 1 px.
const NOTCH_FACTOR = 0.586;

function layerStyle(offsetPx: string, background: string): CSSProperties {
  return {
    ['--n' as string]: `calc(var(--notch) - ${NOTCH_FACTOR} * ${offsetPx})`,
    background,
  };
}

/**
 * Carte clé (niveau, boss, badges) : double filet avec coins coupés via clip-path.
 * Empilement de calques octogonaux, chacun réduit pour garder des diagonales d'épaisseur constante.
 */
export function CarvedCard({
  children,
  className,
  innerClassName,
  ruleToken = '--color-border',
}: CarvedCardProps) {
  const rule = `var(${ruleToken})`;
  const surface = 'var(--color-surface)';
  return (
    <div
      className={cn('notched p-px', className)}
      style={{ ['--n' as string]: 'var(--notch)', background: rule }}
    >
      <div
        className="notched"
        style={{ ...layerStyle('var(--border-width)', surface), padding: 'var(--double-rule-gap)' }}
      >
        <div
          className="notched p-px"
          style={layerStyle('calc(var(--border-width) + var(--double-rule-gap))', rule)}
        >
          <div
            className={cn('notched p-4', innerClassName)}
            style={layerStyle('calc(2 * var(--border-width) + var(--double-rule-gap))', surface)}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
