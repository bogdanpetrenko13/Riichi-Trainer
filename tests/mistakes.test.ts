import test from "node:test";
import assert from "node:assert/strict";

const store: Record<string, string> = {};
(globalThis as any).window = {
  localStorage: {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  },
};

const { addMistake, resolveMistake, countMistakes, pickMistake, mistakeKey } = await import("../src/mistakes");

const handA = [0, 1, 1, 1, ...Array(34).fill(0)];
const handB = [0, 2, 0, 0, ...Array(34).fill(0)];

test("a mistake needs two correct answers in a row to retire", () => {
  addMistake({ hand: handA, draw: false, dora: 1, round: 1, seat: 1 });
  assert.equal(countMistakes(), 1);
  assert.equal(resolveMistake(handA, true), false);
  assert.equal(resolveMistake(handA, false), false); // streak resets
  assert.equal(resolveMistake(handA, true), false);
  assert.equal(resolveMistake(handA, true), true);
  assert.equal(countMistakes(), 0);
});

test("the least practised hand is repeated first and duplicates are merged", () => {
  addMistake({ hand: handA, draw: false, dora: 1, round: 1, seat: 1 });
  addMistake({ hand: handB, draw: false, dora: 1, round: 1, seat: 1 });
  addMistake({ hand: handA, draw: false, dora: 1, round: 1, seat: 1 });
  assert.equal(countMistakes(), 2);
  resolveMistake(handB, true);
  assert.equal(mistakeKey(pickMistake(null)!.hand), mistakeKey(handA));
});
