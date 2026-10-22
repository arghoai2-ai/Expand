import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ShopTaskTile } from './ShopTaskTile.tsx';
import { ShopTaskQuickAddSheet } from './ShopTaskQuickAddSheet.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { CheckSquare, Plus, ChevronDown, ChevronRight } from 'lucide-react';

export function ShopTasksScreen() {
  const {
    pendingShopTasks,
    doneShopTasksToday,
    addShopTask,
    updateShopTask,
    toggleShopTaskDone,
    cancelShopTask,
    deleteShopTask,
  } = useApp();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDoneSectionOpen, setIsDoneSectionOpen] = useState(true);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium">
          {pendingShopTasks.length} pending task{pendingShopTasks.length !== 1 ? 's' : ''}
        </span>
        <span>
          {doneShopTasksToday.length} completed today
        </span>
      </div>

      {/* Pending List */}
      {pendingShopTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="All shop tasks clear"
          description="Add quick operational tasks, dispatch duties, and time-bound shop reminders."
          actionLabel="+ Add Shop Task"
          onAction={() => setIsQuickAddOpen(true)}
        />
      ) : (
        <div className="space-y-2">
          {pendingShopTasks.map((task) => (
            <ShopTaskTile
              key={task.id}
              task={task}
              onToggleDone={() => toggleShopTaskDone(task.id)}
              onCancel={() => cancelShopTask(task.id)}
              onDelete={() => deleteShopTask(task.id)}
              onUpdateTitle={(newTitle) => updateShopTask({ ...task, title: newTitle })}
              onUpdateTask={updateShopTask}
            />
          ))}
        </div>
      )}

      {/* Collapsible Done Section */}
      {doneShopTasksToday.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsDoneSectionOpen(!isDoneSectionOpen)}
            className="w-full flex items-center justify-between py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              {isDoneSectionOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Done Today ({doneShopTasksToday.length})
            </span>
            <span className="text-[11px] font-normal text-zinc-400">
              {isDoneSectionOpen ? 'Hide' : 'Show'}
            </span>
          </button>

          {isDoneSectionOpen && (
            <div className="space-y-2 mt-1">
              {doneShopTasksToday.map((task) => (
                <ShopTaskTile
                  key={task.id}
                  task={task}
                  onToggleDone={() => toggleShopTaskDone(task.id)}
                  onCancel={() => cancelShopTask(task.id)}
                  onDelete={() => deleteShopTask(task.id)}
                  onUpdateTitle={(newTitle) => updateShopTask({ ...task, title: newTitle })}
                  onUpdateTask={updateShopTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        aria-label="Add shop task"
        onClick={() => setIsQuickAddOpen(true)}
        className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-30 w-13 h-13 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-zinc-400/40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Quick Add Sheet */}
      <ShopTaskQuickAddSheet
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={addShopTask}
      />
    </div>
  );
}
