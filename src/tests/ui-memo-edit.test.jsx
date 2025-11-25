// src/tests/ui-memo-edit.test.jsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("UI: メモ編集機能", () => {
  // テストごとに永続化データをリセット
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("タスクのメモを編集して保存すると、カード上のメモが更新される", async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. タスク＋メモを入力して追加
    const titleInput = screen.getByPlaceholderText("タスクを入力...");
    const memoInput = screen.getByPlaceholderText(
      "メモ（任意）：例）攻略メモや注意点など"
    );

    await user.type(titleInput, "メモ編集テスト");
    await user.type(memoInput, "最初のメモ");
    await user.click(screen.getByRole("button", { name: "追加" }));

    // 2. 追加されたタスクカードを特定
    const list = screen.getByRole("list");
    const titleSpan = within(list).getByText(/メモ編集テスト/);
    const taskItem = titleSpan.closest("li");
    expect(taskItem).not.toBeNull();
    if (!taskItem) {
      throw new Error("タスクカードが見つかりませんでした");
    }

    // 3. 初期メモが表示されていることを確認
    expect(within(taskItem).getByText(/最初のメモ/)).toBeInTheDocument();

    // 4. ✏️ 編集 → メモを書き換え
    const editButton = within(taskItem).getByRole("button", { name: "✏️ 編集" });
    await user.click(editButton);

    // 編集モード内のメモ欄（カードの中だけを対象にする）
    const editMemoInput = within(taskItem).getByPlaceholderText("メモを編集...");

    await user.clear(editMemoInput);
    await user.type(editMemoInput, "更新後のメモ");

    // 5. 💾 保存 で確定
    const saveButton = within(taskItem).getByRole("button", { name: /保存/ });
    await user.click(saveButton);

    // 6. 新しいメモが表示され、古いメモは消えていること
    expect(within(taskItem).getByText(/更新後のメモ/)).toBeInTheDocument();
    expect(within(taskItem).queryByText(/最初のメモ/)).not.toBeInTheDocument();
  });
});
