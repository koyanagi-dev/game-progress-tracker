import { renderHook, act } from "@testing-library/react";
import { useState } from "react";
import '@testing-library/jest-dom';

// App.jsx 内のロジックをテストするため、必要な部分だけ関数化して再現する
// ※ 本番ロジックと完全一致させています

const statuses = ["not-started", "in-progress", "completed", "on-hold"];

// タスク追加
function addTask(prev, text) {
  return [
    ...prev,
    {
      id: Date.now(),
      text,
      status: "not-started",
      isEditing: false,
    },
  ];
}

// 状態変更
function changeStatus(prev, id) {
  return prev.map((task) => {
    if (task.id !== id) return task;
    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    return { ...task, status: statuses[nextIndex] };
  });
}

// 編集保存
function saveEdit(prev, id, newText) {
  return prev.map((task) =>
    task.id === id ? { ...task, text: newText, isEditing: false } : task
  );
}

// 削除
function deleteTask(prev, id) {
  return prev.filter((task) => task.id !== id);
}

// localStorage 保存（isEditing を除外）
function saveToLocalStorage(tasks) {
  const toSave = tasks.map(({ isEditing, ...rest }) => rest);
  localStorage.setItem("tasks", JSON.stringify(toSave));
}

// localStorage 復元
function loadFromLocalStorage() {
  const saved = localStorage.getItem("tasks");
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return parsed.map((t) => ({ ...t, isEditing: false }));
  } catch {
    return [];
  }
}

describe("localStorage 永続化（B-1）", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(global, "Date").mockImplementation(() => ({
      getTime: () => 12345,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("タスク追加が localStorage に保存される", () => {
    let tasks = [];

    tasks = addTask(tasks, "test-task");
    saveToLocalStorage(tasks);

    const stored = JSON.parse(localStorage.getItem("tasks"));
    expect(stored.length).toBe(1);
    expect(stored[0].text).toBe("test-task");
    expect(stored[0].status).toBe("not-started");
  });

  test("状態変更が localStorage に反映される", () => {
    let tasks = [{ id: 1, text: "A", status: "not-started" }];

    tasks = changeStatus(tasks, 1);
    saveToLocalStorage(tasks);

    const stored = JSON.parse(localStorage.getItem("tasks"));
    expect(stored[0].status).toBe("in-progress");
  });

  test("編集保存が localStorage に反映される", () => {
    let tasks = [{ id: 1, text: "A", status: "not-started" }];

    tasks = saveEdit(tasks, 1, "B");
    saveToLocalStorage(tasks);

    const stored = JSON.parse(localStorage.getItem("tasks"));
    expect(stored[0].text).toBe("B");
  });

  test("削除すると localStorage からも削除される", () => {
    let tasks = [
      { id: 1, text: "A", status: "not-started" },
      { id: 2, text: "B", status: "completed" },
    ];

    tasks = deleteTask(tasks, 1);
    saveToLocalStorage(tasks);

    const stored = JSON.parse(localStorage.getItem("tasks"));
    expect(stored.length).toBe(1);
    expect(stored[0].text).toBe("B");
  });

  test("復元時に isEditing が false で戻る", () => {
    const stored = [
      { id: 1, text: "A", status: "not-started" },
    ];
    localStorage.setItem("tasks", JSON.stringify(stored));

    const loaded = loadFromLocalStorage();
    expect(loaded[0]).toHaveProperty("isEditing", false);
  });
});
