import test from "node:test";
import assert from "node:assert/strict";
import { calculateFu, calculatePayment, emptyMelds } from "../src/scripts/ScoreCounter";

const melds = (o: Record<string, number[]>) => ({ ...emptyMelds(), ...o });

test("fu: basic cases", () => {
  assert.equal(calculateFu({ winType: "ron" }).fu, 30); // closed ron, no extras
  assert.equal(calculateFu({ winType: "tsumo" }).fu, 30); // 22 -> 30
  assert.equal(calculateFu({ winType: "ron", open: true }).fu, 30); // 20 -> 30 (minimum)
  assert.equal(calculateFu({ winType: "tsumo", pinfu: true }).fu, 20);
  assert.equal(calculateFu({ winType: "ron", pinfu: true }).fu, 30);
  assert.equal(calculateFu({ winType: "ron", chiitoitsu: true }).fu, 25);
  assert.equal(calculateFu({ winType: "tsumo", chiitoitsu: true }).fu, 25);
});

test("fu: melds, pair, wait", () => {
  // closed ron: 20 + 10 + closed terminal triplet 8 + open simple triplet 2 + kanchan 2 = 42 -> 50
  assert.equal(calculateFu({ winType: "ron", melds: melds({ terminalTriplet: [1, 0], simpleTriplet: [0, 1] }), wait: "kanchan" }).fu, 50);
  // closed terminal kan 32 + closed ron 10 + 20 = 62 -> 70
  assert.equal(calculateFu({ winType: "ron", melds: melds({ terminalKan: [1, 0] }) }).fu, 70);
  // double-wind pair is 4 fu: 20 + 10 + 4 = 34 -> 40
  assert.equal(calculateFu({ winType: "ron", pair: 4 }).fu, 40);
  assert.equal(calculateFu({ winType: "ron", pair: 2 }).fu, 40); // 32 -> 40
  // open hand ignores pinfu / chiitoitsu flags
  assert.equal(calculateFu({ winType: "ron", open: true, chiitoitsu: true, pinfu: true }).fu, 30);
});

test("payments: non-dealer ron / tsumo", () => {
  assert.equal(calculatePayment({ han: 1, fu: 30 }).ron, 1000);
  assert.equal(calculatePayment({ han: 2, fu: 30 }).ron, 2000);
  assert.equal(calculatePayment({ han: 3, fu: 30 }).ron, 3900);
  assert.equal(calculatePayment({ han: 4, fu: 30 }).ron, 7700);
  assert.equal(calculatePayment({ han: 2, fu: 25 }).ron, 1600);
  assert.equal(calculatePayment({ han: 1, fu: 30, tsumo: true }).fromDealer, 500);
  assert.equal(calculatePayment({ han: 1, fu: 30, tsumo: true }).fromOthers, 300);
  const t = calculatePayment({ han: 3, fu: 30, tsumo: true });
  assert.deepEqual([t.fromOthers, t.fromDealer], [1000, 2000]);
  const t2 = calculatePayment({ han: 2, fu: 20, tsumo: true });
  assert.deepEqual([t2.fromOthers, t2.fromDealer, t2.total], [400, 700, 1500]);
});

test("payments: dealer", () => {
  assert.equal(calculatePayment({ han: 1, fu: 30, dealer: true }).ron, 1500);
  assert.equal(calculatePayment({ han: 3, fu: 30, dealer: true }).ron, 5800);
  const t = calculatePayment({ han: 1, fu: 30, dealer: true, tsumo: true });
  assert.equal(t.fromOthers, 500);
  assert.equal(t.total, 1500);
});

test("limits", () => {
  assert.equal(calculatePayment({ han: 5, fu: 30 }).ron, 8000);
  assert.equal(calculatePayment({ han: 5, fu: 30, dealer: true }).ron, 12000);
  assert.equal(calculatePayment({ han: 3, fu: 70 }).limit, "mangan");
  assert.equal(calculatePayment({ han: 4, fu: 40 }).ron, 8000);
  assert.equal(calculatePayment({ han: 6, fu: 30 }).ron, 12000);
  assert.equal(calculatePayment({ han: 8, fu: 30 }).ron, 16000);
  assert.equal(calculatePayment({ han: 11, fu: 30 }).ron, 24000);
  assert.equal(calculatePayment({ han: 13, fu: 30 }).ron, 32000);
  assert.equal(calculatePayment({ han: 13, fu: 30, dealer: true }).ron, 48000);
  const y = calculatePayment({ han: 13, fu: 30, yakuman: 2 });
  assert.equal(y.ron, 64000);
  const yt = calculatePayment({ han: 13, fu: 30, dealer: true, tsumo: true });
  assert.equal(yt.fromOthers, 16000);
});

test("kiriage mangan", () => {
  assert.equal(calculatePayment({ han: 4, fu: 30 }).ron, 7700);
  assert.equal(calculatePayment({ han: 4, fu: 30, kiriage: true }).ron, 8000);
  assert.equal(calculatePayment({ han: 3, fu: 60, kiriage: true }).ron, 8000);
  assert.equal(calculatePayment({ han: 3, fu: 60 }).ron, 7700);
  assert.equal(calculatePayment({ han: 4, fu: 30, kiriage: true, tsumo: true }).fromOthers, 2000);
  assert.equal(calculatePayment({ han: 0, fu: 30 }).total, 0);
});
