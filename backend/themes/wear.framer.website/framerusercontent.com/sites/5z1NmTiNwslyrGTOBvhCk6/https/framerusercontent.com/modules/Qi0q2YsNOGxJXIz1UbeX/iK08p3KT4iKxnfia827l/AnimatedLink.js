// Lightweight inline link with advanced hover animations for underline
// User wants a lightweight inline text component (no link) with advanced hover underline animations and isolated font size control.
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { addPropertyControls, ControlType } from "framer";
/**
 * Lightweight inline text with animated underline hover effects (no link).
 *
 * @framerIntrinsicWidth 120
 * @framerIntrinsicHeight 24
 *
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */ export default function AnimatedLink(props) {
  const {
    text,
    textColor,
    hoverColor,
    underlineColor,
    animationType,
    underlineThickness,
    animationDuration,
    fontSize,
    font,
    style,
  } = props;
  const getUnderlineVariants = () => {
    const baseVariants = { initial: {}, hover: {} };
    switch (animationType) {
      case "center-out":
        return {
          initial: { scaleX: 0, originX: 0.5 },
          hover: { scaleX: 1, originX: 0.5 },
        };
      case "left-right":
        return {
          initial: { scaleX: 0, originX: 0 },
          hover: { scaleX: 1, originX: 0 },
        };
      case "right-left":
        return {
          initial: { scaleX: 0, originX: 1 },
          hover: { scaleX: 1, originX: 1 },
        };
      case "fade-in":
        return {
          initial: { opacity: 0, scaleX: 1 },
          hover: { opacity: 1, scaleX: 1 },
        };
      case "slide-up":
        return {
          initial: { y: underlineThickness, opacity: 0 },
          hover: { y: 0, opacity: 1 },
        };
      default:
        return baseVariants;
    }
  };
  const underlineVariants = getUnderlineVariants();
  const isFixedWidth = style && style.width === "100%";
  return /*#__PURE__*/ _jsxs(motion.div, {
    initial: "initial",
    whileHover: "hover",
    style: {
      ...(style || {}),
      ...(isFixedWidth ? {} : { width: "max-content" }),
      position: "relative",
      display: "inline-block",
      cursor: "pointer",
    },
    children: [
      /*#__PURE__*/ _jsx(motion.span, {
        variants: {
          initial: { color: textColor },
          hover: { color: hoverColor },
        },
        transition: { duration: animationDuration },
        style: { position: "relative", zIndex: 1, ...font, fontSize },
        children: text,
      }),
      /*#__PURE__*/ _jsx(motion.span, {
        variants: underlineVariants,
        transition: { duration: animationDuration, ease: "easeInOut" },
        style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: underlineThickness,
          backgroundColor: underlineColor,
          pointerEvents: "none",
        },
      }),
    ],
  });
}
addPropertyControls(AnimatedLink, {
  text: { type: ControlType.String, title: "Text", defaultValue: "Hover me" },
  textColor: {
    type: ControlType.Color,
    title: "Text Color",
    defaultValue: "#000000",
  },
  hoverColor: {
    type: ControlType.Color,
    title: "Hover Color",
    defaultValue: "#0099FF",
  },
  underlineColor: {
    type: ControlType.Color,
    title: "Underline",
    defaultValue: "#0099FF",
  },
  animationType: {
    type: ControlType.Enum,
    title: "Animation",
    options: ["center-out", "left-right", "right-left", "fade-in", "slide-up"],
    optionTitles: [
      "Center Out",
      "Left to Right",
      "Right to Left",
      "Fade In",
      "Slide Up",
    ],
    defaultValue: "center-out",
    displaySegmentedControl: false,
  },
  underlineThickness: {
    type: ControlType.Number,
    title: "Thickness",
    defaultValue: 2,
    min: 1,
    max: 10,
    step: 1,
    unit: "px",
  },
  animationDuration: {
    type: ControlType.Number,
    title: "Duration",
    defaultValue: 0.3,
    min: 0.1,
    max: 1,
    step: 0.05,
    unit: "s",
  },
  fontSize: {
    type: ControlType.Number,
    title: "Font Size",
    defaultValue: 15,
    min: 8,
    max: 72,
    step: 1,
    unit: "px",
  },
  font: {
    type: ControlType.Font,
    title: "Font",
    controls: "extended",
    defaultFontType: "sans-serif",
    displayFontSize: false,
    defaultValue: {
      variant: "Medium",
      letterSpacing: "-0.01em",
      lineHeight: "1.3em",
    },
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "AnimatedLink",
      slots: [],
      annotations: {
        framerIntrinsicWidth: "120",
        framerSupportedLayoutWidth: "auto",
        framerIntrinsicHeight: "24",
        framerContractVersion: "1",
        framerSupportedLayoutHeight: "auto",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./AnimatedLink.map
