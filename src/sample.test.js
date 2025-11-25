// sample.test.js
export function add(a, b) {
  return a + b;
}

import { expect, test } from "vitest";

test("add() correctly adds two numbers", () => {
  expect(add(2, 3)).toBe(5);
});
