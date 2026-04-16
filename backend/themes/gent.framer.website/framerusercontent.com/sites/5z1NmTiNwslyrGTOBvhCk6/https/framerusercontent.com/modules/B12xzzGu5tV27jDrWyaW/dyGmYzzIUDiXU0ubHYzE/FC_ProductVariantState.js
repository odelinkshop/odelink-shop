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
import { addPropertyControls, ControlType } from "framer";
import { useEffect, useState, useCallback } from "react";
import { get } from "lodash-es";
/**
 * @framerDisableUnlink
 */ export default function FC_ProductVariantState(props) {
  const { shopifyProductID, textTemplate } = props;
  const [product, setProduct] = useState();
  const [selectedOptions, setSelectedOptions] = useState({}); // Move handler outside useEffect for better stability
  const handleVariantSelection = useCallback((event) => {
    // Directly set the new selected options
    setSelectedOptions((prev) => ({
      ...prev,
      [event.detail.optionName]: event.detail.value,
    }));
  }, []);
  useEffect(() => {
    if (window["shopXtools"] && Array.isArray(window["shopXtools"].products)) {
      const _matchingProduct = window["shopXtools"].products.find(
        ({ node: _product }) =>
          _product.id === `gid://shopify/Product/${shopifyProductID}`
      );
      setProduct(_matchingProduct ? _matchingProduct.node : "404");
    } else {
      document.addEventListener("data__products-ready", (e) => {
        if (Array.isArray(e.detail.products)) {
          const _matchingProduct = e.detail.products.find(
            ({ node: _product }) =>
              _product.id === `gid://shopify/Product/${shopifyProductID}`
          );
          setProduct(_matchingProduct ? _matchingProduct.node : "404");
        }
      });
    }
    document.addEventListener(
      "variant_option_selected",
      handleVariantSelection
    );
    return () => {
      document.removeEventListener(
        "variant_option_selected",
        handleVariantSelection
      );
    };
  }, [shopifyProductID, handleVariantSelection]);
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      const { currency } = event.detail;
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
      }
    };
    window.addEventListener("currency_changed", handleCurrencyChange);
    return () => {
      window.removeEventListener("currency_changed", handleCurrencyChange);
    };
  }, [shopifyProductID]);
  const options = get(product, "options", []); // Get remaining unselected options
  const remainingOptions = options
    .filter((opt) => !selectedOptions[opt.name])
    .map((opt) => opt.name); // In Framer canvas or when shopXtools is not ready, show placeholder
  const isFramerCanvas = typeof window === "undefined" || !window["shopXtools"];
  const displayText = isFramerCanvas
    ? textTemplate.replace("{{variant}}", "Size")
    : remainingOptions.length === 0
    ? ""
    : textTemplate.replace("{{variant}}", remainingOptions.join(", ")); // If no text to display, return empty div
  if (!displayText) {
    return /*#__PURE__*/ _jsx("div", {
      style: { width: "100%", height: "100%" },
    });
  }
  return /*#__PURE__*/ _jsx("div", {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    children: /*#__PURE__*/ _jsx("p", {
      style: {
        ...props.font,
        color: props.color,
        margin: 0,
        textAlign: "center",
        textTransform: props.textTransform,
      },
      children: displayText,
    }),
  });
}
FC_ProductVariantState.defaultProps = {
  shopifyProductID: "",
  textTemplate: "Select {{variant}}",
  textTransform: "none",
  color: "#000000",
};
addPropertyControls(FC_ProductVariantState, {
  shopifyProductID: { type: ControlType.String, title: "Product ID" },
  textTemplate: {
    type: ControlType.String,
    title: "Format",
    description: "Use {{variant}} to insert the variant name",
  },
  font: { type: ControlType.Font, title: "Font", controls: "extended" },
  color: { type: ControlType.Color, title: "Color", defaultValue: "#000000" },
  textTransform: {
    type: ControlType.Enum,
    title: "Transform",
    options: ["None", "Uppercase", "Lowercase", "Capitalize"],
    defaultValue: "none",
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FC_ProductVariantState",
      slots: [],
      annotations: { framerContractVersion: "1", framerDisableUnlink: "" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./FC_ProductVariantState.map
