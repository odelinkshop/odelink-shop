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
import { useCallback, cloneElement, useEffect, useState, useRef } from "react";
import { addPropertyControls, ControlType } from "framer";
import {
  parseUrlFilters,
  updateUrlWithFilters,
  convertFilterName,
} from "https://framerusercontent.com/modules/A55TPw8oJtDToWtsjcDZ/rm89gWVDrPnML7Vtbv1c/filterMappings.js"; // Constants for debugging
const DEBUG_MODE = true; // Helper function for consistent logging
const logDebug = (action, data) => {
  if (DEBUG_MODE) {
    //console.log(`🔄 [FilterReset] ${action}:`, data);
  }
};
/**
 * @framerDisableUnlink
 */ export default function FC_CatalogFilterResetButton(props) {
  const { Default, showWhenNoFilters } = props;
  const [, setForceUpdate] = useState(0);
  const componentId = useRef(
    `filter-reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  ).current;
  const mountedRef = useRef(true); // Force re-render when filters change
  useEffect(() => {
    if (!mountedRef.current) return;
    const handleFilterChange = () => {
      logDebug("Filter change detected");
      setForceUpdate((prev) => prev + 1);
    }; // Listen for filter changes
    document.addEventListener("product-filter-change", handleFilterChange);
    document.addEventListener("filter-reset", handleFilterChange);
    document.addEventListener("product-sort-change", handleFilterChange);
    document.addEventListener("filter-navigation", handleFilterChange); // Listen for URL changes
    const observer = new MutationObserver(() => {
      if (mountedRef.current) {
        handleFilterChange();
      }
    });
    const body = document.querySelector("body");
    if (body) {
      observer.observe(body, { subtree: true, childList: true });
    }
    return () => {
      mountedRef.current = false;
      document.removeEventListener("product-filter-change", handleFilterChange);
      document.removeEventListener("filter-reset", handleFilterChange);
      document.removeEventListener("product-sort-change", handleFilterChange);
      document.removeEventListener("filter-navigation", handleFilterChange);
      observer.disconnect();
    };
  }, []);
  const resetFilters = useCallback(() => {
    try {
      logDebug("Resetting all filters"); // Get current URL and parse existing filters
      const url = new URL(window.location.href);
      const currentFilters = parseUrlFilters(url.searchParams); // Log current state before reset
      logDebug("Current filters before reset", currentFilters); // Create empty filter state
      const emptyFilters = {
        collection: { active: false, values: [] },
        product_type: { active: false, values: [] },
        product_tag: { active: false, values: [] },
        variant: { active: false, values: [] },
        price: { active: false, values: [] },
        discount_amount: { active: false, values: [] },
        discount_percent: { active: false, values: [] },
        on_sale: { active: false, value: true },
        in_stock: { active: false, value: true },
        bundle: { active: false, value: true },
        subscription: { active: false, value: true },
      }; // Update URL with empty filters
      updateUrlWithFilters(emptyFilters, url); // Update URL without reloading the page
      window.history.pushState({}, "", url.toString()); // First send individual reset events for each filter type
      const filterTypes = [
        "collection",
        "product_type",
        "product_tag",
        "price",
        "discount_amount",
        "discount_percent",
        "variant",
        "on_sale",
        "in_stock",
        "bundle",
        "subscription",
      ];
      filterTypes.forEach((type) => {
        const legacyType = convertFilterName(type, true);
        logDebug(`Resetting filter: ${type} (legacy: ${legacyType})`);
        let eventDetail = {
          type: legacyType,
          active: false,
          componentId: componentId,
        }; // Add specific value structure for different filter types
        if (type === "discount_amount" || type === "discount_percent") {
          eventDetail = { ...eventDetail, value: { values: [] } };
        } else if (type === "variant") {
          eventDetail = { ...eventDetail, value: "", values: [] };
        } else if (type === "price") {
          eventDetail = { ...eventDetail, value: { values: [] } };
        } else {
          eventDetail = { ...eventDetail, value: "", values: [] };
        }
        document.dispatchEvent(
          new CustomEvent("product-filter-change", { detail: eventDetail })
        );
      }); // Then send the filter-reset event to update UI
      document.dispatchEvent(
        new CustomEvent("filter-reset", {
          detail: {
            timestamp: Date.now(),
            componentId: componentId,
            resetToInitialScope: true,
          },
        })
      ); // Reset sort to default
      document.dispatchEvent(
        new CustomEvent("product-sort-change", {
          detail: {
            type: "relevancy",
            sortBy: "relevancy",
            sortDirection: null,
            componentId: componentId,
          },
        })
      ); // Dispatch filter navigation event
      document.dispatchEvent(
        new CustomEvent("filter-navigation", {
          detail: { filters: emptyFilters, sourceComponentId: componentId },
        })
      );
      logDebug("All filters reset successfully");
    } catch (error) {
      console.error("Error resetting filters:", error);
    }
  }, [componentId]); // const handleClick = (e: React.MouseEvent) => {
  //     e.preventDefault();
  //     resetFilters();
  // };
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  let content = Default?.[0] || null;
  if (!content) {
    logDebug("No default content provided");
    return null;
  }
  const clonedElement = /*#__PURE__*/ cloneElement(content, {
    style: {
      ...(content.props?.style || {}),
      width: "100%",
      height: "100%",
      cursor: "pointer",
    },
    onClick: resetFilters,
    "aria-label": "Reset all filters",
    role: "button",
    tabIndex: 0,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        resetFilters();
      }
    },
  }); // In canvas, always show
  if (
    typeof window === "undefined" ||
    window.location.href.includes("framercanvas")
  ) {
    return /*#__PURE__*/ _jsx("div", {
      style: { height: "100%", width: "100%" },
      children: clonedElement,
    });
  } // In browser, check filters
  const hasFilters = hasActiveFilters(); // Show if there are filters OR showWhenNoFilters is true
  if (!hasFilters && !showWhenNoFilters) {
    return null;
  }
  return /*#__PURE__*/ _jsx("div", {
    style: { height: "100%", width: "100%" },
    children: clonedElement,
  });
}
FC_CatalogFilterResetButton.defaultProps = {
  Default: null,
  showWhenNoFilters: true,
};
function hasActiveFilters() {
  if (typeof window === "undefined") return false;
  try {
    const url = new URL(window.location.href);
    const filters = parseUrlFilters(url.searchParams); // Check if any filter is active
    return Object.values(filters).some((filter) => filter.active);
  } catch (error) {
    console.error("Error checking active filters:", error);
    return false;
  }
}
addPropertyControls(FC_CatalogFilterResetButton, {
  Default: { type: ControlType.ComponentInstance, title: "Button Design" },
  showWhenNoFilters: {
    type: ControlType.Boolean,
    title: "No Filters",
    defaultValue: true,
    enabledTitle: "Show",
    disabledTitle: "Hide",
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FC_CatalogFilterResetButton",
      slots: [],
      annotations: { framerContractVersion: "1", framerDisableUnlink: "" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
