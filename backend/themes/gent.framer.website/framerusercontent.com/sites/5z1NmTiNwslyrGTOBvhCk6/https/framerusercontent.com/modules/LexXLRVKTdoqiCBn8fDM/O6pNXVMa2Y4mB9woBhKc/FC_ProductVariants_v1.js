/*
 * Framer Commerce
 * Confidential and Proprietary - All Rights Reserved
 * Unauthorized use, reproduction, distribution, or disclosure of this
 * source code or any related information is strictly prohibited.
 *
 * This software is the exclusive property of Framer Commerce ("Company").
 * It is considered highly confidential and proprietary information.
 *
 * Any use, copying, modification, distribution, or sharing of this software,
 * in whole or in part, without the express written permission of the Company
 * is strictly prohibited and may result in legal action.
 *
 * DISCLAIMER: This software does not provide any express or
 * implied warranties, including, but not limited to, the implied warranties
 * of merchantability and fitness for a particular purpose. In no event shall
 * Framer Commerce be liable for any direct, indirect, incidental, special,
 * exemplary, or consequential damages (including, but not limited to, procurement
 * of substitute goods or services; loss of use, data, or profits; or business
 * interruption) however caused and on any theory of liability, whether in
 * contract, strict liability, or tort (including negligence or otherwise)
 * arising in any way out of the use of this software, even if advised of
 * the possibility of such damage.
 *
 * Any unauthorized possession, use, copying, distribution, or dissemination
 * of this software will be considered a breach of confidentiality and may
 * result in legal action.
 *
 * For inquiries, contact:
 * Framer Commerce
 * Email: hello@framercommerce.com
 *
 * © 2025 Butter Supply Inc. All Rights Reserved.
 */ /*
 * Note: This component is not yet ready for use.
 * It replaces the referenced Framer import and creates the buttons from scratch, which is stable.
 * It also uses CMS data to populate the product data on canvas, which causes critical issues when replacing the code in the existing code component.
 */ import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react"; // Internal
import { addPropertyControls, ControlType } from "framer"; // Helper to determine if the component is in a purchase action mode
const __isPurchaseMode = (act) => act === "Add to Cart" || act === "Buy Now";
import { get } from "lodash-es";
import {
  createCartMutation,
  addToCartMutation,
} from "https://framerusercontent.com/modules/yiRfl1JCGhIBUL31WVDk/wupS2XmBAHu1kBQNv9pi/mutations_v2.js";
import { appendAllTrackingParamsToUrl } from "https://framerusercontent.com/modules/w24ELWa2giT3SFaWpV77/398w6fPyag8B92ojouQr/utmParams.js";
import { appendLanguageToUrl } from "https://framerusercontent.com/modules/vC6fzbfO83MgBPIhn5zl/DUlbmWuOELzEUenVmv3G/locales.js";
import {
  trackFacebookPixelAddToCart,
  trackFacebookPixelInitiateCheckout,
} from "https://framerusercontent.com/modules/6Zs9CjkPbKzHjoy8LK08/iqoIwmJw4hztafi4V4IV/Fb_pixel.js";
const VariantDropdown = ({
  opt,
  filteredValues,
  isLast,
  valid,
  invalidMsg,
  props,
  dispatchOptionSelectedEvent,
  selectedOptions,
  combinations,
  index,
  totalCount,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { dropdownConfigs } = props;
  const { font, selected, hover, focus, unselected, radius, padding, icon } =
    dropdownConfigs;
  const paddingParts = String(padding).trim().split(/\s+/);
  const paddingRight =
    paddingParts.length >= 2 ? paddingParts[1] : paddingParts[0];
  const unselectedText = (unselected.text || "Select {{variant}}").replace(
    "{{variant}}",
    opt.name
  );
  const currentValue = selectedOptions[opt.name] || unselectedText;
  const isUnselected = currentValue === unselectedText; // Edge to edge styling - only apply when gap is 0
  const isLastItem = index === totalCount - 1;
  const gap = Number(props.containerConfigs.gap);
  const applyEdgeToEdge = gap === 0;
  const isHorizontal = props.containerConfigs.direction === "horizontal"; // Calculate margin style for edge-to-edge effect
  const marginStyle = {};
  if (applyEdgeToEdge && !isLastItem) {
    if (isHorizontal) {
      // For horizontal layout, use negative right margin
      marginStyle.marginRight = "-1px";
    } else {
      // For vertical layout, use negative bottom margin
      marginStyle.marginBottom = "-1px";
    }
  } // Determine border style based on state (focus uses outline, not border change)
  const borderWidth = isUnselected
    ? unselected.border.borderWidth
    : isHovered
    ? hover.border.borderWidth
    : selected.border.borderWidth;
  const borderStyle = `${borderWidth}px solid ${
    isUnselected
      ? unselected.border.borderColor
      : isHovered
      ? hover.border.borderColor
      : selected.border.borderColor
  }`; // Calculate effective outline offset: when offset is 0, subtract border width to align with border edge
  const effectiveOffset =
    focus?.offset === 0 ? -borderWidth : focus?.offset || 2; // Calculate focus radius: dropdown radius + offset (for pixel values)
  const calculateFocusRadius = (radiusValue, offset) => {
    // Parse the radius value
    const match = radiusValue.match(/^(\d+(?:\.\d+)?)(px|%)$/);
    if (!match)
      return radiusValue; // Return as-is if we can't parse it
    const [, value, unit] = match;
    if (unit === "px") {
      // For pixel values, add the offset (ensure it doesn't go negative)
      const numericValue = parseFloat(value);
      const calculatedRadius = Math.max(0, numericValue + offset);
      return `${calculatedRadius}px`;
    } else {
      // For percentages, return as-is (can't add pixels to percentage)
      return radiusValue;
    }
  };
  const focusRadius = calculateFocusRadius(radius, effectiveOffset);
  return /*#__PURE__*/ _jsx(
    "div",
    {
      style: {
        width: "100%",
        position: "relative",
        zIndex: isFocused ? 1 : 0,
        overflow: "visible",
        ...(isHorizontal && applyEdgeToEdge && !isLastItem
          ? { marginRight: "-1px" }
          : {}),
      },
      className: `variant-dropdown-container ${
        isHorizontal && applyEdgeToEdge && !isLastItem
          ? "horizontal-edge-to-edge"
          : ""
      }`,
      "data-horizontal": isHorizontal ? "true" : "false",
      "data-last": isLastItem ? "true" : "false",
      "data-edge-to-edge": applyEdgeToEdge ? "true" : "false",
      children: /*#__PURE__*/ _jsxs("div", {
        style: { display: "flex", flexDirection: "column", gap: "0px" },
        children: [
          /*#__PURE__*/ _jsx("div", {
            style: {
              width: "100%",
              display:
                props.titleConfigs.visible || props.selectedConfigs.visible
                  ? "flex"
                  : "none",
              justifyContent:
                props.titleConfigs.font.textAlign === "center"
                  ? "center"
                  : props.titleConfigs.font.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
              marginBottom:
                get(props, "containerConfigs.gap2") !== undefined
                  ? get(props, "containerConfigs.gap2")
                  : get(props, "titleConfigs.gap"),
              overflow: "visible",
            },
            children: /*#__PURE__*/ _jsxs("div", {
              style: {
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                overflow: "visible",
              },
              children: [
                props.titleConfigs.visible &&
                  /*#__PURE__*/ _jsx("label", {
                    id: `variant-title-${opt.name}`,
                    htmlFor: `variant-${opt.name}`,
                    style: {
                      ...get(props, "titleConfigs.font"),
                      color: get(props, "titleConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      margin: 0,
                      cursor: "pointer",
                      textTransform: get(
                        props,
                        "titleConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: (
                      props.titleConfigs.display || "{{Option}}"
                    ).replace("{{Option}}", opt.name),
                  }),
                props.selectedConfigs.visible &&
                  selectedOptions[opt.name] &&
                  /*#__PURE__*/ _jsx("p", {
                    style: {
                      ...get(props, "selectedConfigs.font"),
                      color: get(props, "selectedConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      paddingLeft: props.titleConfigs.visible
                        ? `${props.selectedConfigs.gap}px`
                        : 0,
                      margin: 0,
                      textTransform: get(
                        props,
                        "selectedConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: selectedOptions[opt.name],
                  }),
                props.selectedConfigs.visible &&
                  props.selectedConfigs.emptyVisible &&
                  !selectedOptions[opt.name] &&
                  /*#__PURE__*/ _jsx("p", {
                    style: {
                      ...get(props, "selectedConfigs.font"),
                      color: get(props, "selectedConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      paddingLeft: props.titleConfigs.visible
                        ? `${props.selectedConfigs.gap}px`
                        : 0,
                      margin: 0,
                      textTransform: get(
                        props,
                        "selectedConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: (
                      props.selectedConfigs.emptyText ||
                      "Select {{Option Value}}"
                    ).replace("{{Option Value}}", opt.name),
                  }),
              ],
            }),
          }),
          /*#__PURE__*/ _jsx("div", {
            style: { position: "relative" },
            children: /*#__PURE__*/ _jsxs("div", {
              className: "dropdown-inner",
              style: {
                position: "relative",
                display: "flex",
                alignItems: "center",
                padding: padding,
                paddingRight: `calc(${paddingRight} + ${icon.size}px + ${paddingRight})`,
                backgroundColor: isUnselected
                  ? unselected.background
                  : isHovered
                  ? hover.background
                  : selected.background,
                borderRadius: radius,
                border: borderStyle,
                cursor: "pointer",
                "--hover-border-color": hover.border.borderColor,
                "--focus-outline-color":
                  focus?.color || hover.border.borderColor,
                "--focus-outline-width": `${focus?.width || 2}px`,
                "--focus-outline-offset": `${effectiveOffset}px`,
                "--focus-outline-radius": focusRadius,
                ...marginStyle,
              },
              children: [
                /*#__PURE__*/ _jsx("span", {
                  style: {
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    minWidth: "max-content",
                    ...font,
                    color: isUnselected
                      ? unselected.color
                      : isFocused
                      ? hover.color
                      : isHovered
                      ? hover.color
                      : selected.color,
                    textTransform: get(
                      props,
                      "dropdownConfigs.textTransform",
                      "None"
                    ).toLowerCase(),
                  },
                  children: currentValue,
                }),
                /*#__PURE__*/ _jsxs("select", {
                  id: `variant-${opt.name}`,
                  style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "100%",
                    height: "100%",
                    boxSizing: "border-box",
                    appearance: "none",
                    WebkitAppearance: "none",
                    background: "transparent",
                    color: "transparent",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                    outline: "none",
                    opacity: 0,
                  },
                  value: currentValue,
                  onChange: (e) => {
                    const value = e.target.value;
                    if (value !== unselectedText) {
                      dispatchOptionSelectedEvent(opt.name, value);
                    }
                  },
                  onMouseDown: () => setIsFocused(true),
                  onMouseEnter: () => setIsHovered(true),
                  onMouseLeave: () => setIsHovered(false),
                  onFocus: () => setIsFocused(true),
                  onBlur: () => setIsFocused(false),
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      const select = e.target;
                      const event = new MouseEvent("mousedown", {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                      });
                      select.dispatchEvent(event);
                    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      setIsFocused(true);
                    }
                  },
                  "aria-label": `Select ${opt.name}`,
                  "aria-invalid": !valid,
                  "aria-required": "true",
                  "aria-describedby": !valid
                    ? `variant-error-${opt.name}`
                    : undefined,
                  children: [
                    /*#__PURE__*/ _jsx("option", {
                      value: unselectedText,
                      disabled: true,
                      children: unselectedText,
                    }),
                    filteredValues.map((v) => {
                      let isAvailableForSale;
                      if (
                        props.behaviorConfigs?.filterVariants?.variantGroups ===
                        "all"
                      ) {
                        const filtered = Array.from(
                          Object.entries({ ...selectedOptions, [opt.name]: v })
                        );
                        isAvailableForSale = combinations.find(
                          (combination) =>
                            filtered.every(
                              ([key, value]) => combination[key] === value
                            ) && combination.availableForSale
                        );
                      } else {
                        const availableValues = Array.from(
                          new Set(
                            combinations
                              .filter(
                                (comb) =>
                                  comb.availableForSale &&
                                  Object.entries(selectedOptions)
                                    .filter(([key]) => key !== opt.name)
                                    .every(
                                      ([key, value]) => comb[key] === value
                                    )
                              )
                              .map((comb) => comb[opt.name])
                              .filter(Boolean)
                          )
                        );
                        isAvailableForSale = availableValues.includes(v);
                      }
                      return /*#__PURE__*/ _jsx(
                        "option",
                        {
                          value: v,
                          disabled: !isAvailableForSale,
                          style: {
                            color: !isAvailableForSale
                              ? unselected.color
                              : selected.color,
                            backgroundColor: !isAvailableForSale
                              ? unselected.background
                              : selected.background,
                          },
                          children: v,
                        },
                        v
                      );
                    }),
                  ],
                }),
                /*#__PURE__*/ _jsx("div", {
                  "aria-hidden": "true",
                  style: {
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: padding,
                    pointerEvents: "none",
                  },
                  children:
                    icon.type === "custom" && icon.customIcon
                      ? /*#__PURE__*/ _jsx("img", {
                          src: icon.customIcon,
                          width: icon.size,
                          height: icon.size,
                          style: { objectFit: "contain" },
                          alt: "Dropdown icon",
                        })
                      : /*#__PURE__*/ _jsx("svg", {
                          width: icon.size,
                          height: icon.size,
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke:
                            icon.type === "default"
                              ? icon.color
                              : isUnselected
                              ? unselected.color
                              : isFocused
                              ? hover.color
                              : isHovered
                              ? hover.color
                              : icon.color,
                          strokeWidth: icon.weight,
                          strokeLinecap: "butt",
                          strokeLinejoin: "miter",
                          children: /*#__PURE__*/ _jsx("polyline", {
                            points: "6 9 12 15 18 9",
                          }),
                        }),
                }),
              ],
            }),
          }),
          !valid &&
            /*#__PURE__*/ _jsx("div", {
              id: `variant-error-${opt.name}`,
              role: "alert",
              "aria-live": "polite",
              style: {
                color: props.ErrorConfigs.errorColor,
                ...props.ErrorConfigs.errorFont,
                paddingTop: props.ErrorConfigs.errorPaddingTop,
              },
              children: invalidMsg,
            }),
        ],
      }),
    },
    opt.name
  );
};
/**
 * @framerDisableUnlink
 *
 * FC_ProductVariants is a component that allows users to select product variants.
 *
 * The 'variants' property accepts a string in the following format:
 * [Option Name: Value1,Value2,Value3 • option_id] •• [Value1/Value2 • variant_id][Value1/Value3 • variant_id2] •• product_id
 *
 * Examples:
 * - Single option: [Size: XS,S,M,L,XL • size_id] •• [XS • variant1][S • variant2][M • variant3][L • variant4][XL • variant5]
 * - Multiple options: [Size: XS,S,M,L,XL • size_id][Color: Blue,Black • color_id] •• [XS/Blue • var1][XS/Black • var2][S/Blue • var3]
 * - With product ID: [Size: XS,S,M,L,XL • size_id] •• [XS • variant1][S • variant2] •• product_123456789
 */ export default function FC_ProductVariants(props) {
  const { shopifyProductID, images, behaviorConfigs, style, variants } = props;
  const {
    showSingleVariants,
    selectOutOfStock,
    filterVariants,
    action,
    triggerCart,
    productPage = true,
  } = behaviorConfigs || {};
  let { autoSelectFirst } = behaviorConfigs || {};
  const [product, setProduct] = useState(null);
  const [shouldValidate, setShouldValidate] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [combinations, setCombinations] = useState([]); // Compute the option names this instance actually controls, accounting for
  // "equals" vs "doesn't equal" variantGroups. For "doesn't equal" we must
  // use the complement set (all option names excluding variantTitles).
  const getIncludedOptionNames = (prod = product, filters = filterVariants) => {
    const allNames = (get(prod, "options", []) || []).map((o) => o.name);
    if (!filters || filters.variantGroups === "all") return allNames;
    const titles = filters.variantTitles || [];
    return filters.variantGroups === "equals"
      ? titles
      : allNames.filter((name) => !titles.includes(name));
  }; // Filter options based on the filterVariants prop (for quick purchase functionality)
  const filteredOptions = React.useMemo(() => {
    if (!filterVariants || filterVariants.variantGroups === "all") {
      return get(product, "options") || [];
    }
    if (filterVariants.variantGroups === "equals") {
      return (get(product, "options") || []).filter((opt) =>
        filterVariants.variantTitles?.includes(opt.name)
      );
    }
    if (filterVariants.variantGroups === "doesn't equal") {
      return (get(product, "options") || []).filter(
        (opt) => !filterVariants.variantTitles?.includes(opt.name)
      );
    }
    return get(product, "options") || [];
  }, [product, filterVariants]); // Define environment flags without touching `window` on the server to avoid hydration mismatches
  const isBrowser = typeof window !== "undefined";
  const isCanvas = !isBrowser ? true : !window.shopXtools;
  const autoSelectRef = useRef(false); // Unique per-instance identifier to avoid cross-talk between multiple selectors
  const instanceIdRef = useRef(Math.random().toString(36).slice(2)); // Track whether we already applied variant from session storage to avoid double-processing
  const appliedFromStorageRef = useRef(false); // Guard to prevent race conditions while initializing auto-select
  const isInitializingRef = useRef(false); // Track previous config to detect transitions that should clear caches
  const prevActionRef = useRef(action);
  const prevAutoSelectFirstRef = useRef(!!autoSelectFirst); // Token to discard stale async work during initialization
  const initTokenRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const initialScrollPreventedRef = useRef(false); // Prevent initial scroll trigger
  const [selectedCurrency, setSelectedCurrency] = useState();
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);
  const [focusedValueIndex, setFocusedValueIndex] = useState(-1);
  const containerRef = useRef(null);
  const [colorHexMap, setColorHexMap] = useState(new Map());
  useEffect(() => {
    if (isInitializingRef.current) return;
    setSelectedOptions({});
    autoSelectRef.current = false;
  }, [shopifyProductID]); // Reset guards when filter configuration changes so auto-select can re-run
  useEffect(() => {
    if (isInitializingRef.current) return;
    setSelectedOptions({});
    autoSelectRef.current = false;
  }, [
    filterVariants?.variantGroups,
    (filterVariants?.variantTitles || []).join("|"),
  ]); // When autoSelectFirst is toggled off, clear any preselection in Canvas and Browser
  useEffect(() => {
    if (!autoSelectFirst) {
      autoSelectRef.current = false;
      setSelectedOptions({});
    }
  }, [autoSelectFirst]);
  const swatchColors = props.colors || []; // Use server-safe defaults during first render; hydrate from `window` after mount
  const [swatchImages, setSwatchImages] = useState(props.swatchImages || []);
  const [colorTitles, setColorTitles] = useState(
    props.colorTitles || ["Color"]
  );
  const imageTitles = props.imageTitles || [];
  const variantImageTitles = props.variantImageTitles || []; // After mount, read from window if available and props did not provide values
  useEffect(() => {
    if (!isBrowser) return;
    const cfg = window.__FcCheckoutConfigs;
    if (!props.swatchImages && Array.isArray(cfg?.variantImageValues)) {
      setSwatchImages(cfg.variantImageValues);
    }
    if (!props.colorTitles && Array.isArray(cfg?.variantColorTitles)) {
      setColorTitles(cfg.variantColorTitles);
    }
  }, [isBrowser, props.swatchImages, props.colorTitles]); // Standard color fallbacks
  const standardColorMap = new Map([
    ["black", "#000000"],
    ["white", "#FFFFFF"],
    ["red", "#FF0000"],
    ["green", "#00FF00"],
    ["blue", "#0000FF"],
    ["yellow", "#FFFF00"],
    ["purple", "#800080"],
    ["orange", "#FFA500"],
    ["pink", "#FFC0CB"],
    ["brown", "#A52A2A"],
    ["gray", "#808080"],
    ["grey", "#808080"],
    ["navy", "#000080"],
    ["teal", "#008080"],
    ["maroon", "#800000"],
    ["olive", "#808000"],
    ["lime", "#00FF00"],
    ["aqua", "#00FFFF"],
    ["silver", "#C0C0C0"],
    ["gold", "#FFD700"],
    ["beige", "#F5F5DC"],
    ["ivory", "#FFFFF0"],
    ["lavender", "#E6E6FA"],
    ["mint", "#F5FFFA"],
    ["coral", "#FF7F50"],
    ["indigo", "#4B0082"],
    ["violet", "#EE82EE"],
    ["magenta", "#FF00FF"],
    ["turquoise", "#40E0D0"],
    ["plum", "#DDA0DD"],
    ["salmon", "#FA8072"],
    ["tan", "#D2B48C"],
    ["khaki", "#F0E68C"],
    ["azure", "#F0FFFF"],
    ["bisque", "#FFE4C4"],
    ["chocolate", "#D2691E"],
    ["crimson", "#DC143C"],
    ["fuchsia", "#FF00FF"],
    ["honeydew", "#F0FFF0"],
    ["linen", "#FAF0E6"],
    ["moccasin", "#FFE4B5"],
    ["oldlace", "#FDF5E6"],
    ["orchid", "#DA70D6"],
    ["papayawhip", "#FFEFD5"],
    ["peachpuff", "#FFDAB9"],
    ["peru", "#CD853F"],
    ["rosybrown", "#BC8F8F"],
    ["sandybrown", "#F4A460"],
    ["seashell", "#FFF5EE"],
    ["sienna", "#A0522D"],
    ["skyblue", "#87CEEB"],
    ["slateblue", "#6A5ACD"],
    ["slategray", "#708090"],
    ["slategrey", "#708090"],
    ["snow", "#FFFAFA"],
    ["springgreen", "#00FF7F"],
    ["steelblue", "#4682B4"],
    ["thistle", "#D8BFD8"],
    ["tomato", "#FF6347"],
    ["wheat", "#F5DEB3"],
    ["whitesmoke", "#F5F5F5"],
    ["yellowgreen", "#9ACD32"],
  ]);
  useEffect(() => {
    const defaultColors = new Map(); // First, try to use colors from props if they exist
    if (swatchColors && swatchColors.length > 0) {
      swatchColors.forEach((color) => {
        if (color.name) {
          // Normalize the color name by trimming and converting to lowercase
          const normalizedName = color.name.trim().toLowerCase(); // Only use standard color as fallback if hex is missing
          const hex = color.hex || standardColorMap.get(normalizedName);
          if (hex) {
            defaultColors.set(normalizedName, hex);
          }
        }
      });
    } else if (
      typeof window !== "undefined" &&
      window.__FcCheckoutConfigs?.variantColorValues
    ) {
      try {
        const colors = window.__FcCheckoutConfigs.variantColorValues;
        if (Array.isArray(colors)) {
          colors.forEach((color) => {
            if (color.name && color.hex) {
              defaultColors.set(color.name.toLowerCase(), color.hex);
            }
          });
        }
      } catch (error) {
        console.error(
          "Error parsing color data from window.__FcCheckoutConfigs:",
          error
        );
      }
    }
    setColorHexMap(defaultColors);
  }, [swatchColors, swatchImages, product, colorTitles]); ////////////////////////////URL WITH VARIANT PARAMETER HANDLING//////////////////////////////////
  // Helper function to update URL with variant ID (for product pages)
  const updateUrlWithVariant = useCallback(
    (variantId) => {
      // console.log("updateUrlWithVariant called with:", {
      //     variantId,
      //     productPage,
      //     windowUndefined: typeof window === "undefined",
      //     currentUrl: typeof window !== "undefined" ? window.location.href : "N/A"
      // })
      if (typeof window !== "undefined" && productPage && variantId) {
        // Extract just the numeric ID from the full Shopify ID
        const numericId = variantId.replace(
          "gid://shopify/ProductVariant/",
          ""
        ); //console.log("Extracted numeric ID:", numericId)
        // Create new URL with variant parameter
        const url = new URL(window.location.href); //console.log("Current URL before update:", url.toString())
        url.searchParams.set("variant", numericId); //console.log("New URL with variant:", url.toString())
        // Update URL without triggering page refresh
        window.history.replaceState({}, "", url.toString()); //console.log("✅ Successfully updated URL with variant:", numericId)
        if (typeof window !== "undefined" && product && shopifyProductID) {
          // First, check for variant ID in URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const variantIdFromUrl = urlParams.get("variant");
          if (variantIdFromUrl) {
            // Find the variant with this ID
            const matchingVariant = (get(product, "variants.edges") || []).find(
              ({ node }) =>
                node.id.endsWith(variantIdFromUrl) ||
                node.id === `gid://shopify/ProductVariant/${variantIdFromUrl}`
            );
            if (matchingVariant) {
              const urlOptions = {};
              matchingVariant.node.selectedOptions.forEach((option) => {
                urlOptions[option.name] = option.value;
              });
              setSelectedOptions(urlOptions); //console.log("Link: Set variant from URL parameter:", urlOptions)
              // console.log("Link: matchingVariant", matchingVariant)
              const allOptions = get(product, "options", []).map(
                (opt) => opt.name
              ); //console.log("Link: allOptions", allOptions)
              const allOptionsSelected = allOptions.every(
                (optName) => urlOptions[optName]
              ); // console.log(
              //     "Link: allOptionsSelected", allOptionsSelected
              // )
              const key = `fc_active_variant_${shopifyProductID}`;
              const savedVariant = sessionStorage.getItem(key);
              if (!savedVariant) {
                saveVariantToSessionStorage(
                  urlOptions,
                  matchingVariant.node.id,
                  false
                ); //console.log("Link: saved variant to sessionStorage from url", urlOptions)
              }
              if (allOptionsSelected) {
                // Also dispatch a single event for the active variant
                setTimeout(() => {
                  if (__isPurchaseMode(action)) return;
                  const activeVariantEvent = new CustomEvent(
                    "product__active-variant__changed",
                    {
                      detail: {
                        ...matchingVariant.node,
                        productId: `gid://shopify/Product/${shopifyProductID}`,
                        isCompleteVariant: allOptionsSelected,
                      },
                    }
                  );
                  document.dispatchEvent(activeVariantEvent); // console.log(
                  //     "Link: activeVariantEvent",
                  //     activeVariantEvent.detail
                  // )
                }, 100);
              }
              return; // Exit early if we found a URL variant
            }
          }
        }
      } else {
        // console.log("❌ Skipping URL update - conditions not met:", {
        //     hasWindow: typeof window !== "undefined",
        //     productPage,
        //     hasVariantId: !!variantId
        // })
      }
    },
    [productPage, product, shopifyProductID]
  ); // Helper function to determine if current page is a product page based on URL
  const isCurrentPageProductPage = useCallback(() => {
    if (typeof window === "undefined") return false;
    try {
      setTimeout(() => {
        const products = window.shopXtools?.products;
        if (!Array.isArray(products)) {
          return false;
        }
        const url = new URL(window.location.href);
        const pathname = url.pathname;
        const urlHandle = pathname.split("/").filter(Boolean).pop();
        if (!urlHandle) {
          return false;
        }
        return products.some(({ node }) => node.handle === urlHandle);
      }, 500);
    } catch (error) {
      console.error(
        "Error determining if current page is product page:",
        error
      );
      return false;
    }
  }, []); // Clean up URL when component mounts on non-product page
  useEffect(() => {
    if (typeof window === "undefined" || !window.shopXtools?.products) return;
    checkAndCleanupUrl();
  }, []); // Function to clear session storage
  const clearSessionStorage = useCallback(() => {
    if (typeof window === "undefined") return; // const isPageProductPage = isCurrentPageProductPage()
    //console.log("clearSessionStorage - isPageProductPage", isPageProductPage)
    try {
      if (typeof window === "undefined") return;
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith("fc_active_variant_")) {
            sessionStorage.removeItem(key); // console.log("Cleared variant from sessionStorage", key);
          }
        }
      } catch (error) {
        console.error("Error clearing variant from sessionStorage:", error);
      }
    } catch (error) {
      console.error("Error clearing variant from sessionStorage:", error);
    }
  }, [shopifyProductID, isCurrentPageProductPage]); // Function to strip variant parameter from URL
  const stripVariantFromUrl = useCallback(() => {
    if (typeof window === "undefined" || !selectedOptions) return;
    try {
      const url = new URL(window.location.href);
      const searchParams = url.searchParams; // const isPageProductPage = isCurrentPageProductPage()
      // console.log("stripVariantFromUrl - isPageProductPage", isPageProductPage)
      // Remove variant parameter if it exists
      if (searchParams.has("variant")) {
        searchParams.delete("variant"); // Update URL without variant parameter using replaceState
        const newUrl = url.toString();
        window.history.replaceState({}, "", newUrl); // console.log("Stripped variant parameter from URL:", newUrl)
      } else {
        //console.log("Skipping stripping variant from URL - not on product page", isPageProductPage)
      }
    } catch (error) {
      console.error("Error stripping variant from URL:", error);
    }
  }, [shopifyProductID, selectedOptions, isCurrentPageProductPage]); // Function to check and clean up URL if not on valid product page
  const checkAndCleanupUrl = useCallback(() => {
    if (typeof window === "undefined" || !window.shopXtools?.products) return;
    const isValidProductPage = isCurrentPageProductPage(); // console.log(
    //     "isValidProductPage in checkAndCleanupUrl",
    //     isValidProductPage
    // )
    const hasVariantParam = new URLSearchParams(window.location.search).has(
      "variant"
    ); // console.log("has valid param in the url", hasVariantParam)
    if (isValidProductPage === undefined) return; // if (hasVariantParam && isValidProductPage){
    // }
    // If we have a variant parameter but we're not on a valid product page, clean up
    if (hasVariantParam && !isValidProductPage) {
      // console.log("Cleaning up variant URL - not on valid product page", isValidProductPage)
      clearSessionStorage();
      stripVariantFromUrl();
      setSelectedOptions({});
    }
  }, [
    isCurrentPageProductPage,
    clearSessionStorage,
    stripVariantFromUrl,
    selectedOptions,
  ]); // Build a namespaced storage key based on product and filter configuration
  const getVariantStorageKey = useCallback(() => {
    const group = filterVariants?.variantGroups || "all";
    const titles = (filterVariants?.variantTitles || []).join("|") || "all";
    return `fc_active_variant_${shopifyProductID}_${group}__${titles}`;
  }, [
    shopifyProductID,
    filterVariants?.variantGroups,
    filterVariants?.variantTitles,
  ]); // Function to save variant selection to session storage
  const saveVariantToSessionStorage = useCallback(
    (selectedOptions, variantId, isPartial = false) => {
      if (typeof window === "undefined") return;
      try {
        const savedVariantKey = getVariantStorageKey();
        const variantData = {
          selectedOptions,
          variantId,
          timestamp: Date.now(),
          isPartial,
        }; // Write to namespaced key (includes filter config)
        sessionStorage.setItem(savedVariantKey, JSON.stringify(variantData)); // Also write to legacy product-only key so other instances with different
        // filter configurations can still restore
        const legacyKey = `fc_active_variant_${shopifyProductID}`;
        sessionStorage.setItem(legacyKey, JSON.stringify(variantData)); //console.log("Saved variant to sessionStorage:", savedVariantKey, variantData)
      } catch (error) {
        console.error("Error saving variant to sessionStorage:", error);
      }
    },
    [getVariantStorageKey]
  ); // Function to load variant from session storage
  const loadVariantFromSessionStorage = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      const namespacedKey = getVariantStorageKey();
      let savedData = sessionStorage.getItem(namespacedKey); // Back-compat: fall back to legacy product-only key
      if (!savedData) {
        const legacyKey = `fc_active_variant_${shopifyProductID}`;
        savedData = sessionStorage.getItem(legacyKey);
      } // As an additional fallback, search for any saved key for this product regardless
      // of filter configuration and pick the most recent
      if (!savedData) {
        const prefix = `fc_active_variant_${shopifyProductID}_`;
        let latest = null;
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith(prefix)) {
            try {
              const value = sessionStorage.getItem(key);
              if (!value) continue;
              const parsed = JSON.parse(value);
              const ts = parsed?.timestamp || 0;
              if (
                parsed?.selectedOptions &&
                (!latest || ts > latest.timestamp)
              ) {
                latest = { data: parsed, timestamp: ts };
              }
            } catch (_) {
              // ignore malformed entries
            }
          }
        }
        if (latest) {
          savedData = JSON.stringify(latest.data);
        }
      }
      if (savedData) {
        const savedVariantData = JSON.parse(savedData);
        const timestamp = savedVariantData.timestamp || Date.now(); // Only restore if the data is recent (within 24 hours)
        const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1e3;
        if (isRecent && savedVariantData.selectedOptions) {
          // Do not enforce presence of specific option names here; different components
          // may use different filter configurations. We'll filter to product option names
          // later during application.
          return savedVariantData;
        }
      }
    } catch (error) {
      console.error("Error loading variant from sessionStorage:", error);
    }
    return null;
  }, [
    shopifyProductID,
    getVariantStorageKey,
    filterVariants?.variantGroups,
    filterVariants?.variantTitles,
  ]); // Function to apply variant from session storage to URL (for product pages)
  const applyVariantFromSessionStorage = useCallback(() => {
    if (typeof window === "undefined" || !productPage || !product) return;
    const hasUrlVariant = new URLSearchParams(window.location.search).has(
      "variant"
    ); // If the URL already specifies a variant, do NOT apply sessionStorage.
    // The URL must be the source of truth on refresh/navigation.
    if (hasUrlVariant) return false;
    const savedVariant = loadVariantFromSessionStorage();
    if (savedVariant?.variantId && savedVariant?.selectedOptions) {
      // console.log("Applying variant from sessionStorage:", savedVariant)
      // Filter saved options to only those that exist on this product
      const productOptionNames = (get(product, "options", []) || []).map(
        (opt) => opt.name
      );
      const filteredSelectedOptions = Object.fromEntries(
        Object.entries(savedVariant.selectedOptions).filter(([name]) =>
          productOptionNames.includes(name)
        )
      ); // console.log("filteredSelectedOptions", filteredSelectedOptions)
      // Merge into existing selections so components that auto-selected
      // missing options are not overwritten by storage restore
      setSelectedOptions((prev) => ({
        ...(prev || {}),
        ...filteredSelectedOptions,
      })); // console.log("applyVariantFromSessionStorage - setSelectedOptions", savedVariant.selectedOptions)
      // Find the matching variant to dispatch events
      const matchingVariant = (get(product, "variants.edges") || []).find(
        ({ node }) => node.id === savedVariant.variantId
      );
      if (matchingVariant) {
        // console.log("applyVariantFromSessionStorage - matchingVariant", matchingVariant)
        if (filterVariants?.variantGroups === "all" && autoSelectFirst) {
          const allOptions = get(product, "options", []).map((opt) => opt.name);
          const options = matchingVariant.node.selectedOptions;
          const allOptionsSelected = allOptions.every((optName) =>
            options.some((opt) => opt.name === optName && !!opt.value)
          );
          if (allOptionsSelected) {
            // console.log("updating url with an active variant", matchingVariant.node)
            updateUrlWithVariant(matchingVariant.node.id);
            saveVariantToSessionStorage(
              matchingVariant.node.selectedOptions,
              matchingVariant.node.id,
              false
            );
          }
        } // If this instance has AutoSelectFirst and the group has missing selections,
        // proactively fill them from the matching variant or the first available variant
        const groupOptionNames = getIncludedOptionNames();
        const missingInGroup = groupOptionNames.filter(
          (name) => !filteredSelectedOptions[name]
        );
        let mergedSelectedOptions = { ...filteredSelectedOptions }; // console.log("mergedSelectedOptions", mergedSelectedOptions)
        // Only backfill missing selections from storage when a URL variant is present.
        // Without a URL variant, keep the restore strictly partial.
        if (hasUrlVariant && autoSelectFirst && missingInGroup.length > 0) {
          // console.log("missingInGroup with autoSelectFirst", missingInGroup)
          let chosenSource = matchingVariant.node?.selectedOptions || [];
          if (!chosenSource.length) {
            const firstAvailable = (
              get(product, "variants.edges", []) || []
            ).find(({ node }) => node.availableForSale);
            chosenSource = firstAvailable?.node?.selectedOptions || [];
          }
          const filled = {};
          chosenSource.forEach((opt) => {
            if (missingInGroup.includes(opt.name)) {
              filled[opt.name] = opt.value;
            }
          });
          if (Object.keys(filled).length > 0) {
            mergedSelectedOptions = { ...filteredSelectedOptions, ...filled };
            setSelectedOptions((prev) => ({
              ...(prev || {}),
              ...mergedSelectedOptions,
            })); // Dispatch events for newly filled options to sync other components
            setTimeout(() => {
              Object.entries(filled).forEach(([optionName, value]) => {
                const event = new CustomEvent("variant_option_selected", {
                  detail: {
                    optionName,
                    value,
                    allSelectedOptions: mergedSelectedOptions,
                    isCompleteVariant: false,
                    isPurchaseAction: false,
                    productId: `gid://shopify/Product/${shopifyProductID}`,
                  },
                });
                document.dispatchEvent(event);
              }); // Dispatch communication event for other variant selectors to coordinate
              if (filterVariants?.variantGroups !== "all") {
                const communicationEvent = new CustomEvent(
                  "__variant_option_selected",
                  {
                    detail: {
                      productId: `gid://shopify/Product/${shopifyProductID}`,
                      optionName: Object.keys(filled)[0] || "",
                      value: Object.values(filled)[0] || "",
                      allSelectedOptions: mergedSelectedOptions,
                      allOptionsSelected: false,
                      isPurchaseAction: false,
                      autoSelectFirst: autoSelectFirst,
                      senderPriority: getIncludedOptionNames()[0] || "",
                      instanceId: instanceIdRef.current,
                    },
                  }
                );
                window.dispatchEvent(communicationEvent);
              }
            }, 0);
          }
        }
        const allOptions = get(product, "options", []).map((opt) => opt.name);
        const allOptionsSelected = allOptions.every(
          (optName) => mergedSelectedOptions[optName]
        ); // console.log("allOptionsSelected", allOptionsSelected)
        setTimeout(() => {
          // Dispatch events for each selected option
          const isCompleteEffective = hasUrlVariant && allOptionsSelected;
          Object.entries(mergedSelectedOptions).forEach(
            ([optionName, value]) => {
              const event = new CustomEvent("variant_option_selected", {
                detail: {
                  optionName,
                  value,
                  allSelectedOptions: mergedSelectedOptions,
                  isCompleteVariant: isCompleteEffective,
                  isPurchaseAction: false,
                  productId: `gid://shopify/Product/${shopifyProductID}`,
                },
              });
              document.dispatchEvent(event); // console.log("isCompleteEffective", isCompleteEffective)
            }
          ); // Dispatch communication event for other variant selectors to coordinate
          if (filterVariants?.variantGroups !== "all") {
            const communicationEvent = new CustomEvent(
              "__variant_option_selected",
              {
                detail: {
                  productId: `gid://shopify/Product/${shopifyProductID}`,
                  optionName: Object.keys(mergedSelectedOptions)[0] || "",
                  value: Object.values(mergedSelectedOptions)[0] || "",
                  allSelectedOptions: mergedSelectedOptions,
                  allOptionsSelected: allOptionsSelected,
                  isPurchaseAction: false,
                  autoSelectFirst: autoSelectFirst,
                  senderPriority: getIncludedOptionNames()[0] || "",
                  instanceId: instanceIdRef.current,
                },
              }
            );
            window.dispatchEvent(communicationEvent); // console.log("communicationEvent", communicationEvent)
          }
        }, 100); // Only treat restore as authoritative when a URL variant is present.
        if (hasUrlVariant && allOptionsSelected) {
          // console.log("applyVariantFromSessionStorage - updateUrlWithVariant", savedVariant.variantId)
          updateUrlWithVariant(savedVariant.variantId);
        }
        setTimeout(() => {
          if (__isPurchaseMode(action)) return;
          if (!hasUrlVariant) return;
          const activeVariantEvent = new CustomEvent(
            "product__active-variant__changed",
            {
              detail: {
                ...matchingVariant.node,
                productId: `gid://shopify/Product/${shopifyProductID}`,
                isCompleteVariant: allOptionsSelected,
              },
            }
          );
          document.dispatchEvent(activeVariantEvent); // console.log("Applied variant from sessionStorage - dispatched event:", activeVariantEvent.detail)
        }, 100);
      } else if (autoSelectFirst) {
        // console.log("applyVariantFromSessionStorage - autoSelectFirst")
        // No matching variant in this product, but we have partial selections
        // If this component's group has missing selections, fill them from first available variant
        const productOptionNames = (get(product, "options", []) || []).map(
          (opt) => opt.name
        );
        const groupOptionNames = getIncludedOptionNames();
        const missingInGroup = groupOptionNames.filter(
          (name) => !filteredSelectedOptions[name]
        );
        if (missingInGroup.length > 0) {
          const firstAvailable = (
            get(product, "variants.edges", []) || []
          ).find(({ node }) => node.availableForSale);
          const source = firstAvailable?.node?.selectedOptions || [];
          const filled = {};
          source.forEach((opt) => {
            if (missingInGroup.includes(opt.name)) {
              filled[opt.name] = opt.value;
            }
          });
          if (Object.keys(filled).length > 0) {
            const mergedSelectedOptions = {
              ...filteredSelectedOptions,
              ...filled,
            };
            setSelectedOptions((prev) => ({
              ...(prev || {}),
              ...mergedSelectedOptions,
            }));
            setTimeout(() => {
              Object.entries(filled).forEach(([optionName, value]) => {
                const event = new CustomEvent("variant_option_selected", {
                  detail: {
                    optionName,
                    value,
                    allSelectedOptions: mergedSelectedOptions,
                    isCompleteVariant: false,
                    isPurchaseAction: false,
                    productId: `gid://shopify/Product/${shopifyProductID}`,
                  },
                });
                document.dispatchEvent(event);
              }); // Dispatch communication event for other variant selectors to coordinate
              if (filterVariants?.variantGroups !== "all") {
                const communicationEvent = new CustomEvent(
                  "__variant_option_selected",
                  {
                    detail: {
                      productId: `gid://shopify/Product/${shopifyProductID}`,
                      optionName: Object.keys(filled)[0] || "",
                      value: Object.values(filled)[0] || "",
                      allSelectedOptions: mergedSelectedOptions,
                      allOptionsSelected: false,
                      isPurchaseAction: false,
                      autoSelectFirst: autoSelectFirst,
                      senderPriority: getIncludedOptionNames()[0] || "",
                      instanceId: instanceIdRef.current,
                    },
                  }
                );
                window.dispatchEvent(communicationEvent);
              }
            }, 0);
          }
        }
      }
      return true;
    }
    return false;
  }, [
    productPage,
    loadVariantFromSessionStorage,
    updateUrlWithVariant,
    product,
    shopifyProductID,
  ]);
  const restoreVariantFromUrl = useCallback(() => {
    // console.log("restoreVariantFromUrl - restoring variant from URL")
    const url = new URL(window.location.href);
    const pathname = url.pathname; // Extract potential product handle from URL pathname
    const urlHandle = pathname.split("/").filter(Boolean).pop(); // console.log("restoreVariantFromUrl - urlHandle", urlHandle)
    if (
      window.shopXtools?.products &&
      Array.isArray(window.shopXtools.products) &&
      urlHandle
    ) {
      const matchingProduct = window.shopXtools.products.find(
        ({ node: product }) => product.handle === urlHandle
      );
      const matchingProductId = matchingProduct?.node.id.split(
        "gid://shopify/Product/"
      )[1]; // console.log("matchingProductId", matchingProductId)
      // console.log(
      //     "restoreVariantFromUrl - matchingProduct",
      //     matchingProduct
      // )
      if (!matchingProduct) {
        // console.log(
        //     "restoreVariantFromUrl - no matching product found for the shopifyProductID"
        // )
        return;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const variantIdFromUrl = urlParams.get("variant");
      if (variantIdFromUrl) {
        // Find the variant with this ID
        const matchingVariant = (
          get(matchingProduct.node, "variants.edges") || []
        ).find(
          ({ node }) =>
            node.id.endsWith(variantIdFromUrl) ||
            node.id === `gid://shopify/ProductVariant/${variantIdFromUrl}`
        ); // console.log("restoreVariantFromUrl - matchingVariant", matchingVariant)
        if (!matchingVariant) {
          // console.log(
          //     "restoreVariantFromUrl - no matching variant found for the product"
          // )
          return;
        }
        if (matchingVariant) {
          // Build selected options from variant
          const matchingVariantId = matchingVariant.node.id.split(
            "gid://shopify/ProductVariant/"
          )[1];
          const urlOptions = {};
          matchingVariant.node.selectedOptions.forEach((option) => {
            urlOptions[option.name] = option.value;
          }); //console.log("restoreVariantFromUrl - urlOptions", urlOptions)
          // Set selected options in state
          setSelectedOptions(urlOptions); // Optionally, dispatch events here if needed
          const allOptions = get(matchingProduct, "options", []).map(
            (opt) => opt.name
          ); // console.log("Restore URL: allOptions", allOptions)
          const allOptionsSelected = allOptions.every(
            (optName) => urlOptions[optName]
          ); // console.log(
          //     "Restore URL: allOptionsSelected", allOptionsSelected
          // )
          if (allOptionsSelected) {
            // Save to sessionStorage if not already present
            // saveVariantToSessionStorage(
            //     urlOptions,
            //     matchingVariant.node.id,
            //     false
            // )
            const savedVariantKey = `fc_active_variant_${matchingProductId}`;
            if (sessionStorage.getItem(savedVariantKey)) return;
            const variantData = {
              urlOptions,
              matchingVariantId,
              timestamp: Date.now(),
              isPartial: false,
            };
            sessionStorage.setItem(
              savedVariantKey,
              JSON.stringify(variantData)
            ); //console.log("Saved variant to sessionStorage:", savedVariantKey, variantData)
            //console.log("Restore URL:Saved variant to sessionStorage from URL", urlOptions)
            // Also dispatch a single event for the active variant
            setTimeout(() => {
              if (__isPurchaseMode(action)) return;
              const activeVariantEvent = new CustomEvent(
                "product__active-variant__changed",
                {
                  detail: {
                    ...matchingVariant.node,
                    productId: `gid://shopify/Product/${shopifyProductID}`,
                    isCompleteVariant: allOptionsSelected,
                  },
                }
              );
              document.dispatchEvent(activeVariantEvent); // console.log(
              //     "Restore URL: activeVariantEvent",
              //     activeVariantEvent.detail
              // )
            }, 100);
          }
        }
      }
    }
  }, [product]); // Handle page leave cleanup
  // Refs to access current values in stable handler
  const productPageRef = useRef(productPage);
  const productRef = useRef(product);
  const restoreVariantFromUrlRef = useRef(restoreVariantFromUrl); // Update refs when values change
  useEffect(() => {
    productPageRef.current = productPage;
    productRef.current = product;
    restoreVariantFromUrlRef.current = restoreVariantFromUrl;
  }, [productPage, product, restoreVariantFromUrl]); // Comprehensive navigation handler - handles ALL scenarios
  const handlePopState = useCallback(
    (event) => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasVariantInUrl = urlParams.has("variant");
      const currentPath = window.location.pathname;
      const urlHandle = currentPath.split("/").filter(Boolean).pop(); // Determine if current URL is a product page
      const isUrlProductPage =
        window.shopXtools?.products && Array.isArray(window.shopXtools.products)
          ? window.shopXtools.products.some(
              ({ node }) => node.handle === urlHandle
            )
          : false; // Scenario 1: We're on a product page component AND URL is a product page AND has variant
      if (productPageRef.current && isUrlProductPage && hasVariantInUrl) {
        // console.log("Scenario 1: We're on a product page component AND URL is a product page AND has variant")
        event.stopImmediatePropagation();
        if (productRef.current) {
          restoreVariantFromUrlRef.current();
        }
        return;
      } // WORKS: Scenario 2: We're on a product page component BUT URL is NOT a product page (forward navigation)
      if (productPageRef.current && !isUrlProductPage) {
        // console.log("Scenario 2: We're on a product page component BUT URL is NOT a product page (forward navigation)")
        event.stopImmediatePropagation();
        window.location.reload();
        return;
      } // WORKS: Scenario 3: We're NOT on a product page component BUT URL has variant (back navigation)
      if (!productPageRef.current && hasVariantInUrl) {
        // console.log("Scenario 3: We're NOT on a product page component BUT URL has variant (back navigation)")
        event.stopImmediatePropagation();
        window.location.reload();
        return;
      } // WORKS: Scenario 4: We're NOT on a product page component AND URL is a product page but no variant
      // This is navigation TO a product page - let Framer handle it naturally
      // Stop propagation to prevent CatalogDisplay from interfering
      if (!productPageRef.current && isUrlProductPage && !hasVariantInUrl) {
        // Normal navigation - stop propagation so CatalogDisplay doesn't interfere
        // console.log("Normal navigation - stopping propagation: Scenario 4")
        event.stopImmediatePropagation();
        return;
      } // Scenario 5: We're on a product page component AND URL is a product page but no variant
      // This could be initial load or variant cleared - let Framer handle
      if (productPageRef.current && isUrlProductPage && !hasVariantInUrl) {
        // Normal navigation - do nothing, let Framer handle
        // console.log("Normal navigation - do nothing, let Framer handle: Scenario 5")
        event.stopImmediatePropagation();
        return;
      }
    },
    [shopifyProductID]
  ); // Priority navigation handling - takes precedence over global handlers
  useEffect(() => {
    if (typeof window === "undefined") return; // Add with capture=true to run before other handlers
    window.addEventListener("popstate", handlePopState, true);
    return () => {
      window.removeEventListener("popstate", handlePopState, true);
    };
  }, [handlePopState, shopifyProductID]); // Apply variant from session storage when component mounts on product page
  useEffect(() => {
    // console.log("UseEffect: productPage, product", productPage, product)
    if (productPage && !isCanvas && typeof window !== "undefined" && product) {
      // Small delay to ensure URL is stable and product data is loaded
      const timer = setTimeout(() => {
        const isAppliedFromSessionStorage = applyVariantFromSessionStorage();
        appliedFromStorageRef.current = !!isAppliedFromSessionStorage; // console.log("Applied and saved variant from sessionStorage", isAppliedFromSessionStorage)
        if (isAppliedFromSessionStorage) return;
        if (!isAppliedFromSessionStorage) {
          // console.log("No variant found in sessionStorage, restoring from URL")
          // 1. Check for variant in URL
          const urlParams = new URLSearchParams(window.location.search);
          const variantIdFromUrl = urlParams.get("variant");
          if (variantIdFromUrl) {
            // Find the variant with this ID
            const matchingVariant = (get(product, "variants.edges") || []).find(
              ({ node }) =>
                node.id.endsWith(variantIdFromUrl) ||
                node.id === `gid://shopify/ProductVariant/${variantIdFromUrl}`
            );
            if (matchingVariant) {
              // Build selected options from variant
              const urlOptions = {};
              matchingVariant.node.selectedOptions.forEach((option) => {
                urlOptions[option.name] = option.value;
              }); // Set selected options in state
              setSelectedOptions(urlOptions); // Optionally, dispatch events here if needed
              const allOptions = get(product, "options", []).map(
                (opt) => opt.name
              ); // console.log("Restore URL: allOptions", allOptions)
              const allOptionsSelected = allOptions.every(
                (optName) => urlOptions[optName]
              ); // console.log(
              //     "Restore URL: allOptionsSelected", allOptionsSelected
              // )
              if (allOptionsSelected) {
                // Save to sessionStorage if not already present
                saveVariantToSessionStorage(
                  urlOptions,
                  matchingVariant.node.id,
                  false
                ); //console.log("Restore URL:Saved variant to sessionStorage from URL", urlOptions)
                // Also dispatch a single event for the active variant
                setTimeout(() => {
                  const activeVariantEvent = new CustomEvent(
                    "product__active-variant__changed",
                    {
                      detail: {
                        ...matchingVariant.node,
                        productId: `gid://shopify/Product/${shopifyProductID}`,
                        isCompleteVariant: allOptionsSelected,
                      },
                    }
                  );
                  document.dispatchEvent(activeVariantEvent); // console.log(
                  //     "Restore URL: activeVariantEvent",
                  //     activeVariantEvent.detail
                  // )
                }, 100);
              }
            }
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [productPage, applyVariantFromSessionStorage, product, shopifyProductID]); // Add global styles for hover effects and accessibility
  useEffect(() => {
    // Create style element if it doesn't exist
    let styleEl = document.getElementById("fc-product-variants-styles");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "fc-product-variants-styles";
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
            /* Base z-index for all containers */
            .variant-button-container, .variant-dropdown-container {
                z-index: 0;
                position: relative;
            }
            
            /* Increase z-index on hover */
            .variant-button-container:hover, .variant-dropdown-container:hover {
                z-index: 2 !important;
            }
            
            /* Ensure dropdown inner elements inherit hover state */
            .variant-dropdown-container:hover .dropdown-inner {
                z-index: 2 !important;
                position: relative;
            }
            
            /* Ensure dropdown select elements have proper z-index */
            .dropdown-inner {
                position: relative;
                z-index: 0;
            }

            /* Focus outline via CSS - instant, no React delay */
            .dropdown-inner {
                outline: var(--focus-outline-width, 2px) solid transparent;
                outline-offset: var(--focus-outline-offset, 2px);
                transition: outline-color 0.15s ease-in-out;
            }
            .dropdown-inner:focus-within {
                outline-color: var(--focus-outline-color, var(--hover-border-color, #000));
                border-radius: var(--focus-outline-radius, 0px);
                transition: outline-color 0.15s ease-in-out;
            }

            /* Remove ALL default focus/active styling from select */
            .dropdown-inner select,
            .dropdown-inner select:focus,
            .dropdown-inner select:focus-visible,
            .dropdown-inner select:focus-within,
            .dropdown-inner select:active,
            .dropdown-inner select:-moz-focusring {
                outline: none !important;
                outline-offset: 0 !important;
                border: none !important;
                box-shadow: none !important;
                -webkit-tap-highlight-color: transparent !important;
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
            }

            /* Firefox inner focus ring */
            .dropdown-inner select::-moz-focus-inner {
                border: 0 !important;
                outline: 0 !important;
            }

            /* Force margin-right for horizontal layout */
            .variant-dropdown-container[data-horizontal="true"]:not([data-last="true"]) {
                margin-right: -1px !important;
            }
            
            /* Direct class for horizontal edge-to-edge */
            .horizontal-edge-to-edge {
                margin-right: -1px !important;
            }
            
            /* Focus styles for accessibility - buttons only, dropdown uses inline styles */
            .variant-button-container button:focus-visible {
                outline: 2px solid #0078D4 !important;
                outline-offset: 2px !important;
            }
            
            /* High contrast mode support */
            @media (forced-colors: active) {
                .variant-button-container button:focus-visible {
                    outline: 2px solid CanvasText !important;
                }
            }

            /* Swatch styles */
            .variant-swatch-container {
                position: relative;
            }
            
            .variant-swatch-container:hover {
                z-index: 10 !important;
            }
            
            .variant-swatch-container:hover .swatch-tooltip {
                opacity: 1;
                visibility: visible;
            }
            
            .variant-swatch-container button:focus-visible {
                outline: 2px solid #0078D4 !important;
                outline-offset: 2px !important;
            }
            
            /* High contrast mode support */
            @media (forced-colors: active) {
                .variant-swatch-container button:focus-visible {
                    outline: 2px solid CanvasText !important;
                }
            }
        `;
  }, []); // Force autoSelectFirst to false if action is purchase
  if (__isPurchaseMode(action)) {
    autoSelectFirst = false;
  } // Dispatch the autoSelectFirst flag on load (scoped with product GID)
  useEffect(() => {
    if (isCanvas) return;
    const productGid = `gid://shopify/Product/${shopifyProductID}`;
    const timeoutId = setTimeout(() => {
      const hasUrlVariant =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).has("variant"); // Force autoSelectFirst to false if action is purchase
      if (action === "Add to Cart" || action === "Buy Now") {
        const autoSelectEvent = new CustomEvent("auto_select_first_flag", {
          detail: {
            autoSelectFirst: false,
            shopifyProductID: productGid,
            instanceId: instanceIdRef.current,
          },
        });
        document.dispatchEvent(autoSelectEvent); //console.log("Purchase: dispatching autoSelectFirst as", { autoSelectFirst: false })
      } else {
        // On PDP without a URL variant, always broadcast false to prevent eager full selection
        const effectiveAuto =
          productPage && !hasUrlVariant ? false : autoSelectFirst;
        const autoSelectEvent = new CustomEvent("auto_select_first_flag", {
          detail: {
            autoSelectFirst: effectiveAuto,
            shopifyProductID: productGid,
            instanceId: instanceIdRef.current,
          },
        });
        document.dispatchEvent(autoSelectEvent); // console.log("Dispatching autoSelectFirst as", { autoSelectFirst })
      }
    }, 100); // Adjust the delay as needed
    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
  }, [autoSelectFirst, action, isCanvas, shopifyProductID]);
  useEffect(() => {
    // Reset autoSelectRef when product changes
    // autoSelectRef.current = false
    // setSelectedOptions({})
    // Create style element if it doesn't exist
    let styleEl = document.getElementById("fc-product-variants-styles");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "fc-product-variants-styles";
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
            /* Base z-index for all containers */
            .variant-dropdown-container {
                position: relative;
                z-index: 1;
            }

            /* Increase z-index when focused */
            .variant-dropdown-container:focus-within {
                z-index: 10;
            }

            /* Remove ALL default focus/active styling from select */
            .dropdown-inner select,
            .dropdown-inner select:focus,
            .dropdown-inner select:focus-visible,
            .dropdown-inner select:focus-within,
            .dropdown-inner select:active,
            .dropdown-inner select:-moz-focusring {
                outline: none !important;
                outline-offset: 0 !important;
                border: none !important;
                box-shadow: none !important;
                -webkit-tap-highlight-color: transparent !important;
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
            }

            /* Firefox inner focus ring */
            .dropdown-inner select::-moz-focus-inner {
                border: 0 !important;
                outline: 0 !important;
            }

            /* Focus outline on dropdown wrapper via CSS variable */
            .dropdown-inner {
                outline: var(--focus-outline-width, 2px) solid transparent;
                outline-offset: var(--focus-outline-offset, 2px);
                transition: outline-color 0.15s ease-in-out;
            }
            .dropdown-inner:focus-within {
                outline-color: var(--focus-outline-color, var(--hover-border-color, #000));
                border-radius: var(--focus-outline-radius, 0px);
                transition: outline-color 0.15s ease-in-out;
            }

            /* Special styling for edge-to-edge layout */
            .horizontal-edge-to-edge + .horizontal-edge-to-edge .variant-dropdown {
                border-left: none !important;
            }

            .fc-dropdown-focus {
                outline: 2px solid CanvasText !important;
                outline-offset: 2px !important;
            }

            .fc-dropdown-list-item:focus {
                outline: 2px solid CanvasText !important;
                outline-offset: -2px !important;
            }
        `; // If we're in canvas mode and have variants prop, use that data
    if (isCanvas && variants) {
      const {
        options,
        variants: parsedVariants,
        productId,
      } = parseOptionsAndVariants(variants); // Create mock product with the parsed data (for canvas preview only)
      const mockProduct = {
        id: productId || "mock-product",
        options: options.map((opt) => ({ name: opt.name, values: opt.values })),
        variants: {
          edges: parsedVariants.map((variant, index) => {
            // Check if preview mode is enabled and this is the second variant of any option group
            let availableForSale = true;
            if (props.buttonConfigs?.outOfStock?.preview) {
              // For each option, check if this variant has the second value
              options.forEach((opt, optIndex) => {
                if (
                  opt.values.length > 1 &&
                  variant.combination[optIndex] === opt.values[1]
                ) {
                  availableForSale = false;
                }
              });
            }
            return {
              node: {
                id: variant.id.startsWith("gid://")
                  ? variant.id
                  : `gid://shopify/ProductVariant/${variant.id}`,
                availableForSale: availableForSale,
                quantityAvailable: availableForSale ? 50 : 0,
                selectedOptions: options.map((opt, index) => ({
                  name: opt.name,
                  value: variant.combination[index],
                })),
                price: { amount: "19.99", currencyCode: "USD" },
              },
            };
          }),
        },
        images: {
          edges: Array(4)
            .fill(0)
            .map((_, i) => ({ node: { id: `image-${i + 1}` } })),
        },
        priceRange: {
          minVariantPrice: { amount: "19.99", currencyCode: "USD" },
        },
      };
      setProduct(mockProduct);
      return;
    } // If we're in canvas mode but no variants prop, use default mock data
    if (isCanvas) {
      const mockProduct = {
        id: "mock-product",
        variants: {
          edges: [
            // XS variants
            {
              node: {
                id: "mock-variant-1",
                availableForSale: selectOutOfStock || true,
                quantityAvailable: 50,
                selectedOptions: [
                  { name: "Size", value: "XS" },
                  { name: "Color", value: "Green" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-2",
                availableForSale:
                  selectOutOfStock || !props.buttonConfigs?.outOfStock?.preview,
                selectedOptions: [
                  { name: "Size", value: "XS" },
                  { name: "Color", value: "Blue" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-3",
                availableForSale: selectOutOfStock || true,
                selectedOptions: [
                  { name: "Size", value: "XS" },
                  { name: "Color", value: "Pink" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-4",
                availableForSale: selectOutOfStock || true,
                selectedOptions: [
                  { name: "Size", value: "XS" },
                  { name: "Color", value: "Black" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            }, // S variants (disabled when preview ON - S is 2nd size)
            {
              node: {
                id: "mock-variant-5",
                availableForSale:
                  selectOutOfStock || !props.buttonConfigs?.outOfStock?.preview,
                selectedOptions: [
                  { name: "Size", value: "S" },
                  { name: "Color", value: "Green" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-6",
                availableForSale:
                  selectOutOfStock || !props.buttonConfigs?.outOfStock?.preview,
                selectedOptions: [
                  { name: "Size", value: "S" },
                  { name: "Color", value: "Blue" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-7",
                availableForSale:
                  selectOutOfStock || !props.buttonConfigs?.outOfStock?.preview,
                selectedOptions: [
                  { name: "Size", value: "S" },
                  { name: "Color", value: "Pink" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-8",
                availableForSale:
                  selectOutOfStock || !props.buttonConfigs?.outOfStock?.preview,
                selectedOptions: [
                  { name: "Size", value: "S" },
                  { name: "Color", value: "Black" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            }, // M variants
            {
              node: {
                id: "mock-variant-9",
                availableForSale: selectOutOfStock || true,
                selectedOptions: [
                  { name: "Size", value: "M" },
                  { name: "Color", value: "Green" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-10",
                availableForSale:
                  selectOutOfStock || !props.buttonConfigs?.outOfStock?.preview,
                selectedOptions: [
                  { name: "Size", value: "M" },
                  { name: "Color", value: "Blue" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-11",
                availableForSale: selectOutOfStock || true,
                selectedOptions: [
                  { name: "Size", value: "M" },
                  { name: "Color", value: "Pink" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-12",
                availableForSale: selectOutOfStock || true,
                selectedOptions: [
                  { name: "Size", value: "M" },
                  { name: "Color", value: "Black" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            }, // L variants
            {
              node: {
                id: "mock-variant-13",
                availableForSale: selectOutOfStock || true,
                selectedOptions: [
                  { name: "Size", value: "L" },
                  { name: "Color", value: "Green" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-14",
                availableForSale:
                  selectOutOfStock || !props.buttonConfigs?.outOfStock?.preview,
                selectedOptions: [
                  { name: "Size", value: "L" },
                  { name: "Color", value: "Blue" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-15",
                availableForSale: selectOutOfStock || true,
                selectedOptions: [
                  { name: "Size", value: "L" },
                  { name: "Color", value: "Pink" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-16",
                availableForSale: selectOutOfStock || true,
                selectedOptions: [
                  { name: "Size", value: "L" },
                  { name: "Color", value: "Black" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            }, // XL variants
            {
              node: {
                id: "mock-variant-17",
                availableForSale: selectOutOfStock || true,
                selectedOptions: [
                  { name: "Size", value: "XL" },
                  { name: "Color", value: "Green" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-18",
                availableForSale:
                  selectOutOfStock || !props.buttonConfigs?.outOfStock?.preview,
                selectedOptions: [
                  { name: "Size", value: "XL" },
                  { name: "Color", value: "Blue" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-19",
                availableForSale: selectOutOfStock || true,
                selectedOptions: [
                  { name: "Size", value: "XL" },
                  { name: "Color", value: "Pink" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
            {
              node: {
                id: "mock-variant-20",
                availableForSale: selectOutOfStock || true,
                selectedOptions: [
                  { name: "Size", value: "XL" },
                  { name: "Color", value: "Black" },
                ],
                price: { amount: "19.99", currencyCode: "USD" },
              },
            },
          ],
        },
        options: [
          { name: "Size", values: ["XS", "S", "M", "L", "XL"] },
          { name: "Color", values: ["Green", "Blue", "Pink", "Black"] },
        ],
        images: {
          edges: Array(4)
            .fill(0)
            .map((_, i) => ({ node: { id: `image-${i + 1}` } })),
        },
        priceRange: {
          minVariantPrice: { amount: "19.99", currencyCode: "USD" },
        },
      };
      setProduct(mockProduct);
      return;
    } // If we're not in canvas mode, use the standard product data loading
    if (!isCanvas) {
      if (
        window["shopXtools"] &&
        Array.isArray(window["shopXtools"].products)
      ) {
        const _matchingProduct = window["shopXtools"].products.find(
          ({ node: _product }) =>
            _product.id === `gid://shopify/Product/${shopifyProductID}`
        );
        if (_matchingProduct) {
          setProduct(_matchingProduct.node);
        }
      } // ALWAYS set up event listener to receive updates (including priority products)
      const handleProductsReady = (e) => {
        // console.log('Variant Selector received the product', e);
        if (Array.isArray(e.detail.products)) {
          const _matchingProduct = e.detail.products.find(
            ({ node: _product }) =>
              _product.id === `gid://shopify/Product/${shopifyProductID}`
          );
          if (_matchingProduct) {
            setProduct(_matchingProduct.node);
          }
        }
      };
      document.addEventListener("data__products-ready", handleProductsReady);
      return () => {
        document.removeEventListener(
          "data__products-ready",
          handleProductsReady
        );
      };
    }
    document.addEventListener("product__variants__validate", () => {
      setShouldValidate(true);
    });
    return () => {
      document.removeEventListener("product__variants__validate", () =>
        setShouldValidate(true)
      );
    };
  }, [
    shopifyProductID,
    variants,
    images.imageChange,
    props.variantImageIds,
    props.buttonConfigs?.outOfStock?.preview,
  ]); // Handle URL variants when product data becomes available
  useEffect(() => {
    if (!productPage || !product || isCanvas || __isPurchaseMode(action))
      return;
    const urlParams = new URLSearchParams(window.location.search);
    const variantIdFromUrl = urlParams.get("variant");
    if (variantIdFromUrl) {
      // Debug logging to help troubleshoot URL variant processing
      // console.log(`[FC_ProductVariants] Processing URL variant: ${variantIdFromUrl}`, {
      //     productId: shopifyProductID,
      //     productOptions: get(product, "options", []).map(opt => opt.name),
      //     variantCount: get(product, "variants.edges", []).length,
      //     filterConfig: filterVariants
      // })
      // Find the variant with this ID - use exact matching to avoid partial ID conflicts
      const matchingVariant = get(product, "variants.edges", []).find(
        ({ node }) => {
          // Try exact full ID match first
          if (node.id === `gid://shopify/ProductVariant/${variantIdFromUrl}`) {
            return true;
          } // Fallback: extract just the numeric ID from the full Shopify ID and compare
          const nodeIdNumber = node.id.split("/").pop();
          return nodeIdNumber === variantIdFromUrl;
        }
      ); // Debug logging to help troubleshoot variant matching
      if (!matchingVariant) {
        console.warn(
          `[FC_ProductVariants] URL variant ${variantIdFromUrl} not found in product variants:`,
          {
            urlVariantId: variantIdFromUrl,
            availableVariantIds: get(product, "variants.edges", []).map(
              ({ node }) => ({
                fullId: node.id,
                numericId: node.id.split("/").pop(),
              })
            ),
            productId: shopifyProductID,
          }
        );
      }
      if (matchingVariant) {
        const urlOptions = {};
        matchingVariant.node.selectedOptions.forEach((option) => {
          urlOptions[option.name] = option.value;
        });
        setSelectedOptions(urlOptions); // Set autoSelectRef if auto-select is enabled
        if (autoSelectFirst) {
          autoSelectRef.current = true;
        } // Dispatch events for the URL variant
        const allOptions = get(product, "options", []).map((opt) => opt.name);
        const allOptionsSelected = allOptions.every(
          (optName) => urlOptions[optName]
        );
        setTimeout(() => {
          // Dispatch events for each selected option
          Object.entries(urlOptions).forEach(([optionName, value]) => {
            const event = new CustomEvent("variant_option_selected", {
              detail: {
                optionName,
                value,
                allSelectedOptions: urlOptions,
                isCompleteVariant: allOptionsSelected,
                isPurchaseAction: false,
                productId: `gid://shopify/Product/${shopifyProductID}`,
              },
            });
            document.dispatchEvent(event);
          }); // Dispatch communication event for other variant selectors to coordinate
          if (filterVariants?.variantGroups !== "all") {
            const communicationEvent = new CustomEvent(
              "__variant_option_selected",
              {
                detail: {
                  productId: `gid://shopify/Product/${shopifyProductID}`,
                  optionName: Object.keys(urlOptions)[0] || "",
                  value: Object.values(urlOptions)[0] || "",
                  allSelectedOptions: urlOptions,
                  isPurchaseAction: false,
                  autoSelectFirst: autoSelectFirst,
                  senderPriority: getIncludedOptionNames()[0] || "",
                  instanceId: instanceIdRef.current,
                },
              }
            );
            window.dispatchEvent(communicationEvent);
          } // Dispatch active variant event if complete - RESPECT the URL variant even if out of stock
          if (allOptionsSelected) {
            const activeVariantEvent = new CustomEvent(
              "product__active-variant__changed",
              {
                detail: {
                  ...matchingVariant.node,
                  productId: `gid://shopify/Product/${shopifyProductID}`,
                  isCompleteVariant: allOptionsSelected,
                },
              }
            );
            document.dispatchEvent(activeVariantEvent); // console.log("active variant event sent", activeVariantEvent)
          }
        }, 100);
      }
    }
  }, [
    product,
    productPage,
    shopifyProductID,
    isCanvas,
    action,
    autoSelectFirst,
    filterVariants?.variantGroups,
    filterVariants?.variantTitles,
  ]); // Retry mechanism for URL variants to handle race conditions
  useEffect(() => {
    if (!productPage || isCanvas || __isPurchaseMode(action)) return;
    const urlParams = new URLSearchParams(window.location.search);
    const variantIdFromUrl = urlParams.get("variant");
    if (variantIdFromUrl && !product) {
      // If we have a URL variant but no product data yet, retry after a delay
      const retryTimer = setTimeout(() => {
        if (window.location.search.includes(`variant=${variantIdFromUrl}`)) {
          // Force a re-render to trigger the URL variant effect again
          window.dispatchEvent(new Event("resize"));
        }
      }, 500);
      return () => clearTimeout(retryTimer);
    }
  }, [product, productPage, shopifyProductID, isCanvas, action]); // On PDP without a URL variant, clear only full selections from storage; keep partials so PLP→PDP can persist
  useEffect(() => {
    if (!productPage) return;
    if (__isPurchaseMode(action)) return;
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get("variant")) {
      try {
        const prefixLegacy = `fc_active_variant_${shopifyProductID}`;
        const prefixScoped = `fc_active_variant_${shopifyProductID}_`;
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (!k) continue;
          if (k === prefixLegacy || k.startsWith(prefixScoped)) {
            try {
              const parsed = JSON.parse(sessionStorage.getItem(k) || "null"); // Remove only if it represents a full selection
              if (parsed && parsed.isPartial === false) {
                sessionStorage.removeItem(k);
              }
            } catch {
              // If unreadable, remove to be safe
              sessionStorage.removeItem(k);
            }
          }
        } // Do not clear local selection here; allow hybrid restore of partials
      } catch {}
    }
  }, [productPage, action, shopifyProductID]); // useEffect to listen for variant selection via selected images
  useEffect(() => {
    if (!product) return; // Listen for image variant selection events
    const handleImageVariantSelected = (e) => {
      if (!e.detail) return;
      const variantId = e.detail.variant_id;
      if (!variantId) return; // console.log("Mapping variant to image", e.detail)
      // Find the variant with this ID
      const variant = (get(product, "variants.edges") || []).find(
        ({ node }) => node.id === variantId
      );
      if (variant) {
        // console.log("variant", variant)
        // Determine which option this image should control (prefer configured image titles, then color titles, else first option)
        const imageOptionNames = [
          ...(props.variantImageTitles || []),
          ...(props.imageTitles || []),
          ...(props.colorTitles || ["Color", "Colour"]),
        ].map((s) => String(s).toLowerCase().trim()); // console.log("imageOptionNames", imageOptionNames)
        const targetOpt =
          (variant.node.selectedOptions || []).find((opt) =>
            imageOptionNames.includes(
              String(opt?.name || "")
                .toLowerCase()
                .trim()
            )
          ) || (variant.node.selectedOptions || [])[0]; // console.log("targetOpt", targetOpt)
        if (targetOpt?.name && targetOpt?.value) {
          // Use the central selection flow so partial selection is respected
          dispatchOptionSelectedEvent(targetOpt.name, targetOpt.value);
        }
      }
    };
    document.addEventListener(
      "image__variant__selected",
      handleImageVariantSelected
    );
    const handleImageNumberSelected = (e) => {
      // console.log("Mapping image number to variant", e.detail)
      // Only process image clicks if imageChange is enabled
      if (
        !images.imageChange ||
        !e.detail?.imageNumber ||
        !props.variantImageIds
      ) {
        // console.log(
        //     "[Variants] handleImageNumberSelected: no imageChange or imageNumber or variantImageIds"
        // )
        return;
      } // Parse the variant-to-image mapping
      const mapping = new Map();
      let match;
      while (
        (match = IMAGE_MAPPING_REGEX.exec(props.variantImageIds)) !== null
      ) {
        const [, imageNumber, variantId] = match; // Store mapping both ways for easy lookup
        mapping.set(imageNumber, variantId);
        mapping.set(variantId, imageNumber);
      } // Reset regex index for next use
      IMAGE_MAPPING_REGEX.lastIndex = 0; // Find the variant ID for this image number
      const variantId = mapping.get(String(e.detail.imageNumber)); // console.log("variantId", variantId)
      if (!variantId) return; // Find the variant with this ID
      const variant = (get(product, "variants.edges") || []).find(({ node }) =>
        node.id.endsWith(variantId)
      ); // console.log("variant", variant)
      if (variant) {
        // console.log("variant", variant)
        // console.log("autoSelectFirst", autoSelectFirst)
        if (variant.node.selectedOptions) {
          //autoSelectFirst &&
          const allSelectedOptions = {};
          for (const option of variant.node.selectedOptions || []) {
            if (option.name && option.value) {
              allSelectedOptions[option.name] = option.value;
            }
          } //Dispatch individual option selected event
          const communicationEvent = new CustomEvent(
            "__variant_option_selected",
            {
              detail: {
                productId: `gid://shopify/Product/${shopifyProductID}`, // optionName: name,
                // value,
                allSelectedOptions, //allOptionsSelected: allOptionsSelected,
                isPurchaseAction: false,
                autoSelectFirst: autoSelectFirst,
                senderPriority: getIncludedOptionNames()[0] || "",
                instanceId: instanceIdRef.current,
                twoWayGallery: true,
              },
            }
          );
          window.dispatchEvent(communicationEvent); // console.log(
          //     "communicationEvent in two way gallery logic",
          //     communicationEvent.detail
          // )
          // return
        } // // Determine which option this image should control (prefer configured image titles, then color titles, else first option)
        // const imageOptionNames = [
        //     ...(props.variantImageTitles || []),
        //     ...(props.imageTitles || []),
        //     ...(props.colorTitles || ["Color", "Colour"]),
        // ].map((s) => String(s).toLowerCase().trim())
        // const targetOpt =
        //     (variant.node.selectedOptions || []).find((opt) =>
        //         imageOptionNames.includes(
        //             String(opt?.name || "")
        //                 .toLowerCase()
        //                 .trim()
        //         )
        //     ) || (variant.node.selectedOptions || [])[0]
        // if (targetOpt?.name && targetOpt?.value) {
        //     // console.log("targetOpt?.name && targetOpt?.value", targetOpt?.name, targetOpt?.value)
        //     // Use the central selection flow so partial selection is respected
        //     dispatchOptionSelectedEvent(targetOpt.name, targetOpt.value)
        // }
      }
    };
    document.addEventListener(
      "image__variant__selected",
      handleImageVariantSelected
    );
    document.addEventListener(
      "image__number__selected",
      handleImageNumberSelected
    );
    return () => {
      document.removeEventListener(
        "image__variant__selected",
        handleImageVariantSelected
      );
      document.removeEventListener(
        "image__number__selected",
        handleImageNumberSelected
      );
    };
  }, [product]); // Canvas-only: when toggling from Purchase to Update Active with Auto Select enabled,
  // clear prior selection and product-scoped cache so auto-select can re-run deterministically
  useEffect(() => {
    if (!isCanvas) return;
    if (action === "Update Active" && autoSelectFirst) {
      try {
        const key = `fc_active_variant_${shopifyProductID}`;
        sessionStorage.removeItem(key);
      } catch {}
      setSelectedOptions({});
      autoSelectRef.current = false;
    }
  }, [isCanvas, action, autoSelectFirst, shopifyProductID]); // Browser and Canvas: when switching to Update Active or enabling Auto Select 1st,
  // clear product-scoped cache and local selection so auto-select can re-run
  useEffect(() => {
    const switchedToUpdateActive =
      prevActionRef.current !== "Update Active" && action === "Update Active";
    const enabledAutoSelect =
      !prevAutoSelectFirstRef.current && !!autoSelectFirst;
    if (switchedToUpdateActive || enabledAutoSelect) {
      try {
        const key = `fc_active_variant_${shopifyProductID}`;
        sessionStorage.removeItem(key);
      } catch {}
      setSelectedOptions({});
      autoSelectRef.current = false;
    }
    prevActionRef.current = action;
    prevAutoSelectFirstRef.current = !!autoSelectFirst;
  }, [action, autoSelectFirst, shopifyProductID]); // Ref: Reset options when purchase/checkout click is completed
  // const isResettingRef = useRef(false)
  useEffect(() => {
    if (
      autoSelectFirst &&
      product &&
      !autoSelectRef.current &&
      Object.keys(selectedOptions).length === 0
    ) {
      // Skip auto-select if there's already a URL variant - respect user's explicit choice
      // const urlParams = new URLSearchParams(window.location.search)
      // if (urlParams.get("variant") && !isCanvas) {
      //     return
      // }
      const variants = get(product, "variants.edges", []); // Find first available variant
      const firstAvailableVariant = variants.find(
        ({ node }) => node.availableForSale
      );
      const variantKey = `fc_active_variant_${shopifyProductID}`;
      const savedVariant = isCanvas ? null : sessionStorage.getItem(variantKey); // console.log("Saved variant to sessionStorage", savedVariant, variantKey)
      let initialOptions = {};
      let parsedVariant = null;
      let isPartial = false;
      if (!savedVariant && productPage && !isCanvas && product) {
        // console.log("No saved variant, parsing url")
        // console.log("product in autoSelectFirst", product)
        const urlParams = new URLSearchParams(window.location.search);
        const variantIdFromUrl = urlParams.get("variant"); // console.log("variantIdFromUrl", variantIdFromUrl)
        parsedVariant = get(product, "variants.edges", []).find(
          ({ node }) =>
            node.id === `gid://shopify/ProductVariant/${variantIdFromUrl}`
        ); // console.log("parsedVariant, no saved", parsedVariant)
        if (parsedVariant) {
          parsedVariant.node.selectedOptions.forEach((option) => {
            initialOptions[option.name] = option.value;
          });
          setSelectedOptions(initialOptions); // console.log("parsedVariant in autoSelectFirst: initialOptions", initialOptions)
        }
        autoSelectRef.current = true;
        const allOptions = get(product, "options", []).map((opt) => opt.name);
        const allOptionsSelected = allOptions.every(
          (optName) => initialOptions[optName]
        ); // console.log(
        //     "savedVariant : allOptionsSelected",
        //     allOptionsSelected
        // )
        // Add a small delay to ensure components are ready
        setTimeout(() => {
          // Dispatch events for each selected option
          Object.entries(initialOptions).forEach(([optionName, value]) => {
            const event = new CustomEvent("variant_option_selected", {
              detail: {
                optionName,
                value,
                allSelectedOptions: initialOptions,
                isCompleteVariant: allOptionsSelected,
                isPurchaseAction: false,
                productId: `gid://shopify/Product/${shopifyProductID}`,
              },
            });
            document.dispatchEvent(event); // console.log(
            //     "variant_option_selected event: savedVariant",
            //     event.detail
            // )
          });
          if (allOptionsSelected && !isPartial) {
            // updateUrlWithVariant(fullVariant.node.id)
            // console.log("Updating url for autoSelectFirst")
            setTimeout(() => {
              // Also dispatch a single event for the active variant
              if (action !== "Add to Cart" && action !== "Buy Now") {
                const activeVariantEvent = new CustomEvent(
                  "product__active-variant__changed",
                  {
                    detail: {
                      ...parsedVariant?.node,
                      productId: `gid://shopify/Product/${shopifyProductID}`,
                      isCompleteVariant: allOptionsSelected,
                    },
                  }
                );
                document.dispatchEvent(activeVariantEvent); // console.log(
                //     "activeVariantEvent in autoSelectFirst",
                //     activeVariantEvent.detail
                // )
              }
            }, 100); // End of initialization
            isInitializingRef.current = false;
          }
        }, 100);
      }
      if (
        savedVariant &&
        productPage &&
        !isCanvas &&
        !appliedFromStorageRef.current
      ) {
        // console.log("Saved variant exists, restoring")
        const savedVariantId = JSON.parse(savedVariant).variantId; //console.log("savedVariantId", savedVariantId)
        const variantId = savedVariantId.split(
          "gid://shopify/ProductVariant/"
        )[1]; // console.log("variantId", variantId)
        // console.log("product", product)
        parsedVariant = get(product, "variants.edges", []).find(
          ({ node }) => node.id === `gid://shopify/ProductVariant/${variantId}`
        ); // console.log("parsedVariant", parsedVariant)
        isPartial = JSON.parse(savedVariant).isPartial; // console.log("isPartial", isPartial)
        initialOptions = JSON.parse(savedVariant).selectedOptions; // If this component's group has missing selections, fill them
        const allOptionNames = (get(product, "options", []) || []).map(
          (opt) => opt.name
        );
        const groupOptionNames = getIncludedOptionNames();
        const missingInGroup = groupOptionNames.filter(
          (name) => !initialOptions[name]
        );
        if (missingInGroup.length > 0) {
          // Helper to pick the first valid combination by declared option value order
          const optionsList = get(product, "options", []) || [];
          const scopeTitles = getIncludedOptionNames();
          const pickFirstByOrder = (baseSelections = {}) => {
            const partial = { ...baseSelections };
            for (const opt of optionsList) {
              if (!scopeTitles.includes(opt.name)) continue;
              const nextValue = (opt.values || []).find((value) => {
                const trial = { ...partial, [opt.name]: value };
                return variants.some(({ node }) => {
                  if (!node?.availableForSale) return false;
                  return Object.entries(trial).every(([k, v]) =>
                    node.selectedOptions?.some(
                      (o) => o.name === k && o.value === v
                    )
                  );
                });
              });
              if (!nextValue) return null;
              partial[opt.name] = nextValue;
            }
            return partial;
          };
          const fallbackPicked = pickFirstByOrder({});
          const fallbackSelected = fallbackPicked
            ? Object.entries(fallbackPicked).map(([name, value]) => ({
                name,
                value,
              }))
            : [];
          const sourceOptions =
            parsedVariant?.node?.selectedOptions || fallbackSelected || [];
          sourceOptions.forEach((option) => {
            if (missingInGroup.includes(option.name)) {
              initialOptions[option.name] = option.value;
            }
          });
        }
        setSelectedOptions(initialOptions); // console.log("savedVariant in autoSelectFirst: initialOptions", initialOptions)
        autoSelectRef.current = true;
        const allOptions = get(product, "options", []).map((opt) => opt.name);
        const allOptionsSelected = allOptions.every(
          (optName) => initialOptions[optName]
        ); // console.log(
        //     "savedVariant : allOptionsSelected",
        //     allOptionsSelected
        // )
        // Add a small delay to ensure components are ready
        setTimeout(() => {
          // Dispatch events for each selected option
          Object.entries(initialOptions).forEach(([optionName, value]) => {
            const event = new CustomEvent("variant_option_selected", {
              detail: {
                optionName,
                value,
                allSelectedOptions: initialOptions,
                isCompleteVariant: allOptionsSelected,
                isPurchaseAction: false,
                productId: `gid://shopify/Product/${shopifyProductID}`,
              },
            });
            document.dispatchEvent(event); // console.log(
            //     "variant_option_selected event: savedVariant",
            //     event.detail
            // )
          }); // Dispatch communication event for other variant selectors
          if (!isCanvas && filterVariants?.variantGroups !== "all") {
            const communicationEvent = new CustomEvent(
              "__variant_option_selected",
              {
                detail: {
                  productId: `gid://shopify/Product/${shopifyProductID}`,
                  optionName: Object.keys(initialOptions)[0],
                  value: Object.values(initialOptions)[0],
                  allSelectedOptions: initialOptions,
                  allOptionsSelected: allOptionsSelected,
                  isPurchaseAction: false,
                  autoSelectFirst: autoSelectFirst,
                  senderPriority: filterVariants?.variantTitles?.[0] || "",
                  instanceId: instanceIdRef.current,
                },
              }
            );
            window.dispatchEvent(communicationEvent);
          }
          if (allOptionsSelected && !isPartial) {
            // updateUrlWithVariant(fullVariant.node.id)
            setTimeout(() => {
              // Also dispatch a single event for the active variant
              if (action !== "Add to Cart" && action !== "Buy Now") {
                const activeVariantEvent = new CustomEvent(
                  "product__active-variant__changed",
                  {
                    detail: {
                      ...parsedVariant?.node,
                      productId: `gid://shopify/Product/${shopifyProductID}`,
                      isCompleteVariant: allOptionsSelected,
                    },
                  }
                );
                document.dispatchEvent(activeVariantEvent); // console.log(
                //     "activeVariantEvent in autoSelectFirst",
                //     activeVariantEvent.detail
                // )
              }
            }, 100); // End of initialization
            isInitializingRef.current = false;
          }
        }, 100);
      }
      if (!parsedVariant) {
        //console.log("pickFirstByOrder: No saved variant or storage, using autoSelectFirst", parsedVariant)
        // Prefer declared option order over variant edges order
        const optionsList = get(product, "options", []) || [];
        const scopeTitles = getIncludedOptionNames();
        const pickFirstByOrder = (baseSelections = {}) => {
          const partial = { ...baseSelections };
          for (const opt of optionsList) {
            if (!scopeTitles.includes(opt.name)) continue;
            const nextValue = (opt.values || []).find((value) => {
              const trial = { ...partial, [opt.name]: value };
              return variants.some(({ node }) => {
                if (!node?.availableForSale) return false;
                return Object.entries(trial).every(([k, v]) =>
                  node.selectedOptions?.some(
                    (o) => o.name === k && o.value === v
                  )
                );
              });
            });
            if (!nextValue) return null;
            partial[opt.name] = nextValue;
          }
          return partial;
        };
        const picked = pickFirstByOrder({});
        if (picked) {
          initialOptions = picked;
        }
        setSelectedOptions(initialOptions); // console.log("autoSelectFirst: initialOptions", initialOptions)
        autoSelectRef.current = true;
        const allOptions = get(product, "options", []).map((opt) => opt.name);
        const allOptionsSelected = allOptions.every(
          (optName) => initialOptions[optName]
        ); // console.log(
        //     "autoSelectFirst: allOptionsSelected",
        //     allOptionsSelected
        // )
        // Add a small delay to ensure components are ready
        setTimeout(() => {
          // Dispatch events for each selected option
          Object.entries(initialOptions).forEach(([optionName, value]) => {
            const event = new CustomEvent("variant_option_selected", {
              detail: {
                optionName,
                value,
                allSelectedOptions: initialOptions,
                isCompleteVariant: allOptionsSelected,
                isPurchaseAction: false,
                productId: `gid://shopify/Product/${shopifyProductID}`,
              },
            });
            document.dispatchEvent(event); // console.log(
            //     "variant_option_selected event: autoSelectFirst",
            //     event.detail
            // )
          }); // Dispatch communication event for other variant selectors
          if (!isCanvas && filterVariants?.variantGroups !== "all") {
            const communicationEvent = new CustomEvent(
              "__variant_option_selected",
              {
                detail: {
                  productId: `gid://shopify/Product/${shopifyProductID}`,
                  optionName: Object.keys(initialOptions)[0],
                  value: Object.values(initialOptions)[0],
                  allSelectedOptions: initialOptions,
                  allOptionsSelected: allOptionsSelected,
                  isPurchaseAction: false,
                  autoSelectFirst: autoSelectFirst,
                  senderPriority: getIncludedOptionNames()[0] || "",
                  instanceId: instanceIdRef.current,
                },
              }
            );
            window.dispatchEvent(communicationEvent); // console.log(
            //     "communicationEvent in autoSelectFirst",
            //     communicationEvent.detail
            // )
          } // console.log("isPartial", isPartial)
          if (allOptionsSelected && !isPartial) {
            // If we can match a variant for picked options, update URL
            const matching = variants.find(({ node }) =>
              Object.entries(initialOptions).every(([k, v]) =>
                node.selectedOptions?.some((o) => o.name === k && o.value === v)
              )
            ); // console.log("matching", matching.node)
            if (productPage && matching?.node?.id) {
              // console.log("Updating url for autoSelectFirst", matching.node)
              updateUrlWithVariant(matching.node.id);
            } // setTimeout(() => {
            // Also dispatch a single event for the active variant
            if (action !== "Add to Cart" && action !== "Buy Now") {
              const activeVariantEvent = new CustomEvent(
                "product__active-variant__changed",
                {
                  detail: {
                    ...matching?.node,
                    productId: `gid://shopify/Product/${shopifyProductID}`,
                    isCompleteVariant: allOptionsSelected,
                  },
                }
              );
              document.dispatchEvent(activeVariantEvent); // console.log("active variant event sent", activeVariantEvent)
            } // End of initialization
            isInitializingRef.current = false; // console.log(
            //     "activeVariantEvent in autoSelectFirst",
            //     activeVariantEvent.detail
            // )
            // }, 100)
          }
        }, 100);
      }
      if (firstAvailableVariant && !parsedVariant) {
        // console.log("No saved variant or storage, using autoSelectFirst", firstAvailableVariant)
        // If variantGroups is "all", set all options
        // Otherwise only set the current group's option
        firstAvailableVariant.node.selectedOptions.forEach((option) => {
          if (
            filterVariants?.variantGroups === "all" || // (filterVariants?.variantGroups === "equals" &&
            filterVariants?.variantTitles?.includes(option.name)
          ) {
            initialOptions[option.name] = option.value;
          }
        }); //console.log("autoSelectFirst: firstAvailableVariant", firstAvailableVariant.node.id)
        setSelectedOptions(initialOptions); //console.log("autoSelectFirst: initialOptions", initialOptions)
        autoSelectRef.current = true;
        const allOptions = get(product, "options", []).map((opt) => opt.name);
        const allOptionsSelected = allOptions.every(
          (optName) => initialOptions[optName]
        ); // console.log(
        //     "autoSelectFirst: allOptionsSelected",
        //     allOptionsSelected
        // )
        // Add a small delay to ensure components are ready
        setTimeout(() => {
          // Dispatch events for each selected option
          Object.entries(initialOptions).forEach(([optionName, value]) => {
            const event = new CustomEvent("variant_option_selected", {
              detail: {
                optionName,
                value,
                allSelectedOptions: initialOptions,
                isCompleteVariant: allOptionsSelected,
                isPurchaseAction: false,
                productId: `gid://shopify/Product/${shopifyProductID}`,
              },
            });
            document.dispatchEvent(event); // console.log(
            //     "variant_option_selected event: autoSelectFirst",
            //     event.detail
            // )
          }); // Dispatch communication event for other variant selectors
          if (filterVariants?.variantGroups !== "all") {
            const communicationEvent = new CustomEvent(
              "__variant_option_selected",
              {
                detail: {
                  productId: `gid://shopify/Product/${shopifyProductID}`,
                  optionName: Object.keys(initialOptions)[0],
                  value: Object.values(initialOptions)[0],
                  allSelectedOptions: initialOptions,
                  allOptionsSelected: allOptionsSelected,
                  isPurchaseAction: false,
                  autoSelectFirst: autoSelectFirst,
                  senderPriority: getIncludedOptionNames()[0] || "",
                  instanceId: instanceIdRef.current,
                },
              }
            );
            window.dispatchEvent(communicationEvent); // console.log(
            //     "communicationEvent in autoSelectFirst",
            //     communicationEvent.detail
            // )
          }
          if (allOptionsSelected && !isPartial) {
            if (productPage) {
              // console.log("updating Url With Variant", firstAvailableVariant)
              updateUrlWithVariant(firstAvailableVariant.node.id);
            } //console.log("Updating url for autoSelectFirst")
            // setTimeout(() => {
            // Also dispatch a single event for the active variant
            if (action !== "Add to Cart" && action !== "Buy Now") {
              const activeVariantEvent = new CustomEvent(
                "product__active-variant__changed",
                {
                  detail: {
                    ...firstAvailableVariant.node,
                    productId: `gid://shopify/Product/${shopifyProductID}`,
                    isCompleteVariant: allOptionsSelected,
                  },
                }
              );
              document.dispatchEvent(activeVariantEvent); // console.log("active variant event sent", activeVariantEvent)
            } // End of initialization
            isInitializingRef.current = false; // console.log(
            //     "activeVariantEvent in autoSelectFirst",
            //     activeVariantEvent.detail
            // )
            // }, 100)
          }
        }, 100);
      }
    }
  }, [
    product,
    autoSelectFirst,
    shopifyProductID,
    filterVariants?.variantGroups,
    (filterVariants?.variantTitles || []).join("|"),
    productPage,
    isCanvas,
  ]);
  const oldSelectionsRef = useRef({});
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      const { currency } = event.detail;
      setSelectedCurrency(currency);
      oldSelectionsRef.current = { ...selectedOptions }; // Save current selections
      if (
        window["shopXtools"] &&
        Array.isArray(window["shopXtools"].products)
      ) {
        const _matchingProduct = window["shopXtools"].products.find(
          ({ node: _product }) =>
            _product.id === `gid://shopify/Product/${shopifyProductID}`
        );
        if (_matchingProduct) {
          const newProduct = _matchingProduct.node;
          setProduct(newProduct);
        }
      }
    };
    window.addEventListener("currency_changed", handleCurrencyChange);
    return () => {
      window.removeEventListener("currency_changed", handleCurrencyChange);
    };
  }, [shopifyProductID, selectedOptions]); // New effect: restore selections AFTER product updates via currency selection
  useEffect(() => {
    if (!product) return;
    const savedSelections = oldSelectionsRef.current;
    if (!savedSelections || Object.keys(savedSelections).length === 0) return;
    const validSelections = {};
    const newOptions = get(product, "options", []);
    for (const opt of newOptions) {
      const { name, values } = opt;
      const selectedValue = savedSelections[name];
      if (selectedValue && values.includes(selectedValue)) {
        validSelections[name] = selectedValue;
      }
    }
    setSelectedOptions(validSelections); // Only dispatch events if we have valid selections
    if (Object.keys(validSelections).length > 0) {
      const activeVariant = getProductVariant(product, validSelections); // Get all available options for this product
      const allOptions = get(product, "options", []).map((opt) => opt.name); // Check if all options have been selected
      const allOptionsSelected = allOptions.every(
        (optName) => validSelections[optName]
      ); // Dispatch variant option events for each restored selection
      Object.entries(validSelections).forEach(([optionName, value]) => {
        const event = new CustomEvent("variant_option_selected", {
          detail: {
            optionName,
            value,
            allSelectedOptions: validSelections,
            isCompleteVariant: allOptionsSelected,
            isPurchaseAction: false,
          },
        });
        document.dispatchEvent(event);
      }); // Dispatch active variant event if we have a complete variant
      if (activeVariant && allOptionsSelected) {
        // Add a small delay to ensure PurchaseButton is ready
        setTimeout(() => {
          if (action !== "Add to Cart" && action !== "Buy Now") {
            const activeVariantEvent = new CustomEvent(
              "product__active-variant__changed",
              {
                detail: {
                  ...activeVariant,
                  productId: `gid://shopify/Product/${shopifyProductID}`,
                  isCompleteVariant: allOptionsSelected,
                },
              }
            );
            document.dispatchEvent(activeVariantEvent); // console.log(
            //     "activeVariantEvent in currencyChange",
            //     activeVariantEvent.detail
            // )
          } // Dispatch sync event with fromCurrencyChange flag
          const syncEvent = new CustomEvent("variant__visual__sync", {
            detail: {
              productId: `gid://shopify/Product/${shopifyProductID}`,
              selectedOptions: validSelections,
              variantId: activeVariant?.id,
            },
          });
          document.dispatchEvent(syncEvent);
        }, 50);
      }
    }
  }, [product, shopifyProductID]);
  const activeVariant = getProductVariant(product, selectedOptions); // listening to changes on the activeVariant image
  const [previousUrl, setPreviousUrl] = useState(""); // Parse variant IDs string into a map of variant IDs to image numbers
  const parseVariantImageIds = (variantIdsString) => {
    if (!variantIdsString) return new Map();
    const mapping = new Map(); // Find all image markers and their positions
    const imageMarkers = [];
    const imageRegex = /\[Image (\d+) • (\d+)\]/g;
    let imageMatch;
    while ((imageMatch = imageRegex.exec(variantIdsString)) !== null) {
      imageMarkers.push({
        imageNumber: imageMatch[1],
        position: imageMatch.index,
        variantId: imageMatch[2],
        fullMatch: imageMatch[0],
      });
    } // Process each image marker and its associated variants
    for (let i = 0; i < imageMarkers.length; i++) {
      const marker = imageMarkers[i];
      const nextMarker = imageMarkers[i + 1]; // Map the main variant ID
      mapping.set(marker.variantId, marker.imageNumber); // Find all standalone variant IDs between this marker and the next one
      const startPos = marker.position + marker.fullMatch.length;
      const endPos = nextMarker ? nextMarker.position : variantIdsString.length;
      const segment = variantIdsString.substring(startPos, endPos); // Extract and map all standalone variant IDs in this segment
      const variantRegex = /\[(\d+)\]/g;
      let variantMatch;
      while ((variantMatch = variantRegex.exec(segment)) !== null) {
        mapping.set(variantMatch[1], marker.imageNumber);
      }
    } // console.log("Parsed variant to image mapping:", mapping)
    return mapping;
  };
  const [orderFieldError, setOrderFieldError] = useState(false); // Remove variant-to-image handling from dispatchOptionSelectedEvent
  const dispatchOptionSelectedEvent = useCallback(
    (optionName, value) => {
      const newSelectedOptions = { ...selectedOptions, [optionName]: value };
      setSelectedOptions(newSelectedOptions); // console.log("newSelectedOptions", newSelectedOptions)
      // Get all available options for this product
      const allOptions = get(product, "options", []).map((opt) => opt.name); // Check if all options have been selected
      const allOptionsSelected = allOptions.every(
        (optName) => newSelectedOptions[optName]
      ); // Dispatch communication event for quick purchase functionality
      // ONLY dispatch this event if it's NOT a purchase action
      if (
        filterVariants?.variantGroups !== "all" &&
        !__isPurchaseMode(action)
      ) {
        // Dispatch individual option selected event
        const communicationEvent = new CustomEvent(
          "__variant_option_selected",
          {
            detail: {
              productId: `gid://shopify/Product/${shopifyProductID}`,
              optionName,
              value,
              allSelectedOptions: newSelectedOptions,
              allOptionsSelected: allOptionsSelected,
              isPurchaseAction: false,
              autoSelectFirst: autoSelectFirst,
              senderPriority: getIncludedOptionNames()[0] || "",
              instanceId: instanceIdRef.current,
            },
          }
        );
        window.dispatchEvent(communicationEvent); // console.log(
        //     "communicationEvent in dispatchOptionSelectedEvent",
        //     communicationEvent.detail
        // )
      } // Dispatch individual option selected event
      const event = new CustomEvent("variant_option_selected", {
        detail: {
          optionName,
          value,
          allSelectedOptions: newSelectedOptions,
          productId: `gid://shopify/Product/${shopifyProductID}`,
          isPurchaseAction: action === "Add to Cart" || action === "Buy Now",
        },
      });
      document.dispatchEvent(event); // console.log("variant_option_selected event", event.detail)
      // If this is a purchase action and all options are selected, handle the quick purchase
      if (__isPurchaseMode(action)) {
        const purchaseActiveVariant = getProductVariant(
          product,
          newSelectedOptions
        );
        if (purchaseActiveVariant && window.shopXtools) {
          const getLineItem = () => {
            const merchandiseId =
              purchaseActiveVariant?.id ||
              (shopifyProductID
                ? `gid://shopify/ProductVariant/${shopifyProductID}`
                : null);
            if (!merchandiseId) {
              throw new Error("No valid product variant selected");
            }
            const lineItem = { merchandiseId, quantity: 1 };
            try {
              const productSpecificKey = `fc_cart_attributes_${props.shopifyProductID}`;
              const stored = sessionStorage.getItem(productSpecificKey);
              if (!stored) return lineItem;
              const data = JSON.parse(stored); // Get all attributes instead of just checking for specific ones
              const attributes = []; // Process all key-value pairs in the stored data
              Object.entries(data).forEach(([key, value]) => {
                if (value && String(value).trim()) {
                  attributes.push({ key, value: String(value).trim() });
                }
              }); // Only add attributes if we have any
              if (attributes.length > 0) {
                lineItem["attributes"] = attributes;
              }
            } catch (e) {
              console.error("Error adding attributes to cart item:", e);
            }
            return lineItem;
          };
          const handlePurchase = async () => {
            try {
              //attributes
              const productSpecificKey = `fc_cart_attributes_${props.shopifyProductID}`;
              const storedAttributes =
                sessionStorage.getItem(productSpecificKey); // console.log("[CHECK] Stored attributes:", storedAttributes)
              const parsedAttrs = storedAttributes
                ? JSON.parse(storedAttributes)
                : {}; // console.log("[CHECK] parsed attributes:", parsedAttrs)
              const configKey = `fc_input_config_${props.shopifyProductID}`;
              const config = sessionStorage.getItem(configKey);
              const parsedConfig = config ? JSON.parse(config) : {};
              const attrKeyList = Object.keys(parsedConfig);
              let hasError = false;
              for (const attrKey of attrKeyList) {
                const config = parsedConfig[attrKey];
                const savedValue = parsedAttrs[attrKey] || ""; // 1. Required check
                if (
                  config.required &&
                  (!savedValue || savedValue.trim() === "")
                ) {
                  window.dispatchEvent(
                    new CustomEvent("inputValidationFailed", {
                      detail: {
                        productId: props.shopifyProductID,
                        key: attrKey,
                      },
                    })
                  ); // console.log("[CHECK] Required field validation failed:", {
                  //     productId: props.shopifyProductID,
                  //     key: attrKey,
                  // })
                  hasError = true;
                  continue; // No need to check email if required failed
                } // 2. Email validation (only if value is not empty)
                if (
                  config.validateEmail &&
                  savedValue &&
                  savedValue.trim() !== ""
                ) {
                  const validateEmail = (email) => {
                    if (!email || !email.includes("@") || !email.includes("."))
                      return false;
                    if (email.length > 254) return false;
                    const [localPart, domain] = email.split("@");
                    if (localPart.length > 64) return false;
                    const emailPattern =
                      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                    return emailPattern.test(email);
                  };
                  if (!validateEmail(savedValue)) {
                    // console.log("[CHECK] Email validation failed:", {
                    //     productId: props.shopifyProductID,
                    //     key: attrKey,
                    //     savedValue,
                    //     config,
                    // })
                    hasError = true;
                  }
                }
              }
              if (hasError) {
                setOrderFieldError(true);
                return;
              }
              const lines = [getLineItem()];
              const countryCode =
                localStorage.getItem("selectedCountryCode") || undefined;
              if (action === "Add to Cart") {
                // Add to cart
                const existingCartId = localStorage.getItem("shopX_cart_id"); // console.log("existingCartId", existingCartId)
                if (!existingCartId) {
                  const createResult =
                    await window.shopXtools?.handleCartMutation?.(
                      createCartMutation,
                      { lines, countryCode }
                    );
                  if (createResult?.cartCreate?.cart) {
                    localStorage.setItem(
                      "shopX_cart_id",
                      createResult.cartCreate.cart.id
                    );
                    localStorage.setItem(
                      "shopXtools.cart",
                      JSON.stringify(createResult.cartCreate.cart)
                    );
                    if (window.shopXtools) {
                      window.shopXtools.cart = createResult.cartCreate.cart;
                    } // Dispatch event after updating the cart
                    window.dispatchEvent(new Event("shopXtools-cart-update")); // Open cart if triggerCart is true
                    if (triggerCart) {
                      // Notify host site
                      window.shopXtools?.dispatchEvent?.("checkout__changed", {
                        __triggerCartModal: triggerCart,
                      }); // Notify Framer components listening on document
                      document.dispatchEvent(
                        new CustomEvent("checkout__changed", {
                          detail: { __triggerCartModal: triggerCart },
                        })
                      );
                    } // console.log(
                    //     "New cart created, triggering the cart: dispatching checkout__changed",
                    //     onClickAction?.triggerCart
                    // )
                  }
                } else {
                  const addResult =
                    await window.shopXtools?.handleCartMutation?.(
                      addToCartMutation,
                      { cartId: existingCartId, lines }
                    ); // console.log("addResult", addResult)
                  if (addResult?.cartLinesAdd?.cart) {
                    // console.log("addResult.cartLinesAdd.cart", addResult.cartLinesAdd.cart)
                    localStorage.setItem(
                      "shopXtools.cart",
                      JSON.stringify(addResult.cartLinesAdd.cart)
                    );
                    if (window.shopXtools) {
                      window.shopXtools.cart = addResult.cartLinesAdd.cart;
                    } // Dispatch event after updating the cart
                    window.dispatchEvent(new Event("shopXtools-cart-update")); // Google Analytics tracking
                    const currency =
                      purchaseActiveVariant?.price?.currencyCode || "USD";
                    const value = parseFloat(
                      (
                        parseFloat(
                          purchaseActiveVariant?.price?.amount || "0"
                        ) * 1
                      ).toFixed(2)
                    );
                    const item_id = purchaseActiveVariant?.id;
                    const item_name =
                      purchaseActiveVariant?.selectedOptions
                        ?.map((opt) => opt.value)
                        .join(" / ") || "";
                    const price = parseFloat(
                      purchaseActiveVariant?.price?.amount || "0"
                    );
                    const activeProduct = product; // Google Analytics tracking
                    if (typeof window.fcTrackGAEvent === "function") {
                      // console.log("Tracking Add to Cart - google:", {
                      //     currency,
                      //     value,
                      //     items: [{
                      //         item_id,
                      //         item_name,
                      //         price,
                      //         quantity: 1
                      //     }]
                      // });
                      window.fcTrackGAEvent("add_to_cart", {
                        currency,
                        value,
                        items: [{ item_id, item_name, price, quantity: 1 }],
                      });
                    } // Meta Pixel tracking
                    trackFacebookPixelAddToCart({
                      variant: purchaseActiveVariant,
                      product: activeProduct,
                      quantity: 1,
                      currency: currency,
                    }); // Open cart if triggerCart is true
                    if (action === "Add to Cart" && triggerCart) {
                      // Notify host site
                      window.shopXtools?.dispatchEvent?.("checkout__changed", {
                        __triggerCartModal: triggerCart,
                      }); // Notify Framer components listening on document
                      document.dispatchEvent(
                        new CustomEvent("checkout__changed", {
                          detail: { __triggerCartModal: triggerCart },
                        })
                      ); // console.log("Adding new item, triggering the cart: dispatching checkout__changed", triggerCart)
                    }
                    clearSessionStorage();
                    stripVariantFromUrl(); // console.log("sessionStorage cleared and url stripped after quick purchase")
                  }
                }
              } else {
                // Buy Now
                const buyResult = await window.shopXtools?.handleCartMutation?.(
                  createCartMutation,
                  { lines, countryCode }
                );
                if (buyResult?.cartCreate?.cart?.checkoutUrl) {
                  let checkoutUrl = buyResult.cartCreate.cart.checkoutUrl; // Analytics
                  const currency =
                    purchaseActiveVariant?.price?.currencyCode || "USD";
                  const value = parseFloat(
                    (
                      parseFloat(purchaseActiveVariant?.price?.amount || "0") *
                      1
                    ).toFixed(2)
                  );
                  const item_id = purchaseActiveVariant?.id;
                  const item_name =
                    purchaseActiveVariant?.selectedOptions
                      ?.map((opt) => opt.value)
                      .join(" / ") || "";
                  const price = parseFloat(
                    purchaseActiveVariant?.price?.amount || "0"
                  ); // Google Analytics tracking
                  if (typeof window.fcTrackGAEvent === "function") {
                    // console.log("Tracking Initiate Checkout (Buy now) - google:", {
                    //     currency,
                    //     value,
                    //     item_id,
                    //     item_name,
                    //     price,
                    //     quantity: 1
                    // });
                    window.fcTrackGAEvent("begin_checkout", {
                      currency,
                      value,
                      items: [{ item_id, item_name, price, quantity: 1 }],
                    });
                  } // Meta Pixel tracking
                  trackFacebookPixelInitiateCheckout({
                    variant: purchaseActiveVariant,
                    product: product,
                    quantity: 1,
                    currency: currency,
                    useBeacon: true,
                  }); // Add tracking and language params
                  checkoutUrl = appendAllTrackingParamsToUrl(checkoutUrl);
                  checkoutUrl = appendLanguageToUrl(checkoutUrl);
                  window.location.assign(checkoutUrl);
                }
              }
            } catch (error) {
              console.error("Error handling purchase:", error);
              window.dispatchEvent(
                new CustomEvent("errorChanged", {
                  detail: error.message || "Error processing your request",
                })
              );
            }
          };
          handlePurchase(); // Dispatch the event with the purchased variant to use it to remember the matching image for the variant after reset
          window.dispatchEvent(
            new CustomEvent("product__purchase__completed", {
              detail: {
                shopifyProductID,
                activeVariant: purchaseActiveVariant,
                optionName,
                value,
              },
            })
          ); //console.log("dispatching product__purchase__completed")
        }
      } // Compute current active variant from selections
      const activeVariant = getProductVariant(product, newSelectedOptions); // console.log("activeVariant", activeVariant)
      // Only dispatch active-variant updates for non-purchase actions
      // if (!__isPurchaseMode(action)) {
      //     if (activeVariant) {
      //         // For partial selections, override selectedOptions in the payload
      //         const partialSelectedArray = Object.entries(
      //             newSelectedOptions
      //         ).map(([name, value]) => ({ name, value }))
      //         const activeVariantEvent = new CustomEvent(
      //             "product__active-variant__changed",
      //             {
      //                 detail: {
      //                     ...(activeVariant || {}),
      //                     selectedOptions: allOptionsSelected
      //                         ? activeVariant?.selectedOptions || []
      //                         : partialSelectedArray,
      //                     productId: `gid://shopify/Product/${shopifyProductID}`,
      //                     isCompleteVariant: allOptionsSelected,
      //                     onClickAction: action,
      //                 },
      //             }
      //         )
      //         document.dispatchEvent(activeVariantEvent)
      //         console.log("activeVariantEvent in dispatchOptionSelectedEvent", activeVariantEvent.detail)
      //     }
      // }
      // Always dispatch event for visual sync when it is only one variant selector
      const syncEvent = new CustomEvent("variant__visual__sync", {
        detail: {
          productId: `gid://shopify/Product/${shopifyProductID}`,
          selectedOptions: newSelectedOptions,
          variantId: activeVariant?.id,
        },
      });
      document.dispatchEvent(syncEvent); // Handle session storage and URL updates based on productPage prop
      if (activeVariant) {
        if (productPage && allOptionsSelected) {
          // On product page: update URL with variant ID
          // console.log("updating Url With Variant", activeVariant)
          updateUrlWithVariant(activeVariant.id);
          saveVariantToSessionStorage(
            newSelectedOptions,
            activeVariant.id,
            !allOptionsSelected
          );
        } else {
          // On listing page: save to session storage
          saveVariantToSessionStorage(
            newSelectedOptions,
            activeVariant.id,
            !allOptionsSelected
          );
        } // BACK UP EVENT: Always dispatch product__active-variant__changed event
        // when we have a complete variant to allow all components receive it with a delay
        if (allOptionsSelected && !__isPurchaseMode(action)) {
          setTimeout(() => {
            const activeVariantEvent = new CustomEvent(
              "product__active-variant__changed",
              {
                detail: {
                  ...activeVariant,
                  productId: `gid://shopify/Product/${shopifyProductID}`,
                  isCompleteVariant: true,
                  isPurchaseAction: false,
                },
              }
            );
            document.dispatchEvent(activeVariantEvent); // console.log("activeVariantEvent in dispatchOptionSelectedEvent", activeVariantEvent.detail)
          }, 300);
        }
      }
    },
    [
      selectedOptions,
      product,
      shopifyProductID,
      autoSelectFirst,
      autoSelectRef.current,
      filterVariants?.variantGroups,
      productPage,
      updateUrlWithVariant,
      saveVariantToSessionStorage,
    ]
  ); // Reset options when purchase/checkout click is completed
  useEffect(() => {
    const handlePurchaseCompleted = (e) => {
      // console.log("handlePurchaseCompleted", e.detail)
      if (e.detail.shopifyProductID !== shopifyProductID) {
        return;
      }
      if (
        action === "Add to Cart" ||
        (action === "Buy Now" && filterVariants?.variantTitles?.length)
      ) {
        const activeVariant = e.detail.activeVariant; // isResettingRef.current = true
        const optionName = e.detail.optionName;
        const optionValue = e.detail.value;
        const optionToReset = { [optionName]: optionValue }; //console.log("optionToReset", optionToReset)
        const newOptions = (activeVariant?.selectedOptions || []).filter(
          (opt) => !(opt.name in optionToReset)
        ); //console.log("newOptions", newOptions)
        const rememberedOptions = {};
        for (const opt of newOptions) {
          rememberedOptions[opt.name] = opt.value;
        }
        setSelectedOptions(rememberedOptions); // isResettingRef.current = false
        // console.log(
        //     "options to remember in handlePurchaseCompleted",
        //     rememberedOptions
        // )
        //autoSelectRef.current = false;
        // Dispatch communication event after reset
        setTimeout(() => {
          if (activeVariant) {
            // Send the last complete variant to use it to remember the matching image for the variant after reset
            document.dispatchEvent(
              new CustomEvent("last_selected_variant", {
                detail: { activeVariant, shopifyProductID },
              })
            ); // console.log(
            //     "last_selected_variant dispatching",
            //     activeVariant
            // )
          }
          const communicationEvent = new CustomEvent(
            "__variant_option_selected",
            {
              detail: {
                productId: `gid://shopify/Product/${shopifyProductID}`,
                value: null,
                allSelectedOptions: rememberedOptions,
                allOptionsSelected: false,
                isPurchaseAction: true,
                autoSelectFirst: false,
              },
            }
          );
          window.dispatchEvent(communicationEvent); // console.log(
          //     "Dispatched reset communication event:",
          //     communicationEvent.detail
          // )
        }, 200);
      }
    };
    window.addEventListener(
      "product__purchase__completed",
      handlePurchaseCompleted
    );
    return () =>
      window.removeEventListener(
        "product__purchase__completed",
        handlePurchaseCompleted
      );
  }, [
    product,
    action,
    filterVariants?.variantTitles,
    shopifyProductID,
    selectedOptions,
  ]); // Add a new effect to listen for sync events between the two identical variant selectors
  useEffect(() => {
    if (isCanvas) return;
    const handleVisualSync = (e) => {
      // Only sync if it's for the same product, not from a currency change, and if variantGroups is "all", meaning there is only one variant selector
      if (
        e.detail.productId === `gid://shopify/Product/${shopifyProductID}` &&
        filterVariants?.variantGroups === "all"
      ) {
        // Only update when a valid selectedOptions payload is provided
        if (
          e.detail &&
          typeof e.detail.selectedOptions === "object" &&
          e.detail.selectedOptions !== null
        ) {
          setSelectedOptions(e.detail.selectedOptions);
        } //console.log("handleVisualSync", e.detail)
      }
    };
    document.addEventListener("variant__visual__sync", handleVisualSync);
    return () => {
      document.removeEventListener("variant__visual__sync", handleVisualSync);
    };
  }, [shopifyProductID, isCanvas]); //props.behaviorConfigs.action // Ref: Last purchased variant to use it after options reset for image mapping
  const eventVariantRef = useRef(null);
  const eventVariantFreshRef = useRef(false); // An effect to listen for the last purchased variant to use it after options reset for image mapping
  useEffect(() => {
    const handleVariant = (e) => {
      // console.log(
      //     "shopifyProductID, e.detail.shopifyProductID",
      //     shopifyProductID,
      //     e.detail.shopifyProductID
      // )
      if (shopifyProductID === e.detail.shopifyProductID) {
        //console.log("handleVariant", e.detail)
        eventVariantRef.current = e.detail.activeVariant;
        eventVariantFreshRef.current = true;
      }
    };
    document.addEventListener("last_selected_variant", handleVariant);
    return () => {
      document.removeEventListener("last_selected_variant", handleVariant);
    };
  }, [shopifyProductID]); // Consolidate all variant-to-image handling here
  useEffect(() => {
    // console.log("[Image mapping:] useEffect running", { activeVariant, selectedOptions });
    let variantToShow; // If the quick purchase was triggered, use the last purchased variant to show the matching image
    // or the active variant if it is simply a selection change
    if (eventVariantFreshRef.current && eventVariantRef.current) {
      variantToShow = eventVariantRef.current; // console.log(
      //     "Image mapping: eventVariantRef.current",
      //     eventVariantRef.current
      // )
      // console.log(
      //     "Image mapping: eventVariantFreshRef.current",
      //     eventVariantFreshRef.current
      // )
    } else {
      variantToShow = activeVariant; // console.log("Image mapping: activeVariant", activeVariant)
    } // console.log("Image mapping: variantToShow", variantToShow)
    if (variantToShow) {
      const variantId = variantToShow?.id.split("/").pop();
      if (props.variantImageIds) {
        const variantMapping = parseVariantImageIds(props.variantImageIds); // console.log("Image mapping: variantMapping", variantMapping)
        const matchingImageNumber = variantMapping.get(variantId); // console.log(
        //     "Image mapping: matchingImageNumber",
        //     matchingImageNumber
        // )
        // Only dispatch events if we have a matching image number
        if (matchingImageNumber) {
          // Use a single setTimeout to handle all events
          const timeoutId = setTimeout(() => {
            // Only dispatch variant__image__match if imageTrigger is not None
            if (images.imageTrigger !== "None") {
              const tapEvent = new CustomEvent("variant__image__match", {
                detail: {
                  imageNumber: parseInt(matchingImageNumber),
                  shopifyProductID: `gid://shopify/Product/${shopifyProductID}`,
                },
              });
              document.dispatchEvent(tapEvent); // console.log(
              //     "Image mapping: variant__image__match dispatching",
              //     tapEvent.detail
              // )
            } // Only handle Scroll Sections if that's the specific trigger type
            if (images.imageTrigger === "Scroll Sections") {
              // Prevent initial scroll trigger if auto-select first is enabled
              // and this is the first time we're triggering
              if (autoSelectFirst && !initialScrollPreventedRef.current) {
                initialScrollPreventedRef.current = true;
                return; // Skip the scroll trigger on first auto-select
              }
              const newHash = `#image-${matchingImageNumber}`;
              if (window.location.hash !== newHash) {
                history.replaceState(null, "", newHash);
                const element = document.getElementById(
                  `image-${matchingImageNumber}`
                );
                if (element) {
                  const headerOffset = images.offsetY || 0;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition =
                    elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
              }
            }
          }, 0); // Reset the event variant ref to null to allow the next quick purchase
          // to use the active variant and not the last purchased variant
          eventVariantFreshRef.current = false;
          eventVariantRef.current = null; // console.log("eventVariantFreshRef.current is false")
          // console.log("eventVariantRef.current is null")
          // Cleanup timeout on unmount or before next effect
          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [
    activeVariant,
    images.imageTrigger,
    images.offsetY,
    props.variantImageIds,
    selectedOptions,
  ]);
  let variantsTest = get(product, "variants.edges");
  useEffect(() => {
    const allCombinations = (get(product, "variants.edges") || []).map(
      ({ node: variant }) => ({
        id: variant.id,
        availableForSale: variant.availableForSale, // Adds key / value pairs for each variant (ie. "color": "Black" and "size": 'M').
        ...variant.selectedOptions.reduce(
          (accumulator, option) => ({
            ...accumulator,
            [option.name]: option.value,
          }),
          {}
        ),
      })
    ); //console.log("all Combinations", allCombinations)
    setCombinations(allCombinations);
  }, [product]); // An effect to listen for the communication event between the variant selectors (for the quick purchase functionality and else)
  useEffect(() => {
    const handleCommunication = (e) => {
      // console.log("handleCommunication e", e.detail)
      // Ignore cross-instance sync while initializing auto-select to prevent races
      if (isInitializingRef.current) return;
      const productGid = `gid://shopify/Product/${shopifyProductID}`;
      const incomingOptions = e.detail.allSelectedOptions;
      if (
        e.detail.productId === productGid &&
        filterVariants?.variantGroups !== "all" &&
        e.detail.instanceId !== instanceIdRef.current &&
        !e.detail.twoWayGallery
      ) {
        // Always process events for image updates, but control state changes based on purchase action
        const isPurchaseAction = e.detail.isPurchaseAction;
        const senderPriority = e.detail.senderPriority || 0;
        const currentPriority = getIncludedOptionNames()[0] || ""; // console.log("Priority check:", {
        //     senderPriority,
        //     currentPriority,
        //     incomingOptions,
        // })
        // If the sender is a higher-priority selector (e.g., Color), reset lower-priority options
        if (senderPriority === currentPriority) {
          // Keep only the options relevant to this selector and above
          // For example, if this is the Color selector, keep only Color
          const newSelection = {};
          const included = getIncludedOptionNames();
          included.forEach((title) => {
            if (incomingOptions[title]) {
              newSelection[title] = incomingOptions[title];
            }
          }); // Always update local state for image updates, even for purchase actions
          setSelectedOptions(newSelection); // console.log(
          //     "selectedOptions in handleCommunication (replaced)",
          //     newSelection
          // )
          return;
        } else {
          // If the event is for a lower-priority option (e.g., Size), merge it with the current selection.
          // Always update local state for image updates, even for purchase actions
          // setSelectedOptions((prev) => ({
          //     ...prev,
          //     ...incomingOptions,
          // }))
          // console.log(
          //     "selectedOptions in handleCommunication (merged)",
          //     { prev: selectedOptions, incoming: incomingOptions }
          // )
          // Get the merged options for variant matching (always process for image updates)
          const merged = { ...selectedOptions, ...incomingOptions };
          setSelectedOptions(merged);
          const matchingVariant = getProductVariant(product, merged); // console.log("matchingVariant", matchingVariant)
          // console.log("merged", merged)
          const allOptions = get(product, "options", []).map((opt) => opt.name);
          const allOptionsSelected = allOptions.every(
            (optName) => merged[optName]
          ); // console.log("allOptionsSelected", allOptionsSelected)
          if (allOptionsSelected && matchingVariant) {
            if (productPage && !isPurchaseAction) {
              // console.log("updating Url With Variant", matchingVariant)
              updateUrlWithVariant(matchingVariant.id);
            } // Always dispatch variant change event for image updates, even for purchase actions
            const activeVariantEvent = new CustomEvent(
              "product__active-variant__changed",
              {
                detail: {
                  ...matchingVariant,
                  productId: `gid://shopify/Product/${shopifyProductID}`,
                  isCompleteVariant: true,
                  isPurchaseAction: false,
                },
              }
            );
            document.dispatchEvent(activeVariantEvent); // console.log("active variant event sent", activeVariantEvent)
          }
        }
      } else if (e.detail.productId === productGid && e.detail.twoWayGallery) {
        // console.log("Handling gallery")
        const merged = { ...selectedOptions, ...incomingOptions };
        setSelectedOptions(merged);
        const matchingVariant = getProductVariant(product, merged); // console.log("matchingVariant", matchingVariant)
        // console.log("merged", merged)
        const allOptions = get(product, "options", []).map((opt) => opt.name);
        const allOptionsSelected = allOptions.every(
          (optName) => merged[optName]
        ); // console.log("allOptionsSelected", allOptionsSelected)
        if (allOptionsSelected && matchingVariant) {
          if (productPage) {
            // console.log("updating Url With Variant", matchingVariant)
            updateUrlWithVariant(matchingVariant.id);
          } // Always dispatch variant change event for image updates, even for purchase actions
          const activeVariantEvent = new CustomEvent(
            "product__active-variant__changed",
            {
              detail: {
                ...matchingVariant,
                productId: `gid://shopify/Product/${shopifyProductID}`,
                isCompleteVariant: true,
                isPurchaseAction: false,
              },
            }
          );
          document.dispatchEvent(activeVariantEvent); // console.log("active variant event sent", activeVariantEvent)
        }
      }
    };
    window.addEventListener("__variant_option_selected", handleCommunication);
    return () => {
      window.removeEventListener(
        "__variant_option_selected",
        handleCommunication
      );
    };
  }, [
    shopifyProductID,
    combinations,
    autoSelectFirst,
    action,
    product,
    selectedOptions,
    filterVariants?.variantTitles,
    productPage,
  ]);
  const renderVariantDropdown = (
    opt,
    filteredValues,
    isLast,
    valid,
    invalidMsg,
    props,
    dispatchOptionSelectedEvent,
    selectedOptions,
    combinations,
    index,
    totalCount
  ) => {
    return /*#__PURE__*/ _jsx(VariantDropdown, {
      opt: opt,
      filteredValues: filteredValues,
      isLast: isLast,
      valid: valid,
      invalidMsg: invalidMsg,
      props: props,
      dispatchOptionSelectedEvent: dispatchOptionSelectedEvent,
      selectedOptions: selectedOptions,
      combinations: combinations,
      index: index,
      totalCount: totalCount,
    });
  };
  const renderVariantButtons = (
    opt,
    filteredValues,
    isLast,
    valid,
    invalidMsg
  ) => {
    return /*#__PURE__*/ _jsxs(
      "div",
      {
        role: "radiogroup",
        "aria-label": `Select ${opt.name}`,
        "aria-required": !valid,
        "aria-invalid": !valid,
        children: [
          /*#__PURE__*/ _jsx("div", {
            style: {
              width: "100%",
              display:
                props.titleConfigs.visible || props.selectedConfigs.visible
                  ? "flex"
                  : "none",
              justifyContent:
                props.titleConfigs.font.textAlign === "center"
                  ? "center"
                  : props.titleConfigs.font.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
              marginBottom:
                get(props, "containerConfigs.gap2") !== undefined
                  ? get(props, "containerConfigs.gap2")
                  : get(props, "titleConfigs.gap"),
              overflow: "visible",
            },
            children: /*#__PURE__*/ _jsxs("div", {
              style: {
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                overflow: "visible",
              },
              children: [
                props.titleConfigs.visible &&
                  /*#__PURE__*/ _jsx("label", {
                    id: `variant-title-${opt.name}`,
                    htmlFor: `variant-${opt.name}`,
                    style: {
                      ...get(props, "titleConfigs.font"),
                      color: get(props, "titleConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      margin: 0,
                      cursor: "pointer",
                      textTransform: get(
                        props,
                        "titleConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: (
                      props.titleConfigs.display || "{{Option}}"
                    ).replace("{{Option}}", opt.name),
                  }),
                props.selectedConfigs.visible &&
                  selectedOptions[opt.name] &&
                  /*#__PURE__*/ _jsx("p", {
                    style: {
                      ...get(props, "selectedConfigs.font"),
                      color: get(props, "selectedConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      paddingLeft: props.titleConfigs.visible
                        ? `${props.selectedConfigs.gap}px`
                        : 0,
                      margin: 0,
                      textTransform: get(
                        props,
                        "selectedConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: selectedOptions[opt.name],
                  }),
                props.selectedConfigs.visible &&
                  props.selectedConfigs.emptyVisible &&
                  !selectedOptions[opt.name] &&
                  /*#__PURE__*/ _jsx("p", {
                    style: {
                      ...get(props, "selectedConfigs.font"),
                      color: get(props, "selectedConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      paddingLeft: props.titleConfigs.visible
                        ? `${props.selectedConfigs.gap}px`
                        : 0,
                      margin: 0,
                      textTransform: get(
                        props,
                        "selectedConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: (
                      props.selectedConfigs.emptyText ||
                      "Select {{Option Value}}"
                    ).replace("{{Option Value}}", opt.name),
                  }),
              ],
            }),
          }),
          /*#__PURE__*/ _jsxs("div", {
            style: {
              display: props.buttonConfigs.layout === "grid" ? "grid" : "flex",
              flexDirection:
                props.buttonConfigs.layout === "grid"
                  ? undefined
                  : props.buttonConfigs.direction === "horizontal"
                  ? "row"
                  : "column",
              flexWrap:
                props.buttonConfigs.layout === "grid"
                  ? undefined
                  : props.buttonConfigs.direction === "horizontal"
                  ? "wrap"
                  : "nowrap",
              gridTemplateColumns:
                props.buttonConfigs.layout === "grid"
                  ? props.buttonConfigs.columns === "auto"
                    ? (() => {
                        const maxCols = props.buttonConfigs.maxColumns || 4;
                        const gapX = props.buttonConfigs.gap || 8;
                        const minWidth = props.buttonConfigs.gridWidth || 100;
                        if (maxCols <= 1) return "1fr";
                        return `repeat(auto-fit, minmax(max(${minWidth}px, calc((100% - ${
                          maxCols - 1
                        } * ${gapX}px) / ${maxCols})), 1fr))`;
                      })()
                    : filteredValues.length <= 1
                    ? "1fr"
                    : `repeat(${props.buttonConfigs.columnCount || 3}, 1fr)`
                  : undefined,
              gap:
                props.buttonConfigs.layout === "grid"
                  ? `${props.buttonConfigs.gapY || 8}px ${
                      props.buttonConfigs.gap || 8
                    }px`
                  : `${props.buttonConfigs.gapY || 8}px ${
                      props.buttonConfigs.gap || 8
                    }px`,
              width: "100%",
              maxWidth: undefined,
              alignItems:
                props.buttonConfigs.layout === "grid"
                  ? undefined
                  : props.buttonConfigs.direction === "vertical" &&
                    props.buttonConfigs.width
                  ? "stretch"
                  : "flex-start",
            },
            children: [
              filteredValues.map((v, i) => {
                const isActive = selectedOptions[opt.name] === v; // console.log("isActive (button)", isActive, selectedOptions[opt.name], v)
                let isAvailableForSale;
                if (filterVariants?.variantGroups === "all") {
                  const filtered = Array.from(
                    Object.entries({ ...selectedOptions, [opt.name]: v })
                  );
                  isAvailableForSale = combinations.find(
                    (combination) =>
                      filtered.every(
                        ([key, value]) => combination[key] === value
                      ) && combination.availableForSale
                  ); // console.log("isAvailableForSale", isAvailableForSale)
                } else {
                  // Handle both update and purchase actions; honor all other current selections
                  const availableValues = Array.from(
                    new Set(
                      combinations
                        .filter((comb) => {
                          if (!comb.availableForSale) return false;
                          const otherSelected = Object.entries(
                            selectedOptions
                          ).filter(([key]) => key !== opt.name);
                          return otherSelected.every(
                            ([key, value]) => comb[key] === value
                          );
                        })
                        .map((comb) => comb[opt.name])
                        .filter(Boolean)
                    )
                  );
                  isAvailableForSale = availableValues.includes(v); // console.log("isAvailableForSale", isAvailableForSale)
                }
                const canSelect =
                  isAvailableForSale ||
                  (selectOutOfStock && !isAvailableForSale); //console.log("canSelect", canSelect)
                // Edge to edge styling - only apply when gap is 0
                const isLastItem = i === filteredValues.length - 1;
                const gap = Number(props.buttonConfigs.gap);
                const applyEdgeToEdge = gap === 0;
                const isHorizontal =
                  props.buttonConfigs.direction === "horizontal"; // Get borders without modification
                const borderUnselected = get(
                  props,
                  "buttonConfigs.unselected.border"
                );
                const borderSelected = get(
                  props,
                  "buttonConfigs.selected.border"
                );
                const borderDisabled = get(
                  props,
                  "buttonConfigs.outOfStock.border"
                );
                const borderHovered = get(
                  props,
                  "buttonConfigs.hovered.border"
                ); // Helper to get border style string for each config
                function getBorderStyle(borderConfig) {
                  if (!borderConfig) {
                    // console.log('getBorderStyle: borderConfig is undefined/null');
                    return undefined;
                  }
                  const {
                    borderWidth,
                    borderStyle,
                    borderColor,
                    isMixed,
                    toggleTitles,
                    top,
                    right,
                    bottom,
                    left,
                  } = borderConfig;
                  const isIndividual = toggleTitles === "Individual" || isMixed;
                  if (isIndividual) {
                    // Use only per-side keys for this state
                    return {
                      borderTop: `${top ?? 0}px ${borderStyle ?? "solid"} ${
                        borderColor ?? "#000"
                      }`,
                      borderRight: `${right ?? 0}px ${borderStyle ?? "solid"} ${
                        borderColor ?? "#000"
                      }`,
                      borderBottom: `${bottom ?? 0}px ${
                        borderStyle ?? "solid"
                      } ${borderColor ?? "#000"}`,
                      borderLeft: `${left ?? 0}px ${borderStyle ?? "solid"} ${
                        borderColor ?? "#000"
                      }`,
                    };
                  } else {
                    // All sides
                    const width = borderWidth?.all ?? borderWidth ?? 0;
                    return {
                      border: `${width}px ${borderStyle ?? "solid"} ${
                        borderColor ?? "#000"
                      }`,
                    };
                  }
                } // Calculate margin style for edge-to-edge effect
                const marginStyle = {};
                if (applyEdgeToEdge && !isLastItem) {
                  if (isHorizontal) {
                    // For horizontal layout, use negative right margin only
                    marginStyle.marginRight = "-1px";
                  } else {
                    // For vertical layout, use negative bottom margin
                    marginStyle.marginBottom = "-1px";
                  }
                }
                return /*#__PURE__*/ _jsx(
                  "div",
                  {
                    style: {
                      position: "relative",
                      width:
                        props.buttonConfigs.layout === "grid" ? "100%" : "auto",
                    },
                    className: "variant-button-container",
                    children: /*#__PURE__*/ _jsxs("button", {
                      role: "radio",
                      "aria-checked": isActive,
                      "aria-label": `${opt.name} ${v}`,
                      tabIndex: canSelect ? 0 : -1,
                      onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (canSelect) {
                            dispatchOptionSelectedEvent(opt.name, v);
                          }
                        } else if (e.key === "Home") {
                          e.preventDefault(); // Navigate to first available button in this radiogroup
                          const radiogroup = e.target.closest(
                            '[role="radiogroup"]'
                          );
                          const firstAvailable = radiogroup?.querySelector(
                            '[role="radio"]:not([aria-disabled="true"])'
                          );
                          if (firstAvailable) firstAvailable.focus();
                        } else if (e.key === "End") {
                          e.preventDefault(); // Navigate to last available button in this radiogroup
                          const radiogroup = e.target.closest(
                            '[role="radiogroup"]'
                          );
                          const availableButtons = radiogroup?.querySelectorAll(
                            '[role="radio"]:not([aria-disabled="true"])'
                          );
                          if (availableButtons?.length) {
                            availableButtons[
                              availableButtons.length - 1
                            ].focus();
                          }
                        } else if (
                          e.key === "ArrowRight" ||
                          (e.key === "ArrowDown" &&
                            props.buttonConfigs.direction === "vertical")
                        ) {
                          e.preventDefault(); // Find next available button, wrapping to beginning if needed
                          const radiogroup = e.target.closest(
                            '[role="radiogroup"]'
                          );
                          const availableButtons = Array.from(
                            radiogroup?.querySelectorAll(
                              '[role="radio"]:not([aria-disabled="true"])'
                            ) || []
                          );
                          const currentIndex = availableButtons.indexOf(
                            e.target
                          );
                          const nextIndex =
                            (currentIndex + 1) % availableButtons.length;
                          if (availableButtons[nextIndex]) {
                            availableButtons[nextIndex].focus();
                          }
                        } else if (
                          e.key === "ArrowLeft" ||
                          (e.key === "ArrowUp" &&
                            props.buttonConfigs.direction === "vertical")
                        ) {
                          e.preventDefault(); // Find previous available button, wrapping to end if needed
                          const radiogroup = e.target.closest(
                            '[role="radiogroup"]'
                          );
                          const availableButtons = Array.from(
                            radiogroup?.querySelectorAll(
                              '[role="radio"]:not([aria-disabled="true"])'
                            ) || []
                          );
                          const currentIndex = availableButtons.indexOf(
                            e.target
                          );
                          const prevIndex =
                            currentIndex === 0
                              ? availableButtons.length - 1
                              : currentIndex - 1;
                          if (availableButtons[prevIndex]) {
                            availableButtons[prevIndex].focus();
                          }
                        }
                      },
                      style: {
                        padding: get(props, "buttonConfigs.padding"),
                        width:
                          props.buttonConfigs.layout === "grid"
                            ? "100%"
                            : props.buttonConfigs.direction === "vertical" &&
                              props.buttonConfigs.width
                            ? "100%"
                            : "auto",
                        height:
                          get(props, "buttonConfigs.height") === "Fixed"
                            ? `${get(props, "buttonConfigs.fixedHeight")}px`
                            : "Fit",
                        ...marginStyle,
                        borderRadius: get(props, "buttonConfigs.radius"),
                        backgroundColor:
                          isActive && !isAvailableForSale
                            ? get(props, "buttonConfigs.selected.background")
                            : !isAvailableForSale
                            ? get(props, "buttonConfigs.outOfStock.background")
                            : isActive
                            ? get(props, "buttonConfigs.selected.background")
                            : get(props, "buttonConfigs.unselected.background"),
                        ...(isActive && !isAvailableForSale
                          ? getBorderStyle(borderSelected)
                          : !isAvailableForSale
                          ? getBorderStyle(borderDisabled)
                          : isActive
                          ? getBorderStyle(borderSelected)
                          : getBorderStyle(borderUnselected)),
                        color:
                          isActive && !isAvailableForSale
                            ? get(props, "buttonConfigs.selected.color")
                            : !isAvailableForSale
                            ? get(props, "buttonConfigs.outOfStock.color")
                            : isActive
                            ? get(props, "buttonConfigs.selected.color")
                            : get(props, "buttonConfigs.unselected.color"),
                        fontFamily:
                          isActive && !isAvailableForSale
                            ? get(
                                props,
                                "buttonConfigs.selected.font.fontFamily"
                              )
                            : !isAvailableForSale
                            ? get(
                                props,
                                "buttonConfigs.outOfStock.font.fontFamily"
                              )
                            : isActive
                            ? get(
                                props,
                                "buttonConfigs.selected.font.fontFamily"
                              )
                            : get(
                                props,
                                "buttonConfigs.unselected.font.fontFamily"
                              ),
                        fontSize:
                          isActive && !isAvailableForSale
                            ? get(props, "buttonConfigs.selected.font.fontSize")
                            : !isAvailableForSale
                            ? get(
                                props,
                                "buttonConfigs.outOfStock.font.fontSize"
                              )
                            : isActive
                            ? get(props, "buttonConfigs.selected.font.fontSize")
                            : get(
                                props,
                                "buttonConfigs.unselected.font.fontSize"
                              ),
                        fontWeight:
                          isActive && !isAvailableForSale
                            ? get(
                                props,
                                "buttonConfigs.selected.font.fontWeight"
                              )
                            : !isAvailableForSale
                            ? get(
                                props,
                                "buttonConfigs.outOfStock.font.fontWeight"
                              )
                            : isActive
                            ? get(
                                props,
                                "buttonConfigs.selected.font.fontWeight"
                              )
                            : get(
                                props,
                                "buttonConfigs.unselected.font.fontWeight"
                              ),
                        letterSpacing:
                          isActive && !isAvailableForSale
                            ? get(
                                props,
                                "buttonConfigs.selected.font.letterSpacing"
                              )
                            : !isAvailableForSale
                            ? get(
                                props,
                                "buttonConfigs.outOfStock.font.letterSpacing"
                              )
                            : isActive
                            ? get(
                                props,
                                "buttonConfigs.selected.font.letterSpacing"
                              )
                            : get(
                                props,
                                "buttonConfigs.unselected.font.letterSpacing"
                              ),
                        textTransform:
                          isActive && !isAvailableForSale
                            ? get(props, "buttonConfigs.selected.textTransform")
                            : !isAvailableForSale
                            ? get(
                                props,
                                "buttonConfigs.outOfStock.textTransform"
                              )
                            : isActive
                            ? get(props, "buttonConfigs.selected.textTransform")
                            : get(
                                props,
                                "buttonConfigs.unselected.textTransform"
                              ),
                        textAlign:
                          isActive && !isAvailableForSale
                            ? get(
                                props,
                                "buttonConfigs.selected.font.textAlign"
                              )
                            : !isAvailableForSale
                            ? get(
                                props,
                                "buttonConfigs.outOfStock.font.textAlign"
                              )
                            : isActive
                            ? get(
                                props,
                                "buttonConfigs.selected.font.textAlign"
                              )
                            : get(
                                props,
                                "buttonConfigs.unselected.font.textAlign"
                              ),
                        cursor: canSelect ? "pointer" : "not-allowed",
                        overflow: "hidden",
                        position: "relative",
                      },
                      onClick: canSelect
                        ? () => dispatchOptionSelectedEvent(opt.name, v)
                        : undefined,
                      onMouseEnter: (e) => {
                        if (canSelect) {
                          const button = e.currentTarget;
                          button.style.backgroundColor = get(
                            props,
                            "buttonConfigs.hovered.background"
                          );
                          const hoveredBorder = getBorderStyle(borderHovered);
                          if (hoveredBorder.border !== undefined) {
                            button.style.border = hoveredBorder.border;
                          } else {
                            button.style.borderTop = hoveredBorder.borderTop;
                            button.style.borderRight =
                              hoveredBorder.borderRight;
                            button.style.borderBottom =
                              hoveredBorder.borderBottom;
                            button.style.borderLeft = hoveredBorder.borderLeft;
                          }
                          button.style.color = get(
                            props,
                            "buttonConfigs.hovered.color"
                          );
                        }
                      },
                      onMouseLeave: (e) => {
                        const button = e.currentTarget; // Always clear all border styles before applying new ones
                        button.style.border = "";
                        button.style.borderTop = "";
                        button.style.borderRight = "";
                        button.style.borderBottom = "";
                        button.style.borderLeft = "";
                        if (isActive) {
                          button.style.backgroundColor = get(
                            props,
                            "buttonConfigs.selected.background"
                          );
                          const leaveBorder = getBorderStyle(borderSelected);
                          if (leaveBorder && leaveBorder.border !== undefined) {
                            button.style.border = leaveBorder.border ?? "";
                          } else if (leaveBorder) {
                            button.style.borderTop =
                              leaveBorder.borderTop ?? "";
                            button.style.borderRight =
                              leaveBorder.borderRight ?? "";
                            button.style.borderBottom =
                              leaveBorder.borderBottom ?? "";
                            button.style.borderLeft =
                              leaveBorder.borderLeft ?? "";
                          }
                          button.style.color = get(
                            props,
                            "buttonConfigs.selected.color"
                          );
                        } else if (!isAvailableForSale) {
                          button.style.backgroundColor = get(
                            props,
                            "buttonConfigs.outOfStock.background"
                          );
                          const leaveBorder = getBorderStyle(borderDisabled);
                          if (leaveBorder && leaveBorder.border !== undefined) {
                            button.style.border = leaveBorder.border ?? "";
                          } else if (leaveBorder) {
                            button.style.borderTop =
                              leaveBorder.borderTop ?? "";
                            button.style.borderRight =
                              leaveBorder.borderRight ?? "";
                            button.style.borderBottom =
                              leaveBorder.borderBottom ?? "";
                            button.style.borderLeft =
                              leaveBorder.borderLeft ?? "";
                          }
                          button.style.color = get(
                            props,
                            "buttonConfigs.outOfStock.color"
                          );
                        } else {
                          button.style.backgroundColor = get(
                            props,
                            "buttonConfigs.unselected.background"
                          );
                          const leaveBorder = getBorderStyle(borderUnselected);
                          if (leaveBorder && leaveBorder.border !== undefined) {
                            button.style.border = leaveBorder.border ?? "";
                          } else if (leaveBorder) {
                            button.style.borderTop =
                              leaveBorder.borderTop ?? "";
                            button.style.borderRight =
                              leaveBorder.borderRight ?? "";
                            button.style.borderBottom =
                              leaveBorder.borderBottom ?? "";
                            button.style.borderLeft =
                              leaveBorder.borderLeft ?? "";
                          }
                          button.style.color = get(
                            props,
                            "buttonConfigs.unselected.color"
                          );
                        }
                      },
                      children: [
                        /*#__PURE__*/ _jsxs("span", {
                          style: {
                            position: "relative",
                            display: "inline-block",
                          },
                          children: [
                            v,
                            isActive &&
                              !isAvailableForSale &&
                              get(
                                props,
                                "buttonConfigs.outOfStock.strike.line"
                              ) &&
                              get(
                                props,
                                "buttonConfigs.outOfStock.strike.size"
                              ) === "text" &&
                              /*#__PURE__*/ _jsx("span", {
                                style: {
                                  position: "absolute",
                                  top: "50%",
                                  left: "0%",
                                  width: "100%",
                                  height: "1px",
                                  backgroundColor: get(
                                    props,
                                    "buttonConfigs.outOfStock.strike.color"
                                  ),
                                  transform: `translateY(-50%)`,
                                  transformOrigin: "center",
                                  pointerEvents: !canSelect ? "none" : "auto",
                                },
                              }),
                            !isActive &&
                              !isAvailableForSale &&
                              get(
                                props,
                                "buttonConfigs.outOfStock.strike.line"
                              ) &&
                              get(
                                props,
                                "buttonConfigs.outOfStock.strike.size"
                              ) === "text" &&
                              /*#__PURE__*/ _jsx("span", {
                                style: {
                                  position: "absolute",
                                  top: "50%",
                                  left: "0%",
                                  width: "100%",
                                  height: "1px",
                                  backgroundColor: get(
                                    props,
                                    "buttonConfigs.outOfStock.strike.color"
                                  ),
                                  transform: `translateY(-50%)`,
                                  transformOrigin: "center",
                                  pointerEvents: "none",
                                },
                              }),
                          ],
                        }),
                        isActive &&
                          !isAvailableForSale &&
                          get(props, "buttonConfigs.outOfStock.strike.line") &&
                          get(props, "buttonConfigs.outOfStock.strike.size") ===
                            "container" &&
                          /*#__PURE__*/ _jsx("svg", {
                            style: {
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              pointerEvents: !canSelect ? "none" : "auto",
                            },
                            preserveAspectRatio: "none",
                            viewBox: "0 0 100 100",
                            children: /*#__PURE__*/ _jsx("line", {
                              x1:
                                get(
                                  props,
                                  "buttonConfigs.outOfStock.strike.direction"
                                ) === "horizontal"
                                  ? "0"
                                  : get(
                                      props,
                                      "buttonConfigs.outOfStock.strike.direction"
                                    ) === "diagonal-up"
                                  ? "0"
                                  : "0",
                              y1:
                                get(
                                  props,
                                  "buttonConfigs.outOfStock.strike.direction"
                                ) === "horizontal"
                                  ? "50"
                                  : get(
                                      props,
                                      "buttonConfigs.outOfStock.strike.direction"
                                    ) === "diagonal-up"
                                  ? "100"
                                  : "0",
                              x2:
                                get(
                                  props,
                                  "buttonConfigs.outOfStock.strike.direction"
                                ) === "horizontal"
                                  ? "100"
                                  : "100",
                              y2:
                                get(
                                  props,
                                  "buttonConfigs.outOfStock.strike.direction"
                                ) === "horizontal"
                                  ? "50"
                                  : get(
                                      props,
                                      "buttonConfigs.outOfStock.strike.direction"
                                    ) === "diagonal-up"
                                  ? "0"
                                  : "100",
                              stroke: get(
                                props,
                                "buttonConfigs.outOfStock.strike.color"
                              ),
                              strokeWidth: "1",
                              vectorEffect: "non-scaling-stroke",
                            }),
                          }),
                        !isActive &&
                          !isAvailableForSale &&
                          get(props, "buttonConfigs.outOfStock.strike.line") &&
                          get(props, "buttonConfigs.outOfStock.strike.size") ===
                            "container" &&
                          /*#__PURE__*/ _jsx("svg", {
                            style: {
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              pointerEvents: "none",
                            },
                            preserveAspectRatio: "none",
                            viewBox: "0 0 100 100",
                            children: /*#__PURE__*/ _jsx("line", {
                              x1:
                                get(
                                  props,
                                  "buttonConfigs.outOfStock.strike.direction"
                                ) === "horizontal"
                                  ? "0"
                                  : get(
                                      props,
                                      "buttonConfigs.outOfStock.strike.direction"
                                    ) === "diagonal-up"
                                  ? "0"
                                  : "0",
                              y1:
                                get(
                                  props,
                                  "buttonConfigs.outOfStock.strike.direction"
                                ) === "horizontal"
                                  ? "50"
                                  : get(
                                      props,
                                      "buttonConfigs.outOfStock.strike.direction"
                                    ) === "diagonal-up"
                                  ? "100"
                                  : "0",
                              x2:
                                get(
                                  props,
                                  "buttonConfigs.outOfStock.strike.direction"
                                ) === "horizontal"
                                  ? "100"
                                  : "100",
                              y2:
                                get(
                                  props,
                                  "buttonConfigs.outOfStock.strike.direction"
                                ) === "horizontal"
                                  ? "50"
                                  : get(
                                      props,
                                      "buttonConfigs.outOfStock.strike.direction"
                                    ) === "diagonal-up"
                                  ? "0"
                                  : "100",
                              stroke: get(
                                props,
                                "buttonConfigs.outOfStock.strike.color"
                              ),
                              strokeWidth: "1",
                              vectorEffect: "non-scaling-stroke",
                            }),
                          }),
                      ],
                    }),
                  },
                  v
                );
              }),
              !valid &&
                /*#__PURE__*/ _jsx("div", {
                  role: "alert",
                  style: {
                    color: "#FF0000",
                    fontSize: "14px",
                    paddingTop: "8px",
                  },
                  children: `"${opt.name}" missing`,
                }),
            ],
          }),
        ],
      },
      opt.name
    );
  }; // Render color swatches for color variants
  // This creates circular color swatches for the Color/Colour options
  // It will map color names to hex codes using the window.__FcCheckoutConfigs.colors array
  // or fall back to a set of common color codes
  const renderColorSwatches = (
    opt,
    filteredValues,
    isLast,
    valid,
    invalidMsg
  ) => {
    // Check if this option should use color swatches by comparing with colorTitles
    const isSwatchOption = colorTitles.some(
      (title) => title.toLowerCase().trim() === opt.name.toLowerCase().trim()
    ); // If this isn't a swatch-enabled option or swatches are disabled, use appropriate renderer
    if (!isSwatchOption || !props.swatches?.colorEnabled) {
      // Use dropdown or buttons
      if (style === "Dropdown") {
        return renderVariantDropdown(
          opt,
          filteredValues,
          isLast,
          valid,
          invalidMsg,
          props,
          dispatchOptionSelectedEvent,
          selectedOptions,
          combinations,
          get(product, "options")?.findIndex((o) => o.name === opt.name) || 0,
          get(product, "options")?.length || 0
        );
      } else {
        return renderVariantButtons(
          opt,
          filteredValues,
          isLast,
          valid,
          invalidMsg
        );
      }
    }
    const { swatches } = props;
    return /*#__PURE__*/ _jsxs(
      "div",
      {
        role: "radiogroup",
        "aria-label": `Select ${opt.name}`,
        "aria-required": !valid,
        "aria-invalid": !valid,
        children: [
          /*#__PURE__*/ _jsx("div", {
            style: {
              width: "100%",
              display:
                props.titleConfigs.visible || props.selectedConfigs.visible
                  ? "flex"
                  : "none",
              justifyContent:
                props.titleConfigs.font.textAlign === "center"
                  ? "center"
                  : props.titleConfigs.font.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
              marginBottom:
                get(props, "containerConfigs.gap2") !== undefined
                  ? get(props, "containerConfigs.gap2")
                  : get(props, "titleConfigs.gap"),
              overflow: "visible",
            },
            children: /*#__PURE__*/ _jsxs("div", {
              style: {
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                overflow: "visible",
              },
              children: [
                props.titleConfigs.visible &&
                  /*#__PURE__*/ _jsx("label", {
                    id: `variant-title-${opt.name}`,
                    htmlFor: `variant-${opt.name}`,
                    style: {
                      ...get(props, "titleConfigs.font"),
                      color: get(props, "titleConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      margin: 0,
                      cursor: "pointer",
                      textTransform: get(
                        props,
                        "titleConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: (
                      props.titleConfigs.display || "{{Option}}"
                    ).replace("{{Option}}", opt.name),
                  }),
                props.selectedConfigs.visible &&
                  selectedOptions[opt.name] &&
                  /*#__PURE__*/ _jsx("p", {
                    style: {
                      ...get(props, "selectedConfigs.font"),
                      color: get(props, "selectedConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      paddingLeft: props.titleConfigs.visible
                        ? `${props.selectedConfigs.gap}px`
                        : 0,
                      margin: 0,
                      textTransform: get(
                        props,
                        "selectedConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: selectedOptions[opt.name],
                  }),
                props.selectedConfigs.visible &&
                  props.selectedConfigs.emptyVisible &&
                  !selectedOptions[opt.name] &&
                  /*#__PURE__*/ _jsx("p", {
                    style: {
                      ...get(props, "selectedConfigs.font"),
                      color: get(props, "selectedConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      paddingLeft: props.titleConfigs.visible
                        ? `${props.selectedConfigs.gap}px`
                        : 0,
                      margin: 0,
                      textTransform: get(
                        props,
                        "selectedConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: (
                      props.selectedConfigs.emptyText ||
                      "Select {{Option Value}}"
                    ).replace("{{Option Value}}", opt.name),
                  }),
              ],
            }),
          }),
          /*#__PURE__*/ _jsxs("div", {
            style: {
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: swatches.gap,
              width: "100%",
            },
            children: [
              filteredValues.map((v, i) => {
                const isActive = selectedOptions[opt.name] === v; //console.log("isActive", isActive, selectedOptions[opt.name], v)
                let isAvailableForSale;
                if (filterVariants?.variantGroups === "all") {
                  const filtered = Array.from(
                    Object.entries({ ...selectedOptions, [opt.name]: v })
                  );
                  isAvailableForSale = combinations.find(
                    (combination) =>
                      filtered.every(
                        ([key, value]) => combination[key] === value
                      ) && combination.availableForSale
                  );
                } else {
                  const availableValues = Array.from(
                    new Set(
                      combinations
                        .filter(
                          (
                            comb // Only filter by other selected options, not the current one
                          ) =>
                            comb.availableForSale && // Only include available variants!
                            Object.entries(selectedOptions)
                              .filter(([key]) => key !== opt.name)
                              .every(([key, value]) => comb[key] === value)
                        )
                        .map((comb) => comb[opt.name])
                        .filter(Boolean)
                    )
                  );
                  isAvailableForSale = availableValues.includes(v);
                }
                const canSelect =
                  isAvailableForSale ||
                  (selectOutOfStock && !isAvailableForSale); //console.log("canSelect", canSelect)
                // Get the hex color for this color name
                const colorName = v.toLowerCase();
                const hexColor = colorHexMap.get(colorName) || "#CCCCCC"; // Get the current state's border style
                const getStateBorder = () => {
                  if (isActive && !isAvailableForSale) {
                    return swatches.selected.border;
                  }
                  if (!isAvailableForSale) {
                    return swatches.outOfStock.border;
                  }
                  if (isActive) {
                    return swatches.selected.border;
                  }
                  return swatches.unselected.border;
                };
                const getStateBackground = () => {
                  if (isActive && !isAvailableForSale) {
                    return swatches.selected.background;
                  }
                  if (!isAvailableForSale) {
                    return swatches.outOfStock.background;
                  }
                  if (isActive) {
                    return swatches.selected.background;
                  }
                  return swatches.unselected.background;
                };
                const border = getStateBorder();
                const background = getStateBackground();
                return /*#__PURE__*/ _jsxs(
                  "div",
                  {
                    className: "variant-swatch-container",
                    style: { position: "relative" },
                    children: [
                      /*#__PURE__*/ _jsx("button", {
                        role: "radio",
                        "aria-checked": isActive,
                        "aria-label": `${opt.name} ${v}${
                          !isAvailableForSale ? " (Out of Stock)" : ""
                        }`,
                        title: v,
                        disabled: !isAvailableForSale && !selectOutOfStock,
                        onClick: () => {
                          if (isAvailableForSale || selectOutOfStock) {
                            dispatchOptionSelectedEvent(opt.name, v);
                          }
                        },
                        tabIndex:
                          isAvailableForSale || selectOutOfStock ? 0 : -1,
                        onKeyDown: (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (canSelect) {
                              dispatchOptionSelectedEvent(opt.name, v);
                            }
                          } else if (e.key === "Home") {
                            e.preventDefault();
                            const radiogroup = e.target.closest(
                              '[role="radiogroup"]'
                            );
                            const firstAvailable = radiogroup?.querySelector(
                              '[role="radio"]:not([disabled])'
                            );
                            if (firstAvailable) firstAvailable.focus();
                          } else if (e.key === "End") {
                            e.preventDefault();
                            const radiogroup = e.target.closest(
                              '[role="radiogroup"]'
                            );
                            const availableButtons =
                              radiogroup?.querySelectorAll(
                                '[role="radio"]:not([disabled])'
                              );
                            if (availableButtons?.length) {
                              availableButtons[
                                availableButtons.length - 1
                              ].focus();
                            }
                          } else if (
                            e.key === "ArrowRight" ||
                            e.key === "ArrowDown"
                          ) {
                            e.preventDefault();
                            const radiogroup = e.target.closest(
                              '[role="radiogroup"]'
                            );
                            const availableButtons = Array.from(
                              radiogroup?.querySelectorAll(
                                '[role="radio"]:not([disabled])'
                              ) || []
                            );
                            const currentIndex = availableButtons.indexOf(
                              e.target
                            );
                            const nextIndex =
                              (currentIndex + 1) % availableButtons.length;
                            if (availableButtons[nextIndex]) {
                              availableButtons[nextIndex].focus();
                            }
                          } else if (
                            e.key === "ArrowLeft" ||
                            e.key === "ArrowUp"
                          ) {
                            e.preventDefault();
                            const radiogroup = e.target.closest(
                              '[role="radiogroup"]'
                            );
                            const availableButtons = Array.from(
                              radiogroup?.querySelectorAll(
                                '[role="radio"]:not([disabled])'
                              ) || []
                            );
                            const currentIndex = availableButtons.indexOf(
                              e.target
                            );
                            const prevIndex =
                              currentIndex === 0
                                ? availableButtons.length - 1
                                : currentIndex - 1;
                            if (availableButtons[prevIndex]) {
                              availableButtons[prevIndex].focus();
                            }
                          }
                        },
                        onMouseEnter: (e) => {
                          if (canSelect) {
                            const button = e.currentTarget;
                            const { borderWidth, borderStyle } =
                              swatches.hovered.border;
                            button.style.border = `${borderWidth}px ${borderStyle} ${swatches.hovered.border.borderColor}`;
                            button.style.background =
                              swatches.hovered.background;
                          }
                        },
                        onMouseLeave: (e) => {
                          const button = e.currentTarget;
                          const border = getStateBorder();
                          const background = getStateBackground();
                          button.style.border = `${border.borderWidth}px ${border.borderStyle} ${border.borderColor}`;
                          button.style.background = background;
                        },
                        style: {
                          width: swatches.width,
                          height: swatches.height,
                          borderRadius: swatches.radius,
                          border: `${border.borderWidth}px ${border.borderStyle} ${border.borderColor}`,
                          padding: swatches.padding,
                          cursor:
                            isAvailableForSale || selectOutOfStock
                              ? "pointer"
                              : "not-allowed",
                          background: background,
                          position: "relative",
                        },
                        children: /*#__PURE__*/ _jsxs("div", {
                          style: {
                            width: "100%",
                            height: "100%",
                            borderRadius: swatches.radius,
                            backgroundColor: hexColor,
                            opacity: !isAvailableForSale
                              ? swatches.outOfStock.opacity
                              : 1,
                            position: "relative",
                            overflow: "hidden",
                          },
                          children: [
                            isActive &&
                              !isAvailableForSale &&
                              get(props, "swatches.outOfStock.strike.line") &&
                              /*#__PURE__*/ _jsx("svg", {
                                style: {
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  pointerEvents: !canSelect ? "none" : "auto",
                                },
                                viewBox: "0 0 100 100",
                                preserveAspectRatio: "none",
                                children: /*#__PURE__*/ _jsx("line", {
                                  x1:
                                    get(
                                      props,
                                      "swatches.outOfStock.strike.direction"
                                    ) === "horizontal"
                                      ? 0
                                      : get(
                                          props,
                                          "swatches.outOfStock.strike.direction"
                                        ) === "diagonal-up"
                                      ? 0
                                      : 0,
                                  y1:
                                    get(
                                      props,
                                      "swatches.outOfStock.strike.direction"
                                    ) === "horizontal"
                                      ? 50
                                      : get(
                                          props,
                                          "swatches.outOfStock.strike.direction"
                                        ) === "diagonal-up"
                                      ? 100
                                      : 0,
                                  x2: 100,
                                  y2:
                                    get(
                                      props,
                                      "swatches.outOfStock.strike.direction"
                                    ) === "horizontal"
                                      ? 50
                                      : get(
                                          props,
                                          "swatches.outOfStock.strike.direction"
                                        ) === "diagonal-up"
                                      ? 0
                                      : get(
                                          props,
                                          "swatches.outOfStock.strike.direction"
                                        ) === "diagonal-down"
                                      ? 100
                                      : 100,
                                  stroke: get(
                                    props,
                                    "swatches.outOfStock.strike.color"
                                  ),
                                  strokeWidth: "1",
                                  vectorEffect: "non-scaling-stroke",
                                }),
                              }),
                            !isActive &&
                              !isAvailableForSale &&
                              get(props, "swatches.outOfStock.strike.line") &&
                              /*#__PURE__*/ _jsx("svg", {
                                style: {
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  pointerEvents: "none",
                                },
                                viewBox: "0 0 100 100",
                                preserveAspectRatio: "none",
                                children: /*#__PURE__*/ _jsx("line", {
                                  x1:
                                    get(
                                      props,
                                      "swatches.outOfStock.strike.direction"
                                    ) === "horizontal"
                                      ? 0
                                      : get(
                                          props,
                                          "swatches.outOfStock.strike.direction"
                                        ) === "diagonal-up"
                                      ? 0
                                      : 0,
                                  y1:
                                    get(
                                      props,
                                      "swatches.outOfStock.strike.direction"
                                    ) === "horizontal"
                                      ? 50
                                      : get(
                                          props,
                                          "swatches.outOfStock.strike.direction"
                                        ) === "diagonal-up"
                                      ? 100
                                      : 0,
                                  x2: 100,
                                  y2:
                                    get(
                                      props,
                                      "swatches.outOfStock.strike.direction"
                                    ) === "horizontal"
                                      ? 50
                                      : get(
                                          props,
                                          "swatches.outOfStock.strike.direction"
                                        ) === "diagonal-up"
                                      ? 0
                                      : get(
                                          props,
                                          "swatches.outOfStock.strike.direction"
                                        ) === "diagonal-down"
                                      ? 100
                                      : 100,
                                  stroke: get(
                                    props,
                                    "swatches.outOfStock.strike.color"
                                  ),
                                  strokeWidth: "1",
                                  vectorEffect: "non-scaling-stroke",
                                }),
                              }),
                          ],
                        }),
                      }),
                      /*#__PURE__*/ _jsx("div", {
                        className: "swatch-tooltip",
                        style: {
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          color: "#FFFFFF",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          marginTop: "4px",
                          whiteSpace: "nowrap",
                          opacity: 0,
                          visibility: "hidden",
                          transition:
                            "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
                          zIndex: 10,
                        },
                        children: v,
                      }),
                    ],
                  },
                  v
                );
              }),
              !valid &&
                /*#__PURE__*/ _jsx("div", {
                  role: "alert",
                  style: {
                    color: "#FF0000",
                    fontSize: "14px",
                    paddingTop: "8px",
                  },
                  children: `"${opt.name}" missing`,
                }),
            ],
          }),
        ],
      },
      opt.name
    );
  }; // Render image swatches for image variants
  const renderImageSwatches = (
    opt,
    filteredValues,
    isLast,
    valid,
    invalidMsg
  ) => {
    // Get image titles from props
    const variantImageTitles = props.imageTitles || ["Pattern"]; // If this isn't a swatch-enabled option or swatches are disabled, use regular buttons
    const isSwatchOption = variantImageTitles.some(
      (title) => title.toLowerCase().trim() === opt.name.toLowerCase().trim()
    );
    if (!isSwatchOption || !props.imageSwatches?.image) {
      return renderVariantButtons(
        opt,
        filteredValues,
        isLast,
        valid,
        invalidMsg
      );
    } // Get the appropriate style config based on whether we're inheriting or customizing
    const useCustomStyles = props.imageSwatches.imageStyles === "customize";
    const swatchConfig = {
      gap: useCustomStyles
        ? props.imageSwatches.imageGap
        : props.swatches?.gap ?? 8,
      height: useCustomStyles
        ? props.imageSwatches.imageHeight
        : props.swatches?.height ?? 40,
      width: useCustomStyles
        ? props.imageSwatches.imageWidth
        : props.swatches?.width ?? 40,
      radius: useCustomStyles
        ? props.imageSwatches.imageRadius
        : props.swatches?.radius ?? "50%",
      padding: useCustomStyles
        ? props.imageSwatches.imagePadding
        : props.swatches?.padding ?? 2,
      unselected: useCustomStyles
        ? props.imageSwatches.imageUnselected
        : props.swatches?.unselected ?? {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#FFFFFF",
            },
            background: "#FFFFFF00",
          },
      hovered: useCustomStyles
        ? props.imageSwatches.imageHovered
        : props.swatches?.hovered ?? {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#CCCCCC",
            },
            background: "#FFFFFF00",
          },
      selected: useCustomStyles
        ? props.imageSwatches.imageSelected
        : props.swatches?.selected ?? {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#000000",
            },
            background: "#FFFFFF00",
          },
      outOfStock: useCustomStyles
        ? props.imageSwatches.imageOutOfStock
        : props.swatches?.outOfStock ?? {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#FFFFFF",
            },
            opacity: 0.5,
            background: "#FFFFFF00",
            strike: {
              line: false,
              color: "rgba(0, 0, 0, 0.16)",
              direction: "diagonal-down",
            },
          },
    };
    return /*#__PURE__*/ _jsxs(
      "div",
      {
        role: "radiogroup",
        "aria-label": `Select ${opt.name}`,
        "aria-required": !valid,
        "aria-invalid": !valid,
        children: [
          /*#__PURE__*/ _jsx("div", {
            style: {
              width: "100%",
              display:
                props.titleConfigs.visible || props.selectedConfigs.visible
                  ? "flex"
                  : "none",
              justifyContent:
                props.titleConfigs.font.textAlign === "center"
                  ? "center"
                  : props.titleConfigs.font.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
              marginBottom:
                get(props, "containerConfigs.gap2") !== undefined
                  ? get(props, "containerConfigs.gap2")
                  : get(props, "titleConfigs.gap"),
              overflow: "visible",
            },
            children: /*#__PURE__*/ _jsxs("div", {
              style: {
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                overflow: "visible",
              },
              children: [
                props.titleConfigs.visible &&
                  /*#__PURE__*/ _jsx("label", {
                    id: `variant-title-${opt.name}`,
                    htmlFor: `variant-${opt.name}`,
                    style: {
                      ...get(props, "titleConfigs.font"),
                      color: get(props, "titleConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      margin: 0,
                      cursor: "pointer",
                      textTransform: get(
                        props,
                        "titleConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: (
                      props.titleConfigs.display || "{{Option}}"
                    ).replace("{{Option}}", opt.name),
                  }),
                props.selectedConfigs.visible &&
                  selectedOptions[opt.name] &&
                  /*#__PURE__*/ _jsx("p", {
                    style: {
                      ...get(props, "selectedConfigs.font"),
                      color: get(props, "selectedConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      paddingLeft: props.titleConfigs.visible
                        ? `${props.selectedConfigs.gap}px`
                        : 0,
                      margin: 0,
                      textTransform: get(
                        props,
                        "selectedConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: selectedOptions[opt.name],
                  }),
                props.selectedConfigs.visible &&
                  props.selectedConfigs.emptyVisible &&
                  !selectedOptions[opt.name] &&
                  /*#__PURE__*/ _jsx("p", {
                    style: {
                      ...get(props, "selectedConfigs.font"),
                      color: get(props, "selectedConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      paddingLeft: props.titleConfigs.visible
                        ? `${props.selectedConfigs.gap}px`
                        : 0,
                      margin: 0,
                      textTransform: get(
                        props,
                        "selectedConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: (
                      props.selectedConfigs.emptyText ||
                      "Select {{Option Value}}"
                    ).replace("{{Option Value}}", opt.name),
                  }),
              ],
            }),
          }),
          /*#__PURE__*/ _jsxs("div", {
            style: {
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: swatchConfig.gap,
              width: "100%",
            },
            children: [
              filteredValues.map((v, i) => {
                const isActive = selectedOptions[opt.name] === v;
                const filtered = Array.from(
                  Object.entries({ ...selectedOptions, [opt.name]: v })
                );
                const isAvailableForSale = combinations.find(
                  (combination) =>
                    filtered.every(
                      ([key, value]) => combination[key] === value
                    ) && combination.availableForSale
                );
                const canSelect =
                  isAvailableForSale ||
                  (selectOutOfStock && !isAvailableForSale); // Get the image URL for this variant name from swatch store
                const imageValue = swatchImages.find(
                  (img) => img.name.toLowerCase() === v.toLowerCase()
                );
                const imageUrl = imageValue?.url || ""; // Get the current state's border style
                const getStateBorder = () => {
                  if (isActive && !isAvailableForSale) {
                    return swatchConfig.selected.border;
                  }
                  if (!isAvailableForSale) {
                    return swatchConfig.outOfStock.border;
                  }
                  if (isActive) {
                    return swatchConfig.selected.border;
                  }
                  return swatchConfig.unselected.border;
                };
                const getStateBackground = () => {
                  if (isActive && !isAvailableForSale) {
                    return swatchConfig.selected.background;
                  }
                  if (!isAvailableForSale) {
                    return swatchConfig.outOfStock.background;
                  }
                  if (isActive) {
                    return swatchConfig.selected.background;
                  }
                  return swatchConfig.unselected.background;
                };
                const border = getStateBorder();
                const background = getStateBackground();
                return /*#__PURE__*/ _jsxs(
                  "div",
                  {
                    className: "variant-swatch-container",
                    style: { position: "relative" },
                    children: [
                      /*#__PURE__*/ _jsx("button", {
                        role: "radio",
                        "aria-checked": isActive,
                        "aria-label": `${opt.name} ${v}${
                          !isAvailableForSale ? " (Out of Stock)" : ""
                        }`,
                        title: v,
                        disabled: !isAvailableForSale && !selectOutOfStock,
                        onClick: () => {
                          if (isAvailableForSale || selectOutOfStock) {
                            dispatchOptionSelectedEvent(opt.name, v);
                          }
                        },
                        tabIndex:
                          isAvailableForSale || selectOutOfStock ? 0 : -1,
                        onMouseEnter: (e) => {
                          if (isAvailableForSale || selectOutOfStock) {
                            const button = e.currentTarget;
                            const { borderWidth, borderStyle } =
                              swatchConfig.hovered.border;
                            button.style.border = `${borderWidth}px ${borderStyle} ${swatchConfig.hovered.border.borderColor}`;
                            button.style.background =
                              swatchConfig.hovered.background;
                          }
                        },
                        onMouseLeave: (e) => {
                          const button = e.currentTarget;
                          const border = getStateBorder();
                          const background = getStateBackground();
                          button.style.border = `${border.borderWidth}px ${border.borderStyle} ${border.borderColor}`;
                          button.style.background = background;
                        },
                        style: {
                          width: swatchConfig.width,
                          height: swatchConfig.height,
                          borderRadius: swatchConfig.radius,
                          border: `${border.borderWidth}px ${border.borderStyle} ${border.borderColor}`,
                          padding: swatchConfig.padding,
                          cursor:
                            isAvailableForSale || selectOutOfStock
                              ? "pointer"
                              : "not-allowed",
                          background: background,
                          position: "relative",
                        },
                        children: /*#__PURE__*/ _jsxs("div", {
                          style: {
                            width: "100%",
                            height: "100%",
                            borderRadius: swatchConfig.radius,
                            backgroundImage: `url(${imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: !isAvailableForSale
                              ? swatchConfig.outOfStock.opacity
                              : 1,
                            position: "relative",
                            overflow: "hidden",
                          },
                          children: [
                            !isActive &&
                              !isAvailableForSale &&
                              swatchConfig.outOfStock.strike?.line &&
                              /*#__PURE__*/ _jsx("svg", {
                                style: {
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  pointerEvents: "none",
                                },
                                viewBox: "0 0 100 100",
                                preserveAspectRatio: "none",
                                children: /*#__PURE__*/ _jsx("line", {
                                  x1:
                                    swatchConfig.outOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 0
                                      : swatchConfig.outOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 0
                                      : 0,
                                  y1:
                                    swatchConfig.outOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 50
                                      : swatchConfig.outOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 100
                                      : 0,
                                  x2: 100,
                                  y2:
                                    swatchConfig.outOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 50
                                      : swatchConfig.outOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 0
                                      : 100,
                                  stroke: swatchConfig.outOfStock.strike?.color,
                                  strokeWidth: "1",
                                  vectorEffect: "non-scaling-stroke",
                                }),
                              }),
                            isActive &&
                              !isAvailableForSale &&
                              swatchConfig.outOfStock.strike?.line &&
                              /*#__PURE__*/ _jsx("svg", {
                                style: {
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  pointerEvents: !canSelect ? "none" : "auto",
                                },
                                viewBox: "0 0 100 100",
                                preserveAspectRatio: "none",
                                children: /*#__PURE__*/ _jsx("line", {
                                  x1:
                                    swatchConfig.outOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 0
                                      : swatchConfig.outOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 0
                                      : 0,
                                  y1:
                                    swatchConfig.outOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 50
                                      : swatchConfig.outOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 100
                                      : 0,
                                  x2: 100,
                                  y2:
                                    swatchConfig.outOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 50
                                      : swatchConfig.outOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 0
                                      : 100,
                                  stroke: swatchConfig.outOfStock.strike?.color,
                                  strokeWidth: "1",
                                  vectorEffect: "non-scaling-stroke",
                                }),
                              }),
                          ],
                        }),
                      }),
                      /*#__PURE__*/ _jsx("div", {
                        className: "swatch-tooltip",
                        style: {
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          color: "#FFFFFF",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          marginTop: "4px",
                          whiteSpace: "nowrap",
                          opacity: 0,
                          visibility: "hidden",
                          transition:
                            "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
                          zIndex: 10,
                        },
                        children: v,
                      }),
                    ],
                  },
                  v
                );
              }),
              !valid &&
                /*#__PURE__*/ _jsx("div", {
                  role: "alert",
                  style: {
                    color: "#FF0000",
                    fontSize: "14px",
                    paddingTop: "8px",
                  },
                  children: `"${opt.name}" missing`,
                }),
            ],
          }),
        ],
      },
      opt.name
    );
  };
  const renderVariantImages = (
    opt,
    filteredValues,
    isLast,
    valid,
    invalidMsg
  ) => {
    // Use props.variantImageTitles to determine when to show the Variant Images UI
    const variantImageTitles = props.variantImageTitles || ["Amount"]; // If this isn't a swatch-enabled option or swatches are disabled, use regular buttons
    const isSwatchOption = variantImageTitles.some(
      (title) => title.toLowerCase().trim() === opt.name.toLowerCase().trim()
    ); // console.log("isSwatchOption for", opt.name, ":", isSwatchOption, props.variantImages?.image)
    if (!isSwatchOption || !props.variantImages?.image) {
      return renderVariantButtons(
        opt,
        filteredValues,
        isLast,
        valid,
        invalidMsg
      );
    } // Parse variantImageIds mapping if present
    let variantImageIdMap = new Map();
    if (props.variantImageIds) {
      // Use the same parsing function as the main component
      variantImageIdMap = parseVariantImageIds(props.variantImageIds);
    } // Helper to get image URL from product images by image number
    const getImageUrlByNumber = (imageNumber) => {
      if (!imageNumber || !product?.images?.edges) return "";
      const idx = parseInt(imageNumber, 10) - 1;
      return product.images.edges[idx]?.node?.url || "";
    }; // Get the appropriate style config based on whether we're inheriting or customizing
    let swatchConfig;
    if (props.variantImages.imageStyles === "customize") {
      swatchConfig = {
        gap: props.variantImages.imageGap,
        height: props.variantImages.imageHeight,
        width: props.variantImages.imageWidth,
        radius: props.variantImages.imageRadius,
        padding: props.variantImages.imagePadding,
        unselected: props.variantImages.imageUnselected,
        hovered: props.variantImages.imageHovered,
        selected: props.variantImages.imageSelected,
        imageOutOfStock: props.variantImages.imageOutOfStock,
      };
    } else if (props.variantImages.imageStyles === "inherit") {
      if (props.imageSwatches?.image && props.imageSwatches?.imageStyles) {
        swatchConfig = {
          gap: props.imageSwatches.imageGap,
          height: props.imageSwatches.imageHeight,
          width: props.imageSwatches.imageWidth,
          radius: props.imageSwatches.imageRadius,
          padding: props.imageSwatches.imagePadding,
          unselected: props.imageSwatches.imageUnselected,
          hovered: props.imageSwatches.imageHovered,
          selected: props.imageSwatches.imageSelected,
          imageOutOfStock: props.imageSwatches.imageOutOfStock,
        };
      } else if (props.swatches) {
        swatchConfig = {
          gap: props.swatches.gap ?? 8,
          height: props.swatches.height ?? 40,
          width: props.swatches.width ?? 40,
          radius: props.swatches.radius ?? "50%",
          padding: props.swatches.padding ?? 2,
          unselected: props.swatches.unselected ?? {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#FFFFFF",
            },
            background: "#FFFFFF00",
          },
          hovered: props.swatches.hovered ?? {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#CCCCCC",
            },
            background: "#FFFFFF00",
          },
          selected: props.swatches.selected ?? {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#000000",
            },
            background: "#FFFFFF00",
          },
          imageOutOfStock: props.swatches.outOfStock ?? {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#FFFFFF",
            },
            opacity: 0.5,
            background: "#FFFFFF00",
            strike: {
              line: false,
              color: "rgba(0, 0, 0, 0.16)",
              direction: "diagonal-down",
            },
          },
        };
      } else {
        // fallback to default
        swatchConfig = {
          gap: 8,
          height: 40,
          width: 40,
          radius: "50%",
          padding: 2,
          unselected: {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#FFFFFF",
            },
            background: "#FFFFFF00",
          },
          hovered: {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#CCCCCC",
            },
            background: "#FFFFFF00",
          },
          selected: {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#000000",
            },
            background: "#FFFFFF00",
          },
          imageOutOfStock: {
            border: {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#FFFFFF",
            },
            opacity: 0.5,
            background: "#FFFFFF00",
            strike: {
              line: false,
              color: "rgba(0, 0, 0, 0.16)",
              direction: "diagonal-down",
            },
          },
        };
      }
    } else {
      // fallback to default
      swatchConfig = {
        gap: 8,
        height: 40,
        width: 40,
        radius: "50%",
        padding: 2,
        unselected: {
          border: {
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#FFFFFF",
          },
          background: "#FFFFFF00",
        },
        hovered: {
          border: {
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#CCCCCC",
          },
          background: "#FFFFFF00",
        },
        selected: {
          border: {
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#000000",
          },
          background: "#FFFFFF00",
        },
        imageOutOfStock: {
          border: {
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#FFFFFF",
          },
          opacity: 0.5,
          background: "#FFFFFF00",
          strike: {
            line: false,
            color: "rgba(0, 0, 0, 0.16)",
            direction: "diagonal-down",
          },
        },
      };
    }
    return /*#__PURE__*/ _jsxs(
      "div",
      {
        role: "radiogroup",
        "aria-label": `Select ${opt.name}`,
        "aria-required": !valid,
        "aria-invalid": !valid,
        children: [
          /*#__PURE__*/ _jsx("div", {
            style: {
              width: "100%",
              display:
                props.titleConfigs.visible || props.selectedConfigs.visible
                  ? "flex"
                  : "none",
              justifyContent:
                props.titleConfigs.font.textAlign === "center"
                  ? "center"
                  : props.titleConfigs.font.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
              marginBottom:
                get(props, "containerConfigs.gap2") !== undefined
                  ? get(props, "containerConfigs.gap2")
                  : get(props, "titleConfigs.gap"),
              overflow: "visible",
            },
            children: /*#__PURE__*/ _jsxs("div", {
              style: {
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                overflow: "visible",
              },
              children: [
                props.titleConfigs.visible &&
                  /*#__PURE__*/ _jsx("label", {
                    id: `variant-title-${opt.name}`,
                    htmlFor: `variant-${opt.name}`,
                    style: {
                      ...get(props, "titleConfigs.font"),
                      color: get(props, "titleConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      margin: 0,
                      cursor: "pointer",
                      textTransform: get(
                        props,
                        "titleConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: (
                      props.titleConfigs.display || "{{Option}}"
                    ).replace("{{Option}}", opt.name),
                  }),
                props.selectedConfigs.visible &&
                  selectedOptions[opt.name] &&
                  /*#__PURE__*/ _jsx("p", {
                    style: {
                      ...get(props, "selectedConfigs.font"),
                      color: get(props, "selectedConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      paddingLeft: props.titleConfigs.visible
                        ? `${props.selectedConfigs.gap}px`
                        : 0,
                      margin: 0,
                      textTransform: get(
                        props,
                        "selectedConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: selectedOptions[opt.name],
                  }),
                props.selectedConfigs.visible &&
                  props.selectedConfigs.emptyVisible &&
                  !selectedOptions[opt.name] &&
                  /*#__PURE__*/ _jsx("p", {
                    style: {
                      ...get(props, "selectedConfigs.font"),
                      color: get(props, "selectedConfigs.color"),
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      paddingLeft: props.titleConfigs.visible
                        ? `${props.selectedConfigs.gap}px`
                        : 0,
                      margin: 0,
                      textTransform: get(
                        props,
                        "selectedConfigs.textTransform",
                        "None"
                      ).toLowerCase(),
                    },
                    children: (
                      props.selectedConfigs.emptyText ||
                      "Select {{Option Value}}"
                    ).replace("{{Option Value}}", opt.name),
                  }),
              ],
            }),
          }),
          /*#__PURE__*/ _jsxs("div", {
            style: {
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: swatchConfig.gap,
              width: "100%",
            },
            children: [
              filteredValues.map((v, i) => {
                const isActive = selectedOptions[opt.name] === v;
                const filtered = Array.from(
                  Object.entries({ ...selectedOptions, [opt.name]: v })
                );
                const isAvailableForSale = combinations.find(
                  (combination) =>
                    filtered.every(
                      ([key, value]) => combination[key] === value
                    ) && combination.availableForSale
                );
                const canSelect =
                  isAvailableForSale ||
                  (selectOutOfStock && !isAvailableForSale); // Get the variant for this value
                const variant = combinations.find((combination) =>
                  filtered.every(([key, value]) => combination[key] === value)
                );
                const variantId = variant?.id?.split("/").pop(); // Try to get the image from the variant's image.url
                let variantImageUrl;
                let variantEdge = undefined;
                if (variantId && product?.variants?.edges) {
                  variantEdge = product.variants.edges.find(
                    ({ node }) => node.id.split("/").pop() === variantId
                  );
                } // Use mapping to get the image number for this variant, and use the corresponding image prop
                let imageNumber = undefined;
                if (variantId && variantImageIdMap.size > 0) {
                  // console.log("variantId:", variantId)
                  imageNumber = variantImageIdMap.get(variantId); // console.log("imageNumber:", imageNumber)
                  if (imageNumber) {
                    const imageProp = props[`image${imageNumber}`]; // console.log("imageProp:", imageProp)
                    if (imageProp) {
                      variantImageUrl = imageProp; // console.log("variantImageUrl (mapping):", variantImageUrl)
                    }
                  }
                } // console.log("variantEdge", variantEdge)
                // console.log("variantImageUrl", variantImageUrl)
                // Fallback: use variant image.url if no mapping or prop found
                if (
                  !variantImageUrl &&
                  variantEdge &&
                  variantEdge.node?.image?.url
                ) {
                  variantImageUrl = variantEdge.node.image.url; // console.log("variantImageUrl (fallback):", variantImageUrl)
                } // LOGGING for debugging
                // console.log("[VariantImages Debug]", {
                //     value: v,
                //     selectedOptions,
                //     filtered,
                //     variant,
                //     variantId,
                //     variantEdge,
                //     variantImageUrlFromVariant:
                //         variantEdge && variantEdge.node
                //             ? variantEdge.node.image?.url
                //             : undefined,
                //     mappedImageNumber: imageNumber,
                //     mappedImageUrl: variantImageUrl,
                //     finalImageUrl: variantImageUrl,
                //     productImages: product?.images?.edges,
                //     variantImageIdMap: Array.from(
                //         variantImageIdMap.entries()
                //     ),
                // })
                // Get the current state's border style
                // const getStateBorder = () => {
                //     if (!canSelect) {
                //         return swatchConfig.imageOutOfStock.border
                //     }
                //     if (isActive) {
                //         return swatchConfig.selected.border
                //     }
                //     return swatchConfig.unselected.border
                // }
                // const border = getStateBorder()
                // Get the current state's border style
                const getStateBorder = () => {
                  if (isActive && !isAvailableForSale) {
                    return swatchConfig.selected.border;
                  }
                  if (!isAvailableForSale) {
                    return swatchConfig.imageOutOfStock.border;
                  }
                  if (isActive) {
                    return swatchConfig.selected.border;
                  }
                  return swatchConfig.unselected.border;
                };
                const getStateBackground = () => {
                  if (isActive && !isAvailableForSale) {
                    return swatchConfig.selected.background;
                  }
                  if (!isAvailableForSale) {
                    return swatchConfig.imageOutOfStock.background;
                  }
                  if (isActive) {
                    return swatchConfig.selected.background;
                  }
                  return swatchConfig.unselected.background;
                };
                const border = getStateBorder();
                const background = getStateBackground();
                return /*#__PURE__*/ _jsxs(
                  "div",
                  {
                    className: "variant-swatch-container",
                    style: { position: "relative" },
                    children: [
                      /*#__PURE__*/ _jsx("button", {
                        role: "radio",
                        "aria-checked": isActive,
                        "aria-label": `${opt.name} ${v}${
                          !canSelect ? " (Out of Stock)" : ""
                        }`,
                        title: v,
                        disabled: !canSelect,
                        onClick: () => {
                          if (canSelect) {
                            dispatchOptionSelectedEvent(opt.name, v);
                          }
                        },
                        tabIndex: canSelect ? 0 : -1,
                        onMouseEnter: (e) => {
                          if (canSelect) {
                            const button = e.currentTarget;
                            const { borderWidth, borderStyle } =
                              swatchConfig.hovered.border;
                            button.style.border = `${borderWidth}px ${borderStyle} ${swatchConfig.hovered.border.borderColor}`;
                            button.style.background =
                              swatchConfig.hovered.background;
                          }
                        },
                        onMouseLeave: (e) => {
                          const button = e.currentTarget;
                          const border = getStateBorder();
                          const background = getStateBackground();
                          button.style.border = `${border.borderWidth}px ${border.borderStyle} ${border.borderColor}`;
                          button.style.background = background;
                        },
                        style: {
                          width: swatchConfig.width,
                          height: swatchConfig.height,
                          borderRadius: swatchConfig.radius,
                          border: `${border.borderWidth}px ${border.borderStyle} ${border.borderColor}`,
                          padding: swatchConfig.padding,
                          cursor: canSelect ? "pointer" : "not-allowed", // background: "none",
                          background: background,
                          position: "relative",
                        },
                        children: /*#__PURE__*/ _jsxs("div", {
                          style: {
                            width: "100%",
                            height: "100%",
                            borderRadius: swatchConfig.radius,
                            backgroundImage: variantImageUrl
                              ? `url(${variantImageUrl})`
                              : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: !isAvailableForSale
                              ? swatchConfig.imageOutOfStock.opacity
                              : 1,
                            backgroundColor: !variantImageUrl
                              ? "#F0F0F0"
                              : undefined,
                            position: "relative",
                            overflow: "hidden",
                          },
                          children: [
                            !isActive &&
                              !isAvailableForSale &&
                              /*#__PURE__*/ _jsx("div", {
                                style: {
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  background:
                                    swatchConfig.imageOutOfStock?.background ||
                                    "FFFFFF80",
                                  opacity: swatchConfig.imageOutOfStock.opacity,
                                  borderRadius: swatchConfig.radius,
                                  pointerEvents: "none",
                                  zIndex: 1,
                                },
                              }),
                            isActive &&
                              !isAvailableForSale &&
                              swatchConfig.imageOutOfStock.strike?.line &&
                              /*#__PURE__*/ _jsx("svg", {
                                style: {
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  pointerEvents: !canSelect ? "none" : "auto",
                                },
                                viewBox: "0 0 100 100",
                                preserveAspectRatio: "none",
                                children: /*#__PURE__*/ _jsx("line", {
                                  x1:
                                    swatchConfig.imageOutOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 0
                                      : swatchConfig.imageOutOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 0
                                      : 0,
                                  y1:
                                    swatchConfig.imageOutOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 50
                                      : swatchConfig.imageOutOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 100
                                      : 0,
                                  x2: 100,
                                  y2:
                                    swatchConfig.imageOutOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 50
                                      : swatchConfig.imageOutOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 0
                                      : 100,
                                  stroke:
                                    swatchConfig.imageOutOfStock.strike?.color,
                                  strokeWidth: "1",
                                  vectorEffect: "non-scaling-stroke",
                                }),
                              }),
                            !isActive &&
                              !isAvailableForSale &&
                              swatchConfig.imageOutOfStock.strike?.line &&
                              /*#__PURE__*/ _jsx("svg", {
                                style: {
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  pointerEvents: "none",
                                },
                                viewBox: "0 0 100 100",
                                preserveAspectRatio: "none",
                                children: /*#__PURE__*/ _jsx("line", {
                                  x1:
                                    swatchConfig.imageOutOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 0
                                      : swatchConfig.imageOutOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 0
                                      : 0,
                                  y1:
                                    swatchConfig.imageOutOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 50
                                      : swatchConfig.imageOutOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 100
                                      : 0,
                                  x2: 100,
                                  y2:
                                    swatchConfig.imageOutOfStock.strike
                                      ?.direction === "horizontal"
                                      ? 50
                                      : swatchConfig.imageOutOfStock.strike
                                          ?.direction === "diagonal-up"
                                      ? 0
                                      : 100,
                                  stroke:
                                    swatchConfig.imageOutOfStock.strike?.color,
                                  strokeWidth: "1",
                                  vectorEffect: "non-scaling-stroke",
                                }),
                              }),
                          ],
                        }),
                      }),
                      /*#__PURE__*/ _jsx("div", {
                        className: "swatch-tooltip",
                        style: {
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          color: "#FFFFFF",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          marginTop: "4px",
                          whiteSpace: "nowrap",
                          opacity: 0,
                          visibility: "hidden",
                          transition:
                            "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
                          zIndex: 10,
                        },
                        children: v,
                      }),
                    ],
                  },
                  v
                );
              }),
              !valid &&
                /*#__PURE__*/ _jsx("div", {
                  role: "alert",
                  style: {
                    color: "#FF0000",
                    fontSize: "14px",
                    paddingTop: "8px",
                  },
                  children: `"${opt.name}" missing`,
                }),
            ],
          }),
        ],
      },
      opt.name
    );
  };
  const productHasOptions = (product) => {
    return (
      product &&
      Array.isArray(get(product, "options")) &&
      get(product, "options", []).length > 0 &&
      !(
        get(product, "options", []).length === 1 &&
        get(product, "options.0.name") === "Title" &&
        get(product, "options.0.values.0") === "Default Title"
      )
    );
  }; // Check if we should hide variants
  const shouldHideVariants =
    !Array.isArray(get(product, "variants.edges")) ||
    (!showSingleVariants &&
      (get(product, "variants.edges") || []).length <= 1) ||
    !productHasOptions(product) ||
    (isCanvas && variants === "None"); // If product is set to "404", show nothing
  if (product === "404" || shouldHideVariants) {
    return null;
  } // Remove the getConfig function since we're not using FcCheckoutConfigs anymore
  const getConfig = (key, fallback) => {
    return fallback;
  };
  return /*#__PURE__*/ _jsx("div", {
    ref: containerRef,
    className: "fc-product-variants-container",
    style: {
      padding: props.containerConfigs.padding,
      display: "flex",
      flexDirection:
        props.containerConfigs.direction === "horizontal" ? "row" : "column",
      flexWrap:
        props.containerConfigs.direction === "horizontal" ? "wrap" : "nowrap",
      gap: props.containerConfigs.gap,
      width: "100%",
      background: props.containerConfigs.background,
      borderRadius: props.containerConfigs.radius,
    },
    role: "region",
    "aria-label": "Product Variants",
    children: filteredOptions.map((opt, i) => {
      //console.log("filteredOptions", filteredOptions)
      const isLast = i === (get(product, "options") || [{}]).length - 1;
      const valid = !shouldValidate || !!selectedOptions[opt.name]; //console.log("valid", valid)
      const invalidMsg = `"${opt.name}" missing`; // Filter values based on available variants when filtering is applied
      let filteredValues = opt.values;
      if (
        filterVariants?.variantGroups !== "all" &&
        filterVariants?.variantTitles
      ) {
        // Get all variants that match the current filter
        const availableVariants = get(product, "variants.edges", []).filter(
          ({ node }) => {
            return node.selectedOptions.some((option) =>
              filterVariants.variantTitles?.includes(option.name)
            );
          }
        ); // Get all unique values for this option from the filtered variants
        const availableValues = new Set();
        availableVariants.forEach(({ node }) => {
          const option = node.selectedOptions.find((o) => o.name === opt.name);
          if (option) {
            availableValues.add(option.value);
          }
        }); // Filter the option values to only show available ones
        filteredValues = opt.values.filter((value) =>
          availableValues.has(value)
        );
      } //console.log("filteredValues", filteredValues)
      // Get the list of variant titles that should use swatches from config
      const variantColorTitles = props.colorTitles || ["Color", "Colour"];
      const variantImageTitles = props.imageTitles || [];
      const variantImagesTitles = props.variantImageTitles || [];
      const useColorSwatches =
        variantColorTitles.some(
          (title) =>
            title.toLowerCase().trim() === opt.name.toLowerCase().trim()
        ) && props.swatches?.colorEnabled === true;
      const useImageSwatches =
        variantImageTitles.some(
          (title) =>
            title.toLowerCase().trim() === opt.name.toLowerCase().trim()
        ) && props.imageSwatches?.image === true;
      const useVariantImages =
        variantImagesTitles.some(
          (title) =>
            title.toLowerCase().trim() === opt.name.toLowerCase().trim()
        ) && props.variantImages?.image === true;
      return /*#__PURE__*/ _jsx(
        "div",
        {
          style: {
            flex:
              style === "Dropdown" &&
              props.containerConfigs.direction === "horizontal"
                ? "1 1 0" // For dropdowns in horizontal layout: grow and shrink equally, 0 basis to fill space
                : style === "Dropdown"
                ? "1 1 auto" // For dropdowns in vertical layout: grow and shrink
                : props.containerConfigs.direction === "horizontal"
                ? "0 0 auto" // For buttons in horizontal layout: don't grow or shrink
                : "1 1 auto",
            minWidth: style === "Dropdown" ? "88px" : "auto",
            maxWidth: "none",
            width:
              style === "Dropdown"
                ? "100%" // For dropdowns: always fill width
                : props.containerConfigs.direction === "horizontal"
                ? "auto" // For buttons in horizontal layout: natural width
                : "100%", // Apply negative margin for edge-to-edge effect
            ...(style === "Dropdown" &&
            props.containerConfigs.direction === "horizontal" &&
            props.containerConfigs.gap === 0 &&
            !isLast
              ? { marginRight: "-1px" }
              : {}),
          },
          children: (() => {
            if (useColorSwatches) {
              return renderColorSwatches(
                opt,
                filteredValues,
                isLast,
                valid,
                invalidMsg
              );
            } else if (useImageSwatches) {
              return renderImageSwatches(
                opt,
                filteredValues,
                isLast,
                valid,
                invalidMsg
              );
            } else if (useVariantImages) {
              return renderVariantImages(
                opt,
                filteredValues,
                isLast,
                valid,
                invalidMsg
              );
            } else if (style === "Dropdown") {
              return renderVariantDropdown(
                opt,
                filteredValues,
                isLast,
                valid,
                invalidMsg,
                props,
                dispatchOptionSelectedEvent,
                selectedOptions,
                combinations,
                get(product, "options")?.findIndex(
                  (o) => o.name === opt.name
                ) || 0,
                get(product, "options")?.length || 0
              );
            } else {
              return renderVariantButtons(
                opt,
                filteredValues,
                isLast,
                valid,
                invalidMsg
              );
            }
          })(),
        },
        opt.name
      );
    }),
  });
}
function getProductVariant(product, opts) {
  if (!product || !product.variants || !product.variants.edges.length)
    return null;
  if (opts == null || typeof opts !== "object") return null;
  const variant = product.variants.edges.find(({ node: variant }) => {
    return Object.entries(opts).every(([key, value]) => {
      return variant.selectedOptions.find((option) => {
        return option.name === key && option.value === value;
      });
    });
  });
  if (!variant) {
    return null;
  }
  return variant.node;
} // Helper functions for parsing variants data (for Canvas view only)
// Pre-compile regex patterns for better performance
const OPTION_GROUP_REGEX = /\[(.*?)\]/g;
const IMAGE_MAPPING_REGEX = /\[Image (\d+) • (\d+)\]/g;
/**
 * Parses a string containing option definitions in the format:
 * [Option Name: Value1,Value2,Value3 • option_id]
 *
 * @param {string} optionsString - The options string to parse
 * @returns {Array} An array of option objects with name, values, and id
 */ function parseOptions(optionsString) {
  if (!optionsString) return [];
  const optionGroups = optionsString.match(OPTION_GROUP_REGEX) || [];
  return optionGroups.map((group) => {
    const [titleWithValues, id] = group
      .slice(1, -1)
      .split("•")
      .map((s) => s.trim());
    const [title, valuesStr] = titleWithValues.split(":").map((s) => s.trim());
    return {
      name: title,
      values: valuesStr.split(",").map((v) => v.trim()),
      id: id || "",
    };
  });
}
/**
 * Parses a string containing variant definitions in the format:
 * [Value1/Value2 • variant_id]
 *
 * For a single option, the format is:
 * [Value • variant_id]
 *
 * For multiple options, the format is:
 * [Value1/Value2 • variant_id]
 *
 * @param {string} variantsString - The variants string to parse
 * @returns {Array} An array of variant objects with combination, id, and availableForSale
 */ function parseVariants(variantsString) {
  if (!variantsString) return [];
  const variantGroups = variantsString.match(OPTION_GROUP_REGEX) || [];
  const parsedVariants = [];
  for (let i = 0; i < variantGroups.length; i++) {
    const group = variantGroups[i];
    const [combinationPart, id] = group
      .slice(1, -1)
      .split("•")
      .map((s) => s.trim()); // Split only on the separator between options, not inside the option value itself like S/M
    const values = combinationPart.includes(" / ")
      ? combinationPart.split(" / ").map((v) => v.trim())
      : [combinationPart.trim()];
    parsedVariants.push({
      combination: values,
      id: id || "",
      availableForSale: true,
    });
  }
  return parsedVariants;
}
/**
 * Parses a string containing options and variants data in the following format:
 * [Option Name: Value1,Value2,Value3 • option_id] •• [Value1/Value2 • variant_id][Value1/Value3 • variant_id2] •• product_id
 *
 * The string has three parts separated by "••":
 * 1. Options section: One or more option definitions in square brackets
 * 2. Variants section: One or more variant definitions in square brackets
 * 3. (Optional) Product ID: Plain string with the product ID
 *
 * @param {string} combinedString - The combined options and variants string
 * @returns {Object} An object containing parsed options, variants, and optionally a product ID
 */ function parseOptionsAndVariants(combinedString) {
  if (!combinedString) return { options: [], variants: [], productId: null }; // Split into parts: options, variants, and optionally productId
  const parts = combinedString.split("••").map((s) => s.trim());
  const optionsString = parts[0];
  const variantsString = parts.length > 1 ? parts[1] : "";
  const productId = parts.length > 2 ? parts[2] : null; // Parse options
  const options = parseOptions(optionsString); // Parse variants
  const variants = parseVariants(variantsString);
  return { options, variants, productId };
}
addPropertyControls(FC_ProductVariants, {
  shopifyProductID: {
    type: ControlType.String,
    title: "Product ID",
    description: "Connect to Product ID from CMS (required)",
  },
  variantImageIds: {
    type: ControlType.String,
    title: "Image IDs",
    description:
      "Connect to Image Variant IDs from CMS [Learn more](https://framercommerce.com/resources/docs/components/product#gallery)",
  },
  variants: {
    type: ControlType.String,
    title: "Variants",
    description: "Connect to Variants from CMS (required)",
  },
  images: {
    type: ControlType.Object,
    title: "Image Triggers",
    controls: {
      imageTrigger: {
        type: ControlType.Enum,
        title: "Type",
        options: ["None", "Gallery", "Scroll Sections"],
        defaultValue: "None",
        description:
          "Trigger image changes elsewhere on the page. [Learn more](https://framercommerce.com/resources/docs/components/product#gallery)",
        displaySegmentedControl: true,
        segmentedControlDirection: "vertical",
      },
      imageChange: {
        type: ControlType.Boolean,
        title: "Two-Way",
        defaultValue: true,
        enabledTitle: "Yes",
        disabledTitle: "No",
        description:
          "Allow clicking on an image to change the selected variant.",
        hidden: ({ imageTrigger }) => imageTrigger !== "Gallery",
      },
      offsetY: {
        type: ControlType.Number,
        title: "Offset Y",
        description: "Match your Offset Y to your on-canvas values.",
        hidden: ({ imageTrigger }) => imageTrigger !== "Scroll Sections",
        defaultValue: 0,
        min: 0,
        step: 1,
        displayStepper: true,
      },
    },
  },
  behaviorConfigs: {
    type: ControlType.Object,
    title: "Behavior",
    controls: {
      filterVariants: {
        type: ControlType.Object,
        title: "Filter",
        controls: {
          variantGroups: {
            type: ControlType.Enum,
            title: "Groups",
            options: ["all", "equals", "doesn't equal"],
            optionTitles: ["All", "Equals", "Doesn't Equal"],
            defaultValue: "all",
            displaySegmentedControl: true,
            segmentedControlDirection: "vertical",
          },
          variantTitles: {
            type: ControlType.Array,
            title: "Titles",
            control: { type: ControlType.String },
            defaultValue: [],
            description:
              'Show all variants or filter by title (e.g., "Color", "Size") using multiple components.',
            hidden: (props) => props.variantGroups === "all",
          },
        },
      },
      action: {
        type: ControlType.Enum,
        title: "Action",
        options: ["Update Active", "Add to Cart", "Buy Now"],
        optionTitles: ["Update Active", "Add to Cart", "Buy Now"],
        defaultValue: "Update Active",
        displaySegmentedControl: true,
        segmentedControlDirection: "vertical",
        description:
          "Only set Add to Cart or Buy Now when this component displays a single variant group.",
      },
      triggerCart: {
        type: ControlType.Boolean,
        title: "Cart",
        description: "Trigger cart after adding item",
        defaultValue: true,
        hidden: (props) => props.action !== "Add to Cart",
      },
      autoSelectFirst: {
        type: ControlType.Boolean,
        title: "Select 1st",
        description: "Auto-select the first available variant(s)",
        defaultValue: false,
        hidden: (props) =>
          props.action === "Add to Cart" || props.action === "Buy Now",
      },
      productPage: {
        type: ControlType.Boolean,
        title: "PDP",
        description: "Enable if this component is on a product page",
        defaultValue: true,
        enabledTitle: "Yes",
        disabledTitle: "No",
      },
      showSingleVariants: {
        type: ControlType.Boolean,
        title: "Singles",
        description: "Show the variant selector if only one variant",
        defaultValue: false,
      }, // showSingleGroups: {
      //     type: ControlType.Boolean,
      //     title: "Groups",
      //     description: "Show the variant selector if only one group",
      //     defaultValue: false,
      // },
      selectOutOfStock: {
        type: ControlType.Boolean,
        title: "Out of Stock",
        description: "Allow selecting out of stock variants",
        defaultValue: false,
        hidden: (props) => props.action !== "Update Active",
      },
    },
  },
  containerConfigs: {
    type: ControlType.Object,
    title: "Layout",
    controls: {
      padding: {
        type: ControlType.Padding,
        title: "Padding",
        defaultValue: "8px",
      },
      gap2: {
        type: ControlType.Number,
        title: "Title Gap",
        min: 0,
        unit: "px",
      },
      gap: { type: ControlType.Number, title: "Group Gap", min: 0, unit: "px" },
      direction: {
        type: ControlType.Enum,
        title: "Direction",
        options: ["horizontal", "vertical"],
        optionTitles: ["Horizontal", "Vertical"],
        optionIcons: ["direction-horizontal", "direction-vertical"],
        displaySegmentedControl: true,
        defaultValue: "vertical",
      },
      background: {
        type: ControlType.Color,
        title: "BG",
        defaultValue: "rgba(255, 255, 255, 0)",
      },
      radius: {
        type: ControlType.BorderRadius,
        title: "Radius",
        defaultValue: "0px",
      },
    },
  },
  titleConfigs: {
    type: ControlType.Object,
    title: "Title",
    controls: {
      visible: {
        type: ControlType.Boolean,
        title: "Title",
        enabledTitle: "Show",
        disabledTitle: "Hide",
        defaultValue: true,
      },
      display: {
        type: ControlType.String,
        title: "Display",
        defaultValue: "{{Option}}",
        placeholder: "{{Option}}",
        description: "Use {{Option}} to dynamically display Color, Size, etc.",
        hidden: (props) => !props.visible,
      },
      font: {
        type: ControlType.Font,
        title: "Font",
        controls: "extended",
        hidden: (props) => !props.visible,
      },
      textTransform: {
        type: ControlType.Enum,
        title: "Transform",
        options: ["None", "Uppercase", "Lowercase", "Capitalize"],
        defaultValue: "None",
        hidden: (props) => !props.visible,
      },
      color: {
        type: ControlType.Color,
        title: "Color",
        hidden: (props) => !props.visible,
      },
      gap: {
        type: ControlType.Number,
        title: "Gap",
        description: "Space between title and buttons/dropdown",
        min: 0,
        unit: "px",
        hidden: (props) => !props.visible || true,
      },
    },
  },
  selectedConfigs: {
    type: ControlType.Object,
    title: "Selected Value",
    controls: {
      visible: {
        type: ControlType.Boolean,
        title: "Value",
        enabledTitle: "Show",
        disabledTitle: "Hide",
        defaultValue: false,
      },
      gap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: 8,
        min: 0,
        unit: "px",
        hidden: (props) => !props.visible,
      },
      font: {
        type: ControlType.Font,
        title: "Font",
        controls: "extended",
        hidden: (props) => !props.visible,
      },
      textTransform: {
        type: ControlType.Enum,
        title: "Transform",
        options: ["None", "Uppercase", "Lowercase", "Capitalize"],
        defaultValue: "None",
        hidden: (props) => !props.visible,
      },
      color: {
        type: ControlType.Color,
        title: "Color",
        hidden: (props) => !props.visible,
      },
      emptyVisible: {
        type: ControlType.Boolean,
        title: "Empty",
        enabledTitle: "Show",
        disabledTitle: "Hide",
        defaultValue: false,
        hidden: (props) => !props.visible,
      },
      emptyText: {
        type: ControlType.String,
        title: "Display",
        description:
          "Use {{Option Value}} to dynamically display Blue, Medium, etc.",
        placeholder: "Select {{Option Value}}",
        defaultValue: "Select {{Option Value}}",
        hidden: (props) => !props.visible || !props.emptyVisible,
      },
    },
  },
  style: {
    type: ControlType.Enum,
    title: "Style",
    options: ["Buttons", "Dropdown"],
    optionTitles: ["Buttons", "Dropdown"],
    displaySegmentedControl: true,
    segmentedControlDirection: "vertical",
    defaultValue: "Buttons",
  },
  buttonConfigs: {
    type: ControlType.Object,
    title: "Buttons",
    hidden: (props) => props.style !== "Buttons",
    controls: {
      layout: {
        type: ControlType.Enum,
        title: "Layout",
        options: ["stack", "grid"],
        optionTitles: ["Stack", "Grid"],
        displaySegmentedControl: true,
        defaultValue: "stack",
      },
      direction: {
        type: ControlType.Enum,
        title: "Direction",
        options: ["horizontal", "vertical"],
        optionTitles: ["Horizontal", "Vertical"],
        optionIcons: ["direction-horizontal", "direction-vertical"],
        displaySegmentedControl: true,
        defaultValue: "vertical",
        hidden: (props) => props.layout === "grid",
      },
      columns: {
        type: ControlType.Enum,
        title: "Columns",
        options: ["auto", "fixed"],
        optionTitles: ["Auto", "Fixed"],
        displaySegmentedControl: true,
        defaultValue: "auto",
        hidden: (props) => props.layout !== "grid",
      },
      columnCount: {
        type: ControlType.Number,
        title: "Columns",
        defaultValue: 3,
        min: 1,
        step: 1,
        displayStepper: true,
        hidden: (props) => props.layout !== "grid" || props.columns === "auto",
      },
      gridWidth: {
        type: ControlType.Number,
        title: "Min Width",
        defaultValue: 100,
        min: 1,
        max: 1e3,
        step: 1,
        hidden: (props) => props.layout !== "grid" || props.columns === "fixed",
      },
      maxColumns: {
        type: ControlType.Number,
        title: "Max Col",
        defaultValue: 4,
        min: 1,
        step: 1,
        displayStepper: true,
        hidden: (props) => props.layout !== "grid" || props.columns === "fixed",
      },
      gap: { type: ControlType.Number, title: "Gap X", min: 0 },
      gapY: {
        type: ControlType.Number,
        title: "Gap Y",
        defaultValue: 8,
        min: 0,
        step: 1,
      },
      radius: {
        type: ControlType.BorderRadius,
        title: "Radius",
        defaultValue: "4px",
      },
      padding: {
        type: ControlType.Padding,
        title: "Padding",
        defaultValue: "8px",
      },
      width: {
        type: ControlType.Boolean,
        title: "Width",
        enabledTitle: "Fill",
        disabledTitle: "Fit",
        defaultValue: false,
        hidden: (props) => props.direction !== "vertical",
      },
      unselected: {
        type: ControlType.Object,
        title: "Default",
        controls: {
          font: {
            type: ControlType.Font,
            title: "Font",
            controls: "extended",
            defaultValue: { fontSize: 14, fontFamily: "Inter" },
          },
          textTransform: {
            type: ControlType.Enum,
            title: "Transform",
            options: ["None", "Uppercase", "Lowercase", "Capitalize"],
            defaultValue: "None",
          },
          color: {
            type: ControlType.Color,
            title: "Text",
            defaultValue: "rgba(0, 0, 0, 1)",
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "rgba(255, 255, 255, 1)",
          },
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0,0,0,0.08)",
              },
            },
          },
        },
      },
      hovered: {
        type: ControlType.Object,
        title: "Hover",
        controls: {
          font: {
            type: ControlType.Font,
            title: "Font",
            controls: "extended",
            defaultValue: { fontSize: 14, fontFamily: "Inter" },
          },
          textTransform: {
            type: ControlType.Enum,
            title: "Transform",
            options: ["None", "Uppercase", "Lowercase", "Capitalize"],
            defaultValue: "None",
          },
          color: {
            type: ControlType.Color,
            title: "Text",
            defaultValue: "rgba(0, 0, 0, 1)",
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "rgba(0, 0, 0, 0.03)",
          },
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 1)",
              },
            },
          },
        },
      },
      selected: {
        type: ControlType.Object,
        title: "Selected",
        controls: {
          font: {
            type: ControlType.Font,
            title: "Font",
            controls: "extended",
            defaultValue: {
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "Inter",
            },
          },
          textTransform: {
            type: ControlType.Enum,
            title: "Transform",
            options: ["None", "Uppercase", "Lowercase", "Capitalize"],
            defaultValue: "None",
          },
          color: {
            type: ControlType.Color,
            title: "Text",
            defaultValue: "#FFFFFF",
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "#000000",
          },
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#000000",
              },
            },
          },
        },
      },
      outOfStock: {
        type: ControlType.Object,
        title: "Out Of Stock",
        controls: {
          preview: {
            type: ControlType.Boolean,
            title: "Preview",
            enabledTitle: "On",
            disabledTitle: "Off",
            defaultValue: false,
          },
          font: {
            type: ControlType.Font,
            title: "Font",
            controls: "extended",
            defaultValue: {
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "Inter",
            },
          },
          color: {
            type: ControlType.Color,
            title: "Text",
            defaultValue: "rgba(0, 0, 0, 0.40)",
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "rgba(0, 0, 0, 0.08)",
          },
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(255, 255, 255, 1)",
              },
            },
          },
          textTransform: {
            type: ControlType.Enum,
            title: "Transform",
            options: ["None", "Uppercase", "Lowercase", "Capitalize"],
            defaultValue: "None",
          },
          strike: {
            type: ControlType.Object,
            title: "Strike",
            controls: {
              line: {
                type: ControlType.Boolean,
                title: "Line",
                enabledTitle: "Yes",
                disabledTitle: "No",
                defaultValue: false,
              },
              size: {
                type: ControlType.Enum,
                title: "Size",
                options: ["text", "container"],
                optionTitles: ["Text", "Container"],
                defaultValue: "container",
                displaySegmentedControl: true,
                segmentedControlDirection: "vertical",
                hidden: (props) => !props.line,
              },
              color: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0.16)",
                hidden: (props) => !props.line,
              },
              direction: {
                type: ControlType.Enum,
                title: "Direction",
                options: ["horizontal", "diagonal-up", "diagonal-down"],
                optionTitles: ["Horizontal", "Diagonal Up", "Diagonal Down"],
                defaultValue: "diagonal-down",
                displaySegmentedControl: true,
                segmentedControlDirection: "vertical",
                hidden: (props) => !props.line || props.size === "text",
              },
            },
          },
        },
      },
    },
  },
  dropdownConfigs: {
    type: ControlType.Object,
    title: "Dropdown",
    hidden: (props) => props.style !== "Dropdown",
    controls: {
      font: { type: ControlType.Font, title: "Font", controls: "extended" },
      textTransform: {
        type: ControlType.Enum,
        title: "Transform",
        options: ["None", "Uppercase", "Lowercase", "Capitalize"],
        defaultValue: "None",
      },
      unselected: {
        type: ControlType.Object,
        title: "Unselected",
        controls: {
          text: {
            type: ControlType.String,
            title: "Text",
            defaultValue: "Select {{variant}}",
            description: "Use {{variant}} to insert the variant name",
          },
          color: {
            type: ControlType.Color,
            title: "Text",
            defaultValue: "rgba(0, 0, 0, 0.48)",
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "rgba(255, 255, 255, 1)",
          },
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0.08)",
              },
            },
          },
        },
      },
      selected: {
        type: ControlType.Object,
        title: "Selected",
        controls: {
          color: {
            type: ControlType.Color,
            title: "Text",
            defaultValue: "rgba(0, 0, 0, 1)",
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "rgba(255, 255, 255, 1)",
          },
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0.16)",
              },
            },
          },
        },
      },
      hover: {
        type: ControlType.Object,
        title: "Hover",
        controls: {
          color: {
            type: ControlType.Color,
            title: "Text",
            defaultValue: "rgba(0, 0, 0, 1)",
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "rgba(0, 0, 0, 0.04)",
          },
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 1)",
              },
            },
          },
        },
      },
      focus: {
        type: ControlType.Object,
        title: "Focus",
        controls: {
          width: {
            type: ControlType.Number,
            title: "Width",
            defaultValue: 2,
            min: 1,
            max: 20,
            step: 1,
            displayStepper: true,
          },
          offset: {
            type: ControlType.Number,
            title: "Offset",
            defaultValue: 2,
            min: 0,
            max: 20,
            step: 1,
            displayStepper: true,
          },
          color: { type: ControlType.Color, title: "Color" },
        },
      },
      radius: {
        type: ControlType.BorderRadius,
        title: "Radius",
        defaultValue: "4px",
      },
      padding: {
        type: ControlType.Padding,
        title: "Padding",
        defaultValue: "16px 16px 16px 16px",
      },
      icon: {
        type: ControlType.Object,
        title: "Icon",
        controls: {
          type: {
            type: ControlType.Enum,
            title: "Type",
            options: ["default", "custom"],
            optionTitles: ["Default", "Custom"],
            defaultValue: "default",
            displaySegmentedControl: true,
          },
          color: {
            type: ControlType.Color,
            title: "Color",
            defaultValue: "rgba(0, 0, 0, 1)",
            hidden: (props) => props.type === "custom",
          },
          size: {
            type: ControlType.Number,
            title: "Size",
            defaultValue: 12,
            min: 8,
            max: 64,
            step: 1,
          },
          weight: {
            type: ControlType.Number,
            title: "Weight",
            defaultValue: 2,
            min: 0.5,
            max: 4,
            step: 0.5,
            hidden: (props) => props.type === "custom",
          },
          customIcon: {
            type: ControlType.Image,
            title: "Image",
            hidden: (props) => props.type !== "custom",
          },
        },
      },
    },
  },
  swatches: {
    type: ControlType.Object,
    title: "Color Swatches",
    controls: {
      colorEnabled: {
        type: ControlType.Boolean,
        title: "Color",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
        description:
          "Show swatches for Color variants. Set hex codes in the plugin. [Learn more](https://framercommerce.com/resources/academy/variant-colors)",
      },
      gap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: 8,
        min: 0,
        step: 4,
        hidden: (props) => !props.colorEnabled,
      },
      height: {
        type: ControlType.Number,
        title: "Height",
        defaultValue: 40,
        min: 8,
        max: 80,
        step: 4,
        displayStepper: true,
        hidden: (props) => !props.colorEnabled,
      },
      width: {
        type: ControlType.Number,
        title: "Width",
        defaultValue: 40,
        min: 8,
        max: 80,
        step: 4,
        displayStepper: true,
        hidden: (props) => !props.colorEnabled,
      },
      radius: {
        type: ControlType.BorderRadius,
        title: "Radius",
        defaultValue: "50%",
        hidden: (props) => !props.colorEnabled,
      },
      padding: {
        type: ControlType.Padding,
        title: "Padding",
        defaultValue: "2px",
        hidden: (props) => !props.colorEnabled,
      },
      unselected: {
        type: ControlType.Object,
        title: "Default",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0)",
              },
            },
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "rgba(255, 255, 255, 0)",
          },
        },
        hidden: (props) => !props.colorEnabled,
      },
      hovered: {
        type: ControlType.Object,
        title: "Hover",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0.16)",
              },
            },
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "#FFF",
          },
        },
        hidden: (props) => !props.colorEnabled,
      },
      selected: {
        type: ControlType.Object,
        title: "Selected",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 1)",
              },
            },
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "rgba(255, 255, 255, 1)",
          },
        },
        hidden: (props) => !props.colorEnabled,
      },
      outOfStock: {
        type: ControlType.Object,
        title: "Out of Stock",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0,0,0,0)",
              },
            },
          },
          opacity: {
            type: ControlType.Number,
            title: "Opacity",
            defaultValue: 0.5,
            min: 0,
            max: 1,
            step: 0.1,
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "rgba(255, 255, 255, 0)",
          },
          strike: {
            type: ControlType.Object,
            title: "Strike",
            controls: {
              line: {
                type: ControlType.Boolean,
                title: "Line",
                enabledTitle: "Yes",
                disabledTitle: "No",
                defaultValue: false,
              },
              color: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0.16)",
                hidden: (props) => !props.line,
              },
              direction: {
                type: ControlType.Enum,
                title: "Direction",
                options: ["horizontal", "diagonal-up", "diagonal-down"],
                optionTitles: ["Horizontal", "Diagonal Up", "Diagonal Down"],
                defaultValue: "diagonal-down",
                displaySegmentedControl: true,
                segmentedControlDirection: "vertical",
                hidden: (props) => !props.line,
              },
            },
          },
        },
        hidden: (props) => !props.colorEnabled,
      },
    },
  },
  colorTitles: {
    type: ControlType.Array,
    title: "↳ Color Titles",
    control: { type: ControlType.String },
    defaultValue: ["Color"],
    hidden: (props) => !props.swatches?.colorEnabled,
  },
  colors: {
    type: ControlType.Array,
    title: "↳ Color Values",
    control: {
      type: ControlType.Object,
      controls: {
        name: { type: ControlType.String, title: "Name" },
        hex: { type: ControlType.Color, title: "Color" },
      },
    },
    defaultValue: [
      ["green", "#D0EF79"],
      ["blue", "#053ECF"],
      ["pink", "#CC7BE4"],
      ["black", "#333233"],
    ],
    hidden: (props) => !props.swatches?.colorEnabled,
  },
  imageSwatches: {
    type: ControlType.Object,
    title: "Image Swatches",
    controls: {
      image: {
        type: ControlType.Boolean,
        title: "Images",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
        description:
          "Show Image swatches for specific variants. [Learn more](https://framercommerce.com/resources/academy/variant-images)",
      },
      imageStyles: {
        type: ControlType.Enum,
        title: "Styles",
        options: ["inherit", "customize"],
        optionTitles: ["Inherit from Colors", "Customize"],
        defaultValue: "inherit",
        displaySegmentedControl: true,
        segmentedControlDirection: "vertical",
        hidden: (props) => !props.image,
      },
      imageGap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: 8,
        min: 0,
        step: 4,
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageHeight: {
        type: ControlType.Number,
        title: "Height",
        defaultValue: 40,
        min: 8,
        max: 80,
        step: 4,
        displayStepper: true,
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageWidth: {
        type: ControlType.Number,
        title: "Width",
        defaultValue: 40,
        min: 8,
        max: 80,
        step: 4,
        displayStepper: true,
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageRadius: {
        type: ControlType.BorderRadius,
        title: "Radius",
        defaultValue: "50%",
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imagePadding: {
        type: ControlType.Padding,
        title: "Padding",
        defaultValue: "2px",
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageUnselected: {
        type: ControlType.Object,
        title: "Default",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#FFFFFF",
              },
            },
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "#FFF",
          },
        },
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageHovered: {
        type: ControlType.Object,
        title: "Hover",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0.16)",
              },
            },
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "#FFF",
          },
        },
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageSelected: {
        type: ControlType.Object,
        title: "Selected",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#000000",
              },
            },
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "#FFFFFF",
          },
        },
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageOutOfStock: {
        type: ControlType.Object,
        title: "Out of Stock",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0)",
              },
            },
          },
          opacity: {
            type: ControlType.Number,
            title: "Opacity",
            defaultValue: 0.5,
            min: 0,
            max: 1,
            step: 0.1,
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "rgba(255, 255, 255, 0)",
          },
          strike: {
            type: ControlType.Object,
            title: "Strike",
            controls: {
              line: {
                type: ControlType.Boolean,
                title: "Line",
                enabledTitle: "Yes",
                disabledTitle: "No",
                defaultValue: false,
              },
              color: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0.16)",
                hidden: (props) => !props.line,
              },
              direction: {
                type: ControlType.Enum,
                title: "Direction",
                options: ["horizontal", "diagonal-up", "diagonal-down"],
                optionTitles: ["Horizontal", "Diagonal Up", "Diagonal Down"],
                defaultValue: "diagonal-down",
                displaySegmentedControl: true,
                segmentedControlDirection: "vertical",
                hidden: (props) => !props.line,
              },
            },
          },
        },
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
    },
  },
  imageTitles: {
    type: ControlType.Array,
    title: "↳ Image Titles",
    control: { type: ControlType.String },
    defaultValue: [],
    hidden: (props) => !props.imageSwatches?.image,
  },
  swatchImages: {
    type: ControlType.Array,
    title: "↳ Image Values",
    control: {
      type: ControlType.Object,
      controls: {
        name: { type: ControlType.String, title: "Name" },
        url: { type: ControlType.String, title: "URL" },
      },
    },
    defaultValue: [],
    hidden: (props) => !props.imageSwatches?.image,
  },
  variantImages: {
    type: ControlType.Object,
    title: "Variant Images",
    controls: {
      image: {
        type: ControlType.Boolean,
        title: "Images",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
        description:
          "Show variant images for specific variants. Uses the variant's associated image from the product data.",
      },
      imageStyles: {
        type: ControlType.Enum,
        title: "Styles",
        options: ["inherit", "customize"],
        optionTitles: ["Inherit from Images", "Customize"],
        defaultValue: "inherit",
        displaySegmentedControl: true,
        segmentedControlDirection: "vertical",
        hidden: (props) => !props.image,
      },
      imageGap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: 8,
        min: 0,
        step: 4,
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageHeight: {
        type: ControlType.Number,
        title: "Height",
        defaultValue: 40,
        min: 8,
        max: 80,
        step: 4,
        displayStepper: true,
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageWidth: {
        type: ControlType.Number,
        title: "Width",
        defaultValue: 40,
        min: 8,
        max: 80,
        step: 4,
        displayStepper: true,
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageRadius: {
        type: ControlType.BorderRadius,
        title: "Radius",
        defaultValue: "50%",
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imagePadding: {
        type: ControlType.Padding,
        title: "Padding",
        defaultValue: "2px",
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageUnselected: {
        type: ControlType.Object,
        title: "Default",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#FFFFFF",
              },
            },
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "#FFF",
          },
        },
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageHovered: {
        type: ControlType.Object,
        title: "Hover",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0.16)",
              },
            },
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "#FFF",
          },
        },
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageSelected: {
        type: ControlType.Object,
        title: "Selected",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#000000",
              },
            },
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "#FFFFFF",
          },
        },
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
      imageOutOfStock: {
        type: ControlType.Object,
        title: "Out of Stock",
        controls: {
          border: {
            type: ControlType.Object,
            title: "Border",
            controls: {
              borderWidth: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixed",
                toggleTitles: ["All", "Individual"],
                valueKeys: ["top", "right", "bottom", "left"],
                valueLabels: ["T", "R", "B", "L"],
                min: 0,
                defaultValue: 1,
              },
              borderStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "double"],
                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
                defaultValue: "solid",
              },
              borderColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0)",
              },
            },
          },
          opacity: {
            type: ControlType.Number,
            title: "Opacity",
            defaultValue: 0.5,
            min: 0,
            max: 1,
            step: 0.1,
          },
          background: {
            type: ControlType.Color,
            title: "BG",
            defaultValue: "rgba(255, 255, 255, 0)",
          },
          strike: {
            type: ControlType.Object,
            title: "Strike",
            controls: {
              line: {
                type: ControlType.Boolean,
                title: "Line",
                enabledTitle: "Yes",
                disabledTitle: "No",
                defaultValue: false,
              },
              color: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(0, 0, 0, 0.16)",
                hidden: (props) => !props.line,
              },
              direction: {
                type: ControlType.Enum,
                title: "Direction",
                options: ["horizontal", "diagonal-up", "diagonal-down"],
                optionTitles: ["Horizontal", "Diagonal Up", "Diagonal Down"],
                defaultValue: "diagonal-down",
                displaySegmentedControl: true,
                segmentedControlDirection: "vertical",
                hidden: (props) => !props.line,
              },
            },
          },
        },
        hidden: (props) => !props.image || props.imageStyles === "inherit",
      },
    },
  },
  variantImageTitles: {
    type: ControlType.Array,
    title: "↳ Variant Image Titles",
    control: { type: ControlType.String },
    defaultValue: [],
    hidden: (props) => !props.variantImages?.image,
  }, // Add up to 100 image props for variant images
  ...(() => {
    const imageControls = {};
    for (let i = 1; i <= 100; i++) {
      imageControls[`image${i}`] = {
        type: ControlType.Image,
        title: `↳ Image ${i}`,
        hidden: (props) => {
          if (!props.variantImages?.image) return true;
          if (i === 1) return false; // Only show if previous image is set
          return !props[`image${i - 1}`];
        },
      };
    }
    return imageControls;
  })(),
});
FC_ProductVariants.defaultProps = {
  shopifyProductID: "",
  variantImageIds: "",
  variants: "",
  images: { imageTrigger: "None", imageChange: true, offsetY: 0 },
  behaviorConfigs: {
    autoSelectFirst: false,
    showSingleVariants: false, // showSingleGroups: false,
    selectOutOfStock: false,
    filterVariants: { variantGroups: "all", variantTitles: [] },
    onClickAction: {
      action: "update",
      purchaseType: "add to cart",
      triggerCart: true,
    },
  },
  style: "Buttons",
  buttonConfigs: {
    gap: 8,
    radius: "4px",
    padding: "8px",
    direction: "horizontal",
    width: false,
    unselected: {
      font: { fontSize: 14, fontWeight: 500, fontFamily: "Inter" },
      color: "rgba(0, 0, 0, 1)",
      background: "rgba(255, 255, 255, 1)",
      border: "1px solid rgba(0,0,0,0.08)",
      textTransform: "None",
    },
    hovered: {
      font: { fontSize: 14, fontWeight: 500, fontFamily: "Inter" },
      color: "rgba(0, 0, 0, 1)",
      background: "rgba(0, 0, 0, 0.03)",
      border: "1px solid rgba(0, 0, 0, 1)",
      textTransform: "None",
    },
    selected: {
      font: { fontSize: 14, fontWeight: 500, fontFamily: "Inter" },
      color: "rgba(255, 255, 255, 1)",
      background: "rgba(0, 0, 0, 1)",
      border: "1px solid rgba(0, 0, 0, 1)",
      textTransform: "None",
    },
    outOfStock: {
      font: { fontSize: 14, fontWeight: 500, fontFamily: "Inter" },
      color: "rgba(0, 0, 0, 0.40)",
      background: "rgba(0, 0, 0, 0.08)",
      border: "1px solid rgba(255, 255, 255, 1)",
      textTransform: "None",
      preview: false,
      strike: {
        line: false,
        size: "container",
        color: "rgba(0, 0, 0, 0.16)",
        direction: "diagonal-down",
      },
    },
  },
  dropdownConfigs: {
    font: undefined,
    textTransform: "None",
    unselected: {
      text: "Select {{variant}}",
      color: "rgba(0, 0, 0, 0.48)",
      background: "rgba(255, 255, 255, 1)",
      border: {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "rgba(0,0,0,0.08)",
      },
    },
    selected: {
      color: "rgba(0, 0, 0, 1)",
      background: "rgba(255, 255, 255, 1)",
      border: {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "rgba(0,0,0,1)",
      },
    },
    hover: {
      color: "rgba(0, 0, 0, 1)",
      background: "rgba(0, 0, 0, 0.16)",
      border: {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "rgba(0, 0, 0, 1)",
      },
    },
    focus: { width: 2, offset: 2 },
    radius: "4px",
    padding: "16px 16px 16px 16px",
    icon: { type: "default", color: "rgba(0, 0, 0, 1)", size: 12, weight: 2 },
  },
  containerConfigs: { padding: "0px", gap: 24, gap2: 8, direction: "vertical" },
  titleConfigs: {
    visible: true,
    font: undefined,
    color: "rgba(0, 0, 0, 1)",
    gap: 8,
    display: "{{Option}}",
    textTransform: "None",
  },
  selectedConfigs: {
    visible: false,
    gap: 8,
    font: undefined,
    color: "rgba(0, 0, 0, 1)",
    emptyVisible: true,
    emptyText: "Select {{Option Value}}",
    textTransform: "None",
  },
  swatches: {
    colorEnabled: true,
    gap: 8,
    height: 40,
    width: 40,
    radius: "50%",
    padding: 2,
    unselected: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(255, 255, 255, 1)",
      },
      background: "rgba(255, 255, 255, 0)",
    },
    hovered: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(0,0,0,0.16)",
      },
      background: "rgba(255, 255, 255, 0)",
    },
    selected: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(0, 0, 0, 1)",
      },
      background: "rgba(255, 255, 255, 0)",
    },
    outOfStock: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(255, 255, 255, 1)",
      },
      opacity: 0,
      background: "rgba(255, 255, 255, 0)",
      strike: {
        line: false,
        color: "rgba(0, 0, 0, 0.16)",
        direction: "diagonal-down",
      },
    },
  },
  imageSwatches: {
    image: false,
    imageStyles: "inherit",
    imageGap: 8,
    imageHeight: 40,
    imageWidth: 40,
    imageRadius: "50%",
    imagePadding: 2,
    imageUnselected: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(255, 255, 255, 1)",
      },
      background: "rgba(255, 255, 255, 0)",
    },
    imageHovered: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(0, 0, 0, 0.20)",
      },
      background: "rgba(255, 255, 255, 0)",
    },
    imageSelected: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(0, 0, 0, 1)",
      },
      background: "rgba(255, 255, 255, 0)",
    },
    imageOutOfStock: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(255, 255, 255, 1)",
      },
      opacity: 0,
      background: "rgba(255, 255, 255, 0)",
      strike: {
        line: false,
        color: "rgba(0, 0, 0, 0.16)",
        direction: "diagonal-down",
      },
    },
  },
  imageTitles: [],
  variantImageTitles: [],
  variantImages: {
    image: false,
    imageStyles: "inherit",
    imageGap: 8,
    imageHeight: 40,
    imageWidth: 40,
    imageRadius: "50%",
    imagePadding: 2,
    imageUnselected: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(255, 255, 255, 1)",
      },
      background: "rgba(255, 255, 255, 0)",
    },
    imageHovered: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(0, 0, 0, 0.20)",
      },
      background: "rgba(255, 255, 255, 0)",
    },
    imageSelected: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(0, 0, 0, 1)",
      },
      background: "rgba(255, 255, 255, 0)",
    },
    imageOutOfStock: {
      border: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(255, 255, 255, 1)",
      },
      opacity: 0,
      background: "rgba(255, 255, 255, 0)",
      strike: {
        line: false,
        color: "rgba(0, 0, 0, 0.16)",
        direction: "diagonal-down",
      },
    },
  },
};
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FC_ProductVariants",
      slots: [],
      annotations: { framerContractVersion: "1", framerDisableUnlink: "*" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./FC_ProductVariants_v1.map
