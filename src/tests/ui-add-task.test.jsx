import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// localStorage をテストごとにリセット
beforeEach(() => {
  localStorage.clear();
});

describe("UI: タスク追加フォーム", () => {
  test("タスクを追加すると画面に表示される", async () => {
    render(<App />);
    const user = userEvent.setup();

    // 入力欄を取得
    const input = screen.getByPlaceholderText("タスクを入力...");

    // 「追加」ボタンを取得
    const addButton = screen.getByRole("button", { name: "追加" });

    // 入力欄に文字を入力
    await user.type(input, "テストタスク");

    // 「追加」ボタンをクリック
    await user.click(addButton);

    // 画面に「テストタスク」が表示されているか確認
    expect(screen.getByText(/テストタスク/)).toBeInTheDocument();
  });
});
