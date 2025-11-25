import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

beforeEach(() => {
  localStorage.clear();
});

// テストで使うヘルパー：4つのタスクを作成して、状態をバラバラに設定する
async function setupTasksWithDifferentStatuses() {
  const user = userEvent.setup();
  render(<App />);

  const input = screen.getByPlaceholderText("タスクを入力...");
  const addButton = screen.getByText("追加");

  // 1〜4のタスクを順番に追加
  const names = ["タスク1", "タスク2", "タスク3", "タスク4"];

  for (const name of names) {
    await user.type(input, name);
    await user.click(addButton);
  }

  // 状態変更ボタン（4つぶん）
  const statusButtons = screen.getAllByRole("button", { name: "🔄 状態変更" });

  // 各タスクの状態をバラバラに設定する
  // Task1: 2回クリック → 完了
  await user.click(statusButtons[0]); // 進行中
  await user.click(statusButtons[0]); // 完了

  // Task2: 0回 → 未着手 のまま

  // Task3: 3回クリック → 保留
  await user.click(statusButtons[2]); // 進行中
  await user.click(statusButtons[2]); // 完了
  await user.click(statusButtons[2]); // 保留

  // Task4: 1回クリック → 進行中
  await user.click(statusButtons[3]); // 進行中

  return { user, names };
}

// li の中身から「タスク名だけ」を抜き出すヘルパー
function getTaskNameOrder() {
  const items = screen.getAllByRole("listitem");
  return items.map((li) => {
    const text = li.textContent || "";
    const match = text.match(/タスク\d/);
    return match ? match[0] : text;
  });
}

describe("UI: 並べ替え（ソート）機能", () => {
  it("昇順ボタンで状態順（未着手→進行中→完了→保留）に並ぶ", async () => {
    const { user } = await setupTasksWithDifferentStatuses();

    // 昇順ボタン押下
    const ascButton = screen.getByRole("button", {
      name: "状態の昇順（未着手 → 保留）",
    });
    await user.click(ascButton);

    const order = getTaskNameOrder();

    // 状態の昇順に並ぶはず：
    // 未着手: タスク2
    // 進行中: タスク4
    // 完了:   タスク1
    // 保留:   タスク3
    expect(order).toEqual(["タスク2", "タスク4", "タスク1", "タスク3"]);
  });

  it("降順ボタンで状態順（保留→完了→進行中→未着手）に並ぶ", async () => {
    const { user } = await setupTasksWithDifferentStatuses();

    const descButton = screen.getByRole("button", {
      name: "状態の降順（保留 → 未着手）",
    });
    await user.click(descButton);

    const order = getTaskNameOrder();

    // 状態の降順に並ぶはず：
    // 保留:   タスク3
    // 完了:   タスク1
    // 進行中: タスク4
    // 未着手: タスク2
    expect(order).toEqual(["タスク3", "タスク1", "タスク4", "タスク2"]);
  });

  it("並べ替え解除で元の追加順（タスク1→4）が復元される", async () => {
    const { user } = await setupTasksWithDifferentStatuses();

    // まず昇順で並べ替え
    const ascButton = screen.getByRole("button", {
      name: "状態の昇順（未着手 → 保留）",
    });
    await user.click(ascButton);

    // その後「並べ替え解除」
    const resetButton = screen.getByRole("button", { name: "並べ替え解除" });
    await user.click(resetButton);

    const order = getTaskNameOrder();

    // 追加順に戻っているはず：
    // タスク1, タスク2, タスク3, タスク4
    expect(order).toEqual(["タスク1", "タスク2", "タスク3", "タスク4"]);
  });

  it("昇順ソート中に状態変更しても、タスクの並び順は変わらない", async () => {
    const { user } = await setupTasksWithDifferentStatuses();

    // 昇順ソート
    const ascButton = screen.getByRole("button", {
      name: "状態の昇順（未着手 → 保留）",
    });
    await user.click(ascButton);

    const before = getTaskNameOrder();

    // 昇順後の並びの「先頭タスク」の状態を変更
    const statusButtons = screen.getAllByRole("button", { name: "🔄 状態変更" });
    await user.click(statusButtons[0]);

    const after = getTaskNameOrder();

    // 並び順（タスク名の順番）は変わらないはず
    expect(after).toEqual(before);
  });

  it("降順ソート中に状態変更しても、タスクの並び順は変わらない", async () => {
    const { user } = await setupTasksWithDifferentStatuses();

    // 降順ソート
    const descButton = screen.getByRole("button", {
      name: "状態の降順（保留 → 未着手）",
    });
    await user.click(descButton);

    const before = getTaskNameOrder();

    // 降順後の並びの「先頭タスク」の状態を変更
    const statusButtons = screen.getAllByRole("button", { name: "🔄 状態変更" });
    await user.click(statusButtons[0]);

    const after = getTaskNameOrder();

    // 並び順（タスク名の順番）は変わらないはず
    expect(after).toEqual(before);
  });
});
