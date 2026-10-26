import * as Dialog from '@radix-ui/react-dialog';
import { XIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { IconButton } from './Button';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
  /** Zone d'actions collée en bas du panneau. */
  footer?: ReactNode;
};

/** Panneau qui monte du bas de l'écran (Radix Dialog : focus piégé, Échap, lecteur d'écran). */
export function Sheet({ open, onOpenChange, title, closeLabel, children, footer }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40 bg-bg opacity-80"
          style={{ animation: 'fade-in var(--duration-base) var(--ease-heavy)' }}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] max-w-xl flex-col border-t border-border bg-surface"
          style={{ animation: 'sheet-in var(--duration-base) var(--ease-heavy)' }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
            <Dialog.Title className="font-display text-base font-bold uppercase tracking-display">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <IconButton label={closeLabel}>
                <XIcon size={22} />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
          {footer && (
            <div className="flex gap-3 border-t border-border px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
