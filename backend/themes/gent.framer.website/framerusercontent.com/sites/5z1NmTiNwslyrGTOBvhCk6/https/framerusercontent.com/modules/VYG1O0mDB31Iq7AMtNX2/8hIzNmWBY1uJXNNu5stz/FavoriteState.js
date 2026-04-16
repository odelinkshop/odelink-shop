// Create a single component with two empty-state modes controlled by a shared internal state.
// Mode 1 – Trigger: Acts as a favorite trigger (e.g. heart icon behavior). This mode should not render any UI by default. Instead, it exposes a Slot so I can connect an external, pre-designed button from the canvas. When the connected button is clicked, it updates the shared state to "active".
// Mode 2 – Display: Listens to the same shared state and reacts automatically. When the state is active, render a small notification indicator: Shape: rounded circle, Size: 8px, Fill color: #DB2C3A, Shadow: native Framer Box shadow, position Outside, subtle spread (matching the reference image). When the state is inactive, the indicator should not render.
// Behavior: The display mode must always listen to the trigger state. Clicking the trigger toggles the state on/off. The trigger and display can live in different places on the page (e.g. trigger on product cards, display in the navigation).
// Each trigger-display pair works independently. Multiple triggers can be selected at once.
import { jsx as _jsx } from "react/jsx-runtime";
import { addPropertyControls, ControlType, RenderTarget } from "framer";
import { startTransition, useEffect, useState, useMemo } from "react"; // Global registry to track all active triggers - now organized by storageKey
const activeTriggersByKey = new Map();
const FAVORITE_EVENT = "favorite-state-change"; // Get or create the Set for a specific storageKey
function getTriggersForKey(storageKey) {
  if (!activeTriggersByKey.has(storageKey)) {
    activeTriggersByKey.set(storageKey, new Set());
  }
  return activeTriggersByKey.get(storageKey);
} // Initialize triggers from localStorage
function initializeTriggers(storageKey) {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const savedTriggers = JSON.parse(saved);
      if (Array.isArray(savedTriggers)) {
        const triggers = getTriggersForKey(storageKey);
        triggers.clear();
        savedTriggers.forEach((id) => triggers.add(id));
      }
    }
  } catch (error) {
    console.error("Failed to load saved triggers:", error);
  }
} // Helper function to save triggers to localStorage
function saveTriggers(storageKey) {
  if (typeof window === "undefined") return;
  try {
    const triggers = getTriggersForKey(storageKey);
    const triggersArray = Array.from(triggers);
    localStorage.setItem(storageKey, JSON.stringify(triggersArray));
  } catch (error) {
    console.error("Failed to save triggers:", error);
  }
} // Generate unique IDs for instances
let instanceCounter = 0;
const instanceIds = new WeakMap();
/**
 * @framerIntrinsicWidth 8
 * @framerIntrinsicHeight 8
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */ export default function FavoriteState(props) {
  const {
    mode,
    triggerId,
    children,
    activeChildren,
    style,
    borderRadius,
    fillColor,
    boxShadow,
    storageKey = "favorite-triggers",
    gap = 10,
    padding = "0px",
    alignment = "center",
    direction = "horizontal",
  } = props; // Generate a unique ID for this instance if triggerId is not provided or is "default"
  const uniqueId = useMemo(() => {
    if (mode === "display") {
      // Display mode doesn't need an ID
      return null;
    }
    if (triggerId && triggerId !== "default") {
      return triggerId;
    } // Auto-generate unique ID for trigger mode
    return `auto-${instanceCounter++}-${Date.now()}`;
  }, [triggerId, mode]); // Local state to trigger re-renders
  const [, setUpdateCounter] = useState(0); // Initialize on first render with the correct storageKey
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || initialized) return;
    initializeTriggers(storageKey);
    setInitialized(true);
    setUpdateCounter((prev) => prev + 1);
  }, [storageKey, initialized]); // For display mode: check if ANY trigger is active
  // For trigger mode: check if THIS specific trigger is active
  const triggers = getTriggersForKey(storageKey);
  const isActive =
    mode === "display" ? triggers.size > 0 : triggers.has(uniqueId);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleChange = () => {
      startTransition(() => {
        setUpdateCounter((prev) => prev + 1);
      });
    }; // Listen for storage changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === storageKey) {
        initializeTriggers(storageKey);
        startTransition(() => {
          setUpdateCounter((prev) => prev + 1);
        });
      }
    };
    window.addEventListener(FAVORITE_EVENT, handleChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener(FAVORITE_EVENT, handleChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [storageKey]);
  const handleClick = () => {
    if (typeof window === "undefined") return;
    const triggers = getTriggersForKey(storageKey);
    if (triggers.has(uniqueId)) {
      triggers.delete(uniqueId);
    } else {
      triggers.add(uniqueId);
    }
    saveTriggers(storageKey);
    const event = new CustomEvent(FAVORITE_EVENT, { detail: { storageKey } });
    window.dispatchEvent(event);
  };
  if (mode === "trigger") {
    return /*#__PURE__*/ _jsx("div", {
      style: {
        ...style,
        position: "relative",
        cursor: "pointer",
        display: "flex",
        alignItems:
          alignment === "start"
            ? "flex-start"
            : alignment === "end"
            ? "flex-end"
            : "center",
        justifyContent:
          alignment === "start"
            ? "flex-start"
            : alignment === "end"
            ? "flex-end"
            : "center",
        flexDirection: direction === "vertical" ? "column" : "row",
        gap: `${gap}px`,
        padding: padding,
        width: "100%",
        height: "100%",
      },
      onClickCapture: handleClick,
      children: isActive ? activeChildren || children : children,
    });
  }
  if (mode === "display") {
    const isPreview = RenderTarget.current() === RenderTarget.preview;
    const shouldShow = isPreview ? isActive : true;
    return /*#__PURE__*/ _jsx("div", {
      style: {
        ...style,
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: `${borderRadius}px`,
        backgroundColor: fillColor,
        boxShadow: boxShadow,
        display: shouldShow ? "block" : "none",
      },
    });
  }
  return null;
}
addPropertyControls(FavoriteState, {
  mode: {
    type: ControlType.Enum,
    title: "Mode",
    options: ["trigger", "display"],
    optionTitles: ["Trigger", "Display"],
    defaultValue: "trigger",
    displaySegmentedControl: true,
  },
  storageKey: {
    type: ControlType.String,
    title: "Storage Key",
    defaultValue: "favorite-triggers",
    description:
      "Custom localStorage key for independent favorite systems (e.g., 'wishlist', 'compare')",
  },
  triggerId: {
    type: ControlType.String,
    title: "Trigger ID",
    defaultValue: "default",
    description:
      "Use unique ID from CMS (e.g., product ID) to link trigger and display in each card",
    hidden: ({ mode }) => mode !== "trigger",
  },
  children: {
    type: ControlType.Slot,
    title: "Default Button",
    hidden: ({ mode }) => mode !== "trigger",
  },
  activeChildren: {
    type: ControlType.Slot,
    title: "Active Button",
    hidden: ({ mode }) => mode !== "trigger",
  },
  direction: {
    type: ControlType.Enum,
    title: "Direction",
    options: ["horizontal", "vertical"],
    optionTitles: ["Horizontal", "Vertical"],
    defaultValue: "horizontal",
    displaySegmentedControl: true,
    hidden: ({ mode }) => mode !== "trigger",
  },
  alignment: {
    type: ControlType.Enum,
    title: "Alignment",
    options: ["start", "center", "end"],
    optionTitles: ["Start", "Center", "End"],
    defaultValue: "center",
    displaySegmentedControl: true,
    hidden: ({ mode }) => mode !== "trigger",
  },
  gap: {
    type: ControlType.Number,
    title: "Gap",
    defaultValue: 10,
    min: 0,
    max: 100,
    step: 1,
    unit: "px",
    hidden: ({ mode }) => mode !== "trigger",
  },
  padding: {
    type: ControlType.Padding,
    title: "Padding",
    defaultValue: "0px",
    hidden: ({ mode }) => mode !== "trigger",
  },
  borderRadius: {
    type: ControlType.Number,
    title: "Radius",
    defaultValue: 4,
    min: 0,
    max: 50,
    step: 0.5,
    unit: "px",
    hidden: ({ mode }) => mode !== "display",
  },
  fillColor: {
    type: ControlType.Color,
    title: "Fill",
    defaultValue: "#DB2C3A",
    hidden: ({ mode }) => mode !== "display",
  },
  boxShadow: {
    type: ControlType.BoxShadow,
    title: "Shadow",
    defaultValue: "0px 2px 4px rgba(0, 0, 0, 0.15)",
    hidden: ({ mode }) => mode !== "display",
    description: "More components at [Dragframe.](https://dragframe.com)",
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FavoriteState",
      slots: ["children", "activeChildren"],
      annotations: {
        framerSupportedLayoutHeight: "any",
        framerIntrinsicHeight: "8",
        framerIntrinsicWidth: "8",
        framerSupportedLayoutWidth: "any",
        framerContractVersion: "1",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./FavoriteState.map
