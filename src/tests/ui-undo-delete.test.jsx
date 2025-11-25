// src/tests/ui-undo-delete.test.jsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("UI: 削除取り消し（Undo）機能", () => {
  // テストごとに永続化データをリセット
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("直前に削除したタスクを元に戻せる", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText("タスクを入力...");

    // タスク1追加
    await user.type(input, "タスク1");
    await user.click(screen.getByRole("button", { name: "追加" }));

    // タスク2追加
    await user.clear(input);
    await user.type(input, "タスク2");
    await user.click(screen.getByRole("button", { name: "追加" }));

    // 両方表示されていることを確認（カード側）
    expect(screen.getByText(/タスク1/)).toBeInTheDocument();
    expect(screen.getByText(/タスク2/)).toBeInTheDocument();

    // 2つ目のタスクの「❌ 削除」を押す
    const deleteButtons = screen.getAllByRole("button", { name: "❌ 削除" });
    await user.click(deleteButtons[1]);

    // ✅ タスク一覧（list）の中から「タスク2」が消えていることを確認
    const list = screen.getByRole("list");
    expect(within(list).queryByText(/タスク2/)).not.toBeInTheDocument();

    // タスク1は残っている
    expect(screen.getByText(/タスク1/)).toBeInTheDocument();

    // Undo ボタンで復元
    const undoButton = screen.getByRole("button", { name: "削除を取り消す" });
    await user.click(undoButton);

    // 復元後は両方のタスクが表示される
    expect(screen.getByText(/タスク1/)).toBeInTheDocument();
    expect(screen.getByText(/タスク2/)).toBeInTheDocument();
  });

  test("削除履歴がないときは『削除を取り消す』ボタンは押せない", async () => {
    const user = userEvent.setup();
    render(<App />);

    const undoButton = screen.getByRole("button", { name: "削除を取り消す" });
    // 最初は無効
    expect(undoButton).toBeDisabled();

    // タスクを1件追加
    const input = screen.getByPlaceholderText("タスクを入力...");
    await user.type(input, "一つ目");
    await user.click(screen.getByRole("button", { name: "追加" }));

    // （localStorage をクリアしているので、この時点では❌削除は1個だけのはず）
    const deleteButton = screen.getByRole("button", { name: "❌ 削除" });
    await user.click(deleteButton);

    // 削除後は Undo が有効になる
    expect(undoButton).not.toBeDisabled();
  });
});
