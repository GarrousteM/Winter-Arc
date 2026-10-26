import { copy } from '@/copy';
import { RuneRow } from '@/ui/Rune';

const p = copy.placeholder;

function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-6 pt-10 text-center">
      <RuneRow />
      <h1 className="text-2xl font-black">{title}</h1>
      <p className="m-0 text-muted">{body}</p>
    </div>
  );
}

export function ProgressPlaceholder() {
  return <ComingSoon title={copy.nav.progress} body={p.progress} />;
}
