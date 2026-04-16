// SkyDropText: Animated falling text logo, auto-sizes to fit text, no container.
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState, useMemo } from "react";
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer";
const TEXT = "SkyDrop";
const FONT_SIZE = 40;
const GRAVITY = 1200; // px/s^2
const BOUNCE = 0.7; // 30% energy loss
const STAGGER_WINDOW = 200; // ms
const SUBSTEPS = 2;
function getFont(fontSize, fontFamily, fontWeight) {
  return {
    fontFamily,
    fontWeight,
    fontSize: fontSize + "px",
    color: "#fff",
    lineHeight: 1,
    letterSpacing: 0,
    userSelect: "none",
    pointerEvents: "none",
  };
}
function getLetterWidth(char, fontSize, fontFamily, fontWeight) {
  if (typeof window === "undefined") return fontSize * 0.6;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  return ctx.measureText(char).width;
}
function getLetterHeight(char, fontSize, fontFamily, fontWeight) {
  if (typeof window === "undefined") return fontSize;
  const span = document.createElement("span");
  span.style.visibility = "hidden";
  span.style.position = "absolute";
  span.style.fontFamily = fontFamily;
  span.style.fontWeight = fontWeight;
  span.style.fontSize = fontSize + "px";
  span.textContent = char;
  document.body.appendChild(span);
  const height = span.offsetHeight || fontSize;
  document.body.removeChild(span);
  return height;
}
/**
 * SkyDropText
 *
 * Animated falling text with random static rotation, vertical bounce, and perfect alignment on landing.
 * Letters fall from the top with random start times and fixed random rotation (-45 to 45deg), bounce vertically, and align perfectly at the center line with 0deg rotation.
 *
 * @framerIntrinsicWidth auto
 * @framerIntrinsicHeight auto
 *
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */ export default function SkyDropText(props) {
  const {
    text = TEXT,
    fontSize = FONT_SIZE,
    gravity = GRAVITY,
    bounce = BOUNCE,
    font,
    style,
    textColor = "#FFFFFF",
  } = props;
  const isStatic = useIsStaticRenderer();
  const [letters, setLetters] = useState(() => text.split(""));
  const [positions, setPositions] = useState(() =>
    letters.map(() => ({
      x: 0,
      y: 0,
      vy: 0,
      phase: 0,
      bouncing: 0,
      bounceV: 0,
      settled: false,
      rot: 0,
      startTime: 0,
    }))
  );
  const [settled, setSettled] = useState(false);
  const [frame, setFrame] = useState(0);
  const animRef = useRef(null);
  const startTimeRef = useRef(0);
  const containerRef = useRef(null);
  const [letterWidths, setLetterWidths] = useState([]);
  const [letterHeights, setLetterHeights] = useState([]);
  const [letterStartTimes, setLetterStartTimes] = useState([]);
  const [letterInitialRots, setLetterInitialRots] = useState([]);
  useEffect(() => {
    setLetters(text.split(""));
  }, [text]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fontFamily = font?.fontFamily || "Arial";
    const fontWeight = font?.fontWeight || "bold";
    const widths = letters.map((char) =>
      getLetterWidth(char, fontSize, fontFamily, fontWeight)
    );
    setLetterWidths(widths);
    const heights = letters.map((char) =>
      getLetterHeight(char, fontSize, fontFamily, fontWeight)
    );
    setLetterHeights(heights);
  }, [letters, fontSize, font]); // Generate random start times and static initial rotations
  useEffect(() => {
    const starts = letters.map(() => Math.random() * STAGGER_WINDOW);
    setLetterStartTimes(starts);
    const rots = letters.map(() => (Math.random() - 0.5) * 90); // -45deg to +45deg
    setLetterInitialRots(rots);
  }, [letters]); // Compute max letter height for vertical centering
  const maxLetterHeight = useMemo(
    () => (letterHeights.length ? Math.max(...letterHeights) : fontSize),
    [letterHeights, fontSize]
  ); // Calculate text bounding box
  const totalTextWidth = useMemo(
    () =>
      letterWidths.reduce((a, b) => a + b, 0) +
      (letters.length - 1) * fontSize * 0.15,
    [letterWidths, letters, fontSize]
  );
  const padding = typeof props.padding === "number" ? props.padding : 10;
  const containerWidth = totalTextWidth + padding * 2; // If padding is 0, bounce only downward, so top is flush
  const bounceRoom = fontSize * 0.2;
  const containerHeight =
    padding === 0
      ? maxLetterHeight + bounceRoom
      : maxLetterHeight + bounceRoom + padding * 2; // Baseline so text sits centered vertically, respecting padding
  // If padding is 0, groundY is at maxLetterHeight (flush to top after bounce)
  const groundY =
    padding === 0
      ? maxLetterHeight
      : padding +
        (containerHeight - 2 * padding) / 2 +
        maxLetterHeight / 2 -
        maxLetterHeight * 0.1; // Compute final layout for perfect alignment
  const layout = useMemo(() => {
    const totalWidth =
      letterWidths.reduce((a, b) => a + b, 0) +
      (letters.length - 1) * fontSize * 0.15;
    let x = (containerWidth - totalWidth) / 2;
    return letters.map((char, i) => {
      const w = letterWidths[i] || fontSize * 0.6;
      const pos = x + w / 2;
      x += w + fontSize * 0.15;
      return pos;
    });
  }, [letterWidths, letters, fontSize, containerWidth]);
  useEffect(() => {
    if (isStatic) return;
    let running = true;
    let last = performance.now();
    let localPositions = letters.map((_, i) => ({
      x: layout[i],
      y: 0,
      vy: 0,
      bouncing: 0,
      bounceV: 0,
      settled: false,
      rot: letterInitialRots[i] || 0,
      startTime: letterStartTimes[i] || 0,
    }));
    setPositions(localPositions);
    setSettled(false);
    setFrame(0);
    startTimeRef.current = performance.now();
    function animate() {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min((now - last) / 1e3, 1 / 30);
      last = now;
      let tempPositions = localPositions.map((p) => ({ ...p }));
      for (let sub = 0; sub < SUBSTEPS; sub++) {
        let subdt = dt / SUBSTEPS;
        for (let i = 0; i < tempPositions.length; i++) {
          const t0 = (letterStartTimes[i] || 0) / 1e3;
          let t = (now - startTimeRef.current) / 1e3 - t0;
          if (t < 0) t = 0;
          let p = tempPositions[i];
          if (p.settled) continue; // Only fall after start time
          if (t === 0) continue;
          p.vy += gravity * subdt;
          p.y += p.vy * subdt; // Bounce on ground
          if (p.y >= groundY) {
            p.y = groundY;
            if (p.bouncing < 1 && Math.abs(p.vy) > 60) {
              p.vy = -Math.abs(p.vy) * bounce;
              p.bouncing++;
            } else {
              p.vy = 0;
              p.settled = true;
            }
          } // Clamp to never fall below ground
          if (p.y > groundY) p.y = groundY;
        }
      } // If all settled, snap to perfect alignment and 0deg rotation
      let allSettledFlag = true;
      for (let i = 0; i < tempPositions.length; i++) {
        if (!tempPositions[i].settled) allSettledFlag = false;
      }
      if (allSettledFlag) {
        tempPositions = tempPositions.map((p, i) => ({
          ...p,
          x: layout[i],
          y: groundY,
          rot: 0,
        }));
      }
      localPositions = tempPositions;
      setPositions(tempPositions);
      setFrame((f) => f + 1);
      if (!allSettledFlag) {
        animRef.current = window.requestAnimationFrame(animate);
      } else {
        setSettled(true);
      }
    }
    animRef.current = window.requestAnimationFrame(animate);
    return () => {
      running = false;
      if (animRef.current) window.cancelAnimationFrame(animRef.current);
    };
  }, [
    text,
    fontSize,
    gravity,
    bounce,
    layout,
    isStatic,
    letterWidths,
    letterHeights,
    letterStartTimes,
    letterInitialRots,
    containerHeight,
  ]);
  if (isStatic) {
    return /*#__PURE__*/ _jsx("div", {
      style: {
        width: containerWidth,
        height: containerHeight,
        position: "relative",
        display: "block",
        ...style,
      },
      ref: containerRef,
      children: letters.map((char, i) =>
        /*#__PURE__*/ _jsx(
          "span",
          {
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate(${
                layout[i] - (letterWidths[i] || fontSize * 0.6) / 2
              }px, ${groundY - (letterHeights[i] || maxLetterHeight) / 2}px)`,
              ...getFont(
                fontSize,
                font?.fontFamily || "Arial, Helvetica, sans-serif",
                font?.fontWeight || "bold"
              ),
              color: textColor,
              pointerEvents: "none",
              userSelect: "none",
            },
            "aria-label": char,
            children: char,
          },
          i
        )
      ),
    });
  }
  return /*#__PURE__*/ _jsx("div", {
    style: {
      width: containerWidth,
      height: containerHeight,
      position: "relative",
      display: "block",
      overflow: "visible",
      ...style,
    },
    ref: containerRef,
    "aria-label": text,
    children: letters.map((char, i) => {
      const p = positions[i] || { x: layout[i], y: 0, rot: 0 };
      const translateX = p.x - (letterWidths[i] || fontSize * 0.6) / 2;
      const translateY = p.y - (letterHeights[i] || maxLetterHeight) / 2;
      const rotation = p.settled || settled ? 0 : letterInitialRots[i] || 0;
      return /*#__PURE__*/ _jsx(
        "span",
        {
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`,
            transition:
              p.settled || settled
                ? "transform 0.5s cubic-bezier(.4,2,.2,1)"
                : "none",
            willChange: p.settled || settled ? "auto" : "transform",
            ...getFont(
              fontSize,
              font?.fontFamily || "Arial, Helvetica, sans-serif",
              font?.fontWeight || "bold"
            ),
            color: textColor,
            pointerEvents: "none",
            userSelect: "none",
          },
          "aria-label": char,
          children: char,
        },
        i
      );
    }),
  });
}
addPropertyControls(SkyDropText, {
  padding: {
    type: ControlType.Number,
    title: "Padding",
    defaultValue: 10,
    min: 0,
    max: 100,
    step: 1,
    unit: "px",
  },
  text: { type: ControlType.String, title: "Text", defaultValue: TEXT },
  fontSize: {
    type: ControlType.Number,
    title: "Font Size",
    defaultValue: FONT_SIZE,
    min: 16,
    max: 120,
    step: 1,
    unit: "px",
  },
  textColor: {
    type: ControlType.Color,
    title: "Text Color",
    defaultValue: "#FFFFFF",
  },
  gravity: {
    type: ControlType.Number,
    title: "Gravity",
    defaultValue: GRAVITY,
    min: 100,
    max: 3e3,
    step: 10,
    unit: "px/s\xb2",
  },
  bounce: {
    type: ControlType.Number,
    title: "Bounce Elasticity",
    defaultValue: BOUNCE,
    min: 0.3,
    max: 0.95,
    step: 0.01,
  },
  font: {
    type: ControlType.Font,
    title: "Font",
    controls: "extended",
    defaultFontType: "sans-serif",
    defaultValue: {
      fontSize: FONT_SIZE,
      variant: "Bold",
      letterSpacing: 0,
      lineHeight: "1em",
    },
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "SkyDropText",
      slots: [],
      annotations: {
        framerSupportedLayoutWidth: "auto",
        framerContractVersion: "1",
        framerIntrinsicWidth: "auto",
        framerSupportedLayoutHeight: "auto",
        framerIntrinsicHeight: "auto",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./SkyDropText.map
