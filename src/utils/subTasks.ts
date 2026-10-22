import type { SubTask } from '../types/index.ts';

/**
 * Generates a new subtask object with a unique id
 */
export function createSubTask(title: string): SubTask {
  return {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: title.trim(),
    isDone: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Appends a new subtask to a task object
 */
export function addSubTaskToTask<T extends { subTasks?: SubTask[] }>(task: T, title: string): T {
  const trimmed = title.trim();
  if (!trimmed) return task;
  const newSubTask = createSubTask(trimmed);
  return {
    ...task,
    subTasks: [...(task.subTasks || []), newSubTask],
  };
}

/**
 * Toggles a subtask's isDone boolean
 */
export function toggleSubTaskInTask<T extends { subTasks?: SubTask[] }>(
  task: T,
  subTaskId: string
): T {
  if (!task.subTasks) return task;
  return {
    ...task,
    subTasks: task.subTasks.map((st) =>
      st.id === subTaskId ? { ...st, isDone: !st.isDone } : st
    ),
  };
}

/**
 * Updates a subtask's title text
 */
export function updateSubTaskInTask<T extends { subTasks?: SubTask[] }>(
  task: T,
  subTaskId: string,
  newTitle: string
): T {
  const trimmed = newTitle.trim();
  if (!trimmed || !task.subTasks) return task;
  return {
    ...task,
    subTasks: task.subTasks.map((st) =>
      st.id === subTaskId ? { ...st, title: trimmed } : st
    ),
  };
}

/**
 * Removes a subtask from a task object
 */
export function deleteSubTaskFromTask<T extends { subTasks?: SubTask[] }>(
  task: T,
  subTaskId: string
): T {
  if (!task.subTasks) return task;
  return {
    ...task,
    subTasks: task.subTasks.filter((st) => st.id !== subTaskId),
  };
}

/**
 * Calculates completed count, total count, and completion ratio
 */
export function getSubTaskProgress(subTasks?: SubTask[]): {
  completed: number;
  total: number;
  ratio: number;
  allDone: boolean;
} {
  if (!subTasks || subTasks.length === 0) {
    return { completed: 0, total: 0, ratio: 0, allDone: false };
  }
  const completed = subTasks.filter((st) => st.isDone).length;
  const total = subTasks.length;
  return {
    completed,
    total,
    ratio: completed / total,
    allDone: completed === total && total > 0,
  };
}
