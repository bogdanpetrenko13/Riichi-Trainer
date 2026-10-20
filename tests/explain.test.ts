import test from "node:test";
import assert from "node:assert/strict";
import { explainUkeire, explainSafety } from "../src/scripts/Explain";

test("explainUkeire classifies discards", () => {
  assert.equal(explainUkeire({ value: 8, tiles: [1] }, { value: 8, tiles: [1] }, 3, 3).key, "optimal");
  assert.equal(explainUkeire({ value: 8, tiles: [1] }, { value: 8, tiles: [2] }, 3, 4).key, "equal");
  assert.equal(explainUkeire({ value: 0, tiles: [] }, { value: 8, tiles: [2] }, 3, 4).key, "stalls");
  assert.equal(explainUkeire({ value: 20, tiles: [1] }, { value: 21, tiles: [1, 2] }, 3, 4).key, "close");
  const far = explainUkeire({ value: 8, tiles: [1] }, { value: 20, tiles: [1, 2] }, 3, 4);
  assert.equal(far.key, "fewer");
  assert.deepEqual(far.lost, [2]);
  assert.equal(far.params.diff, 12);
});

test("explainSafety compares ratings", () => {
  assert.equal(explainSafety(3, 3, 1, 2).key, "safeEqual");
  assert.equal(explainSafety(1.55, 3, 1, 2).params.gap, 1.4);
});
