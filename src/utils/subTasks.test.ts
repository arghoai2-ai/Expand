import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSubTask,
  addSubTaskToTask,
  toggleSubTaskInTask,
  updateSubTaskInTask,
  deleteSubTaskFromTask,
  getSubTaskProgress,
} from './subTasks.ts';
import type { ShopTask } from '../types/index.ts';

test('createSubTask generates subtask with false isDone and unique id', () => {
  const st = createSubTask('Replace brake pads');
  assert.equal(st.title, 'Replace brake pads');
  assert.equal(st.isDone, false);
  assert.ok(st.id.startsWith('sub_'));
});

test('addSubTaskToTask appends to existing task and handles empty subTasks', () => {
  const task: ShopTask = {
    id: 'st_1',
    title: 'Bike Repair',
    status: 'pending',
    notifBase: 123,
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21',
  };

  const updated1 = addSubTaskToTask(task, 'Check tire pressure');
  assert.equal(updated1.subTasks?.length, 1);
  assert.equal(updated1.subTasks[0].title, 'Check tire pressure');
  assert.equal(updated1.subTasks[0].isDone, false);

  const updated2 = addSubTaskToTask(updated1, 'Oil chain');
  assert.equal(updated2.subTasks?.length, 2);
  assert.equal(updated2.subTasks[1].title, 'Oil chain');
});

test('toggleSubTaskInTask flips isDone boolean individually', () => {
  const task: ShopTask = {
    id: 'st_1',
    title: 'Bike Repair',
    status: 'pending',
    notifBase: 123,
    subTasks: [
      { id: 'sub_1', title: 'Check tire pressure', isDone: false },
      { id: 'sub_2', title: 'Oil chain', isDone: false },
    ],
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21',
  };

  const toggled = toggleSubTaskInTask(task, 'sub_1');
  assert.equal(toggled.subTasks?.[0].isDone, true);
  assert.equal(toggled.subTasks?.[1].isDone, false);

  const toggledBack = toggleSubTaskInTask(toggled, 'sub_1');
  assert.equal(toggledBack.subTasks?.[0].isDone, false);
});

test('updateSubTaskInTask modifies text of matching subtask', () => {
  const task: ShopTask = {
    id: 'st_1',
    title: 'Bike Repair',
    status: 'pending',
    notifBase: 123,
    subTasks: [{ id: 'sub_1', title: 'Check tires', isDone: false }],
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21',
  };

  const updated = updateSubTaskInTask(task, 'sub_1', 'Check tires and tubes');
  assert.equal(updated.subTasks?.[0].title, 'Check tires and tubes');
});

test('deleteSubTaskFromTask removes matching subtask', () => {
  const task: ShopTask = {
    id: 'st_1',
    title: 'Bike Repair',
    status: 'pending',
    notifBase: 123,
    subTasks: [
      { id: 'sub_1', title: 'Check tires', isDone: false },
      { id: 'sub_2', title: 'Oil chain', isDone: false },
    ],
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21',
  };

  const deleted = deleteSubTaskFromTask(task, 'sub_1');
  assert.equal(deleted.subTasks?.length, 1);
  assert.equal(deleted.subTasks[0].id, 'sub_2');
});

test('getSubTaskProgress computes correct counts and ratio', () => {
  const p0 = getSubTaskProgress(undefined);
  assert.equal(p0.total, 0);
  assert.equal(p0.completed, 0);
  assert.equal(p0.allDone, false);

  const p1 = getSubTaskProgress([
    { id: '1', title: 'A', isDone: true },
    { id: '2', title: 'B', isDone: false },
    { id: '3', title: 'C', isDone: true },
  ]);
  assert.equal(p1.total, 3);
  assert.equal(p1.completed, 2);
  assert.equal(p1.ratio, 2 / 3);
  assert.equal(p1.allDone, false);

  const p2 = getSubTaskProgress([
    { id: '1', title: 'A', isDone: true },
    { id: '2', title: 'B', isDone: true },
  ]);
  assert.equal(p2.allDone, true);
});
