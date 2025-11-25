import { useState } from "react";

// 状態を日本語に変換する関数
const statusToLabel = (status) => {
  switch (status) {
    case "not-started":
      return "未着手";
    case "in-progress":
      return "進行中";
    case "completed":
      return "完了";
    case "on-hold":
      return "保留";
    default:
      return status;
  }
};

function TaskList({
  tasks,
  onStatusChange,
  onDelete,
  onEditStart,
  onEditCancel,
  onEditSave,
}) {
  const statusStyles = {
    "not-started": { color: "gray", icon: "⏳", bg: "#f5f5f5", progress: 0 },
    "in-progress": { color: "blue", icon: "⚡", bg: "#e3f2fd", progress: 50 },
    completed: { color: "green", icon: "✅", bg: "#e8f5e9", progress: 100 },
    "on-hold": { color: "orange", icon: "⏸️", bg: "#fff3e0", progress: 0 },
  };

  // 🟦 編集中の「タイトル＋メモ」を一時的に持っておく
  //   形式: { [taskId]: { text: string, memo: string } }
  const [editValues, setEditValues] = useState({});

  const ensureEditValues = (task) => {
    setEditValues((prev) => {
      if (prev[task.id]) return prev;
      return {
        ...prev,
        [task.id]: {
          text: task.text,
          memo: task.memo ?? "",
        },
      };
    });
  };

  const handleClickEdit = (task) => {
    ensureEditValues(task);
    onEditStart(task.id);
  };

  const handleChangeText = (id, value) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {}),
        text: value,
      },
    }));
  };

  const handleChangeMemo = (id, value) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {}),
        memo: value,
      },
    }));
  };

  const handleSave = (task) => {
    const current = editValues[task.id] ?? {
      text: task.text,
      memo: task.memo ?? "",
    };
    onEditSave(task.id, current.text ?? "", current.memo ?? "");
  };

  const handleCancel = (task) => {
    setEditValues((prev) => {
      const copy = { ...prev };
      delete copy[task.id];
      return copy;
    });
    onEditCancel(task.id);
  };

  return (
    <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
      {tasks.map((task) => {
        const style = statusStyles[task.status] || {};
        const currentEdit = editValues[task.id] ?? {
          text: task.text,
          memo: task.memo ?? "",
        };

        // 🟦 編集モード表示
        if (task.isEditing) {
          return (
            <li
              key={task.id}
              style={{
                backgroundColor: style.bg,
                color: style.color,
                padding: "10px",
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                marginBottom: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                {/* 左側: タイトル＋メモの入力欄 */}
                <div
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <input
                    type="text"
                    value={currentEdit.text}
                    onChange={(e) =>
                      handleChangeText(task.id, e.target.value)
                    }
                    style={{
                      padding: "6px",
                      fontSize: "14px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      width: "100%",
                    }}
                    placeholder="タスク名を編集..."
                  />
                  <textarea
                    value={currentEdit.memo}
                    onChange={(e) =>
                      handleChangeMemo(task.id, e.target.value)
                    }
                    style={{
                      padding: "6px",
                      fontSize: "13px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      width: "100%",
                      minHeight: "40px",
                      resize: "vertical",
                    }}
                    placeholder="メモを編集..."
                  />
                </div>

                {/* 右側: 保存／キャンセルボタン */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <button
                    onClick={() => handleSave(task)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "#a5d6a7",
                      cursor: "pointer",
                    }}
                  >
                    💾 保存
                  </button>
                  <button
                    onClick={() => handleCancel(task)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "#e0e0e0",
                      cursor: "pointer",
                    }}
                  >
                    ↩️ キャンセル
                  </button>
                </div>
              </div>

              {/* ステータス＋カテゴリ表示 */}
              <div
                style={{
                  marginTop: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <span>
                  {style.icon} 編集中…（{statusToLabel(task.status)}）
                </span>
                {task.category && (
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: "999px",
                      backgroundColor: "rgba(0,0,0,0.05)",
                    }}
                  >
                    🏷 {task.category}
                  </span>
                )}
              </div>

              {/* 進捗ゲージ */}
              <div
                style={{
                  height: "8px",
                  backgroundColor: "#ccc",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${style.progress}%`,
                    backgroundColor: style.color,
                    height: "100%",
                    transition: "width 0.3s ease",
                  }}
                ></div>
              </div>
            </li>
          );
        }

        // 🟦 通常表示
        return (
          <li
            key={task.id}
            style={{
              backgroundColor: style.bg,
              color: style.color,
              padding: "10px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              marginBottom: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {/* タイトル＋カテゴリ＋ボタン */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ fontWeight: "bold" }}>
                  {style.icon} {task.text}（{statusToLabel(task.status)}）
                </span>
                {task.category && (
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "2px 6px",
                      borderRadius: "999px",
                      backgroundColor: "rgba(0,0,0,0.05)",
                    }}
                  >
                    🏷 {task.category}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  onClick={() => handleClickEdit(task)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#ffd54f",
                    cursor: "pointer",
                  }}
                >
                  ✏️ 編集
                </button>
                <button
                  onClick={() => onStatusChange(task.id)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#90caf9",
                    cursor: "pointer",
                  }}
                >
                  🔄 状態変更
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#ef9a9a",
                    cursor: "pointer",
                  }}
                >
                  ❌ 削除
                </button>
              </div>
            </div>

            {/* メモ表示（あれば） */}
            {task.memo && task.memo.trim() !== "" && (
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "13px",
                  color: "#555",
                }}
              >
                📝 {task.memo}
              </div>
            )}

            {/* 進捗ゲージ */}
            <div
              style={{
                height: "8px",
                backgroundColor: "#ccc",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${style.progress}%`,
                  backgroundColor: style.color,
                  height: "100%",
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default TaskList;
