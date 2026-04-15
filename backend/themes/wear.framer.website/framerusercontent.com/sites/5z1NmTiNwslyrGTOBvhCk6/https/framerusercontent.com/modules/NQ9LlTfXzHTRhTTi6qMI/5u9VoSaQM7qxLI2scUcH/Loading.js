import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useRef, useEffect } from "react";
import { addPropertyControls, ControlType, useAnimation, motion } from "framer";
import {
  defaultEvents,
  useOnEnter,
  useOnExit,
} from "https://framer.com/m/framer/default-utils.js@^0.45.0";
var Indicators;
(function (Indicators) {
  Indicators["DotWave"] = "Dots";
  Indicators["Material"] = "Material";
  Indicators["IOS"] = "iOS";
})(Indicators || (Indicators = {}));
const angleInRadians = (angleInDegrees) =>
  (angleInDegrees - 90) * (Math.PI / 180);
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const a = angleInRadians(angleInDegrees);
  return {
    x: centerX + radius * Math.cos(a),
    y: centerY + radius * Math.sin(a),
  };
};
const arc = (x, y, radius, startAngle, endAngle) => {
  const fullCircle = endAngle - startAngle === 360;
  const start = polarToCartesian(x, y, radius, endAngle - 0.01);
  const end = polarToCartesian(x, y, radius, startAngle);
  const arcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  let d = [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    arcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
  if (fullCircle) d += "z";
  return d;
};
function Spinner({ color }) {
  const length = 360;
  const endPercentage = (length / 360) * 100;
  const strokeWidth = 10;
  const width = 100;
  const height = 100;
  return /*#__PURE__*/ _jsxs(motion.div, {
    style: {
      height: "85%",
      width: "85%",
      position: "relative",
      originX: 0.5,
      originY: 0.5,
    },
    animate: { rotate: 360 },
    transition: { loop: Infinity, ease: "linear", duration: 0.5 },
    children: [
      /*#__PURE__*/ _jsx(motion.svg, {
        style: {
          height: "100%",
          width: "100%",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          position: "absolute",
          WebkitMask: `conic-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0,1.0) ${endPercentage}%)`,
        },
        viewBox: "0 0 100 100",
        children: /*#__PURE__*/ _jsx("g", {
          transform: "translate(0 0)",
          children: /*#__PURE__*/ _jsx("path", {
            d: arc(
              width / 2,
              height / 2,
              width / 2 - strokeWidth / 2,
              0,
              length
            ),
            fill: "none",
            stroke: color,
            strokeWidth: strokeWidth,
            strokeLinecap: "round",
          }),
        }),
      }),
      /*#__PURE__*/ _jsx(motion.svg, {
        style: { height: "100%", width: "100%", position: "absolute" },
        viewBox: "0 0 100 100",
        children: /*#__PURE__*/ _jsx("g", {
          transform: "translate(50 0)",
          children: /*#__PURE__*/ _jsx("path", {
            d: "M 0 0 C 2.761 0 5 2.239 5 5 C 5 7.761 2.761 10 0 10 C 0 10 0 0 0 0 Z",
            fill: color,
          }),
        }),
      }),
    ],
  });
} // <path d="M 0 0 C 2.761 0 5 2.239 5 5 C 5 7.761 2.761 10 0 10 C 0 10 0 0 0 0 Z" fill="#CCC"></path>
// function Spinner({ color }) {
//     return (
//         <svg style={{ height: "85%", width: "85%" }} viewBox="0 0 100 100">
//             <motion.g
//                 transform="translate(3 3)"
//                 animate={{ rotate: 360 }}
//                 transition={{ loop: Infinity, ease: "linear", duration: 1 }}
//             >
//                 {pathStrings.map((data, i) => {
//                     return <path d={data} fill={color} opacity={i / pathStrings.length} />
//                 })}
//             </motion.g>
//         </svg>
//     )
// }
function DotWave({ color, animation }) {
  const circles = [0, 1, 2];
  const { delay, ease, duration, ...animProps } = animation;
  const transition =
    animation.type === "spring" ? animProps : { ...animProps, ease, duration }; // console.log(animProps)
  return /*#__PURE__*/ _jsx(motion.svg, {
    style: { height: "85%", width: "85%" },
    viewBox: "0 0 30 30",
    variants: {
      show: { transition: { delayChildren: 0.1, staggerChildren: 0.12 } },
    },
    animate: "show",
    children: circles.map((circle) =>
      /*#__PURE__*/ _jsx(
        motion.circle,
        {
          style: { fill: color },
          variants: { hidden: { y: 0 }, show: { y: [0, 0, 0, -10, 0, 0, 0] } },
          transition: { ...transition, yoyo: Infinity },
          r: 3,
          cx: circle * 10 + 5,
          cy: 15,
        },
        circle
      )
    ),
  });
}
function Material({ color, animation }) {
  return /*#__PURE__*/ _jsx(motion.svg, {
    style: {
      height: "85%",
      width: "85%",
      overflow: "visible",
      originX: "50%",
      originY: "50%",
    },
    animate: { rotate: 360 },
    transition: { ease: "linear", loop: Infinity, duration: 2 },
    viewBox: "25 25 50 50",
    children: /*#__PURE__*/ _jsx(motion.circle, {
      style: { stroke: color, strokeLinecap: "round" },
      animate: {
        strokeDasharray: ["1, 200", "89, 200", "89, 200"],
        strokeDashoffset: [0, -35, -124],
      },
      transition: { ...animation, loop: Infinity, ease: "easeInOut" },
      cx: "50",
      cy: "50",
      r: "20",
      fill: "none",
      strokeWidth: 2,
      strokeMiterlimit: "10",
    }),
  });
}
function IOS({ color, animation }) {
  const particles = 12; // this was the death of me
  const arrayRotate = (arr, n) =>
    arr.slice(n, arr.length).concat(arr.slice(0, n));
  const lines = [...new Array(particles)]
    .map((l, i) => (0.9 / particles) * i + 0.1)
    .reverse();
  const lineOpacities = lines.map((l, i) => arrayRotate(lines, i));
  return /*#__PURE__*/ _jsx(motion.svg, {
    viewBox: "-15 -15 30 30",
    style: { width: "100%", height: "100%" },
    children: lineOpacities.map((lineKeyframes, i) =>
      /*#__PURE__*/ _jsx(
        motion.g,
        {
          initial: { opacity: lineKeyframes[0] },
          animate: { opacity: lineKeyframes },
          transition: { ...animation, loop: Infinity, repeatDelay: 0.0005 },
          children: /*#__PURE__*/ _jsx("rect", {
            style: {
              width: 7,
              height: 2,
              fill: color,
              transform: `rotate(${
                ((particles - i) / particles) * 360 - 90
              }deg)`,
            },
            x: 5,
            y: -1,
            rx: 1,
          }),
        },
        i
      )
    ),
  });
}
function getIndicator(indicator, props) {
  switch (indicator) {
    case Indicators.DotWave:
      return /*#__PURE__*/ _jsx(DotWave, { ...props });
    case Indicators.Material:
      return /*#__PURE__*/ _jsx(Material, { ...props });
    case Indicators.IOS:
      return /*#__PURE__*/ _jsx(IOS, { ...props }); // case Indicators.Spinner:
    //     return <Spinner {...props} />
    default:
      return /*#__PURE__*/ _jsx(DotWave, { ...props });
  }
}
export function handleTimeout(duration, callback) {
  const id = setTimeout(callback, duration * 1e3);
  return () => clearTimeout(id);
}
/**
 * Loading
 *
 * @framerIntrinsicWidth 40
 * @framerIntrinsicHeight 40
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */ export function Loading(props) {
  const {
    duration,
    onTimeout,
    fadeOut,
    hasDuration,
    indicator,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    style,
  } = props;
  const controls = useAnimation();
  const animDuration = fadeOut ? Math.min(duration, 0.35) : 0;
  const animDelay = fadeOut ? duration - animDuration : duration;
  const currentIndicator = getIndicator(indicator, props);
  const handlers = useRef([]);
  const onFadeOut = React.useCallback(() => {
    if (hasDuration)
      controls.start({
        opacity: 0,
        transition: { duration: animDuration, ease: "easeIn" },
      });
  }, [hasDuration, animDuration]);
  const resetOpacity = async () => {
    controls.set({ opacity: 1 });
  };
  useOnEnter(() => {
    resetOpacity();
    if (hasDuration)
      handlers.current = [
        handleTimeout(duration, onTimeout),
        handleTimeout(animDelay, onFadeOut),
      ];
  }); // Cancel all timers on exit.
  useOnExit(() => handlers.current.forEach((cleanup) => cleanup)); // Cancel all timers on unmount.
  useEffect(() => () => handlers.current.forEach((cleanup) => cleanup), []);
  return /*#__PURE__*/ _jsx(motion.div, {
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    animate: controls,
    style: {
      position: "relative",
      overflow: "show",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      ...style,
    },
    children: currentIndicator,
  });
}
Loading.defaultProps = {
  height: 40,
  width: 40,
  duration: 2,
  color: "#888",
  animation: { type: "tween", ease: "linear", duration: 1.3 },
  hasDuration: false,
}; // Learn more: https://framer.com/api/property-controls/
addPropertyControls(Loading, {
  indicator: {
    title: "Indicator",
    type: ControlType.Enum,
    options: Object.keys(Indicators).map((i) => Indicators[i]),
  },
  color: { type: ControlType.Color, defaultValue: "#888" }, // transition: { title: "Animation", type: ControlType.Transition },
  hasDuration: {
    title: "Duration",
    type: ControlType.Boolean,
    defaultValue: Loading.defaultProps.hasDuration,
    enabledTitle: "Timeout",
    disabledTitle: "Infinity",
  },
  duration: {
    title: "Time",
    hidden: ({ hasDuration }) => !hasDuration,
    min: 0.1,
    max: 10,
    defaultValue: Loading.defaultProps.duration,
    type: ControlType.Number,
    step: 0.1,
  },
  animation: { type: ControlType.Transition },
  fadeOut: {
    title: "Fade Out",
    hidden: ({ hasDuration }) => !hasDuration,
    type: ControlType.Boolean,
    enabledTitle: "Yes",
    disabledTitle: "No",
  },
  onTimeout: { type: ControlType.EventHandler },
  ...defaultEvents,
});
export const __FramerMetadata__ = {
  exports: {
    handleTimeout: {
      type: "function",
      annotations: { framerContractVersion: "1" },
    },
    Loading: {
      type: "reactComponent",
      name: "Loading",
      slots: [],
      annotations: {
        framerIntrinsicWidth: "40",
        framerContractVersion: "1",
        framerSupportedLayoutHeight: "fixed",
        framerSupportedLayoutWidth: "fixed",
        framerIntrinsicHeight: "40",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./Loading.map
