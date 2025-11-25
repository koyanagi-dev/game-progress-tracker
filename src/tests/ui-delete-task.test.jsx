// src/tests/ui-delete-task.test.jsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("UI: タスク削除機能", () => {
  // テストごとに永続化データをリセット
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("タスクを追加して削除すると表示から消える", async () => {
    const user = userEvent.setup();
    render(<App />);

    // タスク追加
    const input = screen.getByPlaceholderText("タスクを入力...");
    await user.type(input, "削除テスト");
    await user.click(screen.getByRole("button", { name: "追加" }));

    // 追加されたことを確認（カード側）
    expect(screen.getByText(/削除テスト/)).toBeInTheDocument();

    // ❌ 削除ボタンを押す
    const deleteButton = screen.getByRole("button", { name: "❌ 削除" });
    await user.click(deleteButton);

    // ✅ タスク一覧（<ul role="list">）の中から「削除テスト」が消えていることを確認
    const list = screen.getByRole("list");
    expect(within(list).queryByText(/削除テスト/)).not.toBeInTheDocument();

    // ※ 上の行では Undo 情報欄（直前に削除したタスク:「削除テスト」）は無視されます
  });
});
