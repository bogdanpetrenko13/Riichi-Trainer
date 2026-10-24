import test from "node:test";
import assert from "node:assert/strict";
import { GLOSSARY, GLOSSARY_CATEGORIES, parseTiles, searchGlossary } from "../src/data/glossary";

test("every entry has both languages and a known section", () => {
  for (const entry of GLOSSARY) {
    assert.ok(GLOSSARY_CATEGORIES.includes(entry.cat), entry.ru.term);
    assert.ok(entry.ru.term && entry.ru.def && entry.en.term && entry.en.def, entry.ru.term);
  }
});

test("example hands are valid tile strings", () => {
  for (const entry of GLOSSARY) {
    for (const example of entry.ex) {
      for (const group of parseTiles(example)) {
        for (const tile of group) assert.ok(tile >= 0 && tile <= 37 && tile !== 30, entry.ru.term + " " + example);
      }
    }
  }
  assert.deepEqual(parseTiles("234m 55p 1112z"), [[2, 3, 4], [15, 15], [31, 31, 31, 32]]);
});

test("full hands in examples have 14 tiles (kans count as 3 + 1)", () => {
  const full = GLOSSARY.filter((e) => e.cat === "yaku" || e.cat === "yakuman").filter((e) => e.ex.length);
  for (const entry of full) {
    const tiles = parseTiles(entry.ex[0]).flat().length;
    const kans = parseTiles(entry.ex[0]).filter((g) => g.length === 4 && g.every((x) => x === g[0])).length;
    assert.equal(tiles - kans, 14 - 0, entry.ru.term);
  }
});

test("yaku have han values", () => {
  for (const entry of GLOSSARY.filter((e) => e.cat === "yaku")) {
    assert.ok(Array.isArray(entry.han), entry.ru.term);
  }
});

test("search matches aliases and spellings", () => {
  const find = (q: string) => searchGlossary(GLOSSARY, q, "ru").map((e) => e.ru.term);
  assert.ok(find("темпай").includes("Тэмпай"));
  assert.ok(find("танъяо").includes("Таняо"));
  assert.ok(find("tanyao")[0] === "Таняо");
  assert.ok(find("ё").length >= 0);
});
