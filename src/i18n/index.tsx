/**
 * A small replacement for i18next / react-i18next with the features the app
 * uses: nested keys ("app.settings"), {{var}} interpolation, "$t(key)"
 * nesting inside strings and values, "_plural" keys picked by `count`, and a
 * language remembered in localStorage (same key as i18next used, so the
 * choice survives the update).
 */
import { useSyncExternalStore, type ComponentType } from "react";
import { de } from "../translations/de";
import { en } from "../translations/en";
import { fr } from "../translations/fr";
import { ja } from "../translations/ja";
import { ko } from "../translations/ko";
import { pl } from "../translations/pl";
import { pt } from "../translations/pt";
import { ru } from "../translations/ru";
import { zh_CN } from "../translations/zh_CN";

type Tree = { [key: string]: string | Tree };
type Params = Record<string, unknown>;
export type TFunction = (key: string, params?: Params) => string;

const RESOURCES: Record<string, Tree> = {
  en: en.translations,
  de: de.translations,
  fr: fr.translations,
  ja: ja.translations,
  ko: ko.translations,
  pl: pl.translations,
  pt: pt.translations,
  ru: ru.translations,
  zh: zh_CN.translations,
  zh_CN: zh_CN.translations,
};
export const LANGUAGES = ["en", "ru", "de", "fr", "pl", "pt", "ja", "ko", "zh"];
const STORAGE_KEY = "i18nextLng";
const DEFAULTS: Params = { repeats: "0" };

function lookup(tree: Tree | undefined, key: string): string | undefined {
  let node: string | Tree | undefined = tree;
  for (const part of key.split(".")) {
    if (!node || typeof node === "string") return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** "ru-RU" -> "ru", "zh-CN" -> "zh"; unknown -> "en". */
export function normalize(lang: string | null | undefined): string {
  if (!lang) return "en";
  const l = lang.replace("-", "_");
  if (RESOURCES[l]) return l === "zh_CN" ? "zh" : l;
  const base = l.split("_")[0].toLowerCase();
  return RESOURCES[base] ? base : "en";
}

function detect(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return normalize(stored);
  } catch {
    /* storage unavailable */
  }
  return normalize(typeof navigator !== "undefined" ? navigator.language : "en");
}

let language = detect();
const listeners = new Set<() => void>();

function raw(key: string, params: Params): string | undefined {
  const count = params.count;
  const plural = typeof count === "number" && count !== 1;
  for (const lang of [language, "en"]) {
    const tree = RESOURCES[lang];
    const hit = (plural && lookup(tree, `${key}_plural`)) || lookup(tree, key);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

function nest(text: string, depth: number): string {
  if (depth > 4 || !text.includes("$t(")) return text;
  return text.replace(/\$t\(([^)]+)\)/g, (_, k: string) => translate(k.trim(), {}, depth + 1));
}

function translate(key: string, params: Params = {}, depth = 0): string {
  const all = { ...DEFAULTS, ...params };
  const text = raw(key, all);
  if (text === undefined) return key;
  const filled = text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, name: string) => {
    const v = all[name];
    return v === undefined || v === null ? m : nest(String(v), depth);
  });
  return nest(filled, depth);
}

export const t: TFunction = (key, params) => translate(key, params);

export const i18n = {
  get language() {
    return language;
  },
  t,
  changeLanguage(lang: string) {
    language = normalize(lang);
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* storage unavailable */
    }
    if (typeof document !== "undefined") document.documentElement.lang = language;
    listeners.forEach((fn) => fn());
  },
};

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Re-renders the caller when the language changes. */
export function useTranslation() {
  useSyncExternalStore(subscribe, () => language);
  return { t, i18n };
}

/** HOC as in react-i18next: injects `t` and `i18n` props. */
export function withTranslation() {
  return function wrap<P extends object>(Component: ComponentType<P>) {
    function Translated(props: Omit<P, "t" | "i18n">) {
      const { t: tt, i18n: ii } = useTranslation();
      const Comp = Component as ComponentType<Record<string, unknown>>;
      return <Comp {...(props as Record<string, unknown>)} t={tt} i18n={ii} />;
    }
    Translated.displayName = `withTranslation(${Component.displayName || Component.name || "Component"})`;
    return Translated;
  };
}
