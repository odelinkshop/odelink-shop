import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function withScrollSentenceReveal(Component) {
  return (props) => {
    const ref = useRef(null);
    useLayoutEffect(() => {
      const root = ref.current;
      if (!root) return;
      if (root.dataset.sentenceReveal === "true") return;
      root.dataset.sentenceReveal = "true";
      const activeColor = "#000000";
      const inactiveColor = "#757575"; // ✅ Only target safe text containers
      const targets = root.querySelectorAll("p, h1, h2, h3, h4, h5, h6");
      targets.forEach((element) => {
        // 🚫 Skip if inside form or label
        if (element.closest("form, label")) return; // 🚫 Skip if element has ID (could be aria reference)
        if (element.id) return;
        const text = element.textContent;
        if (!text || !text.includes(".")) return;
        const parts = text.split(".");
        if (parts.length <= 1) return;
        const fragment = document.createDocumentFragment();
        parts.forEach((part, i) => {
          if (!part.trim()) return;
          const span = document.createElement("span");
          span.className = "reveal-sentence";
          span.textContent = part.trim() + (i < parts.length - 1 ? ". " : "");
          fragment.appendChild(span);
        });
        element.innerHTML = "";
        element.appendChild(fragment);
      });
      const sentences = root.querySelectorAll(".reveal-sentence");
      if (!sentences.length) return;
      gsap.set(sentences, { color: inactiveColor });
      gsap.set(sentences[0], { color: activeColor });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 80%",
          end: "bottom 60%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      sentences.forEach((sentence, i) => {
        if (i === 0) return;
        tl.to(
          sentence,
          { color: activeColor, duration: 0.4, ease: "power2.out" },
          i * 0.5
        );
      });
      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    }, []);
    return /*#__PURE__*/ _jsxs(_Fragment, {
      children: [
        /*#__PURE__*/ _jsx("style", {
          children: `
                    .reveal-sentence {
                        display: inline;
                    }
                `,
        }),
        /*#__PURE__*/ _jsx(Component, { ...props, ref: ref }),
      ],
    });
  };
}
export const __FramerMetadata__ = {
  exports: {
    withScrollSentenceReveal: {
      type: "reactHoc",
      name: "withScrollSentenceReveal",
      annotations: { framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./Text_Reveal.map
