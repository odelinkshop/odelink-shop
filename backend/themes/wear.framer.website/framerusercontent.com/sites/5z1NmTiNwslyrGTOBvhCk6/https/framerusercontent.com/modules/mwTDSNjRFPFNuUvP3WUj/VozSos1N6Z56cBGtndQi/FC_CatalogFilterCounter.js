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
 */ import { jsx as _jsx } from "react/jsx-runtime";
import { addPropertyControls, ControlType, RenderTarget } from "framer";
import * as React from "react";
import {
  convertFilterName,
  parseUrlFilters,
} from "https://framerusercontent.com/modules/A55TPw8oJtDToWtsjcDZ/rm89gWVDrPnML7Vtbv1c/filterMappings.js"; // Define filter groups for better maintainability
const FILTER_GROUPS = {
  LIST: ["collection", "product_type", "product_tag"],
  RANGE: ["price", "discount_amount", "discount_percent"],
  BOOLEAN: ["on_sale", "in_stock"],
};
/**
 * @framerDisableUnlink
 */ export default function FC_CatalogFilterCounter(props) {
  const {
    type = "all",
    property,
    variantTitle,
    hideIfZero = false,
    font,
    color = "#000",
    displayFormat = "{{value}}",
  } = props;
  const [count, setCount] = React.useState(0);
  const [isBrowser, setIsBrowser] = React.useState(false); //const isBrowser = useIsBrowser()
  // Simple function to count filters from URL
  const countFilters = React.useCallback(() => {
    if (typeof window === "undefined") return 0; // if (!isBrowser) return 0;
    try {
      const url = new URL(window.location.href);
      const params = url.searchParams; // console.log("URL:", url.href)
      // console.log("Params:", Array.from(params.entries()))
      // For single property counting
      if (type === "property" && property) {
        //console.log("Counting property:", property)
        const normalizedProperty = convertFilterName(property, false); //console.log("normalizedProperty", normalizedProperty)
        // Handle variants
        if (property === "variant") {
          //console.log("Variant title:", variantTitle)
          if (variantTitle) {
            const values =
              params
                .get(`variant_${variantTitle}`)
                ?.split(",")
                .filter(Boolean) || []; //console.log("Variant values:", values)
            return values.length;
          }
          const variantCount = Array.from(params.entries())
            .filter(([key]) => key.startsWith("variant_"))
            .reduce(
              (acc, [_, value]) =>
                acc + value.split(",").filter(Boolean).length,
              0
            ); // console.log("Total variant count:", variantCount)
          return variantCount;
        } // Handle boolean filters
        if (property && FILTER_GROUPS.BOOLEAN.includes(property)) {
          // console.log("[BUNDLE] property passed", property)
          // console.log(
          //     "[BUNDLE] normalizedProperty",
          //     normalizedProperty
          // )
          // console.log(
          //     "[BUNDLE] params.get(normalizedProperty)",
          //     params.get(normalizedProperty)
          // )
          const booleanValue =
            params.get(normalizedProperty) === "true" ? 1 : 0; //console.log("Boolean filter count:", booleanValue)
          return booleanValue;
        } // Handle range filters
        if (property && FILTER_GROUPS.RANGE.includes(property)) {
          // Use parseUrlFilters to get consistent filter structure
          const filters = parseUrlFilters(params); //console.log("Parsed filters for range:", filters)
          // Special handling for discount filters - combine both types
          if (
            property === "discount_amount" ||
            property === "discount_percent"
          ) {
            let totalDiscountCount = 0; // Count discount_amount filters
            if (
              filters.discount_amount?.active &&
              filters.discount_amount.values
            ) {
              totalDiscountCount += filters.discount_amount.values.length; // console.log(
              //     "discount_amount values:",
              //     filters.discount_amount.values
              // )
            } // Count discount_percent filters
            if (
              filters.discount_percent?.active &&
              filters.discount_percent.values
            ) {
              totalDiscountCount += filters.discount_percent.values.length; // console.log(
              //     "discount_percent values:",
              //     filters.discount_percent.values
              // )
            } //console.log("Total discount count:", totalDiscountCount)
            return totalDiscountCount;
          } // For other range filters (price)
          const filter = filters[normalizedProperty]; //console.log(`Filter for ${normalizedProperty}:`, filter)
          if (filter?.active && filter.values) {
            // console.log(
            //     `${normalizedProperty} values:`,
            //     filter.values
            // )
            return filter.values.length;
          }
          return 0;
        } // Handle list filters
        if (property && FILTER_GROUPS.LIST.includes(property)) {
          const values =
            params.get(normalizedProperty)?.split(",").filter(Boolean) || []; //console.log("List filter values:", values)
          return values.length;
        }
        return 0;
      } // For counting all filters
      if (type === "all") {
        // Use parseUrlFilters to get a consistent view of active filters
        const filters = parseUrlFilters(params); //console.log("Parsed filters:", filters)
        let totalCount = 0; // Count list filters
        FILTER_GROUPS.LIST.forEach((filterType) => {
          if (filters[filterType]?.active) {
            totalCount += filters[filterType].values.length; // console.log(
            //     `${filterType} count:`,
            //     filters[filterType].values.length
            // )
          }
        }); // Count variant filters
        if (filters.variant?.active) {
          totalCount += filters.variant.values.length; //console.log("variant count:", filters.variant.values.length)
        } // Count range filters
        FILTER_GROUPS.RANGE.forEach((filterType) => {
          if (filters[filterType]?.active && filters[filterType].values) {
            totalCount += filters[filterType].values.length; // console.log(
            //     `${filterType} count:`,
            //     filters[filterType].values.length
            // )
          }
        }); // Count boolean filters
        FILTER_GROUPS.BOOLEAN.forEach((filterType) => {
          if (filters[filterType]?.active) {
            totalCount += 1; //console.log(`${filterType} count: 1`)
          }
        }); //console.log("Final total count:", totalCount)
        return totalCount;
      }
      return 0;
    } catch (error) {
      console.error("Error counting filters:", error);
      return 0;
    }
  }, [type, property, variantTitle]); // Update count when filters change
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const updateCount = () => {
      const newCount = countFilters(); // console.log("Current type:", type)
      // console.log("Current property:", property)
      // console.log("Setting new count:", newCount)
      setCount(newCount);
    }; // Initial count
    //setIsBrowser(true);
    updateCount(); // Listen for filter changes and URL changes
    const handleFilterChange = () => {
      //console.log("Filter change event detected")
      updateCount();
    };
    const handleFilterReset = () => {
      //console.log("Filter reset event detected")
      setCount(0);
    };
    window.addEventListener("popstate", updateCount);
    document.addEventListener("product-filter-change", handleFilterChange);
    document.addEventListener("filter-reset", handleFilterReset);
    document.addEventListener("filter-navigation", handleFilterChange);
    return () => {
      window.removeEventListener("popstate", updateCount);
      document.removeEventListener("product-filter-change", handleFilterChange);
      document.removeEventListener("filter-reset", handleFilterReset);
      document.removeEventListener("filter-navigation", handleFilterChange);
    };
  }, [countFilters, type, property]); // Styles
  const wrapperStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const textStyle = {
    ...font,
    opacity: hideIfZero && count === 0 ? 0 : 1,
    userSelect: hideIfZero && count === 0 ? "none" : "auto",
    color,
  }; //console.log("count before rendering", count)
  // const displayValue = isBrowser ? count : "0";
  const displayValue = count; //console.log("displayValue", displayValue)
  const formattedValue = displayFormat.replace(
    "{{value}}",
    displayValue.toString()
  ); //console.log("formattedValue", formattedValue)
  if (RenderTarget.current() === RenderTarget.canvas) {
    return /*#__PURE__*/ _jsx("div", {
      style: wrapperStyle,
      "data-filter-count": "canvas",
      children: /*#__PURE__*/ _jsx("span", {
        style: textStyle,
        children: formattedValue,
      }),
    });
  }
  return /*#__PURE__*/ _jsx("div", {
    style: wrapperStyle,
    "data-filter-count": "browser",
    children: /*#__PURE__*/ _jsx("span", {
      style: textStyle,
      children: formattedValue,
    }),
  });
}
addPropertyControls(FC_CatalogFilterCounter, {
  type: {
    type: ControlType.SegmentedEnum,
    title: "Type",
    options: ["all", "property"],
    optionTitles: ["All", "Property"],
    defaultValue: "all",
  },
  property: {
    type: ControlType.Enum,
    title: "Property",
    options: [
      "variant",
      ...FILTER_GROUPS.LIST,
      ...FILTER_GROUPS.RANGE,
      ...FILTER_GROUPS.BOOLEAN,
    ],
    defaultValue: "variant",
    hidden: (props) => props.type !== "property",
  },
  variantTitle: {
    type: ControlType.String,
    title: "Variant Title",
    defaultValue: "",
    hidden: (props) =>
      props.type !== "property" || props.property !== "variant",
  },
  hideIfZero: {
    type: ControlType.Boolean,
    title: "When 0",
    enabledTitle: "Hide",
    disabledTitle: "Show",
    defaultValue: false,
  },
  font: { type: ControlType.Font, controls: "extended" },
  color: { type: ControlType.Color, title: "Color", defaultValue: "#000" },
  displayFormat: {
    type: ControlType.String,
    title: "Format",
    defaultValue: "{{value}}",
    description: "Use {{value}} as to display the number.",
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FC_CatalogFilterCounter",
      slots: [],
      annotations: { framerDisableUnlink: "", framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
