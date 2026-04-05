import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const LANGUAGE_STORAGE_KEY = "agroveda-language";
const TRANSLATION_CACHE_KEY = "agroveda-translation-cache";

const LanguageContext = createContext();

const shouldTranslate = (text) => {
  if (!text) {
    return false;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }

  if (!/[A-Za-z]/.test(trimmed)) {
    return false;
  }

  if (/^(https?:\/\/|www\.|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/.test(trimmed)) {
    return false;
  }

  if (/^[\d\s.,:/\-()₹$%]+$/.test(trimmed)) {
    return false;
  }

  return true;
};

const loadCache = () => {
  try {
    return JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveCache = (cache) => {
  try {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore cache write failures
  }
};

const translateText = async (text, language) => {
  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${language}&dt=t&q=${encodeURIComponent(
      text
    )}`
  );

  if (!response.ok) {
    throw new Error("Translation request failed");
  }

  const data = await response.json();
  return Array.isArray(data?.[0]) ? data[0].map((part) => part[0]).join("") : text;
};

const collectTextTargets = (root) => {
  const targets = [];

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) {
          return NodeFilter.FILTER_REJECT;
        }

        if (
          parent.closest(".translate-ignore") ||
          ["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "CODE", "PRE", "OPTION"].includes(parent.tagName)
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        const originalText = node.__originalText || node.textContent;
        return shouldTranslate(originalText) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    },
    false
  );

  while (walker.nextNode()) {
    const node = walker.currentNode;
    node.__originalText = node.__originalText || node.textContent;
    targets.push({
      type: "text",
      node,
      original: node.__originalText,
      apply: (translated) => {
        node.textContent = translated;
      },
      reset: () => {
        node.textContent = node.__originalText;
      },
    });
  }

  root.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((element) => {
    const original = element.dataset.originalPlaceholder || element.getAttribute("placeholder") || "";
    if (!shouldTranslate(original)) {
      return;
    }

    element.dataset.originalPlaceholder = original;
    targets.push({
      type: "placeholder",
      node: element,
      original,
      apply: (translated) => {
        element.setAttribute("placeholder", translated);
      },
      reset: () => {
        element.setAttribute("placeholder", element.dataset.originalPlaceholder || "");
      },
    });
  });

  return targets;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en");
  const requestIdRef = useRef(0);
  const observerRef = useRef(null);

  const translateDom = async (targetLanguage) => {
    const root = document.querySelector(".app-shell");
    if (!root) {
      return;
    }

    const targets = collectTextTargets(root);
    if (!targets.length) {
      return;
    }

    if (targetLanguage === "en") {
      targets.forEach((target) => target.reset());
      return;
    }

    const requestId = ++requestIdRef.current;
    const cache = loadCache();
    const uniqueTexts = [...new Set(targets.map((target) => target.original))];
    const missingTexts = uniqueTexts.filter((text) => !cache[`${targetLanguage}::${text}`]);

    if (missingTexts.length) {
      const translatedEntries = await Promise.all(
        missingTexts.map(async (text) => {
          try {
            const translated = await translateText(text, targetLanguage);
            return [text, translated];
          } catch {
            return [text, text];
          }
        })
      );

      translatedEntries.forEach(([text, translated]) => {
        cache[`${targetLanguage}::${text}`] = translated;
      });

      saveCache(cache);
    }

    if (requestId !== requestIdRef.current) {
      return;
    }

    targets.forEach((target) => {
      const translated = cache[`${targetLanguage}::${target.original}`] || target.original;
      target.apply(translated);
    });
  };

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    translateDom(language);

    const root = document.querySelector(".app-shell");
    if (!root) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    let timer = null;
    observerRef.current = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        translateDom(language);
      }, 120);
    });

    observerRef.current.observe(root, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: [
        { code: "en", label: "English" },
        { code: "hi", label: "हिन्दी" },
        { code: "gu", label: "ગુજરાતી" },
        { code: "ta", label: "தமிழ்" },
        { code: "te", label: "తెలుగు" },
      ],
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
