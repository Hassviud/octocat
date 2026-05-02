import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, languages, currencies, type Lang, type TranslationKey } from "@/lib/i18n";

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TranslationKey) => string;
  dir: "ltr" | "rtl";
  currency: string;
  setCurrency: (c: string) => void;
  country: string;
  setCountry: (c: string) => void;
  formatPrice: (usd: number) => string;
  convertPrice: (usd: number) => number;
}

const AppContext = createContext<AppContextValue | null>(null);

function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("vura-lang") as Lang | null;
  if (stored && ["en", "ar", "fr"].includes(stored)) return stored;
  const sys = navigator.language.slice(0, 2).toLowerCase();
  if (sys === "ar") return "ar";
  if (sys === "fr") return "fr";
  return "en";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [currency, setCurrencyState] = useState("USD");
  const [country, setCountryState] = useState("US");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLangState(detectLang());
    const c = localStorage.getItem("vura-currency");
    if (c) setCurrencyState(c);
    const co = localStorage.getItem("vura-country");
    if (co) setCountryState(co);
    setMounted(true);
  }, []);

  const dir = languages.find((l) => l.code === lang)?.dir ?? "ltr";

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir, mounted]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("vura-lang", l);
  };
  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem("vura-currency", c);
  };
  const setCountry = (c: string) => {
    setCountryState(c);
    localStorage.setItem("vura-country", c);
  };

  const t = (k: TranslationKey) => translations[lang][k] ?? translations.en[k];

  const convertPrice = (usd: number) => {
    const cur = currencies.find((c) => c.code === currency);
    return usd * (cur?.rate ?? 1);
  };
  const formatPrice = (usd: number) => {
    const cur = currencies.find((c) => c.code === currency);
    const value = convertPrice(usd);
    return `${cur?.symbol ?? "$"}${value.toFixed(2)}`;
  };

  return (
    <AppContext.Provider value={{ lang, setLang, t, dir, currency, setCurrency, country, setCountry, formatPrice, convertPrice }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
