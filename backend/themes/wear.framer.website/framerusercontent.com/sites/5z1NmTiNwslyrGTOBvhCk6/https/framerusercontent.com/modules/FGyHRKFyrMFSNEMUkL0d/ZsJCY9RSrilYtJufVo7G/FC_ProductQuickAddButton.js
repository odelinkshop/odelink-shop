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
import { useState, useEffect } from "react";
import { addPropertyControls, ControlType, RenderTarget } from "framer";
import { get } from "lodash-es";
import { useIsBrowser } from "https://framerusercontent.com/modules/ncBs5KPMI9I5GEta13fn/zGXDjuZapa1SGy6D8P5e/IsBrowser.js";
import {
  createCartMutation,
  addToCartMutation,
  cartQuery,
} from "https://framerusercontent.com/modules/yiRfl1JCGhIBUL31WVDk/wupS2XmBAHu1kBQNv9pi/mutations_v2.js";
import { appendUTMParamsToUrl } from "https://framerusercontent.com/modules/w24ELWa2giT3SFaWpV77/398w6fPyag8B92ojouQr/utmParams.js";
import { appendLanguageToUrl } from "https://framerusercontent.com/modules/vC6fzbfO83MgBPIhn5zl/DUlbmWuOELzEUenVmv3G/locales.js";
export var ButtonType;
(function (ButtonType) {
  ButtonType["AddToCart"] = "Add to Cart";
  ButtonType["BuyNow"] = "Buy Now";
})(ButtonType || (ButtonType = {}));
/**
 * @framerDisableUnlink
 */ export default function FC_ProductQuickAddButton(props) {
  const {
    shopifyProductID,
    Button,
    OutOfStock,
    type = "Add to Cart",
    openCart = true,
    focus,
  } = props;
  const [activeVariant, setActiveVariant] = useState(null);
  const [isInStock, setIsInStock] = useState(true);
  const isBrowser = useIsBrowser(); // Load product data - simplified approach
  useEffect(() => {
    if (!isBrowser || !shopifyProductID) return;
    const loadVariant = () => {
      try {
        if (window.shopXtools?.products) {
          const matchingProduct = window.shopXtools.products.find(
            ({ node }) =>
              node.id === `gid://shopify/Product/${shopifyProductID}`
          );
          if (matchingProduct?.node) {
            const variants = get(matchingProduct.node, "variants.edges", []);
            const firstAvailableVariant = variants.find(
              ({ node }) => node.availableForSale
            )?.node;
            if (firstAvailableVariant) {
              setActiveVariant(firstAvailableVariant);
              setIsInStock(firstAvailableVariant.availableForSale);
            } else {
              setIsInStock(false);
            }
          } else {
            setIsInStock(false);
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
        setIsInStock(false);
      }
    };
    loadVariant(); // Listen for when products are ready
    const handleProductsReady = () => loadVariant();
    document.addEventListener("data__products-ready", handleProductsReady);
    return () => {
      document.removeEventListener("data__products-ready", handleProductsReady);
    };
  }, [shopifyProductID, isBrowser]); // Properly update cart and trigger necessary events
  const updateCartAndTriggerEvents = (cartData) => {
    if (!cartData) return; // Update localStorage with cart data
    if (cartData.id) {
      localStorage.setItem("shopX_cart_id", cartData.id);
    }
    localStorage.setItem("shopXtools.cart", JSON.stringify(cartData)); // Update window.shopXtools.cart
    if (window.shopXtools) {
      window.shopXtools.cart = cartData;
    } // Trigger cart update events in multiple ways to ensure compatibility
    window.dispatchEvent(new Event("shopXtools-cart-update")); // Dispatch checkout changed event
    window.dispatchEvent(
      new CustomEvent("checkout__changed", {
        detail: { __triggerCartModal: openCart },
      })
    ); // Also use the shopXtools direct method if available
    if (
      window.shopXtools &&
      typeof window.shopXtools.dispatchEvent === "function"
    ) {
      try {
        window.shopXtools.dispatchEvent("checkout__changed", {
          __triggerCartModal: openCart,
        });
      } catch (e) {
        console.error("Error dispatching event through shopXtools:", e);
      }
    }
  }; // Improved add to cart handler with better event handling
  const handleAddToCart = async () => {
    if (!isBrowser || !activeVariant || !window.shopXtools) return;
    try {
      const lineItem = { merchandiseId: activeVariant.id, quantity: 1 };
      const lines = [lineItem];
      const countryCode =
        localStorage.getItem("selectedCountryCode") || undefined;
      if (type === "Add to Cart") {
        // Add to cart
        try {
          const existingCartId = localStorage.getItem("shopX_cart_id"); // Create or update cart
          if (!existingCartId) {
            const createResult = await window.shopXtools.handleCartMutation?.(
              createCartMutation,
              { lines, countryCode }
            );
            if (createResult?.cartCreate?.cart) {
              updateCartAndTriggerEvents(createResult.cartCreate.cart);
            }
          } else {
            // Validate existing cart first
            try {
              const cartValidation =
                await window.shopXtools.handleCartMutation?.(cartQuery, {
                  cartId: existingCartId,
                });
              if (!cartValidation?.cart) {
                // Cart is invalid, create a new one
                localStorage.removeItem("shopX_cart_id");
                localStorage.removeItem("shopXtools.cart");
                const createResult =
                  await window.shopXtools.handleCartMutation?.(
                    createCartMutation,
                    { lines, countryCode }
                  );
                if (createResult?.cartCreate?.cart) {
                  updateCartAndTriggerEvents(createResult.cartCreate.cart);
                }
              } else {
                // Cart is valid, add to it
                const addResult = await window.shopXtools.handleCartMutation?.(
                  addToCartMutation,
                  { cartId: existingCartId, lines }
                );
                if (addResult?.cartLinesAdd?.cart) {
                  updateCartAndTriggerEvents(addResult.cartLinesAdd.cart);
                }
              }
            } catch (error) {
              // Error validating cart, create a new one
              localStorage.removeItem("shopX_cart_id");
              localStorage.removeItem("shopXtools.cart");
              const createResult = await window.shopXtools.handleCartMutation?.(
                createCartMutation,
                { lines, countryCode }
              );
              if (createResult?.cartCreate?.cart) {
                updateCartAndTriggerEvents(createResult.cartCreate.cart);
              }
            }
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          window.dispatchEvent(
            new CustomEvent("errorChanged", {
              detail: error.message || "Failed to add to cart",
            })
          );
        }
      } else {
        // Buy Now
        try {
          const buyResult = await window.shopXtools.handleCartMutation?.(
            createCartMutation,
            { lines, countryCode }
          );
          if (buyResult?.cartCreate?.cart?.checkoutUrl) {
            let checkoutUrl = buyResult.cartCreate.cart.checkoutUrl;
            checkoutUrl = appendUTMParamsToUrl(checkoutUrl);
            checkoutUrl = appendLanguageToUrl(checkoutUrl);
            window.location.assign(checkoutUrl);
          }
        } catch (error) {
          console.error("Error proceeding to checkout:", error);
          window.dispatchEvent(
            new CustomEvent("errorChanged", {
              detail: error.message || "Failed to proceed to checkout",
            })
          );
        }
      }
    } catch (error) {
      console.error("Error handling cart action:", error);
      window.dispatchEvent(
        new CustomEvent("errorChanged", {
          detail: error.message || "Error processing your request",
        })
      );
    }
  }; // Click handler
  const handleClick = (e) => {
    // Stop event propagation to prevent double-handling
    e.stopPropagation();
    if (activeVariant) {
      handleAddToCart();
    }
  }; // Connection message for when no Button is provided
  const connectInstanceMessage = /*#__PURE__*/ _jsx("div", {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#666",
      fontSize: "14px",
      border: "1px dashed #ccc",
      borderRadius: "4px",
    },
    children: "Connect Instance",
  }); // Fallback button when no Button instance is provided
  const fallbackButton = /*#__PURE__*/ _jsx("button", {
    style: {
      width: "100%",
      height: "100%",
      backgroundColor: "#007AFF",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    children: type === "Buy Now" ? "Buy Now" : "Add to Cart",
  }); // Canvas mode rendering - always show components for preview
  if (RenderTarget.current() === RenderTarget.canvas) {
    // In canvas, prioritize showing the primary button if it exists
    if (Button) {
      return /*#__PURE__*/ _jsx("div", {
        style: { width: "100%", height: "100%" },
        children: Button,
      });
    } // If no button is connected but out of stock is available, show that
    if (OutOfStock) {
      return /*#__PURE__*/ _jsx("div", {
        style: { width: "100%", height: "100%" },
        children: OutOfStock,
      });
    } // Otherwise show the connect instance message
    return /*#__PURE__*/ _jsx("div", {
      style: { width: "100%", height: "100%" },
      children: connectInstanceMessage,
    });
  } // Browser mode rendering
  // If the product is out of stock
  if (!isInStock) {
    // Return the OutOfStock component if provided
    if (OutOfStock) {
      return /*#__PURE__*/ _jsx("div", {
        style: { width: "100%", height: "100%" },
        children: OutOfStock,
      });
    } // Otherwise, hide the component completely
    return null;
  } // Hide in browser if no variant available
  if (!activeVariant) {
    return null;
  } // Render with click handling for in-stock items
  return /*#__PURE__*/ _jsxs("div", {
    style: { width: "100%", height: "100%" },
    className: "fc-quick-add-button-container",
    onClick: handleClick,
    role: "button",
    tabIndex: 0,
    "aria-label": type === "Buy Now" ? "Buy Now" : "Add to Cart",
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick(e);
      }
    },
    children: [
      /*#__PURE__*/ _jsx("style", {
        children: `
                .fc-quick-add-button-container :focus-visible {
                    outline: ${focus?.width || 2}px solid ${
          focus?.color || "#007AFF"
        } !important;
                    outline-offset: ${focus?.padding || 2}px !important;
                    border-radius: ${focus?.radius || 0}px !important;
                }
            `,
      }),
      Button || fallbackButton,
    ],
  });
}
addPropertyControls(FC_ProductQuickAddButton, {
  shopifyProductID: {
    type: ControlType.String,
    title: "Product ID",
    description: "Connect to CMS",
  },
  Button: { type: ControlType.ComponentInstance, title: "Quick Add" },
  OutOfStock: {
    type: ControlType.ComponentInstance,
    title: "Out of Stock",
    description: "If no button is connected, component will hide.",
  },
  type: {
    type: ControlType.Enum,
    title: "Type",
    options: ["Add to Cart", "Buy Now"],
    optionTitles: ["Add to Cart", "Buy Now"],
    defaultValue: "Add to Cart",
    displaySegmentedControl: true,
    segmentedControlDirection: "vertical",
  },
  openCart: {
    title: "Trigger Cart",
    description:
      "Open your cart on click. If button is inside the cart, select No to keep the cart open.",
    type: ControlType.Boolean,
    enabledTitle: "Yes",
    disabledTitle: "No",
    defaultValue: true,
  },
  focus: {
    type: ControlType.Object,
    title: "Focus",
    controls: {
      radius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 0,
        min: 0,
        max: 100,
        step: 1,
        displayStepper: true,
      },
      width: {
        type: ControlType.Number,
        title: "Width",
        defaultValue: 2,
        min: 0,
        max: 20,
        step: 1,
        displayStepper: true,
      },
      padding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: 2,
        min: 0,
        max: 20,
        step: 1,
        displayStepper: true,
      },
      color: {
        type: ControlType.Color,
        title: "Color",
        defaultValue: "#007AFF",
      },
    },
  },
});
export const __FramerMetadata__ = {
  exports: {
    ButtonType: { type: "tsType", annotations: { framerContractVersion: "1" } },
    default: {
      type: "reactComponent",
      name: "FC_ProductQuickAddButton",
      slots: [],
      annotations: { framerDisableUnlink: "", framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
