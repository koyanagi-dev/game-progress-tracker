import { useState, useEffect } from "react";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";

// 状態の並び順（既存仕様）
const STATUSES = ["not-started", "in-progress", "completed", "on-hold"];

// localStorage のキー
const STORAGE_KEY = "game-progress-tracker-tasks";

// 🟦 初期タスクを localStorage から読み込む関数
const loadInitialTasks = () => {
  if (typeof window === "undefined") {
    // テスト環境やSSR対策（jsdomでは window ありなので通る）
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // 古いバージョンのデータでも落ちないように補正
    return parsed.map((task) => ({
      ...task,
      status: task.status || "not-started",
      category: task.category || "メインクエスト",
      memo: task.memo ?? "",
      isEditing: false, // 編集中フラグは必ずリセット
    }));
  } catch (e) {
    console.error("タスク読み込みに失敗しました", e);
    return [];
  }
};

// カテゴリ候補（v1）
const CATEGORY_OPTIONS = [
  "メインクエスト",
  "サブクエスト",
  "装備・アイテム収集",
  "レベル上げ・育成",
  "素材集め",
  "ボス攻略",
  "その他",
];

function App() {
  // タスク本体（挿入順を保持）
  const [tasks, setTasks] = useState(loadInitialTasks);

  // 並べ替え状態（asc / desc / null）
  const [sortOrder, setSortOrder] = useState(null);

  // 並び順を固定するための ID リスト（B仕様対応）
  const [sortedIds, setSortedIds] = useState(null);

  // カテゴリフィルタ（"ALL" または カテゴリ名）
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // 直前に削除したタスク（1件だけ保持）
  // { task: タスクオブジェクト, index: 元の位置 } という形で持つ
  const [lastDeleted, setLastDeleted] = useState(null);

  // 🟦 タスクが変更されるたびに localStorage に保存
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error("タスク保存に失敗しました", e);
    }
  }, [tasks]);

  // 🔹 タスク追加（カテゴリ付き）
  const addTask = (text, category, memo) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newTask = {
      id: Date.now(),
      text: trimmed,
      status: "not-started",
      isEditing: false,
      category: category || "その他",
      memo: memo || "",
    };

    setTasks((prev) => [...prev, newTask]);
  };

  // 🔹 状態変更（ローテーション）
  const handleStatusChange = (id) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const currentIndex = STATUSES.indexOf(task.status);
        const nextIndex = (currentIndex + 1) % STATUSES.length;
        return { ...task, status: STATUSES[nextIndex] };
      })
    );
  };

  // 🟦 削除（直前1件を lastDeleted に保存）
  const handleDeleteTask = (id) => {
    setTasks((prev) => {
      const index = prev.findIndex((task) => task.id === id);
      if (index === -1) {
        return prev;
      }

      const deletedTask = prev[index];
      const next = [...prev];
      next.splice(index, 1);

      // 直前に削除したタスクを記録しておく
      setLastDeleted({ task: deletedTask, index });

      return next;
    });
  };

  // 🟦 削除取り消し（Undo）
  const handleUndoDelete = () => {
    if (!lastDeleted) return;

    setTasks((prev) => {
      // 元の index を超える場合は末尾として扱う
      const insertIndex = Math.min(lastDeleted.index, prev.length);

      const next = [...prev];
      next.splice(insertIndex, 0, lastDeleted.task);
      return next;
    });

    // 一度復元したら履歴をクリア
    setLastDeleted(null);
  };

  // 🔹 編集開始
  const startEdit = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isEditing: true } : task
      )
    );
  };

  // 🔹 編集キャンセル
  const cancelEdit = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isEditing: false } : task
      )
    );
  };

  // 🟦 編集保存（タイトル＋メモ更新）
  const saveEdit = (id, newText, newMemo) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;

        const trimmed = (newText ?? "").trim();

        // タイトルが空文字の場合：
        if (!trimmed) {
          // タイトルはそのまま、メモだけ更新（あれば）
          return {
            ...task,
            memo: newMemo ?? task.memo ?? "",
            isEditing: false,
          };
        }

        // 通常ケース：タイトルもメモも更新
        return {
          ...task,
          text: trimmed,
          memo: newMemo ?? task.memo ?? "",
          isEditing: false,
        };
      })
    );
  };

  // 🔹 並べ替えボタンを押したときの処理（B仕様対応）
  const applySort = (order) => {
    if (!order) {
      // 並べ替え解除
      setSortOrder(null);
      setSortedIds(null);
      return;
    }

    setSortOrder(order);

    setSortedIds((prevIds) => {
      const tasksById = new Map(tasks.map((t) => [t.id, t]));

      // 以前の並びをできるだけ維持しつつ、新しいタスクも加味する
      let baseList;
      if (prevIds && prevIds.length) {
        const fromPrev = prevIds
          .map((id) => tasksById.get(id))
          .filter(Boolean);
        const remaining = tasks.filter((t) => !prevIds.includes(t.id));
        baseList = [...fromPrev, ...remaining];
      } else {
        baseList = [...tasks];
      }

      // 状態に基づいて一度だけソート（以後ステータス変更しても順番は固定）
      const sorted = [...baseList].sort((a, b) => {
        const diff =
          STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status);
        return order === "asc" ? diff : -diff;
      });

      return sorted.map((t) => t.id);
    });
  };

  // 🔹 並び順を決めたタスク一覧を取得（ソートのみ考慮）
  const getSortedTasks = () => {
    if (!sortOrder || !sortedIds) {
      // 並べ替え無し：挿入順のまま
      return tasks;
    }

    const tasksById = new Map(tasks.map((t) => [t.id, t]));

    // sortedIds に基づいて並べる
    const ordered = sortedIds
      .map((id) => tasksById.get(id))
      .filter(Boolean);

    // 並べ替え後に追加されたタスクがあれば、末尾に追加
    const remaining = tasks.filter((t) => !sortedIds.includes(t.id));

    return [...ordered, ...remaining];
  };

  // 🔹 カテゴリフィルタを適用
  const filterTasksByCategory = (taskList) => {
    if (categoryFilter === "ALL") return taskList;

    return taskList.filter((task) => {
      const category = task.category || "その他";
      return category === categoryFilter;
    });
  };

  // 画面に表示する最終的なタスクリスト
  const visibleTasks = filterTasksByCategory(getSortedTasks());

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f0f8ff, #e6f7ff)",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "20px",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        🎮 Game Progress Tracker
      </h1>

      {/* タスク追加フォーム（カテゴリ選択付き） */}
      <TaskInput onAddTask={addTask} categoryOptions={CATEGORY_OPTIONS} />

      {/* 並べ替えボタン */}
      <div style={{ marginTop: "10px", textAlign: "center", gap: "10px" }}>
        <button
          onClick={() => applySort("asc")}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#90caf9",
            cursor: "pointer",
            marginRight: "5px",
          }}
        >
          状態の昇順（未着手 → 保留）
        </button>
        <button
          onClick={() => applySort("desc")}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#90caf9",
            cursor: "pointer",
            marginRight: "5px",
          }}
        >
          状態の降順（保留 → 未着手）
        </button>
        <button
          onClick={() => applySort(null)}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#e0e0e0",
            cursor: "pointer",
          }}
        >
          並べ替え解除
        </button>
      </div>

      {/* 🟦 削除取り消し（Undo）ボタン */}
      <div style={{ marginTop: "8px", textAlign: "center" }}>
        <button
          onClick={handleUndoDelete}
          disabled={!lastDeleted}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: lastDeleted ? "#a5d6a7" : "#e0e0e0",
            cursor: lastDeleted ? "pointer" : "not-allowed",
          }}
        >
          削除を取り消す
        </button>
        {lastDeleted && (
          <div
            style={{
              fontSize: "12px",
              marginTop: "4px",
              color: "#555",
            }}
          >
            直前に削除したタスク: 「{lastDeleted.task.text}」
          </div>
        )}
      </div>

      {/* カテゴリフィルタ */}
      <div
        style={{
          marginTop: "10px",
          textAlign: "center",
        }}
      >
        <label
          style={{
            fontSize: "14px",
          }}
        >
          カテゴリ絞り込み：
          <select
            aria-label="カテゴリ絞り込み"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              marginLeft: "8px",
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="ALL">すべて</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* タスク一覧 */}
      <TaskList
        tasks={visibleTasks}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTask}
        onEditStart={startEdit}
        onEditCancel={cancelEdit}
        onEditSave={saveEdit}
      />
    </div>
  );
}

export default App;
