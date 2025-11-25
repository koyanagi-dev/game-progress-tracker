import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

beforeEach(() => {
  localStorage.clear();
});

describe("UI: タスク編集機能", () => {
  test("CASE1: 編集 → 保存 で名前が更新される", async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. タスク追加
    const input = screen.getByPlaceholderText("タスクを入力...");
    const addButton = screen.getByRole("button", { name: "追加" });

    await user.type(input, "最初の名前");
    await user.click(addButton);

    // 2. 編集開始
    const editButton = screen.getByRole("button", { name: "✏️ 編集" });
    await user.click(editButton);

    // 3. 編集用 input を取得
    const editInput = screen.getByDisplayValue("最初の名前");
    await user.clear(editInput);
    await user.type(editInput, "編集後の名前");

    // 4. 保存
    const saveButton = screen.getByRole("button", { name: /保存/ });
    await user.click(saveButton);

    // 5. 変更が反映されていること
    expect(screen.getByText(/編集後の名前/)).toBeInTheDocument();
  });

  test("CASE2: 編集 → キャンセル では変更が反映されない", async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. タスク追加
    const input = screen.getByPlaceholderText("タスクを入力...");
    const addButton = screen.getByRole("button", { name: "追加" });

    await user.type(input, "キャンセルテスト");
    await user.click(addButton);

    // 2. 編集開始
    const editButton = screen.getByRole("button", { name: "✏️ 編集" });
    await user.click(editButton);

    // 3. 編集用 input に文字を入力
    const editInput = screen.getByDisplayValue("キャンセルテスト");
    await user.clear(editInput);
    await user.type(editInput, "書き換えたけど保存しない");

    // 4. キャンセル
    const cancelButton = screen.getByRole("button", { name: /キャンセル/ });
    await user.click(cancelButton);

    // 5. 元の名前が残っていること
    expect(screen.getByText(/キャンセルテスト/)).toBeInTheDocument();

    // 6. 書き換えた名前は表示されない
    expect(screen.queryByText(/書き換えたけど保存しない/)).not.toBeInTheDocument();
  });

  test("CASE3: 編集モードの UI が正しく切り替わる", async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. タスク追加
    const input = screen.getByPlaceholderText("タスクを入力...");
    const addButton = screen.getByRole("button", { name: "追加" });

    await user.type(input, "UIテスト");
    await user.click(addButton);

    // 2. 編集開始
    const editButton = screen.getByRole("button", { name: "✏️ 編集" });
    await user.click(editButton);

    // 3. 編集用 input が表示される
    expect(screen.getByDisplayValue("UIテスト")).toBeInTheDocument();

    // 4. 通常のタスク表示が消えている
    expect(screen.queryByText("UIテスト（未着手）")).not.toBeInTheDocument();

    // 5. 保存ボタンが表示される
    expect(screen.getByRole("button", { name: /保存/ })).toBeInTheDocument();

    // 6. キャンセルボタンが表示される
    expect(screen.getByRole("button", { name: /キャンセル/ })).toBeInTheDocument();
  });

  test("空文字で保存してもタスク名は変わらない", async () => {
    const user = userEvent.setup();

    // 1. 画面を表示
    render(<App />);

    // 2. タスクを1件追加
    const input = screen.getByPlaceholderText("タスクを入力...");
    const addButton = screen.getByRole("button", { name: "追加" });

    await user.type(input, "空編集テスト");
    await user.click(addButton);

    // タスクが表示されていることを確認
    expect(screen.getByText(/空編集テスト/)).toBeInTheDocument();

    // 3. 編集モードに入る
    const editButton = screen.getByRole("button", { name: "✏️ 編集" });
    await user.click(editButton);

    // 4. 入力欄を空（またはスペースだけ）にして保存
    const editInput = screen.getByDisplayValue("空編集テスト");
    await user.clear(editInput);
    await user.type(editInput, "   "); // スペースだけ
    const saveButton = screen.getByRole("button", { name: /保存/ });
    await user.click(saveButton);

    // 5. 保存後もタスク名は元の「空編集テスト」のままであること
    expect(screen.getByText(/空編集テスト/)).toBeInTheDocument();
  });
});
