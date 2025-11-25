import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";

describe("UI: localStorage 永続化", () => {
  beforeEach(() => {
    // テストのたびに localStorage を初期化
    localStorage.clear();
    cleanup();
  });

  test("タスクを追加してから再マウントしてもタスクが復元される", async () => {
    const user = userEvent.setup();

    // 1. 最初のマウント
    render(<App />);

    const input = screen.getByPlaceholderText("タスクを入力...");
    const addButton = screen.getByRole("button", { name: "追加" });

    // 2. タスクを1件追加
    await user.type(input, "保存テストタスク");
    await user.click(addButton);

    // 画面上に表示されていることを確認
    expect(screen.getByText(/保存テストタスク/)).toBeInTheDocument();

    // 3. コンポーネントをいったん全てアンマウント（＝画面を閉じたイメージ）
    cleanup();

    // 4. 再度レンダリング（＝ページ再読み込み相当）
    render(<App />);

    // 5. もう一度「保存テストタスク」が表示されていることを確認
    //    → localStorage からの復元が効いていれば見えるはず
    expect(screen.getByText(/保存テストタスク/)).toBeInTheDocument();
  });
});
