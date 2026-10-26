import { ArchiveIcon } from '@phosphor-icons/react';
import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import type { Goal } from '@/lib/types';
import { Button } from '@/ui/Button';
import { Sheet } from '@/ui/Sheet';
import { GoalForm } from './GoalForm';
import type { GoalDraft } from './goalModel';

export type GoalSheetTarget = { mode: 'new'; categoryId: string } | { mode: 'edit'; goal: Goal };

type GoalEditSheetProps = {
  target: GoalSheetTarget | null;
  onClose: () => void;
  /** Appelé après l'archivage (ex. pour quitter la page de détail). */
  onArchived?: () => void;
};

/** Création ou édition d'un objectif dans un panneau bas, avec archivage. */
export function GoalEditSheet({ target, onClose, onArchived }: GoalEditSheetProps) {
  const categories = useAppStore((s) => s.categories);
  const addGoal = useAppStore((s) => s.addGoal);
  const updateGoal = useAppStore((s) => s.updateGoal);
  const setGoalStatus = useAppStore((s) => s.setGoalStatus);
  const active = categories.filter((c) => !c.archived).sort((a, b) => a.order - b.order);

  const save = (draft: GoalDraft) => {
    if (!target) return;
    if (target.mode === 'new') addGoal(draft);
    else updateGoal(target.goal.id, { ...draft, tag: target.goal.tag });
    onClose();
  };

  return (
    <Sheet
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={target?.mode === 'edit' ? copy.goalForm.editTitle : copy.goalForm.newTitle}
      closeLabel={copy.goalForm.close}
      footer={
        <>
          {target?.mode === 'edit' && (
            <Button
              variant="danger"
              icon={<ArchiveIcon size={18} />}
              onClick={() => {
                setGoalStatus(target.goal.id, 'archived');
                onClose();
                onArchived?.();
              }}
            >
              {copy.goals.archive}
            </Button>
          )}
          <Button block type="submit" form="goal-form" className="flex-1">
            {target?.mode === 'edit' ? copy.goalForm.save : copy.goalForm.create}
          </Button>
        </>
      }
    >
      {target && (
        <div className="flex flex-col gap-4">
          <GoalForm
            key={target.mode === 'edit' ? target.goal.id : `new-${target.categoryId}`}
            formId="goal-form"
            editing={target.mode === 'edit'}
            categories={active}
            initial={
              target.mode === 'edit'
                ? target.goal
                : {
                    title: '',
                    categoryId: target.categoryId,
                    type: 'boolean',
                    frequency: { kind: 'daily' },
                    difficulty: 2,
                  }
            }
            onSubmit={save}
          />
          {target.mode === 'edit' && (
            <p className="m-0 text-sm text-muted">{copy.goals.historyKept}</p>
          )}
        </div>
      )}
    </Sheet>
  );
}
