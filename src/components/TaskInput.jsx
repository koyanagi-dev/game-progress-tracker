import { useState } from "react";

function TaskInput({ onAddTask, categoryOptions }) {
  const [text, setText] = useState("");

  // カテゴリ選択用の state（先頭のカテゴリを初期値に）
  const [category, setCategory] = useState(
    categoryOptions && categoryOptions.length > 0
      ? categoryOptions[0]
      : "その他"
  );

  const [memo, setMemo] = useState("");

  const handleAdd = () => {
    const trimmed = text.trim();
    const trimmedMemo = memo.trim();
    if (!trimmed) {
      return; // 空文字やスペースだけなら何もしない（既存仕様）
    }
    onAddTask(trimmed, category, trimmedMemo);
    setText("");
    setMemo("");
  };

  return (
    <div
      className="task-input"
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        placeholder="タスクを入力..."
        value={text}
        maxLength={100} // 100文字制限（既にテスト済みの仕様）
        onChange={(e) => setText(e.target.value)}
        style={{
          flexGrow: 1,
          padding: "6px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />
      <select
        aria-label="カテゴリ選択"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          padding: "6px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      >
        {categoryOptions?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        onClick={handleAdd}
        style={{
          padding: "6px 12px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#90caf9",
          cursor: "pointer",
        }}
      >
        追加
      </button>

      {/* 📝 メモ入力欄（任意） */}
      <div style={{ marginTop: "8px" }}>
        <textarea
          placeholder="メモ（任意）：例）攻略メモや注意点など"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "12px",
            resize: "vertical",
          }}
        />
      </div>
    </div>
  );
}

export default TaskInput;
