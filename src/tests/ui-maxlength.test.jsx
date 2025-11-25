import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";

describe("UI: タスク名の最大長（100文字）の確認", () => {
  test("100文字ちょうどのタスク名は追加され、101文字以上は100文字に切り詰められる", async () => {
    const user = userEvent.setup();

    // 1. 画面を表示
    render(<App />);

    const input = screen.getByPlaceholderText("タスクを入力...");
    const addButton = screen.getByRole("button", { name: "追加" });

    // 2. ちょうど100文字の文字列を作成
    const exact100 = "あ".repeat(100);         // 「あ」を100回
    const over100 = "い".repeat(120);          // 「い」を120回
    const over100Trimmed = over100.slice(0, 100); // 先頭100文字

    // --- 100文字ちょうどのケース ---

    // 入力 → 追加
    await user.type(input, exact100);
    await user.click(addButton);

    // 「あ」100文字を含むタスクが画面に表示されていること
    const taskExact100 = screen.getByText((content) =>
      content.includes(exact100)
    );
    expect(taskExact100).toBeInTheDocument();

    // --- 101文字以上のケース ---

    // 入力欄をクリア
    await user.clear(input);

    // 120文字入力して追加
    await user.type(input, over100);
    await user.click(addButton);

    // 保存されているのは先頭100文字だけのはず
    const taskTrimmed = screen.getByText((content) =>
      content.includes(over100Trimmed)
    );
    expect(taskTrimmed).toBeInTheDocument();

    // 120文字すべて（over100）がそのまま含まれている要素は存在しないはず
    const taskOver100 = screen.queryByText((content) =>
      content.includes(over100)
    );
    expect(taskOver100).toBeNull();
  });
});
