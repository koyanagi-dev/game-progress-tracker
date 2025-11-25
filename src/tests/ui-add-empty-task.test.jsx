import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";

describe("UI: タスク追加フォーム（空入力チェック）", () => {
  test("空文字やスペースだけではタスクは追加されない", async () => {
    const user = userEvent.setup();

    // 1. 画面を表示
    render(<App />);

    const input = screen.getByPlaceholderText("タスクを入力...");
    const addButton = screen.getByRole("button", { name: "追加" });

    const getTaskItems = () => screen.queryAllByRole("listitem");

    // 初期状態：タスクは0件
    expect(getTaskItems().length).toBe(0);

    // 2. 何も入力せずに「追加」を押しても、タスクは増えない
    await user.click(addButton);
    expect(getTaskItems().length).toBe(0);

    // 3. スペースだけ入力して「追加」しても、タスクは増えない
    await user.type(input, "    "); // スペースだけ
    await user.click(addButton);
    expect(getTaskItems().length).toBe(0);
  });
});
