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
 */ import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { addPropertyControls, ControlType, RenderTarget } from "framer";
import {
  parseUrlFilters,
  updateUrlWithFilters,
  convertFilterName,
} from "https://framerusercontent.com/modules/A55TPw8oJtDToWtsjcDZ/rm89gWVDrPnML7Vtbv1c/filterMappings.js"; // Constants for localStorage and debugging
const FILTER_STATE_KEY = "shopx_filter_states";
const DEBUG_MODE = true; // Enable detailed logging // Global state management to prevent duplicate instances
const globalFilterState = {
  instances: new Set(),
  eventListeners: new Map(),
  cleanup: () => {
    globalFilterState.instances.clear();
    globalFilterState.eventListeners.forEach((listener, event) => {
      window.removeEventListener(event, listener);
    });
    globalFilterState.eventListeners.clear();
  },
}; // Ensure cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", globalFilterState.cleanup);
} // Helper function for consistent logging
const logDebug = (component, action, data) => {
  if (DEBUG_MODE) {
    // console.log(`🔍 [${component}] ${action}:`, data)
  }
};
const normalizeProperty = (property, discountType) => {
  const propertyMap = {
    collection: "collection",
    product_type: "product_type",
    product_tag: "product_tag",
    price: "price",
    on_sale: "on_sale",
    in_stock: "in_stock",
    bundle: "bundle",
    subscription: "subscription",
    variant: "variant",
    discount:
      discountType === "Percent" ? "discount_percent" : "discount_amount",
  };
  return propertyMap[property] || property;
};
/**
 * @framerDisableUnlink
 */ export default function FC_CatalogFilterButton(props) {
  const {
    // Functional props
    filterType = "shopify",
    property = "price",
    displayText = "",
    value = "",
    priceType = "Under",
    priceThreshold = 100,
    priceOver = 50,
    priceLow = 50,
    priceHigh = 100,
    discountType = "Percent",
    discountValueType = "Over",
    discountThreshold = 100,
    discountLow = 50,
    discountHigh = 100,
    variantTitle = "Size",
    variantValue = "Large",
    showVariantTitle = true,
    showVariantValue = true,
    variantStockFilter = "all",
    variantDisplayText = "",
    showText = true, // CMS props
    cmsTitle = "Category",
    cmsValue = "fashion", // Font control
    font = {
      fontSize: 16,
      fontWeight: 400,
      fontFamily: "Inter",
      fontStyle: "normal",
      lineHeight: 1.2,
      letterSpacing: 0,
      textAlign: "left",
      textDecoration: "none",
    }, // Style controls
    style: {
      type = "checkbox",
      width = 20,
      height = 20,
      radius = 4,
      radiusPerSide = false,
      radiusTopLeft = 4,
      radiusTopRight = 4,
      radiusBottomRight = 4,
      radiusBottomLeft = 4,
      swatchType = "color",
      swatchImage = "",
      swatchColor = "#000000",
      swatchBorder = 4,
      icon: {
        type: iconType = "default",
        color: iconColor = "#000000",
        weight: iconWeight = 2,
        edge: iconEdge = "round",
        size: iconSize = 12,
        customIcon = "",
      } = {},
      gap = 8,
      padding = 8,
      paddingPerSide = false,
      paddingTop = 8,
      paddingRight = 8,
      paddingBottom = 8,
      paddingLeft = 8,
      direction = "horizontal",
    } = {}, // State controls
    default: defaultState = {
      textColor: "#000000",
      border: {
        color: "#000000",
        width: { top: 2, right: 2, bottom: 2, left: 2 },
        style: "solid",
      },
      background: "transparent",
    },
    hover: hoverState = {
      textColor: "#333333",
      border: {
        color: "#333333",
        width: { top: 2, right: 2, bottom: 2, left: 2 },
        style: "solid",
      },
      background: "rgba(0,0,0,0.05)",
    },
    selected: selectedState = {
      textColor: "#000000",
      border: {
        color: "#000000",
        width: { top: 2, right: 2, bottom: 2, left: 2 },
        style: "solid",
      },
      background: "rgba(255, 255, 255, 0)",
    },
  } = props; // Component instance tracking with global registry
  const componentId = React.useRef(
    `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  ).current;
  const componentRef = React.useRef(null);
  const mountedRef = React.useRef(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(false);
  const isCheckedRef = React.useRef(false); // Generate a normalized property name for URL parameters
  const normalizedProperty = React.useMemo(() => {
    // Convert legacy Shopify property names to the format used in URL parameters
    if (filterType === "cms") {
      return "cms"; // CMS filters are handled differently
    }
    const mapping = {
      "product-type": "product_type",
      "product-tag": "product_tag",
      "on-sale": "on_sale",
      "in-stock": "in_stock",
      bundles: "bundle",
      subscriptions: "subscription",
      variant: "variant",
      price: "price",
      discount:
        discountType === "Percent" ? "discount_percent" : "discount_amount",
    };
    return mapping[property] || property;
  }, [property, filterType, discountType]); // Helper function to consistently get filter value - rewritten to use utility
  const getFilterValueForComponent = React.useCallback(() => {
    try {
      if (filterType === "cms") {
        return { title: cmsTitle, value: cmsValue, type: "cms" };
      } // Convert property names to normalized format
      const normalizedProp = normalizedProperty; // For variants, construct a variant filter object
      if (property === "variant") {
        return { name: variantTitle, value: variantValue };
      } // Handle specific price filters
      if (property === "price") {
        const values = [];
        if (priceType === "Under") {
          values.push({ priceType, min: null, max: priceThreshold });
        }
        if (priceType === "Over") {
          values.push({ priceType, min: priceOver, max: null });
        }
        if (priceType === "Range") {
          values.push({ priceType, min: priceLow, max: priceHigh });
        } //console.log("values for ranges, priceType", values, priceType)
        return { values };
      } // Handle discount filters
      if (property === "discount") {
        const discountProperty =
          discountType === "Percent" ? "discount_percent" : "discount_amount"; // Create values array with the current range
        const values = [
          {
            min: discountValueType === "Over" ? discountThreshold : discountLow,
            max: discountValueType === "Over" ? null : discountHigh,
          },
        ];
        return { type: discountProperty, values: values };
      } // For boolean filters
      if (
        ["on-sale", "in-stock", "bundles", "subscriptions"].includes(property)
      ) {
        return true;
      } // For collection, product-type, product-tag, return the value
      return value;
    } catch (error) {
      console.error("Error getting filter value:", error);
      return "";
    }
  }, [
    filterType,
    property,
    value,
    priceType,
    priceThreshold,
    priceLow,
    priceHigh,
    discountType,
    discountValueType,
    discountThreshold,
    discountLow,
    discountHigh,
    variantTitle,
    variantValue,
    cmsTitle,
    cmsValue,
    normalizedProperty,
  ]); // Helper function to check if this filter is active in URL
  const checkUrlState = React.useCallback(() => {
    try {
      if (typeof window === "undefined") return false;
      const url = new URL(window.location.href);
      const filterValue = getFilterValueForComponent();
      logDebug("FilterCheckbox", "Checking URL state", {
        filterType,
        property,
        normalizedProperty,
        filterValue,
        url: url.toString(),
      });
      if (filterType === "cms") {
        // For CMS filtering, check for cms-filter parameter
        try {
          const cmsFilters = JSON.parse(
            url.searchParams.get("cms-filter") || "[]"
          );
          return cmsFilters.some(
            (f) => f.title === cmsTitle && f.value === cmsValue
          );
        } catch (e) {
          console.error("Error parsing CMS filters from URL:", e);
          return false;
        }
      } // Use the parsed URL filters from the utility function
      const parsedFilters = parseUrlFilters(url.searchParams); // console.log("parsedFilters", parsedFilters)
      // Check if this filter is active based on property type
      switch (property) {
        case "collection":
        case "product-type":
        case "product-tag": {
          const normalized = convertFilterName(property);
          return (
            parsedFilters[normalized]?.active &&
            parsedFilters[normalized].values.includes(filterValue)
          );
        }
        case "variant": {
          if (!parsedFilters.variant?.active) return false; // Check if our specific variant option/value combo is active
          return parsedFilters.variant.values.some(
            (v) => v.name === variantTitle && v.value === variantValue
          );
        }
        case "price": {
          if (!parsedFilters.price?.active) return false; // console.log("parsedFilters.price", parsedFilters.price)
          // console.log("filterValue", filterValue)
          const range = filterValue.values[0];
          if (range.priceType === "Under") {
            // For "Under" type, check price_max parameter
            const maxValues =
              url.searchParams.get("price_max")?.split(",").map(Number) || [];
            return maxValues.includes(range.max);
          } else if (range.priceType === "Over") {
            // For "Over" type, check price_min parameter
            const minValues =
              url.searchParams.get("price_min")?.split(",").map(Number) || [];
            return minValues.includes(range.min);
          } else {
            // For regular ranges, check price parameter
            const urlRanges =
              url.searchParams.get("price")?.split(",").filter(Boolean) || [];
            const currentRange = `${range.min}-${range.max}`;
            return urlRanges.includes(currentRange);
          }
        }
        case "discount": {
          // Determine discount type (percent vs amount)
          const discountProperty =
            discountType === "Percent" ? "discount_percent" : "discount_amount";
          if (!parsedFilters[discountProperty]?.active) return false; // Get the current range we're checking for
          const currentRange = {
            min: discountValueType === "Over" ? discountThreshold : discountLow,
            max: discountValueType === "Over" ? null : discountHigh,
          }; // Check if this range exists in the values array
          if (parsedFilters[discountProperty].values) {
            return parsedFilters[discountProperty].values.some(
              (range) =>
                range.min === currentRange.min && range.max === currentRange.max
            );
          } // Check min values if it's an "Over" type
          if (
            discountValueType === "Over" &&
            parsedFilters[discountProperty].min
          ) {
            return parsedFilters[discountProperty].min.includes(
              discountThreshold
            );
          }
          return false;
        }
        case "on-sale":
        case "in-stock":
        case "bundles":
        case "subscriptions": {
          const normalized = convertFilterName(property);
          return parsedFilters[normalized]?.active;
        }
        default:
          return false;
      }
    } catch (error) {
      console.error("Error checking URL state:", error);
      return false;
    }
  }, [
    filterType,
    property,
    normalizedProperty,
    getFilterValueForComponent,
    variantTitle,
    variantValue,
    cmsTitle,
    cmsValue,
    priceType,
    priceThreshold,
    priceLow,
    priceHigh,
    discountType,
    discountValueType,
    discountThreshold,
    discountLow,
    discountHigh,
  ]); // Dispatch filter change event
  const dispatchFilterChange = React.useCallback(
    (active) => {
      try {
        logDebug("FilterCheckbox", "Dispatching filter change", {
          componentId,
          property,
          normalizedProperty,
          active,
        });
        const filterValue = getFilterValueForComponent();
        const url = new URL(window.location.href); // Get existing parsed filters
        const filters = parseUrlFilters(url.searchParams); // Update URL parameters based on filter type and state
        if (filterType === "cms") {
          // For CMS filtering, use a JSON array stored in cms-filter param
          try {
            const cmsFilters = JSON.parse(
              url.searchParams.get("cms-filter") || "[]"
            );
            if (active) {
              // Only add if not already present
              if (
                !cmsFilters.some(
                  (f) => f.title === cmsTitle && f.value === cmsValue
                )
              ) {
                cmsFilters.push({
                  title: cmsTitle,
                  value: cmsValue,
                  type: "cms",
                });
                url.searchParams.set("cms-filter", JSON.stringify(cmsFilters));
                logDebug("FilterCheckbox", "Added CMS filter to URL", {
                  title: cmsTitle,
                  value: cmsValue,
                  filterCount: cmsFilters.length,
                });
              }
            } else {
              // Remove this CMS filter from the array
              const filteredCmsFilters = cmsFilters.filter(
                (f) => !(f.title === cmsTitle && f.value === cmsValue)
              );
              if (filteredCmsFilters.length > 0) {
                url.searchParams.set(
                  "cms-filter",
                  JSON.stringify(filteredCmsFilters)
                );
              } else {
                url.searchParams.delete("cms-filter");
              }
              logDebug("FilterCheckbox", "Removed CMS filter from URL", {
                title: cmsTitle,
                value: cmsValue,
                remainingFilters: filteredCmsFilters.length,
              });
            }
          } catch (e) {
            console.error("Error updating CMS filters in URL:", e);
          }
        } else {
          // Update filters based on property type
          switch (property) {
            case "collection":
            case "product-type":
            case "product-tag": {
              const normalized = convertFilterName(property);
              if (active) {
                // Add value to filter
                if (!filters[normalized]) {
                  filters[normalized] = { active: true, values: [] };
                }
                if (!filters[normalized].values.includes(filterValue)) {
                  filters[normalized].values.push(filterValue);
                }
                filters[normalized].active = true;
              } else {
                // Remove value from filter
                if (filters[normalized] && filters[normalized].values) {
                  filters[normalized].values = filters[
                    normalized
                  ].values.filter((v) => v !== filterValue);
                  filters[normalized].active =
                    filters[normalized].values.length > 0;
                }
              }
              break;
            }
            case "variant": {
              if (active) {
                // Initialize variant filter if needed
                if (!filters.variant) {
                  // filters.variant = { active: true, values: [] };
                  filters.variant = { active: true, values: [] };
                } // Add variant if not already present
                const existing = filters.variant.values.some(
                  (v) => v.name === variantTitle && v.value === variantValue
                );
                if (!existing) {
                  filters.variant.values.push({
                    name: variantTitle,
                    value: variantValue,
                  });
                } // Ensure active state is correctly set
                filters.variant.active = filters.variant.values.length > 0; // Check if there are existing values in the URL for this variant
                const urlKey = `variant_${variantTitle}`;
                if (url.searchParams.has(urlKey)) {
                  const existingValuesStr = url.searchParams.get(urlKey);
                  if (existingValuesStr) {
                    // First decode the value to properly handle URL encoding
                    const decodedValues = decodeURIComponent(existingValuesStr);
                    const existingValues = decodedValues
                      .split(",")
                      .filter(Boolean); // Check if the value already exists (case-insensitive)
                    const valueExists = existingValues.some(
                      (v) => v.toLowerCase() === variantValue.toLowerCase()
                    );
                    if (!valueExists) {
                      // Add this value to the existing comma-separated list
                      existingValues.push(variantValue); // Update the URL parameter with the combined list - don't encode, as URLSearchParams does that
                      url.searchParams.set(urlKey, existingValues.join(",")); // console.log(
                      //     `🔎 [FilterCheckbox] Updated variant parameter ${urlKey}:`,
                      //     {
                      //         rawValue:
                      //             existingValues.join(
                      //                 ","
                      //             ),
                      //         existingValues,
                      //     }
                      // )
                    }
                  }
                } else {
                  // Set the single value
                  url.searchParams.set(urlKey, variantValue);
                }
              } else {
                // Remove variant if present
                if (filters.variant && filters.variant.values) {
                  filters.variant.values = filters.variant.values.filter(
                    (v) =>
                      !(v.name === variantTitle && v.value === variantValue)
                  ); // console.log(
                  //     "filters.variant.values",
                  //     filters.variant.values
                  // )
                  if (filters.variant.values.length > 0) {
                    filters.variant.active = true;
                  } // Update URL parameter
                  const urlKey = `variant_${variantTitle}`;
                  if (url.searchParams.has(urlKey)) {
                    const existingValuesStr = url.searchParams.get(urlKey);
                    if (existingValuesStr) {
                      const existingValues = existingValuesStr
                        .split(",")
                        .filter(Boolean);
                      const updatedValues = existingValues.filter(
                        (v) => v !== variantValue
                      ); // console.log(
                      //     "updatedValues",
                      //     updatedValues
                      // )
                      if (updatedValues.length > 0) {
                        url.searchParams.set(urlKey, updatedValues.join(",")); // console.log(
                        //     `🔎 [FilterCheckbox] Updated variant parameter ${urlKey}:`,
                        //     updatedValues.join(",")
                        // )
                      } else {
                        url.searchParams.delete(urlKey); // console.log(
                        //     `🔎 [FilterCheckbox] Removed empty variant parameter ${urlKey}`
                        // )
                      }
                    }
                  }
                }
              }
              break;
            }
            case "price": {
              const range = filterValue.values[0]; // console.log("range", range)
              // Check if the filter is for "Under" or regular range
              if (range.priceType === "Under") {
                // Handle "Under" price ranges
                const maxValues =
                  url.searchParams.get("price_max")?.split(",").map(Number) ||
                  [];
                if (active) {
                  if (!maxValues.includes(range.max)) {
                    maxValues.push(range.max);
                  }
                } else {
                  const index = maxValues.indexOf(range.max);
                  if (index > -1) {
                    maxValues.splice(index, 1);
                  }
                }
                if (maxValues.length > 0) {
                  url.searchParams.set("price_max", maxValues.join(","));
                } else {
                  url.searchParams.delete("price_max");
                }
              } else if (range.priceType === "Over") {
                // Handle "Over" price ranges
                const minValues =
                  url.searchParams.get("price_min")?.split(",").map(Number) ||
                  [];
                if (active) {
                  if (!minValues.includes(range.min)) {
                    minValues.push(range.min);
                  }
                } else {
                  const index = minValues.indexOf(range.min);
                  if (index > -1) {
                    minValues.splice(index, 1);
                  }
                }
                if (minValues.length > 0) {
                  url.searchParams.set("price_min", minValues.join(","));
                } else {
                  url.searchParams.delete("price_min");
                }
              } else {
                // Handle regular price ranges
                const ranges =
                  url.searchParams.get("price")?.split(",").filter(Boolean) ||
                  [];
                const currentRange = `${range.min}-${range.max}`;
                if (active) {
                  if (!ranges.includes(currentRange)) {
                    ranges.push(currentRange);
                  }
                } else {
                  const index = ranges.indexOf(currentRange);
                  if (index > -1) {
                    ranges.splice(index, 1);
                  }
                }
                if (ranges.length > 0) {
                  url.searchParams.set("price", ranges.join(","));
                } else {
                  url.searchParams.delete("price");
                }
              } // Set price filter values with multiple ranges
              filters.price = { active: false, values: [] }; // Add regular ranges
              const regularRanges =
                url.searchParams.get("price")?.split(",").filter(Boolean) || [];
              if (regularRanges.length > 0) {
                filters.price.values.push(
                  ...regularRanges.map((range) => {
                    const [min, max] = range.split("-").map(Number);
                    return {
                      min: isNaN(min) ? null : min,
                      max: isNaN(max) ? null : max,
                      priceType: "Range",
                    };
                  })
                );
              } // Add "Under" ranges
              const underMaxValues =
                url.searchParams.get("price_max")?.split(",").map(Number) || [];
              if (underMaxValues.length > 0) {
                filters.price.values.push(
                  ...underMaxValues.map((max) => ({
                    min: null,
                    max,
                    priceType: "Under",
                  }))
                );
              }
              const minValues =
                url.searchParams.get("price_min")?.split(",").map(Number) || [];
              if (minValues.length > 0) {
                filters.price.values.push(
                  ...minValues.map((min) => ({
                    min,
                    max: null,
                    priceType: "Over",
                  }))
                );
              } // Update active state based on whether we have any ranges
              filters.price.active = filters.price.values.length > 0;
              break;
            }
            case "discount": {
              // Determine discount type (percent vs amount)
              const discountProperty =
                discountType === "Percent"
                  ? "discount_percent"
                  : "discount_amount";
              if (active) {
                // Add the new range to the existing values
                const newRange = {
                  min:
                    discountValueType === "Over"
                      ? discountThreshold
                      : discountLow,
                  max: discountValueType === "Over" ? null : discountHigh,
                };
                if (!filters[discountProperty]) {
                  filters[discountProperty] = { active: true, values: [] };
                }
                filters[discountProperty].values.push(newRange);
                filters[discountProperty].active = true; // Ensure active state is set
              } else {
                // Logic to remove the range if it exists
                if (filters[discountProperty]) {
                  const rangeToRemove = {
                    min:
                      discountValueType === "Over"
                        ? discountThreshold
                        : discountLow,
                    max: discountValueType === "Over" ? null : discountHigh,
                  };
                  filters[discountProperty].values = filters[
                    discountProperty
                  ].values.filter(
                    (range) =>
                      !(
                        range.min === rangeToRemove.min &&
                        range.max === rangeToRemove.max
                      )
                  );
                  filters[discountProperty].active =
                    filters[discountProperty].values.length > 0;
                }
              }
              break;
            }
            case "on-sale":
            case "in-stock":
            case "bundles":
            case "subscriptions": {
              const normalized = convertFilterName(property);
              if (active) {
                filters[normalized] = { active: true, value: true };
              } else {
                filters[normalized] = { active: false, value: true };
              }
              break;
            }
          } // console.log(
          //     "Updating url with price range filters",
          //     filters,
          //     url
          // )
          // Update URL with all current filters
          updateUrlWithFilters(filters, url); // Add logging to track filter state and URL updates
          // console.log("🔄 [FilterCheckbox] Current filters:", filters)
          // console.log(
          //     "🔄 [FilterCheckbox] Current URL:",
          //     url.toString()
          // )
        } // Update URL without reloading the page
        window.history.pushState({}, "", url.toString()); // Determine the event type to dispatch based on filter property
        const eventType = filterType === "cms" ? "cms" : normalizedProperty; // Dispatch the filter-navigation event so other components are notified
        const navigationEvent = new CustomEvent("filter-navigation", {
          detail: { filters, sourceComponentId: componentId },
        });
        document.dispatchEvent(navigationEvent); // Create event type that matches what GlobalCMS expects
        // For variants, we need to use variant_OPTIONNAME format
        let dispatchEventType = eventType;
        let dispatchValue = filterValue;
        if (property === "variant") {
          dispatchEventType = `variant_${variantTitle}`;
          if (!active) {
            dispatchValue = variantValue;
          } else {
            // For variants, use the current URL parameter value which has all selected options
            const urlKey = `variant_${variantTitle}`;
            if (url.searchParams.has(urlKey)) {
              const urlValue = url.searchParams.get(urlKey);
              if (urlValue) {
                // Decode the URL parameter to handle URL encoding
                const decodedValue = decodeURIComponent(urlValue); // console.log(
                //     `🔎 [FilterCheckbox] Using URL value for dispatch:`,
                //     {
                //         urlKey,
                //         urlValue,
                //         decodedValue,
                //     }
                // )
                dispatchValue = decodedValue; // Use the decoded value
              } else {
                dispatchValue = variantValue;
              }
            } else {
              dispatchValue = variantValue;
            }
          }
        } // Dispatch the legacy filter change event for compatibility with GlobalCMS
        const legacyEvent = new CustomEvent("product-filter-change", {
          detail: {
            type: dispatchEventType,
            group: property === "variant" ? variantTitle : undefined,
            active,
            value: dispatchValue,
            componentId: componentId,
            filterType: filterType,
            variantStockFilter:
              property === "variant" ? variantStockFilter : undefined,
          },
        });
        document.dispatchEvent(legacyEvent); // console.log(
        //     "🔎 [FilterCheckbox] Filter change event dispatched",
        //     {
        //         eventType: dispatchEventType,
        //         property,
        //         active,
        //         value: dispatchValue,
        //         filters,
        //     }
        // )
        logDebug("FilterCheckbox", "Filter change events dispatched", {
          componentId,
          property,
          active,
          url: url.toString(),
        });
      } catch (error) {
        console.error("Error dispatching filter change:", error);
      }
    },
    [
      componentId,
      property,
      normalizedProperty,
      variantTitle,
      variantValue,
      getFilterValueForComponent,
      filterType,
      cmsTitle,
      cmsValue,
      priceType,
      priceThreshold,
      priceLow,
      priceHigh,
      discountType,
      discountValueType,
      discountThreshold,
      discountLow,
      discountHigh,
      variantStockFilter,
    ]
  ); // Listen for URL changes
  React.useEffect(() => {
    if (!mountedRef.current) return;
    const handleUrlChange = (event) => {
      // console.log("handleUrlChange", event)
      // console.log("🔙 [Navigation] Event detected:", {
      //     type: event?.type,
      //     isBackButton,
      //     isFilterChanged,
      //     url: currentUrl,
      //     source: eventSource,
      // })
      // Get the current state from URL and compare with current state
      const newState = checkUrlState();
      const currentState = isCheckedRef.current; // console.log("🔙 [Navigation] State comparison:", {
      //     currentState,
      //     newState,
      //     stateChanged: newState !== currentState,
      //     componentId,
      // })
      // Always update on back button
      if (newState !== currentState) {
        // console.log("🔙 [Navigation] Updating state:", {
        //     from: currentState,
        //     to: newState,
        //     reason: isBackButton ? "back_button" : "state_change",
        //     componentId,
        // })
        setIsChecked(newState);
        isCheckedRef.current = newState;
      }
    }; // Separate handler specifically for popstate
    const handlePopState = (event) => {
      const currentPath = window.location.pathname;
      const urlHandle = currentPath.split("/").filter(Boolean).pop(); // Determine if current URL is a product page
      const isProductPage =
        window.shopXtools?.products && Array.isArray(window.shopXtools.products)
          ? window.shopXtools.products.some(
              ({ node }) => node.handle === urlHandle
            )
          : false; // If navigating to/from product page, don't interfere - let Framer handle it
      if (isProductPage) {
        return;
      } // Only handle state updates for catalog pages
      const newState = checkUrlState();
      setIsChecked(newState);
      isCheckedRef.current = newState; // Don't reload - let CatalogDisplay handle the navigation
      // This prevents blank pages and race conditions
    }; //console.log('🔙 [Navigation] Setting up event handlers for component:', componentId);
    // Initial URL check
    handleUrlChange({}); // Add event listeners
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("filter-navigation", handleUrlChange);
    return () => {
      if (!mountedRef.current) return; // console.log(
      //     "🔙 [Navigation] Cleaning up event handlers for component:",
      //     componentId
      // )
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("filter-navigation", handleUrlChange);
    };
  }, [componentId, checkUrlState]); // Handle filter change
  const handleChange = React.useCallback(() => {
    try {
      const newState = !isCheckedRef.current;
      logDebug("FilterCheckbox", "Filter clicked", {
        componentId,
        property,
        currentState: isCheckedRef.current,
        newState,
      }); // Update internal state first to prevent flicker
      setIsChecked(newState);
      isCheckedRef.current = newState; // Then dispatch event to update URL and notify other components
      dispatchFilterChange(newState);
    } catch (error) {
      console.error("Error handling filter change:", error);
    }
  }, [dispatchFilterChange, componentId, property]); // Register instance
  React.useEffect(() => {
    if (!componentRef.current) return;
    try {
      // Register this instance
      globalFilterState.instances.add(componentId);
      componentRef.current.setAttribute("data-filter-id", componentId);
      logDebug("FilterCheckbox", "Component registered", {
        componentId,
        property,
        filterType,
      }); // Cleanup on unmount
      return () => {
        mountedRef.current = false;
        globalFilterState.instances.delete(componentId);
        logDebug("FilterCheckbox", "Component unregistered", { componentId });
        if (globalFilterState.instances.size === 0) {
          globalFilterState.cleanup();
        }
      };
    } catch (error) {
      console.error("Error registering filter component:", error);
    }
  }, [componentId, property, filterType]); // Initialize with shopXtools data and event listeners
  React.useEffect(() => {
    if (!mountedRef.current) return;
    try {
      // Initialize from URL parameters if they exist
      logDebug("FilterCheckbox", "Initializing component from URL", {
        componentId,
        url: typeof window !== "undefined" ? window.location.href : null,
      }); // Handle filter reset events
      const handleFilterReset = (e) => {
        logDebug("FilterCheckbox", "Filter reset event received", {
          componentId,
        });
        setIsChecked(false);
        isCheckedRef.current = false;
      }; // Handle filter change events
      const handleFilterChange = (e) => {
        // Skip events from this component
        if (e.detail.componentId === componentId) return; // Handle CMS vs regular filters
        if (filterType === "cms" && e.detail.type === "cms") {
          // Check if this specific CMS filter was toggled
          if (
            e.detail.value?.title === cmsTitle &&
            e.detail.value?.value === cmsValue
          ) {
            logDebug("FilterCheckbox", "CMS filter change received", {
              componentId,
              title: cmsTitle,
              value: cmsValue,
              active: e.detail.active,
            });
            setIsChecked(e.detail.active);
            isCheckedRef.current = e.detail.active;
          }
        } else if (filterType === "shopify") {
          // Check if this specific property was toggled
          const filterProperty = convertFilterName(property);
          const eventProperty = convertFilterName(e.detail.type);
          if (filterProperty === eventProperty) {
            // For regular properties like on_sale, in_stock, etc.
            if (
              ![
                "variant",
                "price",
                "discount_amount",
                "discount_percent",
              ].includes(filterProperty)
            ) {
              // For value-based filters, check if values match
              if (
                ["collection", "product_type", "product_tag"].includes(
                  filterProperty
                )
              ) {
                if (e.detail.value === value) {
                  logDebug(
                    "FilterCheckbox",
                    "Filter change for value received",
                    {
                      componentId,
                      property: filterProperty,
                      value,
                      active: e.detail.active,
                    }
                  );
                  setIsChecked(e.detail.active);
                  isCheckedRef.current = e.detail.active;
                }
              } else {
                logDebug("FilterCheckbox", "Boolean filter change received", {
                  componentId,
                  property: filterProperty,
                  active: e.detail.active,
                });
                setIsChecked(e.detail.active);
                isCheckedRef.current = e.detail.active;
              }
            } else if (
              filterProperty === "variant" &&
              e.detail.group === variantTitle &&
              e.detail.value?.optionValue === variantValue
            ) {
              logDebug("FilterCheckbox", "Variant filter change received", {
                componentId,
                variantTitle,
                variantValue,
                active: e.detail.active,
              });
              setIsChecked(e.detail.active);
              isCheckedRef.current = e.detail.active;
            } else if (
              ["price", "discount_amount", "discount_percent"].includes(
                filterProperty
              )
            ) {
              // Compare values to see if this specific filter was toggled
              const myFilterValue = getFilterValueForComponent(); // Skip if we can't properly compare
              if (!myFilterValue || !e.detail.value) return;
              const valuesMatch =
                JSON.stringify(myFilterValue) ===
                JSON.stringify(e.detail.value);
              if (valuesMatch) {
                logDebug(
                  "FilterCheckbox",
                  "Price/discount filter change received",
                  {
                    componentId,
                    property: filterProperty,
                    value: myFilterValue,
                    active: e.detail.active,
                  }
                );
                setIsChecked(e.detail.active);
                isCheckedRef.current = e.detail.active;
              }
            }
          }
        }
      }; // Register event listeners
      const events = [
        { name: "filter-reset", handler: handleFilterReset },
        { name: "product-filter-change", handler: handleFilterChange },
      ]; // Add all event listeners
      events.forEach(({ name, handler }) => {
        document.addEventListener(name, handler);
        logDebug("FilterCheckbox", `Added event listener: ${name}`, {
          componentId,
        });
      }); // Cleanup
      return () => {
        if (!mountedRef.current) return;
        events.forEach(({ name, handler }) => {
          document.removeEventListener(name, handler);
        });
        logDebug("FilterCheckbox", "Removed event listeners", { componentId });
      };
    } catch (error) {
      console.error("Error initializing filter:", error);
    }
  }, [
    componentId,
    property,
    getFilterValueForComponent,
    variantTitle,
    variantValue,
    cmsTitle,
    cmsValue,
    filterType,
    normalizedProperty,
    value,
  ]); // Keyboard handler for accessibility
  const handleKeyDown = React.useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleChange();
      }
    },
    [handleChange]
  ); // Text display logic - generate human-readable text
  const getDisplayText = React.useCallback(() => {
    try {
      if (filterType === "cms") {
        return displayText || `${cmsTitle}: ${cmsValue}`;
      }
      switch (property) {
        case "variant":
          return variantDisplayText || variantValue;
        case "price":
          if (priceType === "Under") {
            return `Under $${priceThreshold}`;
          }
          return `$${priceLow} - $${priceHigh}`;
        case "discount":
          const unit = discountType === "Percent" ? "%" : "$";
          if (discountValueType === "Over") {
            return `Over ${discountThreshold}${unit} Off`;
          }
          return `${discountLow}${unit} - ${discountHigh}${unit} Off`;
        case "on-sale":
          return displayText || "On Sale";
        case "in-stock":
          return displayText || "In Stock";
        case "subscriptions":
          return displayText || "Subscriptions";
        default:
          return displayText || value || "";
      }
    } catch (error) {
      console.error("Error generating display text:", error);
      return displayText || value || "";
    }
  }, [
    filterType,
    cmsTitle,
    cmsValue,
    property,
    displayText,
    value,
    variantValue,
    variantDisplayText,
    priceType,
    priceThreshold,
    priceLow,
    priceHigh,
    discountType,
    discountValueType,
    discountThreshold,
    discountLow,
    discountHigh,
  ]); // Style objects with memoization
  const getRadiusStyle = React.useCallback(() => {
    try {
      if (radiusPerSide) {
        return `${radiusTopLeft}px ${radiusTopRight}px ${radiusBottomRight}px ${radiusBottomLeft}px`;
      }
      return `${radius}px`;
    } catch (error) {
      console.error("Error generating radius style:", error);
      return `${radius}px`;
    }
  }, [
    radius,
    radiusPerSide,
    radiusTopLeft,
    radiusTopRight,
    radiusBottomRight,
    radiusBottomLeft,
  ]); // Helper function to generate border style
  const getBorderStyle = (borderConfig) => {
    if (borderConfig.isMixed) {
      return {
        borderTop: `${borderConfig.top}px ${borderConfig.style} ${borderConfig.color}`,
        borderRight: `${borderConfig.right}px ${borderConfig.style} ${borderConfig.color}`,
        borderBottom: `${borderConfig.bottom}px ${borderConfig.style} ${borderConfig.color}`,
        borderLeft: `${borderConfig.left}px ${borderConfig.style} ${borderConfig.color}`,
      };
    }
    return {
      border: `${borderConfig.width}px ${borderConfig.style} ${borderConfig.color}`,
    };
  }; // Helper function to generate hover border style
  const getHoverBorderStyle = (borderConfig) => {
    if (borderConfig.isMixed) {
      return {
        borderTop: `${borderConfig.top}px ${borderConfig.style} ${borderConfig.color}`,
        borderRight: `${borderConfig.right}px ${borderConfig.style} ${borderConfig.color}`,
        borderBottom: `${borderConfig.bottom}px ${borderConfig.style} ${borderConfig.color}`,
        borderLeft: `${borderConfig.left}px ${borderConfig.style} ${borderConfig.color}`,
      };
    }
    return {
      border: `${borderConfig.width}px ${borderConfig.style} ${borderConfig.color}`,
    };
  }; // Helper function to generate selected border style
  const getSelectedBorderStyle = (borderConfig) => {
    if (borderConfig.isMixed) {
      return {
        borderTop: `${borderConfig.top}px ${borderConfig.style} ${borderConfig.color}`,
        borderRight: `${borderConfig.right}px ${borderConfig.style} ${borderConfig.color}`,
        borderBottom: `${borderConfig.bottom}px ${borderConfig.style} ${borderConfig.color}`,
        borderLeft: `${borderConfig.left}px ${borderConfig.style} ${borderConfig.color}`,
      };
    }
    return {
      border: `${borderConfig.width}px ${borderConfig.style} ${borderConfig.color}`,
    };
  };
  const containerStyle = React.useMemo(() => {
    try {
      const state = isChecked
        ? selectedState
        : isHovered
        ? hoverState
        : defaultState;
      return {
        display: "flex",
        flexDirection: props.style?.stacked === "vertical" ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        position: "relative",
        boxSizing: "border-box",
        padding: paddingPerSide
          ? `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`
          : `${padding}px`,
        ...(props.style?.type === "button" && {
          ...(isChecked
            ? getSelectedBorderStyle(selectedState.border)
            : isHovered
            ? getHoverBorderStyle(hoverState.border)
            : getBorderStyle(defaultState.border)),
          background: state.background,
          borderRadius: getRadiusStyle(),
        }),
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        overflow: "hidden",
        flexShrink: 0,
        flexGrow: 0,
      };
    } catch (error) {
      console.error("Error generating container style:", error);
      return {
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        boxSizing: "border-box",
      };
    }
  }, [
    props.style?.type,
    props.style?.stacked,
    padding,
    paddingPerSide,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    getRadiusStyle,
    isHovered,
    isChecked,
    defaultState,
    hoverState,
    selectedState,
  ]);
  const textStyle = React.useMemo(
    () => ({
      margin: 0,
      padding: 0,
      ...font,
      color: isChecked
        ? selectedState.textColor
        : isHovered
        ? hoverState.textColor
        : defaultState.textColor,
      display: "block",
      width: "100%",
      userSelect: "none",
      marginLeft:
        props.style?.type !== "button" && props.style?.stacked !== "vertical"
          ? gap
          : 0,
      marginTop:
        props.style?.type !== "button" && props.style?.stacked === "vertical"
          ? gap
          : 0,
      textAlign: font.textAlign || "left",
      transition: "color 0.2s ease-in-out",
      justifyContent:
        font.textAlign === "center"
          ? "center"
          : font.textAlign === "right"
          ? "flex-end"
          : "flex-start",
      alignItems: "center",
    }),
    [
      font,
      defaultState.textColor,
      hoverState.textColor,
      selectedState.textColor,
      isChecked,
      isHovered,
      props.style?.type,
      props.style?.stacked,
      gap,
    ]
  );
  const checkboxStyle = React.useMemo(() => {
    try {
      const state = isChecked
        ? selectedState
        : isHovered
        ? hoverState
        : defaultState;
      return {
        width: width,
        height: height,
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        display: props.style?.type === "checkbox" ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: getRadiusStyle(),
        flexShrink: 0,
        ...(isChecked
          ? getSelectedBorderStyle(selectedState.border)
          : isHovered
          ? getHoverBorderStyle(hoverState.border)
          : getBorderStyle(defaultState.border)),
        background: state.background,
      };
    } catch (error) {
      console.error("Error generating checkbox style:", error);
      return {
        width: width,
        height: height,
        display: props.style?.type === "checkbox" ? "flex" : "none",
      };
    }
  }, [
    width,
    height,
    getRadiusStyle,
    isHovered,
    isChecked,
    defaultState,
    hoverState,
    selectedState,
    props.style?.type,
  ]);
  const renderIcon = React.useCallback(() => {
    try {
      const showPreview =
        props.style?.icon?.preview && RenderTarget.current() === "CANVAS";
      if ((!isChecked && !showPreview) || props.style?.type !== "checkbox")
        return null;
      if (iconType === "custom" && customIcon) {
        return /*#__PURE__*/ _jsx("img", {
          src: customIcon,
          width: iconSize,
          height: iconSize,
          style: { objectFit: "contain" },
          alt: "Custom checkbox icon",
        });
      } // Default checkmark with precise stroke width
      const lineCap = iconEdge === "round" ? "round" : "square";
      const lineJoin = iconEdge === "round" ? "round" : "miter";
      const strokeWidth = Math.max(1, Math.min(4, iconWeight)); // Ensure stroke width is between 1-4px
      return /*#__PURE__*/ _jsx("svg", {
        width: iconSize,
        height: iconSize,
        viewBox: "0 0 12 12",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        "aria-hidden": "true",
        style: {
          shapeRendering: "crispEdges",
          strokeWidth: `${strokeWidth}px`,
        },
        children: /*#__PURE__*/ _jsx("path", {
          d: "M10 3L4.5 8.5L2 6",
          stroke: iconColor,
          strokeWidth: strokeWidth,
          strokeLinecap: lineCap,
          strokeLinejoin: lineJoin,
        }),
      });
    } catch (error) {
      console.error("Error rendering icon:", error);
      return null;
    }
  }, [
    isChecked,
    props.style?.type,
    props.style?.icon?.preview,
    iconType,
    customIcon,
    iconSize,
    iconEdge,
    iconColor,
    iconWeight,
  ]);
  const renderSwatch = React.useCallback(() => {
    try {
      const state = isChecked
        ? selectedState
        : isHovered
        ? hoverState
        : defaultState;
      const borderConfig = state.border;
      const containerRadius = radiusPerSide
        ? `${radiusTopLeft}px ${radiusTopRight}px ${radiusBottomRight}px ${radiusBottomLeft}px`
        : `${radius}px`; // Handle both single and per-side border widths
      const borderTop = borderConfig.width.isMixed
        ? borderConfig.width.top
        : borderConfig.width.defaultValue ?? 1;
      const borderRight = borderConfig.width.isMixed
        ? borderConfig.width.right
        : borderConfig.width.defaultValue ?? 1;
      const borderBottom = borderConfig.width.isMixed
        ? borderConfig.width.bottom
        : borderConfig.width.defaultValue ?? 1;
      const borderLeft = borderConfig.width.isMixed
        ? borderConfig.width.left
        : borderConfig.width.defaultValue ?? 1; // Calculate inner dimensions accounting for border width and space
      const totalBorderWidth = borderLeft + borderRight;
      const totalBorderHeight = borderTop + borderBottom;
      const totalSpace = swatchBorder * 2;
      const innerWidth = Math.max(0, width - totalBorderWidth - totalSpace);
      const innerHeight = Math.max(0, height - totalBorderHeight - totalSpace); // Calculate inner radius accounting for border width and space
      const innerRadius = radiusPerSide
        ? `${Math.max(
            0,
            radiusTopLeft - swatchBorder - borderTop
          )}px ${Math.max(
            0,
            radiusTopRight - swatchBorder - borderRight
          )}px ${Math.max(
            0,
            radiusBottomRight - swatchBorder - borderBottom
          )}px ${Math.max(0, radiusBottomLeft - swatchBorder - borderLeft)}px`
        : `${Math.max(0, radius - swatchBorder - borderTop)}px`; // Use borderTop for uniform radius calculation
      const containerBorderStyle = {
        borderTop: `${borderTop}px ${borderConfig.style} ${borderConfig.color}`,
        borderRight: `${borderRight}px ${borderConfig.style} ${borderConfig.color}`,
        borderBottom: `${borderBottom}px ${borderConfig.style} ${borderConfig.color}`,
        borderLeft: `${borderLeft}px ${borderConfig.style} ${borderConfig.color}`,
      };
      if (swatchType === "image" && swatchImage) {
        return /*#__PURE__*/ _jsx("div", {
          style: {
            width: width,
            height: height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: containerRadius,
            ...containerBorderStyle,
            background: state.background,
            boxSizing: "border-box",
            flexShrink: 0,
            transition: "all 0.2s ease-in-out",
            overflow: "hidden",
            position: "relative",
          },
          children: /*#__PURE__*/ _jsx("div", {
            style: {
              width: innerWidth,
              height: innerHeight,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: innerRadius,
              overflow: "hidden",
            },
            children: /*#__PURE__*/ _jsx("img", {
              src: swatchImage,
              alt: `Swatch for ${getDisplayText()}`,
              style: { width: "100%", height: "100%", objectFit: "cover" },
            }),
          }),
        });
      } // Get the color based on type
      let color = swatchColor;
      if (
        swatchType === "color" &&
        props.style?.swatchColorType === "dynamic"
      ) {
        // In canvas preview, use the specified color
        if (RenderTarget.current() === "CANVAS") {
          color = "#8A8A8A";
        } else {
          // In browser, try to get the color from window.__FcCheckoutConfigs
          if (
            typeof window !== "undefined" &&
            window.__FcCheckoutConfigs?.variantColorValues
          ) {
            try {
              // For variants, use just the variant value (lowercase) to find the color mapping
              if (property === "variant") {
                const colorName = variantValue.toLowerCase();
                const colorMapping =
                  window.__FcCheckoutConfigs.variantColorValues.find(
                    (c) => c.name.toLowerCase() === colorName
                  );
                if (colorMapping?.hex) {
                  color = colorMapping.hex;
                }
              }
            } catch (error) {
              console.error("Error getting dynamic color:", error);
            }
          }
        }
      }
      return /*#__PURE__*/ _jsx("div", {
        style: {
          width: width,
          height: height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: containerRadius,
          ...containerBorderStyle,
          background: state.background,
          boxSizing: "border-box",
          flexShrink: 0,
          transition: "all 0.2s ease-in-out",
          overflow: "hidden",
          position: "relative",
        },
        children: /*#__PURE__*/ _jsx("div", {
          style: {
            width: innerWidth,
            height: innerHeight,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: color,
            borderRadius: innerRadius,
            minWidth: 0,
            minHeight: 0,
          },
        }),
      });
    } catch (error) {
      console.error("Error rendering swatch:", error);
      return null;
    }
  }, [
    width,
    height,
    swatchType,
    swatchImage,
    swatchColor,
    swatchBorder,
    radius,
    radiusPerSide,
    radiusTopLeft,
    radiusTopRight,
    radiusBottomRight,
    radiusBottomLeft,
    isChecked,
    isHovered,
    defaultState,
    hoverState,
    selectedState,
    getDisplayText,
    props.style?.swatchColorType,
    property,
    variantValue,
  ]); // Render checkbox and text with improved accessibility
  try {
    return /*#__PURE__*/ _jsxs("div", {
      style: containerStyle,
      ref: componentRef,
      onClick: handleChange,
      onKeyDown: handleKeyDown,
      role: "checkbox",
      "aria-checked": isChecked,
      tabIndex: 0,
      "data-filter-id": componentId,
      "data-filter-type": normalizedProperty,
      "data-filter-value":
        typeof value === "string"
          ? value
          : JSON.stringify(getFilterValueForComponent()),
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onTouchStart: () => setIsHovered(true),
      onTouchEnd: () => setIsHovered(false),
      onTouchCancel: () => setIsHovered(false),
      "aria-label": `Filter by ${getDisplayText()}`,
      children: [
        props.style?.type === "checkbox" &&
          /*#__PURE__*/ _jsx("div", {
            style: checkboxStyle,
            children: renderIcon(),
          }),
        props.style?.type === "swatch" && renderSwatch(),
        showText &&
          /*#__PURE__*/ _jsx("p", {
            style: textStyle,
            children:
              property === "variant"
                ? getDisplayText()
                : displayText || getDisplayText(),
          }),
      ],
    });
  } catch (error) {
    console.error("Error rendering filter component:", error);
    return /*#__PURE__*/ _jsx("div", {
      style: { padding: "10px", color: "red" },
      children: "Error rendering filter component",
    });
  }
}
addPropertyControls(FC_CatalogFilterButton, {
  // Style controls
  style: {
    type: ControlType.Object,
    title: "Style",
    controls: {
      type: {
        type: ControlType.Enum,
        title: "Type",
        options: ["checkbox", "swatch", "button"],
        optionTitles: ["Checkbox", "Swatch", "Button"],
        displaySegmentedControl: true,
        segmentedControlDirection: "vertical",
        defaultValue: "checkbox",
      },
      width: {
        type: ControlType.Number,
        title: "Width",
        defaultValue: 24,
        min: 8,
        max: 104,
        step: 8,
        displayStepper: true,
        hidden: ({ type }) => type === "button",
      },
      height: {
        type: ControlType.Number,
        title: "Height",
        defaultValue: 24,
        min: 8,
        max: 104,
        step: 8,
        displayStepper: true,
        hidden: ({ type }) => type === "button",
      },
      radius: {
        type: ControlType.FusedNumber,
        title: "Radius",
        defaultValue: 4,
        toggleKey: "radiusPerSide",
        toggleTitles: ["All", "Sides"],
        valueKeys: [
          "radiusTopLeft",
          "radiusTopRight",
          "radiusBottomRight",
          "radiusBottomLeft",
        ],
        valueLabels: ["TL", "TR", "BR", "BL"],
        min: 0,
      },
      swatchType: {
        type: ControlType.Enum,
        title: "Swatch",
        options: ["image", "color"],
        optionTitles: ["Image", "Color"],
        defaultValue: "color",
        displaySegmentedControl: true,
        hidden: ({ type }) => type !== "swatch",
      },
      swatchColorType: {
        type: ControlType.Enum,
        title: "Color",
        options: ["hex", "dynamic"],
        optionTitles: ["Hex", "Dynamic"],
        defaultValue: "hex",
        displaySegmentedControl: true,
        description:
          "Set hex code or use dynamic variant colors set in the plugin.",
        hidden: ({ type, swatchType }) =>
          type !== "swatch" || swatchType !== "color",
      },
      swatchImage: {
        type: ControlType.Image,
        title: "Image",
        hidden: ({ type, swatchType }) =>
          type !== "swatch" || swatchType !== "image",
      },
      swatchColor: {
        type: ControlType.Color,
        title: "Hex",
        defaultValue: "#000000",
        hidden: ({ type, swatchType, swatchColorType }) =>
          type !== "swatch" ||
          swatchType !== "color" ||
          swatchColorType !== "hex",
      },
      swatchBorder: {
        type: ControlType.Number,
        title: "Space",
        defaultValue: 4,
        min: 0,
        max: 20,
        step: 1,
        description: "Space around swatch and border",
        hidden: ({ type }) => type !== "swatch",
      },
      icon: {
        type: ControlType.Object,
        title: "Icon",
        hidden: ({ type }) => type !== "checkbox",
        controls: {
          preview: {
            type: ControlType.Boolean,
            title: "Preview",
            defaultValue: false,
          },
          type: {
            type: ControlType.Enum,
            title: "Icon",
            options: ["default", "custom"],
            optionTitles: ["Default", "Custom"],
            defaultValue: "default",
            displaySegmentedControl: true,
          },
          color: {
            type: ControlType.Color,
            title: "Color",
            defaultValue: "#000000",
            hidden: ({ type }) => type !== "default",
          },
          weight: {
            type: ControlType.Number,
            title: "Weight",
            defaultValue: 2,
            min: 0.5,
            max: 4,
            step: 0.5,
            hidden: ({ type }) => type !== "default",
          },
          edge: {
            type: ControlType.Enum,
            title: "Edge",
            options: ["hard", "round"],
            optionTitles: ["Hard", "Round"],
            defaultValue: "round",
            displaySegmentedControl: true,
            hidden: ({ type }) => type !== "default",
          },
          size: {
            type: ControlType.Number,
            title: "Size",
            defaultValue: 12,
            min: 8,
            max: 24,
            step: 1,
          },
          customIcon: {
            type: ControlType.Image,
            title: "Image",
            hidden: ({ type }) => type !== "custom",
          },
        },
      },
      gap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: 8,
        min: 0,
        max: 40,
        step: 1,
        hidden: ({ type }) => type === "button",
      },
      padding: {
        type: ControlType.FusedNumber,
        title: "Padding",
        defaultValue: 8,
        toggleKey: "paddingPerSide",
        toggleTitles: ["All", "Sides"],
        valueKeys: [
          "paddingTop",
          "paddingRight",
          "paddingBottom",
          "paddingLeft",
        ],
        valueLabels: ["T", "R", "B", "L"],
        min: 0,
      },
      stacked: {
        type: ControlType.Enum,
        title: "Layout",
        options: ["horizontal", "vertical"],
        optionTitles: ["Horizontal", "Vertical"],
        optionIcons: ["direction-horizontal", "direction-vertical"],
        displaySegmentedControl: true,
        defaultValue: "horizontal",
        hidden: ({ type }) => type === "button",
      },
    },
  },
  font: { type: ControlType.Font, title: "Font", controls: "extended" },
  default: {
    type: ControlType.Object,
    title: "Default",
    controls: {
      textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#000000",
      },
      border: {
        type: ControlType.Object,
        title: "Border",
        controls: {
          color: {
            type: ControlType.Color,
            title: "Color",
            defaultValue: "#000000",
          },
          width: {
            type: ControlType.FusedNumber,
            title: "Width",
            toggleKey: "isMixed",
            toggleTitles: ["All", "Individual"],
            valueKeys: ["top", "right", "bottom", "left"],
            valueLabels: ["T", "R", "B", "L"],
            min: 0,
            defaultValue: 1,
          },
          style: {
            type: ControlType.Enum,
            title: "Style",
            options: ["solid", "dashed", "dotted", "double"],
            optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
            defaultValue: "solid",
          },
        },
      },
      background: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FFFFFF",
      },
    },
  },
  hover: {
    type: ControlType.Object,
    title: "Hover",
    controls: {
      textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#333333",
      },
      border: {
        type: ControlType.Object,
        title: "Border",
        controls: {
          color: {
            type: ControlType.Color,
            title: "Color",
            defaultValue: "#000000",
          },
          width: {
            type: ControlType.FusedNumber,
            title: "Width",
            toggleKey: "isMixed",
            toggleTitles: ["All", "Individual"],
            valueKeys: ["top", "right", "bottom", "left"],
            valueLabels: ["T", "R", "B", "L"],
            min: 0,
            defaultValue: 1,
          },
          style: {
            type: ControlType.Enum,
            title: "Style",
            options: ["solid", "dashed", "dotted", "double"],
            optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
            defaultValue: "solid",
          },
        },
      },
      background: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FFFFFF",
      },
    },
  },
  selected: {
    type: ControlType.Object,
    title: "Selected",
    controls: {
      textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#000000",
      },
      border: {
        type: ControlType.Object,
        title: "Border",
        controls: {
          color: {
            type: ControlType.Color,
            title: "Color",
            defaultValue: "#000000",
          },
          width: {
            type: ControlType.FusedNumber,
            title: "Width",
            toggleKey: "isMixed",
            toggleTitles: ["All", "Individual"],
            valueKeys: ["top", "right", "bottom", "left"],
            valueLabels: ["T", "R", "B", "L"],
            min: 0,
            defaultValue: 1,
          },
          style: {
            type: ControlType.Enum,
            title: "Style",
            options: ["solid", "dashed", "dotted", "double"],
            optionTitles: ["Solid", "Dashed", "Dotted", "Double"],
            defaultValue: "solid",
          },
        },
      },
      background: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "rgba(255, 255, 255, 0)",
      },
    },
  }, // Filter Type Toggle
  // filterType: {
  //     type: ControlType.Enum,
  //     title: "Filter",
  //     options: ["shopify", "cms"],
  //     optionTitles: ["Shopify", "CMS"],
  //     displaySegmentedControl: true,
  //     defaultValue: "shopify",
  // },
  // // CMS specific controls
  // cmsTitle: {
  //     type: ControlType.String,
  //     title: "CMS Title",
  //     placeholder: "Category",
  //     hidden: (props) => props.filterType !== "cms",
  // },
  // cmsValue: {
  //     type: ControlType.String,
  //     title: "CMS Value",
  //     placeholder: "Fashion",
  //     hidden: (props) => props.filterType !== "cms",
  // },
  // Functional props
  property: {
    type: ControlType.Enum,
    title: "Property",
    options: [
      "variant",
      "product-type",
      "product-tag",
      "collection",
      "price",
      "on-sale",
      "discount",
      "in-stock",
      "subscriptions",
    ],
    optionTitles: [
      "Variant",
      "Product Type",
      "Product Tag",
      "Collection",
      "Price",
      "On Sale",
      "Discount",
      "In Stock",
      "Subscriptions",
    ],
    defaultValue: "price",
    hidden: (props) => props.filterType === "cms",
  }, // Collection, Product Type, Product Tag value
  value: {
    type: ControlType.String,
    title: "Value",
    defaultValue: "",
    hidden: (props) => {
      if (props.filterType === "cms") return true;
      const validProperties = ["collection", "product-type", "product-tag"];
      return !validProperties.includes(String(props.property));
    },
  },
  displayText: {
    type: ControlType.String,
    title: "Display Text",
    description: "If not set, value will be used.",
    hidden: (props) => props.property === "variant",
  }, // Price filter controls
  priceType: {
    type: ControlType.Enum,
    title: "Type",
    options: ["Range", "Under", "Over"],
    optionTitles: ["Range", "Under", "Over"],
    defaultValue: "Under",
    displaySegmentedControl: true,
    segmentedControlDirection: "vertical",
    hidden: (props) => props.property !== "price" || props.filterType === "cms",
  },
  priceThreshold: {
    type: ControlType.Number,
    title: "Under",
    defaultValue: 100,
    min: 0,
    step: 1,
    hidden: (props) =>
      props.property !== "price" ||
      props.priceType !== "Under" ||
      props.filterType === "cms",
  },
  priceOver: {
    type: ControlType.Number,
    title: "Over",
    defaultValue: 50,
    min: 0,
    step: 1,
    hidden: (props) =>
      props.property !== "price" ||
      props.priceType !== "Over" ||
      props.filterType === "cms",
  },
  priceLow: {
    type: ControlType.Number,
    title: "Price Low",
    defaultValue: 50,
    min: 0,
    step: 1,
    hidden: (props) =>
      props.property !== "price" ||
      props.priceType !== "Range" ||
      props.filterType === "cms",
  },
  priceHigh: {
    type: ControlType.Number,
    title: "Price High",
    defaultValue: 100,
    min: 0,
    step: 1,
    hidden: (props) =>
      props.property !== "price" ||
      props.priceType !== "Range" ||
      props.filterType === "cms",
  }, // Discount filter controls
  discountType: {
    type: ControlType.Enum,
    title: "Discount",
    options: ["Percent", "Amount"],
    optionTitles: ["Percent", "Amount"],
    defaultValue: "Percent",
    displaySegmentedControl: true,
    hidden: (props) =>
      props.property !== "discount" || props.filterType === "cms",
  },
  discountValueType: {
    type: ControlType.Enum,
    title: "Type",
    options: ["Range", "Over"],
    optionTitles: ["Range", "Over"],
    defaultValue: "Over",
    displaySegmentedControl: true,
    hidden: (props) =>
      props.property !== "discount" || props.filterType === "cms",
  },
  discountThreshold: {
    type: ControlType.Number,
    title: "Discount Threshold",
    defaultValue: 100,
    min: 0,
    step: 1,
    hidden: (props) =>
      props.property !== "discount" ||
      props.discountValueType !== "Over" ||
      props.filterType === "cms",
  },
  discountLow: {
    type: ControlType.Number,
    title: "Discount Low",
    defaultValue: 50,
    min: 0,
    step: 1,
    hidden: (props) =>
      props.property !== "discount" ||
      props.discountValueType !== "Range" ||
      props.filterType === "cms",
  },
  discountHigh: {
    type: ControlType.Number,
    title: "Discount High",
    defaultValue: 100,
    min: 0,
    step: 1,
    hidden: (props) =>
      props.property !== "discount" ||
      props.discountValueType !== "Range" ||
      props.filterType === "cms",
  }, // Variant controls
  variantTitle: {
    type: ControlType.String,
    title: "Title",
    defaultValue: "Size",
    hidden: (props) =>
      props.property !== "variant" ||
      props.filterType === "cms" ||
      props.variantType === "Metafield",
  },
  variantValue: {
    type: ControlType.String,
    title: "Value",
    defaultValue: "Large",
    hidden: (props) =>
      props.property !== "variant" || props.filterType === "cms",
  },
  variantDisplayText: {
    type: ControlType.String,
    title: "Display Text",
    description: "If not set, Value will be displayed.",
    hidden: (props) =>
      props.property !== "variant" || props.filterType === "cms",
  },
  showText: {
    type: ControlType.Boolean,
    title: "Show Text",
    defaultValue: true,
    enabledTitle: "Yes",
    disabledTitle: "No",
    hidden: (props) =>
      props.property !== "variant" || props.filterType === "cms",
  },
  variantStockFilter: {
    type: ControlType.Enum,
    title: "In Stock Only",
    options: ["all", "in_stock"],
    optionTitles: ["No", "Yes"],
    defaultValue: "all",
    displaySegmentedControl: true,
    hidden: (props) =>
      props.property !== "variant" || props.filterType === "cms",
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FC_CatalogFilterButton",
      slots: [],
      annotations: { framerDisableUnlink: "", framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./FC_CatalogFilterButton.map
