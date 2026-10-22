import React, { useState, useRef, useEffect } from 'react';
import type { PersonalTask } from '../../types/index.ts';
import { CheckCircle } from '../common/CheckCircle.tsx';
import { formatTimeLabel } from '../../utils/dates.ts';
import { SubTaskList } from '../common/SubTaskList.tsx';
import {
  addSubTaskToTask,
  toggleSubTaskInTask,
  updateSubTaskInTask,
  deleteSubTaskFromTask,
} from '../../utils/subTasks.ts';
import { Trash2, Repeat, Edit3, Check, X } from 'lucide-react';
import { getTodayDate } from '../../utils/dates.ts';

interface PersonalTaskTileProps {
  task: PersonalTask;
  onToggleDone: () => void;
  onDelete: () => void;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateTask?: (updated: PersonalTask) => void;
}

export function PersonalTaskTile({
  task,
  onToggleDone,
  onDelete,
  onUpdateTitle,
  onUpdateTask,
}: PersonalTaskTileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = getTodayDate();
  const isCompleted = task.repeatDaily
    ? !!(task.completedAt && task.completedAt.startsWith(today))
    : !!task.completedAt;

  const kindBadgeMap = {
    task: { label: 'Task', bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' },
    habit: { label: 'Habit', bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' },
    goal: { label: 'Goal', bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' },
  }[task.kind];

  useEffect(() => {
    if (isEditing) {
      setEditTitle(task.title);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isEditing, task.title]);

  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdateTitle(trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title);
    }
  };

  return (
    <div
      className={`p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all space-y-1.5 shadow-2xs group ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      {/* Main Task Header Row */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {!isEditing && (
            <CheckCircle
              checked={isCompleted}
              onToggle={onToggleDone}
              ariaLabel={`Mark personal ${task.kind} "${task.title}" as ${isCompleted ? 'pending' : 'completed'}`}
            />
          )}

          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="flex items-center gap-1.5 w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2.5 py-1 text-xs sm:text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
                <button
                  type="button"
                  aria-label="Save title"
                  onClick={handleSave}
                  className="p-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-all shrink-0"
                >
                  <Check size={13} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  aria-label="Cancel editing"
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(task.title);
                  }}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div>
                <span
                  className={`text-xs sm:text-sm font-medium block truncate ${
                    isCompleted
                      ? 'line-through text-zinc-400 dark:text-zinc-500'
                      : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {task.title}
                </span>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded-md ${kindBadgeMap.bg}`}>
                    {kindBadgeMap.label}
                  </span>

                  {task.repeatDaily && (
                    <span className="text-[10px] text-zinc-400 flex items-center gap-0.5 font-medium">
                      <Repeat size={10} /> Daily
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1.5 shrink-0">
            {task.reminderAt && (
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                {formatTimeLabel(task.reminderAt)}
              </span>
            )}

            {/* Inline Edit/Modify Button */}
            <button
              type="button"
              aria-label={`Edit task "${task.title}"`}
              onClick={() => setIsEditing(true)}
              title="Edit / Modify task"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Edit3 size={14} />
            </button>

            {/* One-click direct Delete Button */}
            <button
              type="button"
              aria-label={`Delete task "${task.title}"`}
              onClick={onDelete}
              title="Delete task"
              className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Sub-tasks Nested Checklist */}
      <SubTaskList
        subTasks={task.subTasks}
        onAddSubTask={(subTitle) => {
          if (onUpdateTask) {
            onUpdateTask(addSubTaskToTask(task, subTitle));
          }
        }}
        onToggleSubTask={(stId) => {
          if (onUpdateTask) {
            onUpdateTask(toggleSubTaskInTask(task, stId));
          }
        }}
        onUpdateSubTask={(stId, newText) => {
          if (onUpdateTask) {
            onUpdateTask(updateSubTaskInTask(task, stId, newText));
          }
        }}
        onDeleteSubTask={(stId) => {
          if (onUpdateTask) {
            onUpdateTask(deleteSubTaskFromTask(task, stId));
          }
        }}
        disabled={isCompleted}
      />
    </div>
  );
}
