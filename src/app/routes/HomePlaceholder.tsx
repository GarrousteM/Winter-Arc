import { Link } from 'react-router-dom';
import { copy } from '@/copy';
import { KnotDivider } from '@/ui/KnotDivider';
import { RuneRow } from '@/ui/Rune';
import { SnowField } from '@/ui/SnowField';

export function HomePlaceholder() {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
      <SnowField />
      <RuneRow />
      <h1 className="text-3xl font-black">{copy.app.name}</h1>
      <KnotDivider className="w-full" />
      <p className="text-muted">{copy.placeholder.body}</p>
      <Link
        to="/styleguide"
        className="inline-flex min-h-touch items-center rounded border border-accent px-5 font-display text-sm font-bold uppercase tracking-display text-accent"
      >
        {copy.placeholder.toStyleguide}
      </Link>
    </main>
  );
}
