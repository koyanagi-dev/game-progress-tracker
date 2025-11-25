// src/tests/ui-category-filter.test.jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("UI: カテゴリフィルタ機能", () => {
  it("カテゴリで絞り込みができる（メインクエストのみ表示 → すべて表示）", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText("タスクを入力...");
    const addButton = screen.getByText("追加");
    const categorySelect = screen.getByLabelText("カテゴリ選択");

    // タスクA（メインクエスト）
    await user.selectOptions(categorySelect, "メインクエスト");
    await user.type(input, "タスクA");
    await user.click(addButton);

    // タスクB（サブクエスト）
    await user.clear(input);
    await user.selectOptions(categorySelect, "サブクエスト");
    await user.type(input, "タスクB");
    await user.click(addButton);

    // タスクC（ボス攻略）
    await user.clear(input);
    await user.selectOptions(categorySelect, "ボス攻略");
    await user.type(input, "タスクC");
    await user.click(addButton);

    // まずは「すべて」表示されている前提
    expect(screen.getByText(/タスクA/)).toBeInTheDocument();
    expect(screen.getByText(/タスクB/)).toBeInTheDocument();
    expect(screen.getByText(/タスクC/)).toBeInTheDocument();

    // カテゴリフィルタを「メインクエスト」に変更
    const filterSelect = screen.getByLabelText("カテゴリ絞り込み");
    await user.selectOptions(filterSelect, "メインクエスト");

    // タスクA だけ残り、B/C は非表示になるはず
    expect(screen.getByText(/タスクA/)).toBeInTheDocument();
    expect(screen.queryByText(/タスクB/)).not.toBeInTheDocument();
    expect(screen.queryByText(/タスクC/)).not.toBeInTheDocument();

    // フィルタを「すべて」に戻す
    await user.selectOptions(filterSelect, "すべて");

    // 全タスクが再び表示される
    expect(screen.getByText(/タスクA/)).toBeInTheDocument();
    expect(screen.getByText(/タスクB/)).toBeInTheDocument();
    expect(screen.getByText(/タスクC/)).toBeInTheDocument();
  });
});
