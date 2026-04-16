// Logo Carousel component that automatically animates logos across multiple columns with staggered timing,
// supports loop or random modes, keeps logos uniform, and is responsive with smooth, subtle motion.
import { jsx as _jsx } from "react/jsx-runtime";
import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  startTransition,
} from "react";
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer";
import { motion, AnimatePresence, useInView } from "framer-motion";
/**
 * LogoCarousel
 *
 * Displays a responsive carousel of logos, smoothly animating each logo in multiple columns with options for loop or random order, customizable animation style, and thumbnail fallback images. Supports Framer ResponsiveImage format and direct URL strings.
 *
 * @framerIntrinsicWidth 800
 * @framerIntrinsicHeight 240
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */ export default function LogoCarousel(props) {
  const {
    logos,
    columns = 4,
    rowsPerColumn = 3,
    logoSize = 56,
    speed = 18,
    stagger = 2,
    fade = true,
    backgroundColor = "#FFFFFF",
    style,
    animationStyle = "mixed",
    objectFit = "contain",
    rowGap = 16,
    columnGap = 24,
  } = props;
  const isStatic = useIsStaticRenderer();
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { margin: "0px", amount: 0.2 }); // Default fallback logos
  const fallbackLogos = useMemo(
    () => [
      {
        src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
        alt: "Logo 1",
      },
      {
        src: "https://framerusercontent.com/images/2uTNEj5aTl2K3NJaEFWMbnrA.jpg",
        alt: "Logo 2",
      },
      {
        src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
        alt: "Logo 3",
      },
      {
        src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
        alt: "Logo 4",
      },
      {
        src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
        alt: "Logo 5",
      },
      {
        src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
        alt: "Logo 6",
      },
    ],
    []
  ); // Normalize image value structures
  const normalizedLogos = useMemo(() => {
    const cleaned = (logos || []).filter((item) => !!item);
    const source = cleaned.length > 0 ? cleaned : fallbackLogos;
    return source.map((item) => {
      if (typeof item === "string") {
        return { src: item, alt: "" };
      }
      if (
        typeof item === "object" &&
        item !== null &&
        typeof item.src === "string"
      ) {
        return { src: item.src, srcSet: item.srcSet, alt: item.alt || "" };
      }
      return { src: "", alt: "" };
    });
  }, [logos, fallbackLogos]);
  const [currentStep, setCurrentStep] = useState(0);
  const shouldAnimate = !isStatic && inView; // Cycle through logos over time
  useEffect(() => {
    if (!shouldAnimate) return;
    const intervalDuration = speed * 1e3;
    const id = window.setInterval(() => {
      startTransition(() => {
        setCurrentStep((prev) => prev + 1);
      });
    }, intervalDuration);
    return () => window.clearInterval(id);
  }, [shouldAnimate, speed]); // Helper to get animation props per cell
  const getCellAnimation = useCallback(
    (cellIndex) => {
      if (!shouldAnimate) {
        return {
          initial: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
          animate: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
        };
      }
      const mode =
        animationStyle === "mixed"
          ? ["fade", "slide", "zoom", "rotate", "swap"][cellIndex % 5]
          : animationStyle;
      switch (mode) {
        case "fade":
          return { initial: { opacity: 0 }, animate: { opacity: 1 } };
        case "slide":
          return {
            initial: { opacity: 0, x: cellIndex % 2 === 0 ? -24 : 24 },
            animate: { opacity: 1, x: 0 },
          };
        case "zoom":
          return {
            initial: { opacity: 0, scale: 0.85 },
            animate: { opacity: 1, scale: 1 },
          };
        case "rotate":
          return {
            initial: { opacity: 0, rotate: cellIndex % 2 === 0 ? -6 : 6 },
            animate: { opacity: 1, rotate: 0 },
          };
        case "swap":
          return {
            initial: { opacity: 0, y: logoSize },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -logoSize },
          };
        default:
          return { initial: { opacity: 1 }, animate: { opacity: 1 } };
      }
    },
    [shouldAnimate, animationStyle, logoSize]
  );
  if (normalizedLogos.length === 0) {
    return /*#__PURE__*/ _jsx("div", {
      ref: containerRef,
      style: {
        ...(style || {}),
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor,
        overflow: "hidden",
      },
      children: /*#__PURE__*/ _jsx("div", {
        style: { color: "#000000", opacity: 0.6 },
        children: "Add logos in the right panel to get started.",
      }),
    });
  }
  return /*#__PURE__*/ _jsx("div", {
    ref: containerRef,
    style: {
      ...(style || {}),
      position: "relative",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "stretch",
      boxSizing: "border-box",
      padding: 0,
      backgroundColor,
      overflow: "hidden",
      userSelect: "none",
    },
    children: /*#__PURE__*/ _jsx("div", {
      style: {
        display: "flex",
        flex: 1,
        width: "100%",
        alignItems: "stretch",
        justifyContent: "space-between",
        overflow: "hidden",
        gap: columnGap,
      },
      children: Array.from({ length: columns }).map((_, colIndex) =>
        /*#__PURE__*/ _jsx(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              justifyContent: "space-between",
              minWidth: 0,
              height: "100%",
              gap: rowGap,
            },
            children: Array.from({ length: rowsPerColumn }).map(
              (_, rowIndex) => {
                const cellIndex = colIndex * rowsPerColumn + rowIndex;
                const logoIndex =
                  (cellIndex + currentStep) % normalizedLogos.length;
                const item = normalizedLogos[logoIndex];
                const { initial, animate, exit } = getCellAnimation(cellIndex);
                const staggerDelay =
                  stagger > 0 ? ((colIndex + rowIndex) * stagger) / 10 : 0;
                const isSwapAnimation =
                  animationStyle === "swap" ||
                  (animationStyle === "mixed" && cellIndex % 5 === 4);
                return /*#__PURE__*/ _jsx(
                  "div",
                  {
                    style: {
                      width: "auto",
                      height: logoSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxSizing: "border-box",
                      minHeight: logoSize,
                    },
                    children: /*#__PURE__*/ _jsx(AnimatePresence, {
                      mode: "popLayout",
                      initial: false,
                      children: /*#__PURE__*/ _jsx(
                        motion.div,
                        {
                          initial: initial,
                          animate: animate,
                          exit: exit,
                          transition: {
                            duration: isSwapAnimation ? 0.6 : fade ? 0.6 : 0.4,
                            ease: [0.4, 0, 0.2, 1],
                            delay: staggerDelay,
                          },
                          style: {
                            width: "auto",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            willChange: shouldAnimate
                              ? "transform, opacity"
                              : "auto",
                          },
                          children: item.src
                            ? /*#__PURE__*/ _jsx("img", {
                                src: item.src,
                                srcSet: item.srcSet,
                                alt: item.alt,
                                width: logoSize,
                                height: logoSize,
                                loading: "lazy",
                                decoding: "async",
                                style: {
                                  maxHeight: logoSize,
                                  maxWidth: "100%",
                                  height: "auto",
                                  width: "auto",
                                  objectFit: objectFit,
                                  display: "block",
                                },
                                draggable: false,
                                onError: (e) => {
                                  const target = e.currentTarget;
                                  target.onerror = null;
                                  target.src =
                                    "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg";
                                },
                              })
                            : /*#__PURE__*/ _jsx("div", {
                                style: {
                                  width: logoSize * 0.7,
                                  height: logoSize * 0.7,
                                  borderRadius: 12,
                                  backgroundColor: "#EEEEEE",
                                },
                              }),
                        },
                        `${colIndex}-${rowIndex}-${logoIndex}`
                      ),
                    }),
                  },
                  `${colIndex}-${rowIndex}`
                );
              }
            ),
          },
          colIndex
        )
      ),
    }),
  });
}
addPropertyControls(LogoCarousel, {
  logos: {
    type: ControlType.Array,
    title: "Logos",
    maxCount: 40,
    control: { type: ControlType.ResponsiveImage },
    defaultValue: [],
  },
  columns: {
    type: ControlType.Number,
    title: "Columns",
    defaultValue: 4,
    min: 1,
    max: 8,
    step: 1,
    displayStepper: false,
  },
  rowsPerColumn: {
    type: ControlType.Number,
    title: "Rows/Col",
    defaultValue: 3,
    min: 1,
    max: 10,
    step: 1,
    displayStepper: false,
  },
  logoSize: {
    type: ControlType.Number,
    title: "Logo Size",
    defaultValue: 56,
    min: 14,
    max: 160,
    step: 4,
    unit: "px",
  },
  rowGap: {
    type: ControlType.Number,
    title: "Row Gap",
    defaultValue: 16,
    min: 0,
    max: 80,
    step: 4,
    unit: "px",
  },
  columnGap: {
    type: ControlType.Number,
    title: "Column Gap",
    defaultValue: 24,
    min: 0,
    max: 120,
    step: 4,
    unit: "px",
  },
  speed: {
    type: ControlType.Number,
    title: "Speed",
    defaultValue: 18,
    min: 2,
    max: 40,
    step: 1,
    unit: "s",
  },
  stagger: {
    type: ControlType.Number,
    title: "Stagger",
    defaultValue: 2,
    min: 0,
    max: 8,
    step: 0.5,
    unit: "s",
  },
  fade: {
    type: ControlType.Boolean,
    title: "Fade Motion",
    defaultValue: true,
    enabledTitle: "On",
    disabledTitle: "Off",
  },
  animationStyle: {
    type: ControlType.Enum,
    title: "Animation",
    options: ["mixed", "fade", "slide", "zoom", "rotate", "swap"],
    optionTitles: ["Mixed", "Fade", "Slide", "Zoom", "Rotate", "Swap"],
    defaultValue: "mixed",
  },
  objectFit: {
    type: ControlType.Enum,
    title: "Image Fit",
    options: ["contain", "cover", "fill", "scale-down", "none"],
    optionTitles: ["Contain", "Cover", "Fill", "Scale Down", "None"],
    defaultValue: "contain",
  },
  backgroundColor: {
    type: ControlType.Color,
    title: "Background",
    defaultValue: "#FFFFFF",
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "LogoCarousel",
      slots: [],
      annotations: {
        framerSupportedLayoutHeight: "any-prefer-fixed",
        framerContractVersion: "1",
        framerIntrinsicHeight: "240",
        framerSupportedLayoutWidth: "any-prefer-fixed",
        framerIntrinsicWidth: "800",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./LogoCarousel.map
