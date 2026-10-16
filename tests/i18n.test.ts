import { test } from "node:test";
import assert from "node:assert/strict";
import { i18n, normalize, t } from "../src/i18n";
import { en } from "../src/translations/en";
import { ru } from "../src/translations/ru";

type Tree = { [key: string]: string | Tree };

function keys(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([k, v]) =>
    typeof v === "string" ? [prefix + k] : keys(v, `${prefix}${k}.`),
  );
}

test("languages are normalised", () => {
  assert.equal(normalize("ru-RU"), "ru");
  assert.equal(normalize("zh-CN"), "zh");
  assert.equal(normalize("xx"), "en");
  assert.equal(normalize(null), "en");
});

test("interpolation, nesting and plurals", () => {
  i18n.changeLanguage("en");
  const all = keys(en.translations as Tree);
  // A key with {{count}} and a _plural form picks the form by count.
  const plural = all.find((k) => k.endsWith("_plural"));
  if (plural) {
    const base = plural.slice(0, -"_plural".length);
    assert.notEqual(t(base, { count: 1 }), t(base, { count: 5 }));
  }
  // No translated string keeps an unresolved $t(...).
  for (const k of all) assert.ok(!t(k).includes("$t("), k);
});

test("a missing key falls back to English, then to the key", () => {
  i18n.changeLanguage("ru");
  const en_ = keys(en.translations as Tree);
  const ru_ = new Set(keys(ru.translations as Tree));
  const missing = en_.find((k) => !ru_.has(k));
  if (missing) {
    i18n.changeLanguage("en");
    const english = t(missing);
    i18n.changeLanguage("ru");
    assert.equal(t(missing), english);
  }
  assert.equal(t("no.such.key"), "no.such.key");
  i18n.changeLanguage("en");
});
