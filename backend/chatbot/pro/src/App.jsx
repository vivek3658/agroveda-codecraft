import { useState, useRef, useEffect } from "react";
import "./App.css";
import { analyzeSoil, sendToAI } from "./api";
import ReactMarkdown from "react-markdown";

const LANGUAGES = [
  { code: "en", label: "English", recog: "en-US" },
  { code: "hi", label: "हिन्दी", recog: "hi-IN" },
  { code: "mr", label: "मराठी", recog: "mr-IN" },
  { code: "ta", label: "தமிழ்", recog: "ta-IN" },
  { code: "te", label: "తెలుగు", recog: "te-IN" },
  { code: "kn", label: "ಕನ್ನಡ", recog: "kn-IN" },
  { code: "bn", label: "বাংলা", recog: "bn-IN" },
  { code: "gu", label: "ગુજરાતી", recog: "gu-IN" },
  { code: "pa", label: "ਪੰਜਾਬੀ", recog: "pa-IN" },
  { code: "ur", label: "اردو", recog: "ur-PK" },
  { code: "es", label: "Español", recog: "es-ES" },
  { code: "fr", label: "Français", recog: "fr-FR" },
  { code: "pt", label: "Português", recog: "pt-BR" },
  { code: "zh", label: "中文", recog: "zh-CN" },
  { code: "ar", label: "العربية", recog: "ar-SA" },
  { code: "ja", label: "日本語", recog: "ja-JP" },
];

const T = {
  en: { title: "AgroVeda", sub: "Smart Soil Analysis", analyzing: "Analyzing", heroTitle: "Soil Health Analyzer", heroDesc: 'Upload a <strong>soil photo/PDF</strong>, <strong>type</strong>, or <strong>ask via voice</strong> for detailed soil analysis.', c1: "Soil Photo", c2: "Soil Test PDF", c3: "Voice Input", hint: "Tap mic to speak \u2022 Drag & drop supported", inputPh: "Ask about soil...", btnUp: "Upload", drop: "Drop your soil file here", selLang: "Select Language", errType: "\u26a0\ufe0f Only images and PDFs accepted.", errSize: "\u26a0\ufe0f Max 20MB.", errFail: "\u274c Failed to analyze." },
  hi: { title: "AgroVeda", sub: "\u0938\u094d\u092e\u093e\u0930\u094d\u091f \u092e\u093f\u091f\u094d\u091f\u0940 \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923", analyzing: "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0939\u094b \u0930\u0939\u093e", heroTitle: "\u092e\u093f\u091f\u094d\u091f\u0940 \u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0915", heroDesc: '<strong>\u092e\u093f\u091f\u094d\u091f\u0940 \u0915\u0940 \u092b\u094b\u091f\u094b/PDF</strong>, <strong>\u091f\u093e\u0907\u092a</strong>, \u092f\u093e <strong>Voice</strong> \u0938\u0947 \u092a\u0942\u091b\u0947\u0902\u0964', c1: "\u092e\u093f\u091f\u094d\u091f\u0940 \u092b\u094b\u091f\u094b", c2: "\u092e\u093f\u091f\u094d\u091f\u0940 PDF", c3: "Voice Input", hint: "\u092e\u093e\u0907\u0915 \u0926\u092c\u093e\u090f\u0902 \u092f\u093e \u091f\u093e\u0907\u092a \u0915\u0930\u0947\u0902", inputPh: "\u092e\u093f\u091f\u094d\u091f\u0940 \u0915\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947\u0902 \u092a\u0942\u091b\u0947\u0902...", btnUp: "\u0905\u092a\u0932\u094b\u0921", drop: "\u092e\u093f\u091f\u094d\u091f\u0940 \u092b\u093e\u0907\u0932 \u092f\u0939\u093e\u0902 \u091b\u094b\u0921\u093c\u0947\u0902", selLang: "\u092d\u093e\u0937\u093e \u091a\u0941\u0928\u0947\u0902", errType: "\u26a0\ufe0f \u0915\u0947\u0935\u0932 \u092b\u094b\u091f\u094b \u0914\u0930 PDF\u0964", errSize: "\u26a0\ufe0f \u0905\u0927\u093f\u0915\u0924\u092e 20MB\u0964", errFail: "\u274c \u0935\u093f\u092b\u0932\u0964" },
  mr: { title: "AgroVeda", sub: "\u0938\u094d\u092e\u093e\u0930\u094d\u091f \u092e\u093e\u0924\u0940 \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923", analyzing: "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0938\u0941\u0930\u0942", heroTitle: "\u092e\u093e\u0924\u0940 \u0906\u0930\u094b\u0917\u094d\u092f \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0915", heroDesc: '<strong>\u092e\u093e\u0924\u0940\u091a\u093e \u092b\u094b\u091f\u094b/PDF</strong>, <strong>\u091f\u093e\u0907\u092a</strong>, \u0915\u093f\u0902\u0935\u093e <strong>voice</strong> \u0928\u0947 \u0935\u093f\u091a\u093e\u0930\u093e.', c1: "\u092e\u093e\u0924\u0940 \u092b\u094b\u091f\u094b", c2: "\u092e\u093e\u0924\u0940 PDF", c3: "Voice Input", hint: "\u092e\u093e\u0907\u0915 \u0926\u093e\u092c\u093e \u0915\u093f\u0902\u0935\u093e \u091f\u093e\u0907\u092a \u0915\u0930\u093e", inputPh: "\u092e\u093e\u0924\u0940\u092c\u0926\u094d\u0926\u0932 \u0935\u093f\u091a\u093e\u0930\u093e...", btnUp: "\u0905\u092a\u0932\u094b\u0921", drop: "\u092e\u093e\u0924\u0940 \u092b\u093e\u0908\u0932 \u0907\u0925\u0947 \u0938\u094b\u0921\u093e", selLang: "\u092d\u093e\u0937\u093e \u0928\u093f\u0935\u0921\u093e", errType: "\u26a0\ufe0f \u092b\u0915\u094d\u0924 \u092b\u094b\u091f\u094b \u0906\u0923\u093f PDF.", errSize: "\u26a0\ufe0f \u0915\u092e\u093e\u0932 20MB.", errFail: "\u274c \u0905\u092f\u0936\u0938\u094d\u0935\u0940." },
  ta: { title: "AgroVeda", sub: "\u0bae\u0ba3\u0bcd \u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bc1", analyzing: "\u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bbf\u0bb2\u0bcd", heroTitle: "\u0bae\u0ba3\u0bcd \u0b86\u0bb0\u0bcb\u0b95\u0bcd\u0b95\u0bbf\u0baf \u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bbe\u0bb3\u0bb0\u0bcd", heroDesc: '<strong>\u0bae\u0ba3\u0bcd \u0baa\u0bc1\u0b95\u0bc8\u0baa\u0bcd\u0baa\u0b9f\u0bae\u0bcd/PDF</strong>, <strong>\u0ba4\u0b9f\u0bcd\u0b9f\u0b9a\u0bcd\u0b9a\u0bc1</strong>, \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 <strong>voice</strong> \u0b95\u0bc7\u0bb3\u0bc1\u0b99\u0bcd\u0b95\u0bb3\u0bcd.', c1: "\u0bae\u0ba3\u0bcd \u0baa\u0bc1\u0b95\u0bc8\u0baa\u0bcd\u0baa\u0b9f\u0bae\u0bcd", c2: "\u0bae\u0ba3\u0bcd PDF", c3: "Voice Input", hint: "\u0bae\u0bc8\u0b95\u0bcd \u0b85\u0bb4\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 \u0ba4\u0b9f\u0bcd\u0b9f\u0b9a\u0bcd\u0b9a\u0bc1 \u0b9a\u0bc6\u0baf\u0bcd\u0b99\u0bcd\u0b95\u0bb3\u0bcd", inputPh: "\u0bae\u0ba3\u0bcd \u0baa\u0bb1\u0bcd\u0bb1\u0bbf \u0b95\u0bc7\u0bb3\u0bc1\u0b99\u0bcd\u0b95\u0bb3\u0bcd...", btnUp: "\u0baa\u0ba4\u0bbf\u0bb5\u0bc7\u0bb1\u0bcd\u0bb1\u0bc1", drop: "\u0bae\u0ba3\u0bcd \u0b95\u0bcb\u0baa\u0bcd\u0baa\u0bc8 \u0b87\u0b99\u0bcd\u0b95\u0bc7 \u0bb5\u0bbf\u0b9f\u0bb5\u0bc1\u0bae\u0bcd", selLang: "\u0bae\u0bca\u0bb4\u0bbf \u0ba4\u0bc7\u0bb0\u0bcd\u0ba8\u0bcd\u0ba4\u0bc6\u0b9f\u0bc1", errType: "\u26a0\ufe0f \u0baa\u0bc1\u0b95\u0bc8\u0baa\u0bcd\u0baa\u0b9f\u0bae\u0bcd \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd PDF \u0bae\u0b9f\u0bcd\u0b9f\u0bc1\u0bae\u0bc7.", errSize: "\u26a0\ufe0f \u0b85\u0ba4\u0bbf\u0b95\u0baa\u0b9f\u0bcd\u0b9a\u0bae\u0bcd 20MB.", errFail: "\u274c \u0ba4\u0bcb\u0bb2\u0bcd\u0bb5\u0bbf." },
  te: { title: "AgroVeda", sub: "\u0c38\u0c4d\u0c2e\u0c3e\u0c30\u0c4d\u0c1f\u0c4d \u0c28\u0c47\u0c32 \u0c35\u0c3f\u0c36\u0c4d\u0c32\u0c47\u0c37\u0c23", analyzing: "\u0c35\u0c3f\u0c36\u0c4d\u0c32\u0c47\u0c37\u0c3f\u0c38\u0c4d\u0c24\u0c4b\u0c82\u0c26\u0c3f", heroTitle: "\u0c28\u0c47\u0c32 \u0c06\u0c30\u0c4b\u0c97\u0c4d\u0c2f \u0c35\u0c3f\u0c36\u0c4d\u0c32\u0c47\u0c37\u0c15\u0c02", heroDesc: '<strong>\u0c28\u0c47\u0c32 \u0c2b\u0c4b\u0c1f\u0c4b/PDF</strong>, <strong>\u0c1f\u0c48\u0c2a\u0c4d</strong>, \u0c32\u0c47\u0c26\u0c3e <strong>voice</strong> \u0c05\u0c21\u0c17\u0c02\u0c1f\u0c3f.', c1: "\u0c28\u0c47\u0c32 \u0c2b\u0c4b\u0c1f\u0c4b", c2: "\u0c28\u0c47\u0c32 PDF", c3: "Voice Input", hint: "\u0c2e\u0c48\u0c15\u0c4d \u0c28\u0c4a\u0c15\u0c4d\u0c15\u0c82\u0c1f\u0c3f \u0c32\u0c47\u0c26\u0c3e \u0c1f\u0c48\u0c2a\u0c4d \u0c1a\u0c47\u0c2f\u0c82\u0c1f\u0c3f", inputPh: "\u0c28\u0c47\u0c32 \u0c17\u0c41\u0c30\u0c3f\u0c82\u0c1a\u0c3f \u0c05\u0c21\u0c17\u0c02\u0c1f\u0c3f...", btnUp: "\u0c05\u0c2a\u0c4d\u200c\u0c32\u0c4b\u0c1f\u0c4d", drop: "\u0c28\u0c47\u0c32 \u0c2b\u0c48\u0c32\u0c4d\u200c\u0c28\u0c41 \u0c87\u0c95\u0c4d\u0c15\u0c1f \u0c35\u0c26\u0c3f\u0c32\u0c82\u0c1f\u0c3f", selLang: "\u0c2d\u0c3e\u0c37 \u0c0e\u0c02\u0c1a\u0c41\u0c15\u0c4b\u0c02\u0c1f\u0c3f", errType: "\u26a0\ufe0f \u0c2b\u0c4b\u0c1f\u0c4b\u0c32\u0c1c\u0c41 \u0c2e\u0c30\u0c3f\u0c2f\u0c1c\u0c3c PDF \u0c2e\u0c3e\u0c24\u0c4d\u0c30\u0c2e\u0c47.", errSize: "\u26a0\ufe0f \u0c17\u0c30\u0c3f\u0c37\u0c4d\u0c20\u0c02 20MB.", errFail: "\u274c \u0c35\u0c3f\u0c2b\u0c2c\u0c2e\u0c48\u0c82\u0c26\u0c3f." },
  kn: { title: "AgroVeda", sub: "\u0cb8\u0ccd\u0cae\u0cbe\u0cb0\u0ccd\u0c9f\u0ccd \u0cae\u0ca3\u0ccd\u0ca3\u0cc1 \u0cb5\u0cbf\u0cb6\u0ccd\u0cb2\u0cc7\u0cb7\u0ca3\u0cc6", analyzing: "\u0cb5\u0cbf\u0cb6\u0ccd\u0cb2\u0cc7\u0cb7\u0cbf\u0cb8\u0cb2\u0cbe\u0c97\u0cc1\u0ca4\u0ccd\u0ca4\u0cbf\u0ca6\u0cc6", heroTitle: "\u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8 \u0c86\u0cb0\u0ccb\u0c97\u0ccd\u0caf \u0cb5\u0cbf\u0cb6\u0ccd\u0cb2\u0cc7\u0cb7\u0c95", heroDesc: '<strong>\u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8 \u0cab\u0ccb\u0c9f\u0ccb/PDF</strong>, <strong>\u0c9f\u0cbe\u0c87\u0caa\u0ccd</strong>, \u0c85\u0ca5\u0cb5\u0cbe <strong>voice</strong> \u0c95\u0cc7\u0cb3\u0cbf.', c1: "\u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8 \u0cab\u0ccb\u0c9f\u0ccb", c2: "\u0cae\u0ca3\u0ccd\u0ca3\u0cc1 PDF", c3: "Voice Input", hint: "\u0cae\u0cc8\u0c95\u0ccd \u0c92\u0ca4\u0ccd\u0ca4\u0cbf \u0c85\u0ca5\u0cb5\u0cbe \u0c9f\u0cbe\u0c87\u0caa\u0ccd \u0cae\u0cbe\u0ca1\u0cbf", inputPh: "\u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8 \u0cac\u0c97\u0ccd\u0c97\u0cc6 \u0c95\u0cc7\u0cb3\u0cbf...", btnUp: "\u0c85\u0caa\u0ccd\u200c\u0cb2\u0ccb\u0ca1\u0ccd", drop: "\u0cae\u0ca3\u0ccd\u0ca3\u0cc1 \u0cab\u0cc8\u0cb2\u0ccd \u0c87\u0cb2\u0ccd\u0cb2\u0cbf \u0cac\u0cbf\u0ca1\u0cbf", selLang: "\u0cad\u0cbe\u0cb7\u0cc6 \u0c86\u0caf\u0ccd\u0c95\u0cc6\u0cae\u0cbe\u0ca1\u0cbf", errType: "\u26a0\ufe0f \u0cab\u0ccb\u0c9f\u0ccb \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 PDF \u0cae\u0cbe\u0ca4\u0ccd\u0cb0.", errSize: "\u26a0\ufe0f \u0c97\u0cb0\u0cbf\u0cb7\u0ccd\u0ca0 20MB.", errFail: "\u274c \u0cb5\u0cbf\u0cab\u0cb2." },
  bn: { title: "AgroVeda", sub: "\u09b8\u09cd\u09ae\u09be\u09b0\u09cd\u099f \u09ae\u09be\u099f\u09bf \u09ac\u09bf\u09b6\u09cd\u09b2\u09c7\u09b7\u09a3", analyzing: "\u09ac\u09bf\u09b6\u09cd\u09b2\u09c7\u09b7\u09a3 \u09b9\u099a\u09cd\u099b\u09c7", heroTitle: "\u09ae\u09be\u099f\u09bf\u09b0 \u09b8\u09cd\u09ac\u09be\u09b8\u09cd\u09a5\u09cd\u09af \u09ac\u09bf\u09b6\u09cd\u09b2\u09c7\u09b7\u0995", heroDesc: '<strong>\u09ae\u09be\u099f\u09bf\u09b0 \u099b\u09ac\u09bf/PDF</strong>, <strong>\u099f\u09be\u0987\u09aa</strong>, \u09ac\u09be <strong>voice</strong> \u099c\u09bf\u099c\u09cd\u099e\u09be\u09b8\u09be \u0995\u09b0\u09c1\u09a8\u0964', c1: "\u09ae\u09be\u099f\u09bf\u09b0 \u099b\u09ac\u09bf", c2: "\u09ae\u09be\u099f\u09bf PDF", c3: "Voice Input", hint: "\u09ae\u09be\u0987\u0995 \u099a\u09be\u09aa\u09c1\u09a8 \u09ac\u09be \u099f\u09be\u0987\u09aa \u0995\u09b0\u09c1\u09a8", inputPh: "\u09ae\u09be\u099f\u09bf \u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995\u09c7 \u099c\u09bf\u099c\u09cd\u099e\u09be\u09b8\u09be \u0995\u09b0\u09c1\u09a8...", btnUp: "\u0986\u09aa\u09b2\u09cb\u09a1", drop: "\u09ae\u09be\u099f\u09bf\u09b0 \u09ab\u09be\u0987\u09b2 \u098f\u0996\u09be\u09a8\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8", selLang: "\u09ad\u09be\u09b7\u09be \u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09a8", errType: "\u26a0\ufe0f \u099b\u09ac\u09bf \u098f\u09ac\u0982 PDF \u09ae\u09be\u09a4\u09cd\u09b0.", errSize: "\u26a0\ufe0f \u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a 20MB.", errFail: "\u274c \u09ac\u09cd\u09af\u09b0\u09cd\u09a5." },
  gu: { title: "AgroVeda", sub: "\u0ab8\u0acd\u0aae\u0abe\u0ab0\u0acd\u0a9f \u0aae\u0abe\u0a9f\u0ac0 \u0ab5\u0abf\u0ab6\u0acd\u0ab2\u0ac7\u0ab7\u0aa3", analyzing: "\u0ab5\u0abf\u0ab6\u0acd\u0ab2\u0ac7\u0ab7\u0aa3 \u0aa5\u0a88 \u0ab0\u0ab9\u0acd\u0aaf\u0ac1\u0a82", heroTitle: "\u0aae\u0abe\u0a9f\u0ac0 \u0ab8\u0acd\u0ab5\u0abe\u0ab8\u0acd\u0a25\u0acd\u0aaf \u0ab5\u0abf\u0ab6\u0acd\u0ab2\u0ac7\u0ab7\u0a95", heroDesc: '<strong>\u0aae\u0abe\u0a9f\u0ac0\u0aa8\u0cb5 \u0aab\u0acb\u0a9f\u0acb/PDF</strong>, <strong>\u0a9f\u0abe\u0a87\u0aaa</strong>, \u0a85\u0aa5\u0ab5\u0cbe <strong>voice</strong> \u0aaa\u0ac2\u0a9b\u0acb.', c1: "\u0aae\u0abe\u0a9f\u0ac0 \u0aab\u0acb\u0a9f\u0cb5", c2: "\u0aae\u0be8\u0a9f\u0ac0 PDF", c3: "Voice Input", hint: "\u0bae\u0bbe\u0b87\u0b95 \u0ba4\u0baa\u0bbe\u0cb5\u0cbe \u0c95\u0cbf\u0c82\u0cb5\u0cbe \u0c9f\u0cbe\u0c87\u0caa\u0ccd \u0c95\u0cb0\u0cbe", inputPh: "\u0aae\u0abe\u0a9f\u0ac0 \u0ab5\u0abf\u0ab6\u0ac7 \u0aaa\u0ac2\u0a9b\u0cb5\u0cbe...", btnUp: "\u0a85\u0aaa\u0ab2\u0cb5\u0ca1\u0ccd", drop: "\u0bae\u0bbe\u0b9f\u0bbf \u0baa\u0bc8\u0bb2\u0bcd \u0b87\u0bb2\u0bcd\u0bb2\u0bbf \u0bae\u0bc2\u0b95\u0bbe", selLang: "\u0cad\u0bbe\u0bb7\u0bbe \u0baa\u0bb8\u0b82\u0ba4", errType: "\u26a0\ufe0f \u0baa\u0bcb\u0b9f\u0bcb \u0b85\u0ba8\u0bc7 PDF \u0bae\u0bbe\u0ba4\u0bcd\u0bb0.", errSize: "\u26a0\ufe0f \u0bae\u0bb9\u0ba4\u0bcd\u0ba4\u0bae 20MB.", errFail: "\u274c \u0ba8\u0bbf\u0bb7\u0bbf\u0baa\u0bb3." },
  pa: { title: "AgroVeda", sub: "\u0a38\u0a2e\u0a3e\u0a30\u0a4d\u0a1f \u0a2e\u0a3f\u0a71\u0a1f\u0a40 \u0a35\u0a3f\u0a38\u0a3c\u0a32\u0a5c\u0a36\u0a23", analyzing: "\u0a35\u0a3f\u0a38\u0a3c\u0a32\u0a47\u0a36\u0a23 \u0a39\u0a4b \u0a30\u0a3f\u0a39\u0a3e", heroTitle: "\u0a2e\u0a3f\u0a71\u0a1f\u0a40 \u0a38\u0a3f\u0a39\u0a24 \u0a35\u0a3f\u0a38\u0a3c\u0a32\u0a47\u0a36\u0a15", heroDesc: '<strong>\u0a2e\u0a3f\u0a71\u0a1f\u0a40 \u0a26\u0a40 \u0a2b\u0a4b\u0a1f\u0a4b/PDF</strong>, <strong>\u0a1f\u0a3e\u0a08\u0a2a</strong>, \u0a1c\u0a3e\u0a02 <strong>voice</strong> \u0a2a\u0ac1\u0a71\u0a4b.', c1: "\u0a2e\u0a3f\u0a71\u0a1f\u0a40 \u0a2b\u0a4b\u0a1f\u0a4b", c2: "\u0a2e\u0a3f\u0a71\u0a1f\u0a40 PDF", c3: "Voice Input", hint: "\u0a2e\u0a3e\u0a08\u0a15 \u0a26\u0a2c\u0a3e\u0a13 \u0a1c\u0a3e\u0a02 \u0a1f\u0a3e\u0a08\u0a2a \u0a15\u0a30\u0a4b", inputPh: "\u0a2e\u0a3f\u0a71\u0a1f\u0a40 \u0a2c\u0a3e\u0a30\u0a47 \u0a2a\u0ac1\u0a71\u0a4b...", btnUp: "\u0a05\u0a2a\u0a32\u0a4b\u0a1f", drop: "\u0a2e\u0a3f\u0a71\u0a1f\u0a40 \u0a2b\u0a3e\u0a08\u0a32 \u0a07\u0a71\u0a25\u0a47 \u0a38\u0a41\u0a1f\u0a4b", selLang: "\u0a2d\u0a3e\u0a36\u0a3e \u0a1a\u0a41\u0a23\u0a4b", errType: "\u26a0\ufe0f \u0a2b\u0a4b\u0a1f\u0a4b \u0a05\u0a24\u0a47 PDF \u0a39\u0a40.", errSize: "\u26a0\ufe0f \u0a35\u0a71\u0a7c\u0a27 \u0a24\u0a4b\u0a02 \u0a35\u0a71\u0a7c\u0a27 20MB.", errFail: "\u274c \u0a05\u0a38\u0a2b\u0a32." },
  ur: { title: "AgroVeda", sub: "\u0633\u0645\u0627\u0631\u0639 \u0645\u0679\u06cc \u062a\u062c\u0632\u06cc\u0641", analyzing: "\u062a\u062c\u0632\u06cc\u0641 \u062c\u0627\u0631\u06cc", heroTitle: "\u0645\u0679\u06cc \u06a9\u06cc \u0635\u062d\u062a \u062a\u062c\u0632\u06cc\u0641 \u06a9\u0627\u0631", heroDesc: '<strong>\u0645\u0679\u06cc \u06a9\u06cc \u062a\u0635\u0648\u06cc\u0631/PDF</strong>\u060c <strong>\u0679\u0627\u0626\u067e</strong>\u060c \u06cc\u0627 <strong>voice</strong> \u0633\u06d2 \u067e\u0648\u0686\u06cc\u06ba\u06d4', c1: "\u0645\u0679\u06cc \u062a\u0635\u0648\u06cc\u0631", c2: "\u0645\u0679\u06cc PDF", c3: "Voice Input", hint: "\u0645\u0627\u0626\u06a9 \u062f\u0628\u0627\u0626\u06cc\u06ba \u06cc\u0627 \u0679\u0627\u0626\u067e \u06a9\u0631\u06cc\u06ba", inputPh: "\u0645\u0679\u06cc \u06a9\u06d2 \u0628\u0627\u0631\u06d2 \u0645\u06cc\u06ba \u067e\u0648\u0686\u06cc\u06ba...", btnUp: "\u0627\u067e\u0644\u0648\u0688", drop: "\u0645\u0679\u06cc \u0641\u0627\u0626\u0644 \u06cc\u06c1\u0627\u06ba \u0686\u06be\u0648\u0691\u06cc\u06ba", selLang: "\u0632\u0628\u0627\u0646 \u0645\u0646\u062a\u062e\u0628", errType: "\u26a0\ufe0f \u062a\u0635\u0627\u0648\u0631 \u0627\u0648\u0631 PDF \u06c1\u06cc.", errSize: "\u26a0\ufe0f \u0632\u06cc\u0627\u062f\u06c1 \u0633\u06d2 \u0632\u06cc\u0627\u062f\u0641 20MB.", errFail: "\u274c \u0646\u0627\u06a9\u0627\u0645." },
  es: { title: "AgroVeda", sub: "An\u00e1lisis Inteligente del Suelo", analyzing: "Analizando", heroTitle: "Analizador de Salud del Suelo", heroDesc: 'Sube una <strong>foto/PDF del suelo</strong>, <strong>escribe</strong> o <strong>pregunta por voz</strong>.', c1: "Foto del Suelo", c2: "PDF de Prueba", c3: "Voice Input", hint: "Toca el micr\u00f3fono o escribe", inputPh: "Pregunta sobre el suelo...", btnUp: "Subir", drop: "Suelta tu archivo aqu\u00ed", selLang: "Seleccionar Idioma", errType: "\u26a0\ufe0f Solo im\u00e1genes y PDF.", errSize: "\u26a0\ufe0f M\u00e1ximo 20MB.", errFail: "\u274c Error." },
  fr: { title: "AgroVeda", sub: "Analyse Intelligente du Sol", analyzing: "Analyse", heroTitle: "Analyseur de Sant\u00e9 du Sol", heroDesc: 'T\u00e9l\u00e9chargez une <strong>photo/PDF du sol</strong>, <strong>tapez</strong> ou <strong>demandez par voix</strong>.', c1: "Photo du Sol", c2: "PDF de Test", c3: "Voice Input", hint: "Touchez le micro ou tapez", inputPh: "Posez une question sur le sol...", btnUp: "T\u00e9l\u00e9charger", drop: "D\u00e9posez votre fichier ici", selLang: "Choisir la Langue", errType: "\u26a0\ufe0f Images et PDF uniquement.", errSize: "\u26a0\ufe0f Maximum 20MB.", errFail: "\u274c \u00c9chec." },
  pt: { title: "AgroVeda", sub: "An\u00e1lise Inteligente do Solo", analyzing: "Analisando", heroTitle: "Analisador de Sa\u00fade do Solo", heroDesc: 'Envie uma <strong>foto/PDF do solo</strong>, <strong>digite</strong> ou <strong>pergunte por voz</strong>.', c1: "Foto do Solo", c2: "PDF de Teste", c3: "Voice Input", hint: "Toque no microfone ou digite", inputPh: "Pergunte sobre o solo...", btnUp: "Enviar", drop: "Solte seu arquivo aqui", selLang: "Selecionar Idioma", errType: "\u26a0\ufe0f Apenas imagens e PDF.", errSize: "\u26a0\ufe0f M\u00e1ximo 20MB.", errFail: "\u274c Falha." },
  zh: { title: "AgroVeda", sub: "\u667a\u80fd\u571f\u58e4\u5206\u6790", analyzing: "\u5206\u6790\u4e2d", heroTitle: "\u571f\u58e4\u5065\u5eb7\u5206\u6790\u5668", heroDesc: '\u4e0a\u4f20<strong>\u571f\u58e4\u7167\u7247/PDF</strong>\u3001<strong>\u6253\u5b57</strong>\u6216<strong>\u8bed\u97f3\u63d0\u95ee</strong>\u3002', c1: "\u571f\u58e4\u7167\u7247", c2: "\u571f\u58e4\u68c0\u6d4bPDF", c3: "Voice Input", hint: "\u70b9\u51fb\u9ea6\u514b\u98ce\u6216\u8f93\u5165", inputPh: "\u8be2\u95ee\u5173\u4e8e\u571f\u58e4\u7684\u95ee\u9898...", btnUp: "\u4e0a\u4f20", drop: "\u5c06\u6587\u4ef6\u62d6\u653e\u5230\u6b64\u5904", selLang: "\u9009\u62e9\u8bed\u8a00", errType: "\u26a0\ufe0f \u4ec5\u63a5\u53d7\u56fe\u7247\u548cPDF\u3002", errSize: "\u26a0\ufe0f \u6700\u592720MB\u3002", errFail: "\u274c \u5931\u8d25\u3004" },
  ar: { title: "AgroVeda", sub: "\u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u062a\u0631\u0628\u0629 \u0627\u0644\u0630\u0643\u064a", analyzing: "\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0644\u064a\u0644", heroTitle: "\u0645\u062d\u0644\u0644 \u0635\u062d\u0629 \u0627\u0644\u062a\u0631\u0628\u0629", heroDesc: '\u0627\u0631\u0641\u0639 <strong>\u0635\u0648\u0631\u0629/PDF \u0644\u0644\u062a\u0631\u0628\u0629</strong> \u0623\u0648 <strong>\u0627\u0633\u0623\u0644 \u0628\u0635\u0648\u062a\u0643</strong>.', c1: "\u0635\u0648\u0631\u0629 \u0627\u0644\u062a\u0631\u0628\u0629", c2: "PDF \u0627\u0644\u0641\u062d\u0635", c3: "Voice Input", hint: "\u0627\u0636\u063a\u0637 \u0639\u0644\u0649 \u0627\u0644\u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646 \u0623\u0648 \u0627\u0643\u062a\u0628", inputPh: "\u0627\u0633\u0623\u0644 \u0639\u0646 \u0627\u0644\u062a\u0631\u0628\u0629...", btnUp: "\u0631\u0641\u0639", drop: "\u0623\u0641\u0644\u062a \u0645\u0644\u0641\u0643 \u0647\u0646\u0627", selLang: "\u0627\u062e\u062a\u0631 \u0627\u0644\u0644\u063a\u0629", errType: "\u26a0\ufe0f \u0635\u0648\u0631 \u0648 PDF \u0641\u0642\u0637.", errSize: "\u26a0\ufe0f \u0627\u0644\u062d\u062f \u0627\u0644\u0623\u0642\u0635\u0649 20MB.", errFail: "\u274c \u0641\u0634\u0644." },
  ja: { title: "AgroVeda", sub: "\u30b9\u30de\u30fc\u30c8\u571f\u58e4\u5206\u6790", analyzing: "\u5206\u6790\u4e2d", heroTitle: "\u571f\u58e4\u5065\u5eb7\u30a2\u30ca\u30e9\u30a4\u30b6\u30fc", heroDesc: '<strong>\u571f\u58e4\u306e\u5199\u771f/PDF</strong>\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u3001<strong>\u5165\u529b</strong>\u3001\u307e\u305f\u306f<strong>\u97f3\u58f0</strong>\u3067\u8cea\u554f\u3002', c1: "\u571f\u58e4\u5199\u771f", c2: "\u571f\u58e4\u691c\u67fbPDF", c3: "Voice Input", hint: "\u30de\u30a4\u30af\u3092\u30bf\u30c3\u30d7\u3057\u3066\u5165\u529b", inputPh: "\u571f\u58e4\u306b\u3064\u3044\u3066\u8cea\u554f...", btnUp: "\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9", drop: "\u30d5\u30a1\u30a4\u30eb\u3092\u3053\u3053\u306b\u30c9\u30ed\u30c3\u30d7", selLang: "\u8a00\u8a9e\u3092\u9078\u629e", errType: "\u26a0\ufe0f \u753b\u50cf\u3068PDF\u306e\u307f\u3002", errSize: "\u26a0\ufe0f \u6700\u592720MB\u3002", errFail: "\u274c \u5931\u6557\u3002" },
};

const SpeechAPI = typeof window !== "undefined"
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lang, setLang] = useState("en");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const fileInputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const recognitionRef = useRef(null);
  const isProcessingRef = useRef(false);
  const langRef = useRef("en");
  const speechIdRef = useRef(0);

  const t = T[lang] || T.en;
  const isRTL = lang === "ar" || lang === "ur";
  const currentLangLabel = LANGUAGES.find((l) => l.code === lang)?.label || "English";

  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { isProcessingRef.current = isProcessing; }, [isProcessing]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const h = (e) => {
      if (!e.target.closest(".lang-btn") && !e.target.closest(".lang-menu"))
        setShowLangMenu(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) try { recognitionRef.current.abort(); } catch (e) {}
    };
  }, []);

  const getRecogLang = () =>
    LANGUAGES.find((l) => l.code === langRef.current)?.recog || "en-US";

  const killRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const speak = (text, onDone) => {
    if (!text || !text.trim()) {
      if (onDone) setTimeout(onDone, 50);
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    const id = ++speechIdRef.current;

    setTimeout(() => {
      if (id !== speechIdRef.current) { if (onDone) onDone(); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = getRecogLang();
      u.rate = 1;
      const finish = () => {
        if (id === speechIdRef.current) setIsSpeaking(false);
        if (onDone) onDone();
      };
      u.onend = finish;
      u.onerror = finish;
      window.speechSynthesis.speak(u);
    }, 150);
  };

  const startListening = () => {
    if (!SpeechAPI || isProcessingRef.current) return;
    killRecognition();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const rec = new SpeechAPI();
    rec.lang = getRecogLang();
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => { setIsListening(true); };
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      handleSend(text, true);
    };
    rec.onerror = (e) => { console.warn("Mic error:", e.error); setIsListening(false); };
    rec.onend = () => { setIsListening(false); };

    recognitionRef.current = rec;
    setTimeout(() => { try { rec.start(); } catch (e) {} }, 100);
  };

  const handleMicClick = () => {
    if (isProcessingRef.current) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); speechIdRef.current++; setIsSpeaking(false); }
    if (isListening) { killRecognition(); } else { startListening(); }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result.split(",")[1]);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") { setMessages((p) => [...p, { text: t.errType, sender: "bot" }]); return; }
    if (file.size > 20 * 1024 * 1024) { setMessages((p) => [...p, { text: t.errSize, sender: "bot" }]); return; }

    killRecognition(); window.speechSynthesis.cancel(); setIsSpeaking(false);
    const isImage = file.type.startsWith("image/");
    setMessages((p) => [...p, { sender: "user", fileName: file.name, fileType: file.type, filePreview: isImage ? URL.createObjectURL(file) : null }]);
    setIsProcessing(true); isProcessingRef.current = true;

    try {
      const base64 = await fileToBase64(file);
      const selectedLang = LANGUAGES.find((l) => l.code === lang)?.label || "English";
      const reply = await analyzeSoil(file.type, base64, file.name, selectedLang);
      setMessages((p) => [...p, { text: reply, sender: "bot" }]);
    } catch (err) {
      console.error(err);
      setMessages((p) => [...p, { text: t.errFail, sender: "bot" }]);
    } finally {
      setIsProcessing(false); isProcessingRef.current = false;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async (text, shouldSpeak = false) => {
    const userMessage = (text || input).trim();
    if (!userMessage || isProcessingRef.current) return;

    killRecognition(); window.speechSynthesis.cancel(); setIsSpeaking(false);
    setMessages((p) => [...p, { text: userMessage, sender: "user" }]);
    setInput(""); setIsProcessing(true); isProcessingRef.current = true;
    setMessages((p) => [...p, { text: "...", sender: "bot" }]);

    try {
      const selectedLang = LANGUAGES.find((l) => l.code === lang)?.label || "English";
      const reply = await sendToAI(userMessage, selectedLang);

      setMessages((p) => { const updated = [...p]; updated.pop(); return [...updated, { text: reply, sender: "bot" }]; });
      setIsProcessing(false); isProcessingRef.current = false;

      if (shouldSpeak) { speak(reply); }
    } catch (err) {
      console.error(err);
      setMessages((p) => { const updated = [...p]; updated.pop(); return [...updated, { text: t.errFail, sender: "bot" }]; });
      setIsProcessing(false); isProcessingRef.current = false;
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDragActive(false); };
  const onDrop = (e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };

  const openPicker = () => { if (!isProcessingRef.current) fileInputRef.current?.click(); };
  const toggleLang = (e) => { e.stopPropagation(); setShowLangMenu((p) => !p); };
  const pickLang = (code) => { setLang(code); setShowLangMenu(false); };

  /* ==========================================
     CATCH DATA FROM CROP PREDICTOR (MUST BE HERE)
     ========================================== */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingData = params.get('predict');

    if (incomingData) {
      try {
        const data = JSON.parse(decodeURIComponent(incomingData));
        
        const autoMessage = `I tested my soil and got a crop prediction. Here are my details:\n` +
          `Nitrogen: ${data.N}\nPhosphorus: ${data.P}\nPotassium: ${data.K}\n` +
          `Temperature: ${data.temperature}°C\nHumidity: ${data.humidity}%\n` +
          `Rainfall: ${data.rainfall}mm\npH: ${data.ph}\n\n` +
          `The AI predicted these crops:\n${data.result}\n\n` +
          `Based on these exact soil conditions and predicted crops, tell me exactly which fertilizers to buy, how much to apply per acre, and any specific care tips.`;

        setTimeout(() => {
          handleSend(autoMessage);
        }, 500);

        window.history.replaceState({}, '', '/');
      } catch (err) {
        console.error("Failed to read predictor data", err);
      }
    }
  }, []);

  return (
    <div className="app" dir={isRTL ? "rtl" : "ltr"}>
      <header className="header">
        <div className="header-left">
          <div className="logo-circle">🍃</div>
          <div>
            <h1>{t.title}</h1>
            <p className="header-sub">{t.sub}</p>
          </div>
        </div>
        <div className="header-right">
          {isListening && (<span className="status-chip listen-chip"><span className="spin-dot blue"></span>🎤 Listening</span>)}
          {isSpeaking && (<span className="status-chip speak-chip"><span className="spin-dot orange"></span>🔊 Speaking</span>)}
          {isProcessing && (<span className="status-chip"><span className="spin-dot"></span>{t.analyzing}</span>)}
          <div className="lang-wrapper">
            <button type="button" className="lang-btn" onClick={toggleLang}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>
              <span>{currentLangLabel}</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className={`chevron ${showLangMenu ? "open" : ""}`}><path d="M7 10l5 5 5-5z"/></svg>
            </button>
            {showLangMenu && (
              <div className="lang-menu" onClick={(e) => e.stopPropagation()}>
                <div className="lang-menu-title">{t.selLang}</div>
                <div className="lang-options">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} type="button" className={`lang-option ${lang === l.code ? "active" : ""}`} onClick={() => pickLang(l.code)}>
                      <span className="lang-check">{lang === l.code ? "\u2713" : ""}</span>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={`chat-box ${dragActive ? "drag-active" : ""}`} ref={chatBoxRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        {messages.length === 0 && (
          <div className="hero">
            <div className="hero-icon">🍃</div>
            <h2>{t.heroTitle}</h2>
            <p className="hero-desc" dangerouslySetInnerHTML={{ __html: t.heroDesc }} />
            <div className="info-cards">
              <div className="info-card"><span className="info-icon">📸</span><span>{t.c1}</span></div>
              <div className="info-card"><span className="info-icon">📄</span><span>{t.c2}</span></div>
              <div className="info-card"><span className="info-icon">🎤</span><span>{t.c3}</span></div>
            </div>
            <p className="hero-hint">{t.hint}</p>
          </div>
        )}

        {dragActive && (
          <div className="drag-overlay">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
            <p>{t.drop}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.sender}-msg`}>
            {msg.sender === "bot" && <div className="avatar bot-avatar">🍃</div>}
            <div className="bubble">
              {msg.filePreview ? (
                <div className="file-card">
                  <img src={msg.filePreview} alt={msg.fileName} className="preview-img" />
                  <span className="file-label">📎 {msg.fileName}</span>
                </div>
              ) : msg.fileName && !msg.filePreview ? (
                <div className="file-card pdf-card">
                  <div className="pdf-badge">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
                  </div>
                  <span className="file-label">📎 {msg.fileName}</span>
                </div>
              ) : msg.sender === "bot" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
            {msg.sender === "user" && (
              <div className="avatar user-avatar">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="msg bot-msg">
            <div className="avatar bot-avatar">🍃</div>
            <div className="bubble">
              <div className="typing"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
        <button type="button" className="f-btn upload-btn" onClick={openPicker} disabled={isProcessing} title={t.btnUp}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM6 20V4h5v7h7v9H6z"/></svg>
        </button>
        <input className="f-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.inputPh} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()} disabled={isProcessing} />
        <button type="button" className="f-btn send-btn" onClick={() => handleSend()} disabled={isProcessing || !input.trim()} title="Send">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
        {SpeechAPI && (
          <button type="button" className={`f-btn mic-btn ${isListening ? "active" : ""}`} onClick={handleMicClick} disabled={isProcessing} title="Voice">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;