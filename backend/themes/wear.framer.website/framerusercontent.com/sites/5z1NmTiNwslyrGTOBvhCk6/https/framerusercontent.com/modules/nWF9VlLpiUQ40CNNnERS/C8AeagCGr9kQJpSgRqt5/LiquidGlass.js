// Apple Liquid Glass (WWDC 2025) style glass effect
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from "react";
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer";
/**
 * Apple Liquid Glass (WWDC 2025)
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */ export default function LiquidGlass(props) {
  const {
    blur = 20,
    minBlur = 0,
    maxBlur = 20,
    blurDirection = "in",
    borderRadius = 16,
    gradientColor1 = "rgba(255,255,255,0.18)",
    gradientColor2 = "rgba(0,180,255,0.10)",
    gradientAngle = 135,
    gradientIntensity = 1,
    highlightColor = "rgba(255,255,255,0.35)",
    highlightIntensity = 0.7,
    highlightX = 30,
    highlightY = 20,
    highlightRadius = 60,
    backgroundColor = "rgba(255,255,255,0.10)",
    glassType = "frosted",
    style,
  } = props;
  const isStatic = useIsStaticRenderer();
  const [t, setT] = useState(0);
  const reqRef = useRef(); // Animate blur value between minBlur and maxBlur
  useEffect(() => {
    if (isStatic) return;
    let start = performance.now();
    const duration = 3200;
    function animate(now) {
      const elapsed = (now - start) % duration;
      const tNorm = Math.sin((elapsed / duration) * Math.PI);
      setT(tNorm);
      reqRef.current = requestAnimationFrame(animate);
    }
    reqRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isStatic]); // Compute animated blur
  const animatedBlur = useMemo(() => {
    return blurDirection === "in"
      ? minBlur + (maxBlur - minBlur) * t
      : maxBlur - (maxBlur - minBlur) * t;
  }, [blurDirection, minBlur, maxBlur, t]); // Memoize gradient and highlight
  const backgroundLayers = useMemo(() => {
    const gradient = `linear-gradient(${gradientAngle}deg, ${gradientColor1} 0%, ${gradientColor2} 100%)`;
    const highlight = `radial-gradient(circle at ${highlightX}% ${highlightY}%, ${highlightColor} 0%, transparent ${highlightRadius}%)`;
    return `${gradient}, ${highlight}`;
  }, [
    gradientAngle,
    gradientColor1,
    gradientColor2,
    highlightX,
    highlightY,
    highlightColor,
    highlightRadius,
  ]); // Glass texture overlays
  const textureOverlay = useMemo(() => {
    if (glassType === "etched") {
      return /*#__PURE__*/ _jsxs("svg", {
        style: {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          borderRadius,
          pointerEvents: "none",
          zIndex: 4,
          opacity: 0.18,
        },
        viewBox: "0 0 100 100",
        preserveAspectRatio: "none",
        "aria-hidden": "true",
        children: [
          /*#__PURE__*/ _jsx("defs", {
            children: /*#__PURE__*/ _jsx("pattern", {
              id: "etchedPattern",
              width: "6",
              height: "6",
              patternUnits: "userSpaceOnUse",
              children: /*#__PURE__*/ _jsx("path", {
                d: "M0,0 L6,6 M6,0 L0,6",
                stroke: "#fff",
                strokeWidth: "0.5",
                opacity: "0.25",
              }),
            }),
          }),
          /*#__PURE__*/ _jsx("rect", {
            x: "0",
            y: "0",
            width: "100",
            height: "100",
            fill: "url(#etchedPattern)",
          }),
        ],
      });
    } else if (glassType === "frosted") {
      return /*#__PURE__*/ _jsxs("svg", {
        style: {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          borderRadius,
          pointerEvents: "none",
          zIndex: 4,
          opacity: 0.1,
        },
        viewBox: "0 0 100 100",
        preserveAspectRatio: "none",
        "aria-hidden": "true",
        children: [
          /*#__PURE__*/ _jsxs("filter", {
            id: "noise",
            children: [
              /*#__PURE__*/ _jsx("feTurbulence", {
                type: "fractalNoise",
                baseFrequency: "0.8",
                numOctaves: "2",
              }),
              /*#__PURE__*/ _jsx("feColorMatrix", {
                type: "saturate",
                values: "0",
              }),
              /*#__PURE__*/ _jsx("feComponentTransfer", {
                children: /*#__PURE__*/ _jsx("feFuncA", {
                  type: "linear",
                  slope: "0.25",
                }),
              }),
            ],
          }),
          /*#__PURE__*/ _jsx("rect", {
            x: "0",
            y: "0",
            width: "100",
            height: "100",
            filter: "url(#noise)",
            fill: "#fff",
          }),
        ],
      });
    }
    return null;
  }, [glassType, borderRadius]);
  const glassStyle = {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius,
    overflow: "hidden",
    background: backgroundColor,
    WebkitBackdropFilter: `blur(${animatedBlur}px)`,
    backdropFilter: `blur(${animatedBlur}px)`,
    boxShadow: `0 2px 24px 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.10)`,
    willChange: isStatic ? undefined : "backdrop-filter",
    ...style,
  }; // Overlay style for gradients/highlights
  const overlayStyle = {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    borderRadius,
    background: backgroundLayers,
    mixBlendMode: "lighten",
    opacity: gradientIntensity,
    zIndex: 2,
  }; // Bevel overlays for edge polish
  const bevelHighlightStyle = {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    borderRadius,
    background: `linear-gradient(120deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 40%, transparent 100%)`,
    mixBlendMode: "screen",
    opacity: highlightIntensity,
    zIndex: 3,
  };
  const bevelShadowStyle = {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    borderRadius,
    background: `linear-gradient(300deg, rgba(0,0,0,0.10) 0%, transparent 80%)`,
    mixBlendMode: "multiply",
    opacity: 0.7,
    zIndex: 3,
  };
  return /*#__PURE__*/ _jsxs("div", {
    style: glassStyle,
    children: [
      /*#__PURE__*/ _jsx("div", { style: overlayStyle, "aria-hidden": "true" }),
      /*#__PURE__*/ _jsx("div", {
        style: bevelHighlightStyle,
        "aria-hidden": "true",
      }),
      /*#__PURE__*/ _jsx("div", {
        style: bevelShadowStyle,
        "aria-hidden": "true",
      }),
      textureOverlay,
    ],
  });
}
addPropertyControls(LiquidGlass, {
  blur: {
    type: ControlType.Number,
    title: "Blur",
    defaultValue: 20,
    min: 0,
    max: 40,
    step: 1,
    unit: "px",
  },
  minBlur: {
    type: ControlType.Number,
    title: "Min Blur",
    defaultValue: 0,
    min: 0,
    max: 40,
    step: 1,
    unit: "px",
  },
  maxBlur: {
    type: ControlType.Number,
    title: "Max Blur",
    defaultValue: 20,
    min: 0,
    max: 40,
    step: 1,
    unit: "px",
  },
  blurDirection: {
    type: ControlType.Enum,
    title: "Blur Direction",
    options: ["in", "out"],
    optionTitles: ["In (0→max)", "Out (max→0)"],
    defaultValue: "in",
    displaySegmentedControl: true,
  },
  glassType: {
    type: ControlType.Enum,
    title: "Glass Type",
    options: ["frosted", "clear", "etched"],
    optionTitles: ["Frosted", "Clear", "Etched"],
    defaultValue: "frosted",
    displaySegmentedControl: true,
  },
  borderRadius: {
    type: ControlType.Number,
    title: "Radius",
    defaultValue: 12,
    min: 0,
    max: 64,
    step: 1,
    unit: "px",
  },
  backgroundColor: {
    type: ControlType.Color,
    title: "BG Color",
    defaultValue: "#FFFFFF1A",
  },
  gradientColor1: {
    type: ControlType.Color,
    title: "Gradient 1",
    defaultValue: "#FFFFFF2D",
  },
  gradientColor2: {
    type: ControlType.Color,
    title: "Gradient 2",
    defaultValue: "#00B4FF1A",
  },
  gradientAngle: {
    type: ControlType.Number,
    title: "Gradient Angle",
    defaultValue: 135,
    min: 0,
    max: 360,
    step: 1,
    unit: "deg",
  },
  gradientIntensity: {
    type: ControlType.Number,
    title: "Gradient Intensity",
    defaultValue: 1,
    min: 0,
    max: 1,
    step: 0.01,
  },
  highlightColor: {
    type: ControlType.Color,
    title: "Highlight",
    defaultValue: "#FFFFFF59",
  },
  highlightIntensity: {
    type: ControlType.Number,
    title: "Highlight Intensity",
    defaultValue: 0.7,
    min: 0,
    max: 1,
    step: 0.01,
  },
  highlightX: {
    type: ControlType.Number,
    title: "Highlight X%",
    defaultValue: 30,
    min: 0,
    max: 100,
    step: 1,
  },
  highlightY: {
    type: ControlType.Number,
    title: "Highlight Y%",
    defaultValue: 20,
    min: 0,
    max: 100,
    step: 1,
  },
  highlightRadius: {
    type: ControlType.Number,
    title: "Highlight Radius%",
    defaultValue: 60,
    min: 0,
    max: 100,
    step: 1,
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "LiquidGlass",
      slots: [],
      annotations: {
        framerSupportedLayoutHeight: "any-prefer-fixed",
        framerContractVersion: "1",
        framerSupportedLayoutWidth: "any-prefer-fixed",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./LiquidGlass.map
