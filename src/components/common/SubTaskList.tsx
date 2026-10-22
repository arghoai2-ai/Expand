import React, { useState, useRef, useEffect } from 'react';
import type { SubTask } from '../../types/index.ts';
import { CheckCircle } from './CheckCircle.tsx';
import { getSubTaskProgress } from '../../utils/subTasks.ts';
import { ListChecks, ChevronDown, ChevronRight, Plus, Trash2, Edit3, Check, X } from 'lucide-react';

interface SubTaskListProps {
  subTasks?: SubTask[];
  onAddSubTask: (title: string) => void;
  onToggleSubTask: (id: string) => void;
  onUpdateSubTask: (id: string, newTitle: string) => void;
  onDeleteSubTask: (id: string) => void;
  disabled?: boolean;
}

export function SubTaskList({
  subTasks = [],
  onAddSubTask,
  onToggleSubTask,
  onUpdateSubTask,
  onDeleteSubTask,
  disabled = false,
}: SubTaskListProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(subTasks.length > 0);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const progress = getSubTaskProgress(subTasks);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onAddSubTask(trimmed);
    setNewTitle('');
    setTimeout(() => {
      addInputRef.current?.focus();
    }, 50);
  };

  const startEdit = (st: SubTask) => {
    setEditingId(st.id);
    setEditText(st.title);
  };

  const saveEdit = (id: string) => {
    const trimmed = editText.trim();
    if (trimmed) {
      onUpdateSubTask(id, trimmed);
    }
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="w-full pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60 mt-1">
      {/* Header bar: Checklist toggle button */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 py-1 px-1.5 -ml-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse sub-tasks' : 'Expand sub-tasks'}
        >
          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <ListChecks size={13} className="text-zinc-400" />
          <span className="font-semibold text-[11px]">
            {subTasks.length > 0
              ? `${progress.completed}/${progress.total} Checklist`
              : 'Add Sub-tasks'}
          </span>
        </button>

        {subTasks.length > 0 && (
          <div className="flex items-center gap-1.5">
            {/* Minimal Progress Bar */}
            <div className="w-16 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progress.allDone
                    ? 'bg-emerald-500'
                    : 'bg-zinc-800 dark:bg-zinc-200'
                }`}
                style={{ width: `${progress.ratio * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {Math.round(progress.ratio * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Expandable Sub-tasks Body */}
      {isExpanded && (
        <div className="space-y-1.5 mt-2 pl-2 sm:pl-3 border-l-2 border-zinc-200 dark:border-zinc-800">
          {/* Sub-task Items */}
          {subTasks.map((st) => {
            const isEditing = editingId === st.id;
            return (
              <div
                key={st.id}
                className="group flex items-center justify-between gap-2 py-1 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Individual subtask checkbox */}
                  {!isEditing && (
                    <CheckCircle
                      checked={st.isDone}
                      onToggle={() => !disabled && onToggleSubTask(st.id)}
                      ariaLabel={`Mark subtask "${st.title}" as ${st.isDone ? 'pending' : 'done'}`}
                      size="sm"
                    />
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveEdit(st.id);
                          } else if (e.key === 'Escape') {
                            setEditingId(null);
                          }
                        }}
                        className="w-full px-2 py-0.5 text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                      />
                      <button
                        type="button"
                        aria-label="Save subtask text"
                        onClick={() => saveEdit(st.id)}
                        className="p-1 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-all shrink-0"
                      >
                        <Check size={11} strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        aria-label="Cancel editing subtask"
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => !disabled && onToggleSubTask(st.id)}
                      className={`truncate cursor-pointer select-none ${
                        st.isDone
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'text-zinc-800 dark:text-zinc-200 font-medium'
                      }`}
                    >
                      {st.title}
                    </span>
                  )}
                </div>

                {/* Subtask Action Buttons: Inline Edit & Delete */}
                {!isEditing && !disabled && (
                  <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      aria-label={`Edit subtask "${st.title}"`}
                      onClick={() => startEdit(st)}
                      title="Edit sub-task"
                      className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete subtask "${st.title}"`}
                      onClick={() => onDeleteSubTask(st.id)}
                      title="Delete sub-task"
                      className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Dynamic Fast-Add Sub-task Row */}
          {!disabled && (
            <form onSubmit={handleAdd} className="flex items-center gap-1.5 pt-1">
              <input
                ref={addInputRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Add new sub-task... (Press Enter)"
                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-solid focus:ring-1 focus:ring-zinc-400"
              />
              <button
                type="submit"
                disabled={!newTitle.trim()}
                aria-label="Add subtask"
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shrink-0"
              >
                <Plus size={12} strokeWidth={2.5} />
                <span>Add</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
