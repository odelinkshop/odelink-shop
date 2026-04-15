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
import { addPropertyControls, ControlType } from "framer";
/**
 * @framerDisableUnlink
 */ export default function FC_CatalogSortDropdown(props) {
  const {
    DropdownVisual,
    relevanceText = "Relevance",
    titleAscText = "A-Z",
    titleDescText = "Z-A",
    priceAscText = "Price (lowest first)",
    priceDescText = "Price (highest first)",
    newestText = "Newest",
    bestSellingText = "Best Selling",
    defaultSort = "relevance",
  } = props;
  const dropdownRef = React.useRef(null);
  const [currentSort, setCurrentSort] = React.useState(defaultSort);
  const handleClick = () => {
    if (dropdownRef.current) {
      dropdownRef.current.focus();
      const event = new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      dropdownRef.current.dispatchEvent(event);
    }
  }; // Map internal sort values to display text
  const sortOptions = React.useMemo(() => {
    return [
      { value: "relevance", text: relevanceText },
      { value: "title_asc", text: titleAscText },
      { value: "title_desc", text: titleDescText },
      { value: "price_asc", text: priceAscText },
      { value: "price_desc", text: priceDescText },
      { value: "newest", text: newestText },
      { value: "best_selling", text: bestSellingText },
    ].filter((option) => option.text); // Filter out options with empty text
  }, [
    relevanceText,
    titleAscText,
    titleDescText,
    priceAscText,
    priceDescText,
    newestText,
    bestSellingText,
  ]); // Get the current sort text
  const getCurrentSortText = React.useCallback(() => {
    const option = sortOptions.find((opt) => opt.value === currentSort);
    return option?.text || relevanceText;
  }, [currentSort, sortOptions, relevanceText]); // Helper function to update text content with {{param}}
  const updateButtonContent = (element) => {
    if (!element || typeof element !== "object") return element; // Handle arrays
    if (Array.isArray(element)) {
      return element.map((child) => updateButtonContent(child));
    }
    if (!(/*#__PURE__*/ React.isValidElement(element))) return element;
    const { children, ...otherProps } = element.props; // Special handling for Framer Text components
    if (element.type?.displayName?.includes("Text")) {
      const text = element.props.text || "";
      const newText = text.replace(/{{param}}/g, getCurrentSortText());
      return /*#__PURE__*/ React.cloneElement(element, {
        ...otherProps,
        text: newText,
      });
    } // Handle children recursively
    let newChildren = children;
    if (children) {
      if (typeof children === "string") {
        newChildren = children.replace(/{{param}}/g, getCurrentSortText());
      } else if (
        /*#__PURE__*/ React.isValidElement(children) ||
        Array.isArray(children)
      ) {
        newChildren = updateButtonContent(children);
      }
    }
    return /*#__PURE__*/ React.cloneElement(element, {
      ...otherProps,
      children: newChildren,
    });
  }; // Handle sort change
  const handleSortChange = React.useCallback((e) => {
    const value = e.target.value;
    setCurrentSort(value); // Save to session storage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sortBy", value);
    } // Map URL sort parameter to internal sort configuration
    let sortConfig;
    switch (value) {
      case "relevance":
        sortConfig = {
          type: "relevancy",
          sortBy: "relevancy",
          sortDirection: null,
        };
        break;
      case "title_asc":
        sortConfig = { type: "name", sortBy: "name", sortDirection: "aToZ" };
        break;
      case "title_desc":
        sortConfig = { type: "name", sortBy: "name", sortDirection: "zToA" };
        break;
      case "price_asc":
        sortConfig = {
          type: "price",
          sortBy: "price",
          sortDirection: "lowToHigh",
        };
        break;
      case "price_desc":
        sortConfig = {
          type: "price",
          sortBy: "price",
          sortDirection: "highToLow",
        };
        break;
      case "newest":
        sortConfig = {
          type: "created",
          sortBy: "created",
          sortDirection: "newest",
        };
        break;
      case "best_selling":
        sortConfig = {
          type: "best-selling",
          sortBy: "best-selling",
          sortDirection: null,
        };
        break;
    } // Update URL with sort parameter
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("sort", value);
      window.history.pushState({ sortConfig }, "", url.toString());
    } // Dispatch sort change event
    document.dispatchEvent(
      new CustomEvent("product-sort-change", { detail: sortConfig })
    );
  }, []); // Update sort value from URL on mount and URL changes
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const updateSortFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sortParam = urlParams.get("sort"); // First check URL
      if (
        sortParam &&
        sortOptions.some((option) => option.value === sortParam)
      ) {
        setCurrentSort(sortParam);
        sessionStorage.setItem("sortBy", sortParam);
      } else {
        const storedSort = sessionStorage.getItem("sortBy");
        if (
          storedSort &&
          sortOptions.some((option) => option.value === storedSort)
        ) {
          setCurrentSort(storedSort); // Update URL to match session storage
          const url = new URL(window.location.href);
          url.searchParams.set("sort", storedSort);
          window.history.pushState({ sort: storedSort }, "", url.toString());
        }
      }
    };
    updateSortFromUrl();
    window.addEventListener("popstate", updateSortFromUrl);
    return () => {
      window.removeEventListener("popstate", updateSortFromUrl);
    };
  }, [sortOptions]);
  return /*#__PURE__*/ _jsxs("div", {
    style: {
      position: "relative",
      width: "100%",
      height: "100%",
      cursor: "pointer",
    },
    onClick: handleClick,
    children: [
      /*#__PURE__*/ _jsx("div", {
        style: { width: "100%", height: "100%", pointerEvents: "none" },
        children: updateButtonContent(DropdownVisual),
      }),
      /*#__PURE__*/ _jsx("select", {
        ref: dropdownRef,
        value: currentSort,
        onChange: handleSortChange,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
        },
        children: sortOptions.map((option) =>
          /*#__PURE__*/ _jsx(
            "option",
            { value: option.value, children: option.text },
            option.value
          )
        ),
      }),
    ],
  });
}
addPropertyControls(FC_CatalogSortDropdown, {
  DropdownVisual: {
    type: ControlType.ComponentInstance,
    title: "Component",
    description:
      "Connect to native Framer component, on-canvas but off-page. Use {{param}} in text to show the current sort option",
  },
  defaultSort: {
    type: ControlType.Enum,
    title: "Default Sort",
    options: [
      "relevance",
      "title_asc",
      "title_desc",
      "price_asc",
      "price_desc",
      "newest",
      "best_selling",
    ],
    optionTitles: [
      "Relevance",
      "Title A-Z",
      "Title Z-A",
      "Price Low-High",
      "Price High-Low",
      "Newest",
      "Best Selling",
    ],
    defaultValue: "relevance",
  },
  relevanceText: {
    type: ControlType.String,
    title: "Relevance",
    defaultValue: "Relevance",
  },
  titleAscText: {
    type: ControlType.String,
    title: "Title (A-Z)",
    defaultValue: "A-Z",
  },
  titleDescText: {
    type: ControlType.String,
    title: "Title (Z-A)",
    defaultValue: "Z-A",
  },
  priceAscText: {
    type: ControlType.String,
    title: "Price (Low)",
    defaultValue: "Price (lowest first)",
  },
  priceDescText: {
    type: ControlType.String,
    title: "Price (High)",
    defaultValue: "Price (highest first)",
  },
  newestText: {
    type: ControlType.String,
    title: "Newest",
    defaultValue: "Newest",
  },
  bestSellingText: {
    type: ControlType.String,
    title: "Best Selling",
    defaultValue: "Best Selling",
    description: "Empty fields won't be displayed",
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FC_CatalogSortDropdown",
      slots: ["DropdownVisual"],
      annotations: { framerContractVersion: "1", framerDisableUnlink: "" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./FC_CatalogSortDropdown.map
