import { jsx as _jsx } from "react/jsx-runtime";
export const HideScrollbar = () => {
  return {
    style: {
      overflow: "scroll",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      backgroundColor: "none",
      borderRadius: "none",
    },
    onRender: (element) => {
      if (element) {
        element.style.scrollbarWidth = "none";
        element.style.overflow = "scroll";
        element.style.backgroundColor = "inherit"; // Keeps background color
        element.style.display = "flex"; // Ensures proper rendering
      }
    },
  };
};
import { useContext as __legacyOverrideHOC_useContext } from "react";
import { DataObserverContext as __legacyOverrideHOC_DataObserverContext } from "framer";
export function withHideScrollbar(C) {
  return (props) => {
    __legacyOverrideHOC_useContext(__legacyOverrideHOC_DataObserverContext);
    return _jsx(C, { ...props, ...HideScrollbar(props) });
  };
}
withHideScrollbar.displayName = "HideScrollbar";
export const __FramerMetadata__ = {
  exports: {
    withHideScrollbar: {
      type: "reactHoc",
      name: "withHideScrollbar",
      annotations: { framerContractVersion: "1" },
    },
    HideScrollbar: {
      type: "override",
      name: "HideScrollbar",
      annotations: { framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./HideS.map
