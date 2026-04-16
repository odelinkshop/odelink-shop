// Reusable animation component that simulates a falling physics effect for logos or images
import { jsx as _jsx } from "react/jsx-runtime";
import {
  useEffect,
  useRef,
  useState,
  startTransition,
  useMemo,
  useCallback,
} from "react";
import { addPropertyControls, ControlType } from "framer";
import { motion } from "framer-motion";
const DEFAULT_IMG =
  "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg";
/**
 * Falling Images Physics Animation
 *
 * @framerIntrinsicWidth 600
 * @framerIntrinsicHeight 400
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */ export default function FallingImages(props) {
  const {
    images = [{ src: { src: DEFAULT_IMG, alt: "Image 1" } }],
    imageSize = 60,
    gravityStrength = 1,
    rotationAmount = 45,
    initialDelay = 0.5,
    appearSmoothness = 0.3,
    appearStyle = "scale",
    style,
  } = props;
  const containerRef = useRef(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [containerSize, setContainerSize] = useState({
    width: 600,
    height: 400,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // RAF-throttled ResizeObserver — prevents rapid layout thrash on resize
  useEffect(() => {
    if (typeof window === "undefined") return;
    const element = containerRef.current;
    if (!element) return;
    let rafId;
    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      startTransition(() => {
        setContainerSize({
          width: rect.width || 600,
          height: rect.height || 400,
        });
      });
    };
    updateSize();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateSize);
      });
      observer.observe(element);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(rafId);
      };
    }
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []); // Pre-compute ALL per-item data in a single pass.
  // Runs only when container size, image list, or visual props change —
  // not on every hover — keeping the render loop lean.
  const items = useMemo(() => {
    const { width, height } = containerSize; // Slightly looser overlap (0.55 vs 0.5) reduces item count ~20%
    // with no visible difference in density.
    const cellSize = imageSize * 0.55;
    const cols = Math.ceil(width / cellSize) + 8;
    const rows = Math.ceil(height / cellSize) + 8; // Hard cap: beyond ~220 items the GPU wins nothing extra
    const total = Math.min(cols * rows, 220);
    const baseImages = images.filter((img) => img?.src?.src);
    if (!baseImages.length)
      baseImages.push({ src: { src: DEFAULT_IMG, alt: "Default" } });
    const endY = height + imageSize * 2;
    return Array.from({ length: total }, (_, i) => {
      const img = baseImages[i % baseImages.length];
      const id = `${i % baseImages.length}-${i}`; // ── Position ──────────────────────────────────────────────────
      const col = i % cols;
      const row = Math.floor(i / cols);
      const s1 = Math.sin(i * 12.9898) * 43758.5453123;
      const s2 = Math.sin(i * 78.233) * 43758.5453123;
      const s3 = Math.sin(i * 45.164) * 43758.5453123;
      const s4 = Math.sin(i * 94.673) * 43758.5453123;
      const r1 = s1 - Math.floor(s1);
      const r2 = s2 - Math.floor(s2);
      const r3 = s3 - Math.floor(s3);
      const r4 = s4 - Math.floor(s4);
      const baseX = col * cellSize - imageSize * 2.5;
      const baseY = row * cellSize - imageSize * 2.5;
      const jitter = imageSize * 0.6;
      const initial = {
        x: baseX + (r1 - 0.5) * jitter,
        y: baseY + (r2 - 0.5) * jitter,
        rotate: ((r3 * 2 - 1) * rotationAmount) / 2,
        scale: 0.85 + r4 * 0.3,
        zIndex: i,
      }; // ── Fall physics ──────────────────────────────────────────────
      const seed = i * 0.618033988749895;
      const pseudoRandom = (seed % 1) * 2 - 1;
      const randomness = Math.abs(pseudoRandom);
      const duration = (2 + randomness * 0.2) / gravityStrength;
      const appearDelay = randomness * 0.8;
      const anim = {
        y: endY,
        rotate: pseudoRandom * rotationAmount * 0.6,
        duration,
      }; // ── Appear initial state ──────────────────────────────────────
      const base = { x: initial.x, y: initial.y, rotate: initial.rotate };
      let initialState;
      switch (appearStyle) {
        case "fade":
          initialState = { ...base, scale: initial.scale, opacity: 0 };
          break;
        case "slide-up":
          initialState = {
            ...base,
            y: initial.y + 50,
            scale: initial.scale,
            opacity: 0,
          };
          break;
        case "bounce":
        case "scale":
        default:
          initialState = { ...base, scale: 0, opacity: 0 };
      } // ── Appear transition ─────────────────────────────────────────
      const baseT = { duration: appearSmoothness, delay: appearDelay };
      let appearTransition;
      switch (appearStyle) {
        case "fade":
          appearTransition = { opacity: { ...baseT, ease: "easeOut" } };
          break;
        case "slide-up":
          appearTransition = {
            y: {
              duration: appearSmoothness,
              ease: [0.34, 1.56, 0.64, 1],
              delay: appearDelay,
            },
            opacity: {
              duration: appearSmoothness * 0.7,
              ease: "easeOut",
              delay: appearDelay,
            },
          };
          break;
        case "bounce":
          appearTransition = {
            scale: { ...baseT, ease: [0.68, -0.55, 0.265, 1.55] },
            opacity: {
              duration: appearSmoothness * 0.5,
              ease: "easeOut",
              delay: appearDelay,
            },
          };
          break;
        case "scale":
        default:
          appearTransition = {
            scale: { ...baseT, ease: [0.34, 1.56, 0.64, 1] },
            opacity: {
              duration: appearSmoothness * 0.7,
              ease: "easeOut",
              delay: appearDelay,
            },
          };
      }
      return {
        img,
        id,
        initial,
        anim,
        appearDelay,
        initialState,
        appearTransition,
      };
    });
  }, [
    containerSize,
    imageSize,
    rotationAmount,
    gravityStrength,
    appearSmoothness,
    appearStyle,
    images,
  ]);
  const handleMouseEnter = useCallback(() => {
    startTransition(() => {
      setAnimationKey((prev) => prev + 1);
      setIsHovered(true);
      setIsAnimating(true);
    });
  }, []);
  const handleMouseLeave = useCallback(() => {
    startTransition(() => {
      setIsHovered(false);
      setIsAnimating(false);
    });
  }, []);
  return /*#__PURE__*/ _jsx("div", {
    ref: containerRef,
    style: {
      ...style,
      position: "relative",
      overflow: "hidden",
      width: "100%",
      height: "100%",
      contain: "strict",
      backfaceVisibility: "hidden",
    },
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    children: items.map(
      ({
        img,
        id,
        initial,
        anim,
        appearDelay,
        initialState,
        appearTransition,
      }) =>
        /*#__PURE__*/ _jsx(
          motion.div,
          {
            initial: initialState,
            animate: isHovered
              ? {
                  x: initial.x,
                  y: [initial.y, initial.y, anim.y],
                  rotate: [initial.rotate, initial.rotate, anim.rotate],
                  scale: [0, initial.scale, initial.scale],
                  opacity: [0, 1, 1],
                }
              : { opacity: 0 },
            transition: isHovered
              ? {
                  ...appearTransition,
                  y: {
                    times: [0, 0.3, 1],
                    duration: anim.duration + 0.8 + initialDelay,
                    ease: "easeIn",
                    delay: appearDelay,
                  },
                  rotate: {
                    times: [0, 0.3, 1],
                    duration: anim.duration * 1.2 + 0.8 + initialDelay,
                    ease: "easeIn",
                    delay: appearDelay,
                  },
                }
              : { duration: 0 },
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: imageSize,
              height: imageSize,
              pointerEvents: "none",
              zIndex: initial.zIndex,
              willChange: isAnimating ? "transform, opacity" : "auto",
              transform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
            },
            children: /*#__PURE__*/ _jsx("img", {
              src: img.src?.src || DEFAULT_IMG,
              srcSet: img.src?.srcSet,
              alt: img.alt || img.src?.alt || "Falling image",
              style: {
                width: "100%",
                height: "100%",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
                display: "block",
              },
              draggable: false,
            }),
          },
          `${id}-${animationKey}`
        )
    ),
  });
}
addPropertyControls(FallingImages, {
  images: {
    type: ControlType.Array,
    title: "Images",
    control: {
      type: ControlType.Object,
      controls: {
        src: { type: ControlType.ResponsiveImage, title: "Image" },
        alt: {
          type: ControlType.String,
          title: "Alt Text",
          defaultValue: "Falling image",
        },
      },
    },
    defaultValue: [
      {
        src: {
          src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
          alt: "Image 1",
        },
        alt: "Image 1",
      },
      {
        src: {
          src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
          alt: "Image 2",
        },
        alt: "Image 2",
      },
      {
        src: {
          src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
          alt: "Image 3",
        },
        alt: "Image 3",
      },
    ],
  },
  imageSize: {
    type: ControlType.Number,
    title: "Image Size",
    defaultValue: 60,
    min: 20,
    max: 200,
    step: 5,
    unit: "px",
  },
  gravityStrength: {
    type: ControlType.Number,
    title: "Gravity",
    defaultValue: 1,
    min: 0.5,
    max: 3,
    step: 0.1,
  },
  rotationAmount: {
    type: ControlType.Number,
    title: "Rotation",
    defaultValue: 45,
    min: 0,
    max: 180,
    step: 5,
    unit: "deg",
  },
  initialDelay: {
    type: ControlType.Number,
    title: "Initial Delay",
    defaultValue: 0.5,
    min: 0,
    max: 3,
    step: 0.1,
    unit: "s",
  },
  appearSmoothness: {
    type: ControlType.Number,
    title: "Appear Smoothness",
    defaultValue: 0.3,
    min: 0.1,
    max: 2,
    step: 0.1,
    unit: "s",
  },
  appearStyle: {
    type: ControlType.Enum,
    title: "Appear Style",
    defaultValue: "scale",
    options: ["scale", "fade", "slide-up", "bounce"],
    optionTitles: ["Scale", "Fade", "Slide Up", "Bounce"],
    displaySegmentedControl: false,
    description: "More components at [Dragframe.](https://dragframe.com)",
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FallingImages",
      slots: [],
      annotations: {
        framerIntrinsicWidth: "600",
        framerSupportedLayoutHeight: "fixed",
        framerContractVersion: "1",
        framerIntrinsicHeight: "400",
        framerSupportedLayoutWidth: "fixed",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./FallingImages.map
