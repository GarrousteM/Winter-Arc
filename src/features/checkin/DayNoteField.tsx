import { useId, useState } from 'react';
import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import { inputClass } from '@/ui/Field';
import { cn } from '@/lib/cn';
import type { ISODate } from '@/lib/types';

const t = copy.today;

/** Note optionnelle sur la journée, enregistrée en quittant le champ. Remonter avec `key={date}`. */
export function DayNoteField({ date }: { date: ISODate }) {
  const id = useId();
  const saved = useAppStore((s) => s.dayNotes.find((n) => n.date === date)?.text ?? '');
  const setDayNote = useAppStore((s) => s.setDayNote);
  const [text, setText] = useState(saved);
  const [justSaved, setJustSaved] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="eyebrow">
          {t.note}
        </label>
        {justSaved && <span className="text-xs text-success">{t.noteSaved}</span>}
      </div>
      <textarea
        id={id}
        rows={3}
        value={text}
        maxLength={500}
        placeholder={t.notePlaceholder}
        onChange={(e) => {
          setText(e.target.value);
          setJustSaved(false);
        }}
        onBlur={() => {
          if (text.trim() !== saved) {
            setDayNote(date, text);
            setJustSaved(true);
          }
        }}
        className={cn(inputClass, 'resize-none py-2 placeholder:text-muted')}
      />
    </div>
  );
}
