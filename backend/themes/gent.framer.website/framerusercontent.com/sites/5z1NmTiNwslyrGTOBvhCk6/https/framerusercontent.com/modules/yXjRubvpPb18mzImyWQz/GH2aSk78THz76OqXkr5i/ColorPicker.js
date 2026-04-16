// Shared state component with trigger and display modes for color selection
import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useMemo, useCallback, useState, useEffect } from "react";
import { addPropertyControls, ControlType, RenderTarget } from "framer"; // URL parameter key for state persistence
const URL_PARAM_KEY = "selectedColors";
const SYNC_EVENT = "color-picker-sync"; // URL-based state helpers (single source of truth)
const readSelectionFromURL = () => {
  if (typeof window === "undefined") return [];
  try {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(URL_PARAM_KEY);
    if (!value) return [];
    const parsed = JSON.parse(decodeURIComponent(value));
    return Array.isArray(parsed) && parsed.length >= 1
      ? parsed
      : typeof parsed === "string" && parsed
      ? [parsed]
      : [];
  } catch {
    return [];
  }
};
const writeSelectionToURL = (colors) => {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (colors.length >= 1) {
      params.set(URL_PARAM_KEY, encodeURIComponent(JSON.stringify(colors)));
    } else {
      params.delete(URL_PARAM_KEY);
    }
    const newURL = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", newURL); // Dispatch sync event to force re-renders
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch (error) {
    console.warn("Failed to write selection to URL:", error);
  }
};
/**
 * Shared Color State Component
 *
 * @framerIntrinsicWidth 120
 * @framerIntrinsicHeight 40
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */ export default function ColorPicker(props) {
  const {
    mode = "display",
    colorValue = "#3366FF",
    connectedButton,
    swatchWidth = 24,
    swatchHeight = 24,
    swatchRadius = 12,
    backgroundColor = "#FFFFFF",
    borderRadius = 8,
    maxVisibleSwatches = 3,
    swatchOverlap = 40,
    indicator = {
      font: {
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        lineHeight: "1em",
      },
      color: "rgba(0,0,0,0.6)",
    },
    swatchBorderColor = "rgba(255,255,255,0.9)",
    padding = { uniform: true, all: 4, top: 4, right: 4, bottom: 4, left: 4 },
    style,
  } = props; // Force re-render state
  const [, forceUpdate] = useState(0); // Listen for sync events to force re-render
  useEffect(() => {
    const handleSync = () => {
      forceUpdate((prev) => prev + 1);
    };
    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, []); // Read selection from URL (memoized)
  const selected = readSelectionFromURL();
  const hasSelection = selected.length >= 1; // Memoize computed values
  const isSelected = useMemo(
    () => selected.includes(colorValue),
    [selected, colorValue]
  );
  const visibleColors = useMemo(
    () => (hasSelection ? selected.slice(0, maxVisibleSwatches) : []),
    [hasSelection, selected, maxVisibleSwatches]
  );
  const remainingCount = useMemo(
    () =>
      hasSelection ? Math.max(0, selected.length - maxVisibleSwatches) : 0,
    [hasSelection, selected.length, maxVisibleSwatches]
  );
  const overlapAmount = useMemo(
    () => (swatchWidth * swatchOverlap) / 100,
    [swatchWidth, swatchOverlap]
  );
  const paddingValue = useMemo(
    () =>
      padding.uniform
        ? `${padding.all}px`
        : `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
    [padding]
  ); // Handle trigger mode click - toggle selection (memoized)
  const handleTriggerClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const current = readSelectionFromURL();
      const next = current.includes(colorValue)
        ? current.filter((c) => c !== colorValue)
        : [...current, colorValue];
      writeSelectionToURL(next);
    },
    [colorValue]
  ); // Handle clear mode click - reset all state (memoized)
  const handleClearClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    writeSelectionToURL([]);
  }, []); // Trigger mode - display connected button or fallback
  if (mode === "trigger") {
    return /*#__PURE__*/ _jsx("div", {
      style: {
        ...style,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: style?.width || "fit-content",
        height: style?.height || "fit-content",
        minWidth: 10,
        minHeight: 10,
        position: "relative",
      },
      onClick: handleTriggerClick,
      children: connectedButton
        ? /*#__PURE__*/ _jsx("div", {
            style: {
              width: "100%",
              height: "100%",
              position: "relative",
              minWidth: 10,
              minHeight: 10,
            },
            children: connectedButton,
          })
        : /*#__PURE__*/ _jsx("div", {
            style: {
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colorValue,
              borderRadius: borderRadius,
              border: "2px solid rgba(255,255,255,0.8)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "600",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              minWidth: 40,
              minHeight: 32,
            },
            children: isSelected ? "Selected" : "Select Color",
          }),
    });
  } // Clear mode - display connected button or fallback clear button
  if (mode === "clear") {
    return /*#__PURE__*/ _jsx("div", {
      style: {
        ...style,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: style?.width || "fit-content",
        height: style?.height || "fit-content",
        minWidth: 10,
        minHeight: 10,
        position: "relative",
      },
      onClick: handleClearClick,
      children: connectedButton
        ? /*#__PURE__*/ _jsx("div", {
            style: {
              width: "100%",
              height: "100%",
              position: "relative",
              minWidth: 10,
              minHeight: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            children: connectedButton,
          })
        : /*#__PURE__*/ _jsx("div", {
            style: {
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: borderRadius,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              color: "#666",
              fontSize: "12px",
              fontWeight: "600",
              minWidth: 40,
              minHeight: 32,
              textAlign: "center",
            },
            children: "Clear",
          }),
    });
  } // Display mode - pure rendering based on URL
  const isCanvas = RenderTarget.current() === RenderTarget.canvas;
  if (!hasSelection && !isCanvas) {
    return null;
  }
  return /*#__PURE__*/ _jsx("div", {
    style: {
      ...style,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: paddingValue,
      backgroundColor: backgroundColor,
      borderRadius: borderRadius,
      width: style?.width || "max-content",
      height: style?.height || "max-content",
      minWidth: Math.max(swatchWidth + 8, 32),
      minHeight: Math.max(swatchHeight + 8, 32),
      opacity: hasSelection ? 1 : 0.3,
      gap: 4,
    },
    children: hasSelection
      ? /*#__PURE__*/ _jsxs(_Fragment, {
          children: [
            /*#__PURE__*/ _jsx("div", {
              style: {
                display: "flex",
                alignItems: "center",
                position: "relative",
                height: swatchHeight,
              },
              children: visibleColors.map((color, index) =>
                /*#__PURE__*/ _jsx(
                  "div",
                  {
                    style: {
                      width: swatchWidth,
                      height: swatchHeight,
                      backgroundColor: color,
                      borderRadius: swatchRadius,
                      border: `2px solid ${swatchBorderColor}`,
                      flexShrink: 0,
                      marginLeft: index > 0 ? -overlapAmount : 0,
                      position: "relative",
                      zIndex: maxVisibleSwatches - index,
                    },
                  },
                  `${color}-${index}`
                )
              ),
            }),
            remainingCount > 0 &&
              /*#__PURE__*/ _jsxs("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...indicator.font,
                  color: indicator.color,
                  marginLeft: 4,
                  paddingRight: 4,
                },
                children: ["+", remainingCount],
              }),
          ],
        })
      : /*#__PURE__*/ _jsx("div", {
          style: {
            width: swatchWidth,
            height: swatchHeight,
            backgroundColor: "transparent",
            borderRadius: swatchRadius,
            border: "2px dashed rgba(0,0,0,0.2)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          children: /*#__PURE__*/ _jsx("div", {
            style: {
              width: 4,
              height: 4,
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: "50%",
            },
          }),
        }),
  });
}
addPropertyControls(ColorPicker, {
  mode: {
    type: ControlType.Enum,
    title: "Mode",
    options: ["trigger", "display", "clear"],
    optionTitles: ["Trigger", "Display", "Clear"],
    defaultValue: "display",
    displaySegmentedControl: true,
  },
  colorValue: {
    type: ControlType.Color,
    title: "Color Value",
    hidden: ({ mode }) => mode !== "trigger",
  },
  connectedButton: {
    type: ControlType.Slot,
    title: "Connected Button",
    hidden: ({ mode }) => mode !== "trigger" && mode !== "clear",
  },
  swatchWidth: {
    type: ControlType.Number,
    title: "Swatch Width",
    defaultValue: 24,
    min: 12,
    max: 60,
    step: 2,
    unit: "px",
    hidden: ({ mode }) => mode !== "display",
  },
  swatchHeight: {
    type: ControlType.Number,
    title: "Swatch Height",
    defaultValue: 24,
    min: 12,
    max: 60,
    step: 2,
    unit: "px",
    hidden: ({ mode }) => mode !== "display",
  },
  swatchRadius: {
    type: ControlType.Number,
    title: "Swatch Radius",
    defaultValue: 12,
    min: 0,
    max: 20,
    step: 1,
    unit: "px",
    hidden: ({ mode }) => mode !== "display",
  },
  swatchBorderColor: {
    type: ControlType.Color,
    title: "Swatch Border",
    defaultValue: "rgba(255,255,255,0.9)",
    hidden: ({ mode }) => mode !== "display",
  },
  maxVisibleSwatches: {
    type: ControlType.Number,
    title: "Max Visible",
    defaultValue: 3,
    min: 1,
    max: 10,
    step: 1,
    hidden: ({ mode }) => mode !== "display",
  },
  swatchOverlap: {
    type: ControlType.Number,
    title: "Overlap",
    defaultValue: 40,
    min: 0,
    max: 80,
    step: 5,
    unit: "%",
    hidden: ({ mode }) => mode !== "display",
  },
  padding: {
    type: ControlType.Object,
    title: "Padding",
    controls: {
      uniform: {
        type: ControlType.Boolean,
        title: "Uniform",
        defaultValue: true,
        enabledTitle: "All Sides",
        disabledTitle: "Individual",
      },
      all: {
        type: ControlType.Number,
        title: "All Sides",
        defaultValue: 4,
        min: 0,
        max: 32,
        step: 1,
        unit: "px",
        hidden: ({ uniform }) => !uniform,
      },
      top: {
        type: ControlType.Number,
        title: "Top",
        defaultValue: 4,
        min: 0,
        max: 32,
        step: 1,
        unit: "px",
        hidden: ({ uniform }) => uniform,
      },
      right: {
        type: ControlType.Number,
        title: "Right",
        defaultValue: 4,
        min: 0,
        max: 32,
        step: 1,
        unit: "px",
        hidden: ({ uniform }) => uniform,
      },
      bottom: {
        type: ControlType.Number,
        title: "Bottom",
        defaultValue: 4,
        min: 0,
        max: 32,
        step: 1,
        unit: "px",
        hidden: ({ uniform }) => uniform,
      },
      left: {
        type: ControlType.Number,
        title: "Left",
        defaultValue: 4,
        min: 0,
        max: 32,
        step: 1,
        unit: "px",
        hidden: ({ uniform }) => uniform,
      },
    },
    hidden: ({ mode }) => mode !== "display",
  },
  indicator: {
    type: ControlType.Object,
    title: "Indicator",
    controls: {
      font: {
        type: ControlType.Font,
        title: "Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: {
          fontSize: "12px",
          variant: "Semibold",
          letterSpacing: "-0.01em",
          lineHeight: "1em",
        },
      },
      color: {
        type: ControlType.Color,
        title: "Color",
        defaultValue: "rgba(0,0,0,0.6)",
      },
    },
    hidden: ({ mode }) => mode !== "display",
  },
  backgroundColor: {
    type: ControlType.Color,
    title: "Background",
    defaultValue: "#FFFFFF",
    hidden: ({ mode }) => mode !== "display",
  },
  borderRadius: {
    type: ControlType.Number,
    title: "Border Radius",
    defaultValue: 8,
    min: 0,
    max: 20,
    step: 1,
    unit: "px",
    description: "More components at [Dragframe.](https://dragframe.com)",
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "ColorPicker",
      slots: [],
      annotations: {
        framerSupportedLayoutWidth: "any-prefer-fixed",
        framerContractVersion: "1",
        framerSupportedLayoutHeight: "any-prefer-fixed",
        framerIntrinsicHeight: "40",
        framerIntrinsicWidth: "120",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./ColorPicker.map
