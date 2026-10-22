import React, { useState, useRef } from 'react';
import type { TaskKind, PersonalTask } from '../../types/index.ts';
import { FormSheet } from '../common/FormSheet.tsx';
import { createSubTask } from '../../utils/subTasks.ts';
import { Plus, Bell, ListChecks, X } from 'lucide-react';

interface PersonalTaskQuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (data: Omit<PersonalTask, 'id' | 'notifBase' | 'createdAt' | 'updatedAt' | 'completedAt'>) => void;
}

export function PersonalTaskQuickAddSheet({
  isOpen,
  onClose,
  onAddTask,
}: PersonalTaskQuickAddSheetProps) {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<TaskKind>('task');
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [reminderTime, setReminderTime] = useState('');
  const [subTaskTitles, setSubTaskTitles] = useState<string[]>([]);
  const [newSubTaskInput, setNewSubTaskInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKindSelect = (selectedKind: TaskKind) => {
    setKind(selectedKind);
    if (selectedKind === 'habit') {
      setRepeatDaily(true);
    }
  };

  const handleAddSubTaskItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSubTaskInput.trim();
    if (!trimmed) return;
    setSubTaskTitles((prev) => [...prev, trimmed]);
    setNewSubTaskInput('');
  };

  const handleRemoveSubTaskItem = (idx: number) => {
    setSubTaskTitles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const subTasks = subTaskTitles.map((t) => createSubTask(t));

    onAddTask({
      title: title.trim(),
      kind,
      repeatDaily,
      reminderAt: reminderTime || null,
      subTasks: subTasks.length > 0 ? subTasks : undefined,
    });

    // Rapid sequential entry: clear title, keep sheet open!
    setTitle('');
    setSubTaskTitles([]);
    setNewSubTaskInput('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Add Life Upgrade / Daily Routine"
      subtitle="Sheet stays open for rapid continuous logging"
      footer={
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">Press Enter or Add to save & continue</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => handleAdd()}
              disabled={!title.trim()}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add</span>
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleAdd} className="space-y-4 text-xs">
        {/* Title */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Activity / Target
          </label>
          <input
            ref={inputRef}
            type="text"
            required
            autoFocus
            placeholder="e.g. Bike Repair / Read 20 pages / 30m Deep Work"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        {/* Kind Chips: Task | Habit | Goal */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['task', 'habit', 'goal'] as TaskKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKindSelect(k)}
                className={`py-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                  kind === k
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Nested Sub-tasks Checklist during creation */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
            <ListChecks size={13} className="text-zinc-400" />
            <span>Checklist / Sub-tasks (Optional)</span>
          </label>

          {/* List of currently queued sub-tasks */}
          {subTaskTitles.length > 0 && (
            <div className="space-y-1.5 mb-2 pl-2 border-l-2 border-zinc-200 dark:border-zinc-800">
              {subTaskTitles.map((st, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 px-2 py-1 rounded-md bg-zinc-100/70 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 text-xs"
                >
                  <span className="truncate">{st}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubTaskItem(i)}
                    className="text-zinc-400 hover:text-rose-500 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input for adding new subtask */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newSubTaskInput}
              onChange={(e) => setNewSubTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubTaskItem();
                }
              }}
              placeholder="Add sub-task item (Press Enter to append)"
              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <button
              type="button"
              onClick={handleAddSubTaskItem}
              disabled={!newSubTaskInput.trim()}
              className="px-2.5 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              + Item
            </button>
          </div>
        </div>

        {/* Reminder Time & Repeat Daily Switch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Reminder Time (Optional)
            </label>
            <div className="flex items-center gap-1.5">
              <Bell size={14} className="text-zinc-400 shrink-0" />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start sm:gap-3 sm:pt-5">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Repeat Daily
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={repeatDaily}
                onChange={(e) => setRepeatDaily(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100"></div>
            </label>
          </div>
        </div>
      </form>
    </FormSheet>
  );
}
