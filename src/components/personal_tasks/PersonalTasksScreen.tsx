import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { PersonalTaskTile } from './PersonalTaskTile.tsx';
import { PersonalTaskQuickAddSheet } from './PersonalTaskQuickAddSheet.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { Sparkles, Plus, ChevronDown, ChevronRight } from 'lucide-react';

export function PersonalTasksScreen() {
  const {
    pendingPersonalTasks,
    donePersonalTasksToday,
    addPersonalTask,
    updatePersonalTask,
    togglePersonalTaskDone,
    deletePersonalTask,
  } = useApp();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDoneSectionOpen, setIsDoneSectionOpen] = useState(true);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium">
          {pendingPersonalTasks.length} pending target{pendingPersonalTasks.length !== 1 ? 's' : ''}
        </span>
        <span>
          {donePersonalTasksToday.length} completed today
        </span>
      </div>

      {/* Pending List */}
      {pendingPersonalTasks.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Daily routine and goals clear"
          description="Build daily momentum with habits, deep work blocks, personal errands, and wellness routines."
          actionLabel="+ Add Daily Target"
          onAction={() => setIsQuickAddOpen(true)}
        />
      ) : (
        <div className="space-y-2">
          {pendingPersonalTasks.map((task) => (
            <PersonalTaskTile
              key={task.id}
              task={task}
              onToggleDone={() => togglePersonalTaskDone(task.id)}
              onDelete={() => deletePersonalTask(task.id)}
              onUpdateTitle={(newTitle) => updatePersonalTask({ ...task, title: newTitle })}
              onUpdateTask={updatePersonalTask}
            />
          ))}
        </div>
      )}

      {/* Collapsible Done Section */}
      {donePersonalTasksToday.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsDoneSectionOpen(!isDoneSectionOpen)}
            className="w-full flex items-center justify-between py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              {isDoneSectionOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Completed Today ({donePersonalTasksToday.length})
            </span>
            <span className="text-[11px] font-normal text-zinc-400">
              {isDoneSectionOpen ? 'Hide' : 'Show'}
            </span>
          </button>

          {isDoneSectionOpen && (
            <div className="space-y-2 mt-1">
              {donePersonalTasksToday.map((task) => (
                <PersonalTaskTile
                  key={task.id}
                  task={task}
                  onToggleDone={() => togglePersonalTaskDone(task.id)}
                  onDelete={() => deletePersonalTask(task.id)}
                  onUpdateTitle={(newTitle) => updatePersonalTask({ ...task, title: newTitle })}
                  onUpdateTask={updatePersonalTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        aria-label="Add personal task"
        onClick={() => setIsQuickAddOpen(true)}
        className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-30 w-13 h-13 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-zinc-400/40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Quick Add Sheet */}
      <PersonalTaskQuickAddSheet
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={addPersonalTask}
      />
    </div>
  );
}
