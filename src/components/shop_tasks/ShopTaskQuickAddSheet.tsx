import React, { useState, useRef } from 'react';
import { FormSheet } from '../common/FormSheet.tsx';
import { resolveNextTimeOccurrence, formatTimeLabel } from '../../utils/dates.ts';
import { createSubTask } from '../../utils/subTasks.ts';
import type { SubTask } from '../../types/index.ts';
import { Clock, Plus, X, ListChecks } from 'lucide-react';

interface ShopTaskQuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (data: { title: string; dueAt?: string | null; subTasks?: SubTask[] }) => void;
}

export function ShopTaskQuickAddSheet({
  isOpen,
  onClose,
  onAddTask,
}: ShopTaskQuickAddSheetProps) {
  const [title, setTitle] = useState('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState('');
  const [subTaskTitles, setSubTaskTitles] = useState<string[]>([]);
  const [newSubTaskInput, setNewSubTaskInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const presetTimes = ['11:00', '14:00', '17:00', '20:00'];

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

    let dueAtIso: string | null = null;
    const timeToResolve = customTime || selectedTime;
    if (timeToResolve) {
      dueAtIso = resolveNextTimeOccurrence(timeToResolve);
    }

    const subTasks = subTaskTitles.map((t) => createSubTask(t));

    onAddTask({
      title: title.trim(),
      dueAt: dueAtIso,
      subTasks: subTasks.length > 0 ? subTasks : undefined,
    });

    // Rapid Entry: clear input, keep sheet open, keep focus!
    setTitle('');
    setSelectedTime(null);
    setCustomTime('');
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
      title="Quick Add Shop Task"
      subtitle="Sheet stays open for rapid batch entry"
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
              <span>Add Task</span>
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleAdd} className="space-y-4 text-xs">
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Task Description
          </label>
          <input
            ref={inputRef}
            type="text"
            required
            autoFocus
            placeholder="e.g. Bike Repair / Restock barcode labels"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
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

        {/* Due by time chips */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Due By (Optional)
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {presetTimes.map((time) => {
              const isSelected = selectedTime === time && !customTime;
              const resolvedLabel = formatTimeLabel(time);
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    setSelectedTime(isSelected ? null : time);
                    setCustomTime('');
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {resolvedLabel}
                </button>
              );
            })}

            <div className="flex items-center gap-1 ml-1">
              <Clock size={13} className="text-zinc-400" />
              <input
                type="time"
                value={customTime}
                onChange={(e) => {
                  setCustomTime(e.target.value);
                  setSelectedTime(null);
                }}
                className="px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs"
              />
            </div>
          </div>
        </div>
      </form>
    </FormSheet>
  );
}
