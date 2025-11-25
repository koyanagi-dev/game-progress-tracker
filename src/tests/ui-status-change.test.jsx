import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("UI: タスク状態変更機能", () => {
  it("状態変更ボタンで状態が正しくローテーションする", async () => {
    const user = userEvent.setup();

    render(<App />);

    // 1. タスクを追加
    const input = screen.getByPlaceholderText("タスクを入力...");
    const addButton = screen.getByText("追加");

    await user.type(input, "状態テストタスク");
    await user.click(addButton);

    const statusButton = screen.getByRole("button", { name: "🔄 状態変更" });

    // 2. 初期状態: 未着手
    expect(screen.getByText(/（未着手）/)).toBeInTheDocument();

    // 3. 進行中
    await user.click(statusButton);
    expect(screen.getByText(/（進行中）/)).toBeInTheDocument();

    // 4. 完了
    await user.click(statusButton);
    expect(screen.getByText(/（完了）/)).toBeInTheDocument();

    // 5. 保留
    await user.click(statusButton);
    expect(screen.getByText(/（保留）/)).toBeInTheDocument();

    // 6. 未着手（ループ戻り）
    await user.click(statusButton);
    expect(screen.getByText(/（未着手）/)).toBeInTheDocument();
  });
});
