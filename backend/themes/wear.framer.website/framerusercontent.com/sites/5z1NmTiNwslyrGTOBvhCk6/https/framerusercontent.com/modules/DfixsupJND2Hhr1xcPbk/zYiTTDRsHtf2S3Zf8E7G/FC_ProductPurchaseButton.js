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
import { useEffect, useState, useRef, useCallback, cloneElement } from "react";
import {
  createCartMutation,
  addToCartMutation,
  cartQuery,
  updateCartAttributes,
  updateCartCurrency,
  getProductMetafields,
} from "https://framerusercontent.com/modules/yiRfl1JCGhIBUL31WVDk/wupS2XmBAHu1kBQNv9pi/mutations_v2.js";
import { addPropertyControls, ControlType, RenderTarget } from "framer";
import { get } from "lodash-es";
import { appendAllTrackingParamsToUrl } from "https://framerusercontent.com/modules/w24ELWa2giT3SFaWpV77/398w6fPyag8B92ojouQr/utmParams.js";
import { appendLanguageToUrl } from "https://framerusercontent.com/modules/vC6fzbfO83MgBPIhn5zl/DUlbmWuOELzEUenVmv3G/locales.js";
import { useIsBrowser } from "https://framerusercontent.com/modules/ncBs5KPMI9I5GEta13fn/zGXDjuZapa1SGy6D8P5e/IsBrowser.js";
import {
  trackFacebookPixelAddToCart,
  trackFacebookPixelInitiateCheckout,
  trackFacebookPixelViewContent,
} from "https://framerusercontent.com/modules/6Zs9CjkPbKzHjoy8LK08/iqoIwmJw4hztafi4V4IV/Fb_pixel.js";
import { sanitizeChildrenRecursively } from "https://framerusercontent.com/modules/Da0ApllLKQHSw8djEYKs/NKlmeTJYy3YIy3O2qsS9/cloning.js"; // Import initialization utility to ensure UTM tracking is set up
import "https://framerusercontent.com/modules/FXrY3V9ZYVL8aziafDQn/HIuMDRrKIIcsJe65kZwo/initialize.js";
/**
 * @framerDisableUnlink
 */ export default function FC_ProductPurchaseButton(props) {
  const {
    shopifyProductID,
    available,
    OutOfStock,
    SelectVariant,
    LoadingState,
    maxQuantity,
    shopifyProductVariantId,
    BuyNowATC,
    title = "Add to Cart",
    required = false,
    openCart = true,
  } = props; // State from original component
  const [product, setProduct] = useState();
  const [activeVariant, setActiveVariant] = useState();
  const [isInStock, setIsInStock] = useState(true);
  const [needsVariantSelection, setNeedsVariantSelection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [countryCode, setCountryCode] = useState();
  const isBrowser = useIsBrowser(); // Additional state for cart functionality — read persisted state to
  // avoid flickering to 'one-time' on Framer component-variant remounts
  const [planSelected, setPlanSelected] = useState(() => {
    if (typeof window !== "undefined") {
      const persisted = window.__fc_activeSubscription?.[shopifyProductID];
      if (persisted?.subscriptionId) return persisted.subscriptionId;
    }
    return "one-time";
  });
  const [cartExistingData, setCartExistingData] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [productQuantity, setProductQuantity] = useState(1);
  const viewContentFired = useRef(false);
  const [autoSelectFirst, setAutoSelectFirst] = useState(false);
  const [isVariantManuallySelected, setIsVariantManuallySelected] =
    useState(false);
  const [maxQuantityReached, setMaxQuantityReached] = useState(false);
  const [orderMax, setOrderMax] = useState(0); // Check if variant is autoselected by default
  useEffect(() => {
    if (!isBrowser) return; //console.log("FC_ProductPurchaseButton mounted")
    const handleAutoSelectFlag = (event) => {
      // console.log(
      //     "Auto Select event received as:",
      //     event.detail.autoSelectFirst
      // )
      if (
        event.detail.shopifyProductID !==
        `gid://shopify/Product/${props.shopifyProductID}`
      ) {
        return;
      }
      setAutoSelectFirst(event.detail.autoSelectFirst);
      window.__fc_autoSelectFirst = event.detail.autoSelectFirst; //console.log("Auto Select First Flag:", event.detail.autoSelectFirst)
    };
    document.addEventListener("auto_select_first_flag", handleAutoSelectFlag);
    return () => {
      document.removeEventListener(
        "auto_select_first_flag",
        handleAutoSelectFlag
      );
    };
  }, [isBrowser]); // Calculate total inventory helper function
  const calculateTotalInventory = useCallback((productData) => {
    if (!productData || productData === "404") return 0; // If totalInventory is available, use it
    if (typeof productData.totalInventory === "number") {
      return productData.totalInventory;
    } // Otherwise sum up variant quantities
    return get(productData, "variants.edges", []).reduce((total, { node }) => {
      return total + (node.quantityAvailable || 0);
    }, 0);
  }, []); // Helper function to check if variant is available for sale
  const isVariantAvailable = useCallback((variant) => {
    if (!variant) return false; // If availableForSale is true, the variant can be sold regardless of quantity
    if (variant.availableForSale) return true; // If availableForSale is false, check quantity
    return variant.quantityAvailable > 0;
  }, []); // Error handling
  useEffect(() => {
    if (errorMessage && isBrowser) {
      const event = new CustomEvent("errorChanged", { detail: errorMessage });
      window.dispatchEvent(event);
    }
  }, [errorMessage]); // Load cart from localStorage
  useEffect(() => {
    if (!isBrowser || !window["shopXtools"]) return; // Try to load cart ID first
    const savedCartId = localStorage.getItem("shopX_cart_id");
    if (savedCartId) {
      // If we have a cart ID, fetch the cart data
      window.shopXtools
        .handleCartMutation(cartQuery, { cartId: savedCartId })
        .then((data) => {
          if (data?.cart) {
            setCartExistingData(data.cart);
            window.shopXtools.cart = data.cart;
            localStorage.setItem("shopXtools.cart", JSON.stringify(data.cart));
          }
        })
        .catch((error) => {
          // Clear invalid cart data
          localStorage.removeItem("shopX_cart_id");
          localStorage.removeItem("shopXtools.cart");
        });
    } // Check for persisted subscription state that may have been set
    // before this component mounted (solves race on page load when
    // default is "Subscribe")
    const persisted = window.__fc_activeSubscription?.[shopifyProductID];
    if (persisted?.subscriptionId) {
      setPlanSelected(persisted.subscriptionId);
    }
    const handleSubscriptionChange = (event) => {
      // Only apply subscription selection for this specific product
      if (
        event.detail?.productId &&
        event.detail.productId !== shopifyProductID
      )
        return;
      setPlanSelected(event.detail.subscriptionId);
    };
    document.addEventListener(
      "subscription__selection-sync",
      handleSubscriptionChange
    );
    return () =>
      document.removeEventListener(
        "subscription__selection-sync",
        handleSubscriptionChange
      );
  }, [isBrowser, shopifyProductID]); // Add this at the top level with other event handlers
  const handleQuantityChange = (event) => {
    // console.log("Quantity change event received:", event.detail)
    setProductQuantity(event.detail);
  };
  useEffect(() => {
    if (isBrowser) {
      window.addEventListener(
        "FcQuantitySelectorchanges",
        handleQuantityChange
      ); // Cleanup
      return () => {
        window.removeEventListener(
          "FcQuantitySelectorchanges",
          handleQuantityChange
        );
      };
    }
  }, [isBrowser]); // Separate effect for ViewContent tracking - more reliable
  useEffect(() => {
    if (!isBrowser || !product || viewContentFired.current) return; // Wait for either activeVariant or at least one variant to be available
    const hasVariantData = activeVariant || product.variants?.edges?.length > 0;
    if (hasVariantData) {
      // console.log('[ViewContent] Firing ViewContent event for product:', product.title);
      trackFacebookPixelViewContent({
        variant: activeVariant || product.variants?.edges?.[0]?.node,
        product: product,
        currency:
          activeVariant?.price?.currencyCode ||
          product.variants?.edges?.[0]?.node?.price?.currencyCode ||
          "USD",
      });
      viewContentFired.current = true;
    }
  }, [isBrowser, product, activeVariant]);
  useEffect(() => {
    if (!isBrowser) return;
    const handleCurrencyChange = async (event) => {
      const { countryCode } = event.detail;
      setCountryCode(countryCode);
      const existingCartId = localStorage.getItem("shopX_cart_id");
      if (existingCartId) {
        try {
          const updateData = await window.shopXtools.handleCartMutation(
            updateCartCurrency,
            { cartId: existingCartId, countryCode: countryCode }
          );
          if (updateData?.cartBuyerIdentityUpdate?.cart) {
            window.shopXtools.cart = updateData.cartBuyerIdentityUpdate.cart;
            window.dispatchEvent(new Event("shopXtools-cart-update"));
          } else {
            window.dispatchEvent(
              new CustomEvent("errorChanged", {
                detail: "Failed to update cart with new country code",
              })
            );
          }
        } catch (error) {
          window.dispatchEvent(
            new CustomEvent("errorChanged", {
              detail: error.message || "Failed to update cart currency",
            })
          );
        }
      }
    };
    window.addEventListener("currency_changed", handleCurrencyChange);
    return () => {
      window.removeEventListener("currency_changed", handleCurrencyChange);
    };
  }, [isBrowser]); // Load product data and set up event listeners
  useEffect(() => {
    if (!isBrowser) return;
    const handleSingleVariantProduct = (productNode) => {
      if (!productNode) return false;
      const variants = get(productNode, "variants.edges", []);
      if (variants.length === 1) {
        const variant = variants[0].node;
        setActiveVariant(variant);
        if (!isVariantManuallySelected) {
          window.__fc_activeVariantId = variant.id;
        }
        setIsInStock(isVariantAvailable(variant));
        setNeedsVariantSelection(false);
        return true;
      }
      return false;
    };
    const handleProductData = (_matchingProduct) => {
      // Early return if we already have this exact product loaded
      if (product && product !== "404") {
        const currentProductId = product?.id;
        const incomingProductId = _matchingProduct?.node?.id;
        if (
          currentProductId &&
          incomingProductId &&
          currentProductId === incomingProductId
        ) {
          // console.log(
          //   '[handleProductData] Product already loaded, skipping update'
          // );
          return;
        }
      } // console.log(
      //   '[handleProductData] Processing product update',
      //   product,
      //   _matchingProduct
      // );
      if (_matchingProduct) {
        const productNode = _matchingProduct.node;
        setProduct(productNode || "404"); // Fetch order_max if we have a product handle
        if (productNode?.handle) {
          fetchOrderMax(productNode.handle);
        } // If shopifyProductVariantId is provided, find and set that variant
        if (shopifyProductVariantId && productNode) {
          const variantId = `gid://shopify/ProductVariant/${shopifyProductVariantId}`;
          const matchingVariant = get(productNode, "variants.edges", []).find(
            ({ node }) => node.id === variantId
          );
          if (matchingVariant) {
            setActiveVariant(matchingVariant.node);
            if (!isVariantManuallySelected) {
              window.__fc_activeVariantId = matchingVariant.node.id;
            }
            setIsInStock(isVariantAvailable(matchingVariant.node));
            setNeedsVariantSelection(false);
            return; // Exit early as we've found our variant
          }
        } // Immediately handle single variant products
        if (handleSingleVariantProduct(productNode)) {
          return; // Exit early as we've handled the single variant
        }
        if (autoSelectFirst && !isVariantManuallySelected) {
          //console.log("Auto-selecting the first variant");
          const firstAvailableVariant = productNode.variants.edges.find(
            (edge) => edge.node.availableForSale
          )?.node;
          if (firstAvailableVariant) {
            setActiveVariant(firstAvailableVariant);
            if (!isVariantManuallySelected) {
              window.__fc_activeVariantId = firstAvailableVariant.id;
            }
            setIsInStock(isVariantAvailable(firstAvailableVariant));
            setNeedsVariantSelection(false);
            return; // Exit early as we've set the active variant
          }
        } // For multi-variant products without a selected variant
        const variants = get(productNode, "variants.edges", []);
        const hasMultipleVariants = variants.length > 1;
        const optionsCount = get(productNode, "options", []).length || 0; // Only update needsVariantSelection if we don't have an active variant.
        // This is to prevent the "Select Variant" button from showing when the variant is already selected.
        if (!activeVariant) {
          if (!autoSelectFirst && hasMultipleVariants) {
            setNeedsVariantSelection(true);
          } else {
            setNeedsVariantSelection(
              !shopifyProductVariantId && hasMultipleVariants
            );
          }
        } // Check if any variant is available
        const anyVariantAvailable = variants.some(({ node }) =>
          isVariantAvailable(node)
        );
        setIsInStock(anyVariantAvailable); // If nothing is available, do not prompt for variant selection
        if (!anyVariantAvailable) {
          setNeedsVariantSelection(false);
        }
      } else {
        setProduct("404");
        setIsInStock(false);
      }
    }; // Check if we already have product data available
    if (
      window.shopXtools?.products &&
      Array.isArray(window.shopXtools.products) &&
      !product
    ) {
      const _matchingProduct = window.shopXtools.products.find(
        ({ node }) => node.id === `gid://shopify/Product/${shopifyProductID}`
      );
      if (_matchingProduct) {
        // console.log(
        //   '[PURCHASE BUTTON] Found matching product on mount, loading it'
        // );
        handleProductData(_matchingProduct);
      } else {
        // console.log(
        //   '[PURCHASE BUTTON] No matching product found in existing products'
        // );
      }
    }
    const productsReadyHandler = () => {
      if (window?.shopXtools?.products) {
        const matchingProduct = window.shopXtools.products.find(
          ({ node: product }) =>
            product.id === `gid://shopify/Product/${shopifyProductID}`
        ); // console.log(
        //   '[productsReadyHandler] Found matching product:',
        //   !!matchingProduct
        // );
        // Only update if we don't already have this product data loaded
        if (!product || product === "404") {
          // console.log(
          //   '[productsReadyHandler] No product loaded yet, calling handleProductData'
          // );
          handleProductData(matchingProduct);
        }
      }
    };
    const variantChangeHandler = (e) => {
      // Only update the variant if no shopifyProductVariantId is provided
      // console.log("Variant changed, active variant is", e.detail)
      if (e.detail.productId !== `gid://shopify/Product/${shopifyProductID}`) {
        return;
      }
      if (e.detail) {
        // Normalize completeness: some dispatchers may omit isCompleteVariant.
        const productOptions = get(product, "options", []) || [];
        const selectedArray = Array.isArray(e.detail.selectedOptions)
          ? e.detail.selectedOptions
          : [];
        const selectedNames = new Set(
          selectedArray.map((o) => o?.name).filter(Boolean)
        );
        const isCompleteFromNames =
          productOptions.length > 0 &&
          productOptions.every((opt) => selectedNames.has(opt.name));
        const isComplete =
          e.detail.isCompleteVariant === true || isCompleteFromNames; // If selection is partial, DO NOT treat it as an active variant for purchasing
        if (!isComplete) {
          setIsVariantManuallySelected(true);
          setActiveVariant(null);
          window.__fc_activeVariantId = undefined;
          setNeedsVariantSelection(true);
          return;
        } // Complete selection – safe to treat as active variant
        setActiveVariant(e.detail);
        setIsVariantManuallySelected(true);
        window.__fc_activeVariantId = e.detail.id;
        setIsInStock(e.detail.quantityAvailable > 0); // console.log("e.detail.id", e.detail.id)
        // console.log(
        //     "window.__fc_activeVariantId",
        //     window.__fc_activeVariantId
        // )
        const cartQuantity = getCurrentCartQuantity(e.detail.id); // console.log("variantChangeHandler: cartQuantity", cartQuantity)
        // if there's a cart item, it can reach the stock limit only if variant's quantityAvailable > 0
        // if variant's quantityAvailable = 0, it's out of stock, and we don't show 'limit reached' state
        // if variant's quantityAvailable < 0, continue selling when out of stock is enabled, so limit cannot ever be reached
        if (
          cartQuantity === e.detail.quantityAvailable &&
          e.detail.quantityAvailable > 0
        ) {
          // console.log("variantChangeHandler: max reached")
          setMaxQuantityReached(true);
        } else {
          setMaxQuantityReached(false);
        } // When autoSelectFirst is false, we need to make sure all variants are selected
        // before changing the button state
        // Only mark selection as complete when all options are selected
        if (isComplete) {
          setNeedsVariantSelection(false);
        } else {
          setNeedsVariantSelection(true);
        }
      }
    };
    document.addEventListener("data__products-ready", productsReadyHandler);
    document.addEventListener(
      "product__active-variant__changed",
      variantChangeHandler
    );
    return () => {
      document.removeEventListener(
        "data__products-ready",
        productsReadyHandler
      );
      document.removeEventListener(
        "product__active-variant__changed",
        variantChangeHandler
      );
    };
  }, [
    shopifyProductID,
    shopifyProductVariantId,
    activeVariant,
    isBrowser,
    calculateTotalInventory,
    autoSelectFirst,
    product,
  ]); // Update variant selection state when activeVariant changes
  useEffect(() => {
    if (!product || product === "404") return;
    const variants = get(product, "variants.edges", []);
    const hasMultipleVariants = variants.length > 1;
    const noVariantSelected = !activeVariant && !shopifyProductVariantId; // console.log('Variant selection state update:', {
    //     hasMultipleVariants,
    //     noVariantSelected,
    //     activeVariant,
    //     shopifyProductVariantId
    // })
    setNeedsVariantSelection(hasMultipleVariants && noVariantSelected);
  }, [product, activeVariant, shopifyProductVariantId]); // Cart functionality
  // Add new state for order field validation
  const [orderFieldError, setOrderFieldError] = useState(false); // Debug logging function
  const logDebug = (message, data) => {
    // Empty function - no logging
  }; // Enhanced validation function with logging
  const validateOrderField = () => {
    if (!props.required) {
      logDebug("Validation skipped - not required", {
        required: props.required,
      });
      return true;
    }
    const productSpecificKey = `fc_cart_attributes_${props.shopifyProductID}`;
    const storedAttributes = sessionStorage.getItem(productSpecificKey);
    logDebug("Checking stored attributes", {
      productSpecificKey,
      hasStoredAttributes: !!storedAttributes,
    });
    if (!storedAttributes) {
      return false;
    }
    try {
      const parsedAttrs = JSON.parse(storedAttributes); // Check if any attribute has a non-empty value
      const hasValidValue = Object.values(parsedAttrs).some(
        (value) => value && String(value).trim() !== ""
      );
      logDebug("Validation result", {
        attributes: parsedAttrs,
        isValid: hasValidValue,
      });
      return hasValidValue;
    } catch (error) {
      return false;
    }
  }; // Effect to initialize validation state
  useEffect(() => {
    if (props.required) {
      const isValid = validateOrderField();
      logDebug("Initial validation", { isValid, required: props.required });
      setOrderFieldError(!isValid);
    }
  }, [props.required, props.shopifyProductID]); // Listen for order field changes with logging
  useEffect(() => {
    if (props.required) {
      const handleOrderFieldChange = (event) => {
        logDebug("Order field change event received", event.detail);
        const isValid = validateOrderField();
        setOrderFieldError(!isValid);
        logDebug("Order field validation updated", {
          isValid,
          orderFieldError: !isValid,
        });
      };
      window.addEventListener("orderFieldChanged", handleOrderFieldChange);
      return () =>
        window.removeEventListener("orderFieldChanged", handleOrderFieldChange);
    }
  }, [props.required]);
  const [isInputRequired, setIsInputRequired] = useState(false); // Effect to check if the input field exists and is required
  useEffect(() => {
    const checkInputRequirement = () => {
      const configKey = `fc_input_config_${shopifyProductID}`;
      const config = sessionStorage.getItem(configKey); // Only set as required if the config exists and required is true
      if (config) {
        const { required } = JSON.parse(config);
        setIsInputRequired(required);
      } else {
        // If no config exists, the field isn't on the page
        setIsInputRequired(false);
      }
    };
    checkInputRequirement(); // Listen for config changes
    window.addEventListener("inputConfigChanged", checkInputRequirement);
    return () =>
      window.removeEventListener("inputConfigChanged", checkInputRequirement);
  }, [shopifyProductID]);
  const getLineItem = () => {
    const merchandiseId =
      activeVariant?.id ||
      (props.shopifyProductVariantId
        ? `gid://shopify/ProductVariant/${props.shopifyProductVariantId}`
        : null);
    if (!merchandiseId) {
      throw new Error("No valid product variant selected");
    }
    const lineItem = { merchandiseId, quantity: productQuantity }; // Add selling plan ID if a subscription is selected
    if (planSelected && planSelected !== "one-time") {
      lineItem["sellingPlanId"] = planSelected;
    }
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
  }; // Fetch order_max from product metafields
  const fetchOrderMax = useCallback(async (productHandle) => {
    if (!productHandle) return;
    try {
      const metafieldsResponse = await window.shopXtools?.handleCartMutation?.(
        getProductMetafields,
        { handle: productHandle }
      );
      const max = parseInt(
        metafieldsResponse?.product?.metafield_order_max?.value,
        10
      );
      if (!isNaN(max) && max > 0) {
        setOrderMax(max); // console.log("Fetched order max", max)
      } else {
        setOrderMax(0);
      }
    } catch (error) {
      console.warn("Could not fetch product metafields for order_max:", error);
      setOrderMax(0);
    }
  }, []); // Modify the getCurrentCartQuantity function to calculate per-product quantity
  const getCurrentCartQuantity = useCallback(
    (variantId) => {
      // if (!cartExistingData?.lines?.edges) {
      //     return 0
      // }
      const liveCart = window?.shopXtools?.cart;
      setCartExistingData(liveCart);
      const liveEdges = liveCart?.lines?.edges;
      if (!liveEdges) return 0; // If we have a product handle, calculate per-product quantity
      if (product?.handle && orderMax > 0) {
        const productVariantIds = get(product, "variants.edges", []).map(
          ({ node }) => node.id
        );
        const totalQuantity = liveEdges.reduce((total, { node }) => {
          if (productVariantIds.includes(node.merchandise.id)) {
            return total + node.quantity;
          }
          return total;
        }, 0); // console.log("getCurrentCartQuantity (per-product):", totalQuantity)
        return totalQuantity;
      } // Fallback to variant-specific quantity
      const quantity = liveEdges.reduce((total, { node }) => {
        if (node.merchandise.id === variantId) {
          return total + node.quantity;
        }
        return total;
      }, 0); // console.log("getCurrentCartQuantity (per-variant):", quantity)
      return quantity;
    },
    [product, orderMax]
  );
  const handleAddToCart = async () => {
    try {
      if (!isBrowser) return;
      const variantId =
        activeVariant?.id ||
        (props.shopifyProductVariantId
          ? `gid://shopify/ProductVariant/${props.shopifyProductVariantId}`
          : null);
      const currentCartQuantity = getCurrentCartQuantity(variantId); // console.log("currentCartQuantity", currentCartQuantity)
      // Check order_max from product metafields
      if (orderMax > 0) {
        // console.log("orderMax > 0", orderMax)
        // Check if we've already reached the product limit
        if (currentCartQuantity >= orderMax) {
          // console.log("currentCartQuantity >= orderMax: Max reached")
          setMaxQuantityReached(true);
          return;
        }
      } // Check quantityAvailable when orderMax is 0 or not set
      if (
        orderMax === 0 &&
        activeVariant &&
        activeVariant.quantityAvailable > 0
      ) {
        // console.log("orderMax is 0, checking quantityAvailable")
        // console.log("activeVariant.quantityAvailable", activeVariant.quantityAvailable)
        // Check if we've already reached the available quantity
        if (currentCartQuantity >= activeVariant.quantityAvailable) {
          // console.log("currentCartQuantity >= quantityAvailable: Max reached")
          setMaxQuantityReached(true);
          return;
        }
      }
      if (props.required || isInputRequired) {
        const productSpecificKey = `fc_cart_attributes_${props.shopifyProductID}`;
        const storedAttributes = sessionStorage.getItem(productSpecificKey);
        const inputElement = document.querySelector(
          `[data-product-id="${props.shopifyProductID}"]`
        );
        const currentInputValue = inputElement?.value || ""; // Don't check for unsaved input if there's no input element or value
        if (inputElement && currentInputValue && storedAttributes) {
          try {
            // Parse stored attributes
            const parsedAttrs = JSON.parse(storedAttributes); // Check if the current input value is different from any of the stored attribute values
            const valueIsSaved = Object.values(parsedAttrs).some(
              (attrValue) =>
                String(attrValue).trim() === currentInputValue.trim()
            );
            if (!valueIsSaved) {
              window.dispatchEvent(
                new CustomEvent("inputValidationFailed", {
                  detail: {
                    productId: props.shopifyProductID,
                    message: "Please save your input before adding to cart",
                  },
                })
              );
              return;
            }
          } catch (e) {
            // If we can't parse stored attributes, we can't validate
            window.dispatchEvent(
              new CustomEvent("inputValidationFailed", {
                detail: {
                  productId: props.shopifyProductID,
                  message: "Please fill in all required fields",
                },
              })
            );
            return;
          }
        } // Now check if there are any stored attributes at all
        if (!storedAttributes) {
          window.dispatchEvent(
            new CustomEvent("inputValidationFailed", {
              detail: {
                productId: props.shopifyProductID,
                message: "Please fill in all required fields",
              },
            })
          );
          return;
        } // Finally check if any of the stored attributes has a valid value
        try {
          const parsedAttrs = JSON.parse(storedAttributes);
          const hasValidValue = Object.values(parsedAttrs).some(
            (value) => value && String(value).trim() !== ""
          );
          if (!hasValidValue) {
            window.dispatchEvent(
              new CustomEvent("inputValidationFailed", {
                detail: {
                  productId: props.shopifyProductID,
                  message: "Please fill in all required fields",
                },
              })
            );
            return;
          }
        } catch (e) {
          window.dispatchEvent(
            new CustomEvent("inputValidationFailed", {
              detail: {
                productId: props.shopifyProductID,
                message: "Please fill in all required fields",
              },
            })
          );
          return;
        }
      }
      const lines = [getLineItem()]; // console.log("handleAddToCart lines:", lines)
      // Retrieve the selected country code from localStorage
      const countryCode = localStorage.getItem("selectedCountryCode");
      let existingCartId = localStorage.getItem("shopX_cart_id");
      if (!BuyNowATC) {
        if (existingCartId) {
          try {
            const cartValidation = await window.shopXtools.handleCartMutation(
              cartQuery,
              { cartId: existingCartId }
            );
            if (!cartValidation?.cart) {
              localStorage.removeItem("shopX_cart_id");
              localStorage.removeItem("shopXtools.cart");
              existingCartId = null;
            }
          } catch (error) {
            localStorage.removeItem("shopX_cart_id");
            localStorage.removeItem("shopXtools.cart");
            existingCartId = null;
          }
        }
        if (!existingCartId) {
          try {
            const cartData = await window.shopXtools.handleCartMutation(
              createCartMutation,
              { lines, countryCode: countryCode }
            );
            if (cartData?.cartCreate?.cart?.id) {
              localStorage.setItem(
                "shopX_cart_id",
                cartData.cartCreate.cart.id
              );
              localStorage.setItem(
                "shopXtools.cart",
                JSON.stringify(cartData.cartCreate.cart)
              );
              window.shopXtools.cart = cartData.cartCreate.cart;
              setCartExistingData(window.shopXtools.cart); // Dispatch event after updating the cart
              window.dispatchEvent(new Event("shopXtools-cart-update")); // Analytics
              const currency = activeVariant?.price?.currencyCode || "USD";
              const value = parseFloat(
                (
                  parseFloat(activeVariant?.price?.amount || "0") *
                  productQuantity
                ).toFixed(2)
              );
              const item_id = cleanShopifyId(activeVariant?.id);
              const item_name = product?.title || ""; // const item_variant = activeVariant?.selectedOptions
              //     .map(opt => `${opt.name} ${opt.value}`)
              //     .join(" / ") || null
              const item_variant = activeVariant?.selectedOptions
                ? activeVariant.selectedOptions
                    .map((opt) => `${opt.name} ${opt.value}`)
                    .join(" / ") || null
                : "";
              const price = parseFloat(activeVariant?.price?.amount || "0"); // Google Analytics tracking (add_to_cart)
              if (item_id && item_name && item_variant && price > 0) {
                const payload = {
                  currency,
                  value,
                  items: [
                    {
                      item_id,
                      item_name,
                      item_variant,
                      price,
                      item_brand: product?.vendor || null,
                      item_category: product?.productType || null,
                      quantity: productQuantity, // TagHound compatibility
                      SKU: item_id,
                      "Item Name": item_name,
                    },
                  ],
                }; // console.log('[FC_ProductPurchaseButton ANALYTICS] About to fire add_to_cart with payload:', payload);
                if (typeof window.fcTrackGAEvent === "function") {
                  window.fcTrackGAEvent("add_to_cart", payload); // console.log('[FC_ProductPurchaseButton ANALYTICS] Fired add_to_cart:', payload.items[0]);
                }
              } else {
                console.warn("❌ Skipping add_to_cart: missing item data", {
                  item_id,
                  item_name,
                  item_variant,
                  price,
                  value,
                });
              } // Meta Pixel tracking
              trackFacebookPixelAddToCart({
                variant: activeVariant,
                product: product,
                quantity: productQuantity,
                currency: currency,
              });
              window.shopXtools.dispatchEvent("checkout__changed", {
                __triggerCartModal: openCart,
              });
            } else {
              window.dispatchEvent(
                new CustomEvent("errorChanged", {
                  detail: "Failed to add to cart",
                })
              );
            }
          } catch (error) {
            window.dispatchEvent(
              new CustomEvent("errorChanged", {
                detail: error.message || "Failed to create new cart",
              })
            );
          }
        } else {
          const cartData = await window.shopXtools.handleCartMutation(
            addToCartMutation,
            { cartId: existingCartId, lines }
          );
          if (cartData?.cartLinesAdd?.cart) {
            localStorage.setItem(
              "shopXtools.cart",
              JSON.stringify(cartData.cartLinesAdd.cart)
            );
            window.shopXtools.cart = cartData.cartLinesAdd.cart; // console.log("handleAddToCart cart:", window.shopXtools.cart)
            setCartExistingData(window.shopXtools.cart); // Dispatch event after updating the cart
            window.dispatchEvent(new Event("shopXtools-cart-update")); // Google Analytics tracking
            const currency = activeVariant?.price?.currencyCode || "USD";
            const value = parseFloat(
              (
                parseFloat(activeVariant?.price?.amount || "0") *
                productQuantity
              ).toFixed(2)
            );
            const item_id = cleanShopifyId(activeVariant?.id);
            const item_name = product?.title || ""; // const item_variant = activeVariant?.selectedOptions
            //     .map(opt => `${opt.name} ${opt.value}`)
            //     .join(" / ") || null
            const item_variant = activeVariant?.selectedOptions
              ? activeVariant.selectedOptions
                  .map((opt) => `${opt.name} ${opt.value}`)
                  .join(" / ") || null
              : "";
            const price = parseFloat(activeVariant?.price?.amount || "0"); // Google Analytics tracking (add_to_cart)
            if (item_id && item_name && item_variant && price > 0) {
              const payload = {
                currency,
                value,
                items: [
                  {
                    item_id,
                    item_name,
                    item_variant,
                    price,
                    item_brand: product?.vendor || null,
                    item_category: product?.productType || null,
                    quantity: productQuantity, // TagHound compatibility
                    SKU: item_id,
                    "Item Name": item_name,
                  },
                ],
              }; // console.log('[FC_ProductPurchaseButton ANALYTICS] About to fire add_to_cart with payload:', payload);
              if (typeof window.fcTrackGAEvent === "function") {
                window.fcTrackGAEvent("add_to_cart", payload); // console.log('[FC_ProductPurchaseButton ANALYTICS] Fired add_to_cart:', payload.items[0]);
              }
            } else {
              console.warn("❌ Skipping add_to_cart: missing item data", {
                item_id,
                item_name,
                item_variant,
                price,
                value,
              });
            } // Meta Pixel tracking
            trackFacebookPixelAddToCart({
              variant: activeVariant,
              product: product,
              quantity: productQuantity,
              currency: currency,
            });
            window.shopXtools.dispatchEvent("checkout__changed", {
              __triggerCartModal: openCart,
            });
          } else {
            window.dispatchEvent(
              new CustomEvent("errorChanged", {
                detail: "Failed to add to cart",
              })
            );
          }
        }
      } // Directly proceed to checkout without opening the cart modal
      if (BuyNowATC) {
        //console.log("Directly proceeding to checkout without opening the cart modal")
        // Create the cart and proceed to checkout
        const variables = { lines, countryCode: countryCode }; //console.log("Sending mutation with variables:", variables)
        const result = await window["shopXtools"]?.handleTemporaryCartMutation(
          createCartMutation,
          variables
        ); //console.log("result:", result)
        const checkoutUrl = result.cartCreate.cart.checkoutUrl;
        if (checkoutUrl) {
          //console.log("checkoutUrl:", checkoutUrl)
          let finalCheckoutUrl = checkoutUrl;
          if (finalCheckoutUrl) {
            // Analytics
            const currency = activeVariant?.price?.currencyCode || "USD";
            const value = parseFloat(
              (
                parseFloat(activeVariant?.price?.amount || "0") *
                productQuantity
              ).toFixed(2)
            );
            const item_id = cleanShopifyId(activeVariant?.id);
            const item_name = product?.title || ""; // const item_variant = activeVariant?.selectedOptions
            //     .map(opt => `${opt.name} ${opt.value}`)
            //     .join(" / ") || null
            const item_variant = activeVariant?.selectedOptions
              ? activeVariant.selectedOptions
                  .map((opt) => `${opt.name} ${opt.value}`)
                  .join(" / ") || null
              : "";
            const price = parseFloat(activeVariant?.price?.amount || "0"); // Google Analytics tracking (begin_checkout)
            if (item_id && item_name && item_variant && price > 0) {
              const payload = {
                currency,
                value,
                items: [
                  {
                    item_id,
                    item_name,
                    item_variant,
                    price,
                    item_brand: product?.vendor || null,
                    item_category: product?.productType || null,
                    quantity: productQuantity, // TagHound compatibility
                    SKU: item_id,
                    "Item Name": item_name,
                  },
                ],
              }; // console.log('[FC_ProductPurchaseButton ANALYTICS] About to fire begin_checkout with payload:', payload);
              if (typeof window.fcTrackGAEvent === "function") {
                window.fcTrackGAEvent("begin_checkout", payload); // console.log('[FC_ProductPurchaseButton ANALYTICS] Fired begin_checkout:', payload.items[0]);
              }
            } else {
              console.warn("❌ Skipping begin_checkout: missing item data", {
                item_id,
                item_name,
                item_variant,
                price,
                value,
              });
            } // Meta Pixel tracking
            trackFacebookPixelInitiateCheckout({
              variant: activeVariant,
              product: product,
              quantity: productQuantity,
              currency: currency,
              useBeacon: true,
            });
            finalCheckoutUrl = appendAllTrackingParamsToUrl(finalCheckoutUrl);
            finalCheckoutUrl = appendLanguageToUrl(finalCheckoutUrl);
            window.location.assign(finalCheckoutUrl);
          }
        } else {
          window.dispatchEvent(
            new CustomEvent("errorChanged", {
              detail: "Failed to create cart for checkout",
            })
          );
        }
      }
      if (lines[0].attributes) {
        // const cartId = existingCartId || cartData?.cartCreate?.cart?.id;
        const cartId = existingCartId; //removed check for cartData
        await window.shopXtools.handleCartMutation(updateCartAttributes, {
          cartId,
          attributes: lines[0].attributes,
        });
      }
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent("errorChanged", {
          detail: error.message || "Failed to add item to cart",
        })
      );
    }
  }; // Update loading state when product data is received
  useEffect(() => {
    if (product) {
      setIsLoading(false);
    }
  }, [product]); // Initialize hasInitialized
  useEffect(() => {
    if (!hasInitialized && (product || shopifyProductID)) {
      // && (product || shopifyProductID) part ensures the button is rendered in Framer preview
      // Small delay to ensure we have all the necessary data
      const timer = setTimeout(() => {
        setHasInitialized(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [product]); // Handle loading state for canvas preview
  const isDesignOrPreview = RenderTarget.current() === RenderTarget.canvas;
  let content = null;
  if (isDesignOrPreview) {
    content = available?.[0] || null; // Always show available state in canvas
  } else if (!hasInitialized) {
    content = null;
  } else if (maxQuantityReached && maxQuantity?.[0]) {
    content = maxQuantity?.[0] || null;
  } else if (
    (!isInStock && !activeVariant?.availableForSale) ||
    (activeVariant && !isVariantAvailable(activeVariant)) ||
    (product &&
      !get(product, "variants.edges", []).some(({ node }) =>
        isVariantAvailable(node)
      )) ||
    (props.required && orderFieldError)
  ) {
    // Prioritize Out of Stock over prompting variant selection
    content = OutOfStock?.[0] || null;
  } else if (needsVariantSelection) {
    content = SelectVariant?.[0] || null;
  } else {
    content = available?.[0] || null;
  } // Near the bottom of the component where we create clonedElement
  const canAddToCart =
    (isInStock || (activeVariant && activeVariant.availableForSale)) &&
    !needsVariantSelection &&
    !maxQuantityReached &&
    (!props.required || !orderFieldError);
  const handleClick = (e) => {
    if (canAddToCart) {
      handleAddToCart();
    }
  }; // Single consolidated effect for maxQuantityReached
  useEffect(() => {
    const variantId =
      activeVariant?.id ||
      (props.shopifyProductVariantId
        ? `gid://shopify/ProductVariant/${props.shopifyProductVariantId}`
        : null); // Always read from live cart to avoid stale state after updates
    const currentQuantity = getCurrentCartQuantity(variantId); // console.log("currentQuantity", currentQuantity)
    let shouldBeAtMax = false; // Check orderMax first (takes precedence)
    if (orderMax > 0) {
      shouldBeAtMax = currentQuantity >= orderMax; // console.log("orderMax check - shouldBeAtMax:", shouldBeAtMax)
    } else if (orderMax === 0 && activeVariant) {
      if (
        activeVariant.quantityAvailable > 0 &&
        activeVariant.availableForSale
      ) {
        // If no orderMax, check quantityAvailable
        shouldBeAtMax = currentQuantity >= activeVariant.quantityAvailable; // console.log("quantityAvailable check - shouldBeAtMax:", shouldBeAtMax)
      }
    }
    if (shouldBeAtMax !== maxQuantityReached) {
      // console.log("shouldBeAtMax !== maxQuantityReached", maxQuantityReached, shouldBeAtMax)
      setMaxQuantityReached(shouldBeAtMax);
    }
  }, [
    orderMax,
    activeVariant,
    props.shopifyProductVariantId,
    maxQuantityReached,
    getCurrentCartQuantity,
  ]); // Add this effect near the other useEffect hooks
  useEffect(() => {
    if (orderMax > 0) {
      window.dispatchEvent(
        new CustomEvent("setMaxQuantity", {
          detail: { productId: props.shopifyProductID, maxQuantity: orderMax },
        })
      );
    }
  }, [orderMax, props.shopifyProductID]); // Add this effect to handle cart updates
  useEffect(() => {
    const variantId =
      activeVariant?.id ||
      (props.shopifyProductVariantId
        ? `gid://shopify/ProductVariant/${props.shopifyProductVariantId}`
        : null);
    const currentInCart = getCurrentCartQuantity(variantId);
    if (orderMax > 0 && cartExistingData) {
      // Handle orderMax scenario
      const remainingAllowed = Math.max(0, orderMax - currentInCart);
      window.dispatchEvent(
        new CustomEvent("setMaxQuantity", {
          detail: {
            productId: props.shopifyProductID,
            maxQuantity: remainingAllowed,
          },
        })
      ); // console.log("sending setMaxQuantity, orderMAx > 0 (cartExistingData)", {
      //     detail: {
      //         productId: props.shopifyProductID,
      //         maxQuantity: remainingAllowed,
      //     },
      // })
    } else if (orderMax === 0 && activeVariant && cartExistingData) {
      // console.log("cartExistingData, currentInCart", cartExistingData, currentInCart)
      if (
        activeVariant.quantityAvailable > 0 &&
        activeVariant.availableForSale
      ) {
        // Handle quantityAvailable scenario
        const remainingAllowed = Math.max(
          0,
          activeVariant.quantityAvailable - currentInCart
        );
        window.dispatchEvent(
          new CustomEvent("setMaxQuantity", {
            detail: {
              productId: props.shopifyProductID,
              maxQuantity: remainingAllowed,
            },
          })
        ); // console.log("sending setMaxQuantity,  orderMAx = 0 (cartExistingData)", {
        //     detail: {
        //         productId: props.shopifyProductID,
        //         maxQuantity: remainingAllowed,
        //     },
        // })
      }
    }
  }, [
    cartExistingData,
    orderMax,
    activeVariant,
    props.shopifyProductVariantId,
    getCurrentCartQuantity,
    productQuantity,
  ]); // Effect to handle general cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      // console.log("handleCartUpdate: Cart updated, refreshing purchase button state")
      // Force recalculation of maxQuantityReached state
      const variantId = activeVariant?.id || null;
      const currentQuantity = getCurrentCartQuantity(variantId);
      if (orderMax > 0) {
        const shouldBeAtMax = currentQuantity >= orderMax;
        setMaxQuantityReached(shouldBeAtMax); // console.log("handleCartUpdate: orderMax > 0, shouldBeAtMax:", shouldBeAtMax)
      } else if (
        orderMax === 0 &&
        activeVariant &&
        activeVariant.quantityAvailable > 0
      ) {
        const shouldBeAtMax =
          currentQuantity >= activeVariant.quantityAvailable;
        setMaxQuantityReached(shouldBeAtMax); // console.log("handleCartUpdate: orderMax = 0, shouldBeAtMax:", shouldBeAtMax)
      } else {
        setMaxQuantityReached(false); // console.log("handleCartUpdate: resetting maxQuantityReached to false")
      }
      const orderMaxRemainingAllowed = Math.max(0, orderMax - currentQuantity); // console.log("handleCartUpdate: orderMaxRemainingAllowed", orderMaxRemainingAllowed)
      const variantQnt =
        activeVariant?.quantityAvailable <= 0 && activeVariant?.availableForSale
          ? 100
          : activeVariant?.quantityAvailable; // console.log("handleCartUpdate: variantQnt", variantQnt)
      const remainingAllowed = Math.max(0, variantQnt - currentQuantity); // console.log("handleCartUpdate: remainingAllowed", remainingAllowed)
      window.dispatchEvent(
        new CustomEvent("setMaxQuantity", {
          detail: {
            productId: props.shopifyProductID,
            maxQuantity:
              orderMax > 0 ? orderMaxRemainingAllowed : remainingAllowed,
          },
        })
      ); // console.log("handleCartUpdate: sending setMaxQuantity", {
      //     detail: {
      //         productId: props.shopifyProductID,
      //         maxQuantity: orderMax > 0 ? orderMaxRemainingAllowed : remainingAllowed,
      //     },
      // })
    };
    window.addEventListener("shopXtools-cart-update", handleCartUpdate);
    return () =>
      window.removeEventListener("shopXtools-cart-update", handleCartUpdate);
  }, [activeVariant, orderMax, getCurrentCartQuantity, props.shopifyProductID]);
  useEffect(() => {
    if (!isBrowser) return;
    const handleResize = () => {
      if (
        typeof window !== "undefined" &&
        window.__fc_autoSelectFirst !== undefined
      ) {
        setAutoSelectFirst(window.__fc_autoSelectFirst);
      }
      if (
        typeof window !== "undefined" &&
        window.__fc_activeVariantId !== undefined
      ) {
        const storedId = window.__fc_activeVariantId; // console.log("storedId", storedId)
        if (storedId) {
          const variants = get(product, "variants.edges", []);
          const found = variants.find(({ node }) => node.id === storedId); // console.log("found", found)
          if (found) setActiveVariant(found.node); // console.log("setting activeVariant", found.node)
        }
      }
      if (product) {
        const variants = get(product, "variants.edges", []);
        const hasMultipleVariants = variants.length > 1; // console.log("activeVariant", activeVariant)
        if (autoSelectFirst) {
          setNeedsVariantSelection(false); // console.log("handleResize: autoSelectFirst, setting needsVariantSelection to false");
        } else if (activeVariant) {
          // If a variant is already selected, don't require selection
          setNeedsVariantSelection(false); // console.log("handleResize: activeVariant exists, setting needsVariantSelection to false");
        } else if (!autoSelectFirst && hasMultipleVariants) {
          setNeedsVariantSelection(true); // console.log("handleResize: !autoSelectFirst && hasMultipleVariants", autoSelectFirst, hasMultipleVariants);
        } else {
          setNeedsVariantSelection(
            !shopifyProductVariantId && hasMultipleVariants
          ); //console.log("handleResize: !shopifyProductVariantId && hasMultipleVariants", shopifyProductVariantId, hasMultipleVariants);
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [
    isBrowser,
    product,
    activeVariant,
    autoSelectFirst,
    shopifyProductVariantId,
  ]);
  const viewItemTrackedRef = useRef();
  const pageViewTrackedRef = useRef(false); // Single consolidated analytics effect
  useEffect(() => {
    if (!product) return; // Helper to extract brand and category if available
    const item_brand = product.vendor || null;
    const item_category = product.productType || null; // Always fire page_view on initial load
    if (!pageViewTrackedRef.current) {
      const productId = cleanShopifyId(product.id);
      const productName = product.title;
      const defaultVariant = get(product, "variants.edges", [])[0]?.node;
      let payload;
      if (defaultVariant) {
        // Product with variants
        payload = {
          currency: defaultVariant.price?.currencyCode || "USD",
          value: parseFloat(defaultVariant.price?.amount || "0"),
          items: [
            {
              item_id: cleanShopifyId(defaultVariant.id),
              item_name: productName,
              item_variant: defaultVariant.title,
              price: parseFloat(defaultVariant.price?.amount || "0"),
              item_brand,
              item_category,
              quantity: 1, // TagHound compatibility
              SKU: cleanShopifyId(defaultVariant.id),
              "Item Name": productName,
            },
          ],
        };
      } else {
        // Product with no variants
        payload = {
          currency: product.priceRange?.minVariantPrice?.currencyCode || "USD",
          value: parseFloat(product.priceRange?.minVariantPrice?.amount || "0"),
          items: [
            {
              item_id: productId,
              item_name: productName,
              price: parseFloat(
                product.priceRange?.minVariantPrice?.amount || "0"
              ),
              item_brand,
              item_category,
              quantity: 1, // TagHound compatibility
              SKU: productId,
              "Item Name": productName,
            },
          ],
        };
      } // We do not fire GA4 page_view manually; GA4 config handles it. Keep only view_item below.
      pageViewTrackedRef.current = true;
    } // Fire view_item when variant is selected
    if (activeVariant && product?.title) {
      const item_id = cleanShopifyId(activeVariant.id);
      const item_name = product.title; // console.log("activeVariant", activeVariant)
      const item_variant = activeVariant?.selectedOptions
        ? activeVariant.selectedOptions
            .map((opt) => `${opt.name} ${opt.value}`)
            .join(" / ") || null
        : "";
      const price = parseFloat(activeVariant.price?.amount || "0");
      const currency = activeVariant.price?.currencyCode || "USD";
      const value = price; // Only fire if all data is present and not already tracked for this variant
      if (
        item_id &&
        item_name &&
        item_variant &&
        price > 0 &&
        viewItemTrackedRef.current !== item_id
      ) {
        const payload = {
          currency,
          value,
          items: [
            {
              item_id,
              item_name,
              item_variant,
              price,
              item_brand,
              item_category,
              quantity: 1, // TagHound compatibility
              SKU: item_id,
              "Item Name": item_name,
            },
          ],
        };
        if (
          payload.items &&
          payload.items.length > 0 &&
          payload.items[0].item_id &&
          payload.items[0].item_name
        ) {
          window.fcTrackGAEvent && window.fcTrackGAEvent("view_item", payload);
          viewItemTrackedRef.current = item_id;
        } else {
          // Skipping view_item - invalid payload
        }
      }
    }
  }, [product, activeVariant]);
  useEffect(() => {
    // On state transition, blur any currently focused button that is about to be hidden
    const focused = document.activeElement;
    if (focused && focused.closest(".fc-purchase-button-container")) {
      focused.blur();
    }
  }, [content]); // Determine canvas preview content
  let canvasContent = null;
  if (isDesignOrPreview) {
    // If "Available" (Add to Cart) is connected, it dominates
    if (available?.[0]) {
      canvasContent = available[0];
    } else if (SelectVariant?.[0]) {
      canvasContent = SelectVariant[0];
    } else if (OutOfStock?.[0]) {
      canvasContent = OutOfStock[0];
    } else if (maxQuantity?.[0]) {
      canvasContent = maxQuantity[0];
    } else if (LoadingState?.[0]) {
      canvasContent = LoadingState[0];
    }
  } // Check if we need to show "Connect Instance" in canvas
  const hasAnyState =
    available?.[0] ||
    SelectVariant?.[0] ||
    OutOfStock?.[0] ||
    maxQuantity?.[0] ||
    LoadingState?.[0];
  if (isDesignOrPreview && !hasAnyState) {
    return /*#__PURE__*/ _jsx("div", {
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
    });
  }
  const href = typeof window !== "undefined" ? window.location.href : "";
  const isPreview = href.includes("framercanvas.com"); // projects in preview always run under the internal domain framercanvas.com // Sanitize content instances before cloning
  const sanitizedCanvasContent = canvasContent
    ? sanitizeChildrenRecursively(canvasContent)
    : null;
  const sanitizedLoadingState = LoadingState?.[0]
    ? sanitizeChildrenRecursively(LoadingState[0])
    : null;
  const sanitizedContent = content
    ? sanitizeChildrenRecursively(content)
    : null;
  return /*#__PURE__*/ _jsxs("div", {
    style: { height: "100%", position: "relative" },
    role: "none",
    className: "fc-purchase-button-container",
    children: [
      /*#__PURE__*/ _jsx("style", {
        children: `
                .fc-purchase-button-container :focus-visible {
                    outline: ${props.focus.width}px solid ${props.focus.color} !important;
                    outline-offset: ${props.focus.padding}px !important;
                    border-radius: ${props.focus.radius}px !important;
                }
            `,
      }),
      isDesignOrPreview
        ? sanitizedCanvasContent &&
          /*#__PURE__*/ cloneElement(sanitizedCanvasContent, {
            style: {
              ...(canvasContent?.props?.style || {}),
              width: "100%",
              height: "100%",
              cursor: "pointer",
              outline: "none",
            },
            onClick: handleClick,
            role: "button",
            "aria-label":
              canvasContent === available?.[0]
                ? props.BuyNowATC
                  ? "Buy now"
                  : "Add to cart"
                : canvasContent === SelectVariant?.[0]
                ? "Select variant"
                : canvasContent === OutOfStock?.[0]
                ? "Out of stock"
                : canvasContent === maxQuantity?.[0]
                ? "Max quantity reached"
                : "Loading",
          })
        : isLoading && !props.skipLoading && sanitizedLoadingState && !isPreview
        ? /*#__PURE__*/ cloneElement(sanitizedLoadingState, {
            style: {
              ...(LoadingState[0].props?.style || {}),
              width: "100%",
              height: "100%",
              outline: "none",
            },
            role: "status",
            "aria-label": `Loading ${
              props.BuyNowATC ? "buy now" : "add to cart"
            } button`,
            "aria-live": "polite",
            tabIndex: -1,
          })
        : sanitizedContent
        ? /*#__PURE__*/ cloneElement(sanitizedContent, {
            style: {
              ...(content?.props?.style || {}),
              width: "100%",
              height: "100%",
              cursor: canAddToCart ? "pointer" : "not-allowed",
              outline: "none",
            },
            onClick: canAddToCart ? handleClick : undefined,
            onKeyDown: canAddToCart
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick(e);
                  }
                }
              : undefined,
            role: "button",
            "aria-disabled": !canAddToCart,
            "aria-label":
              content === available?.[0]
                ? props.BuyNowATC
                  ? "Buy now"
                  : "Add to cart"
                : content === SelectVariant?.[0]
                ? "Select variant"
                : content === OutOfStock?.[0]
                ? "Out of stock"
                : "Max quantity reached",
            tabIndex: hasInitialized ? 0 : -1,
          })
        : null,
    ],
  });
}
addPropertyControls(FC_ProductPurchaseButton, {
  shopifyProductID: {
    type: ControlType.String,
    title: "Product ID",
    description: "Connect to CMS (required)",
  },
  LoadingState: {
    type: ControlType.ComponentInstance,
    title: "Loading",
    hidden: (props) => props.skipLoading,
    description: "Display when product/variant is determining state to show.",
  },
  available: {
    type: ControlType.ComponentInstance,
    title: "Available",
    description:
      "Display when product/variant is available (Add to Cart or Buy Now).",
  },
  SelectVariant: {
    type: ControlType.ComponentInstance,
    title: "Select Variant",
    description: "Display when product/variant requires a variant selection.",
  },
  OutOfStock: {
    type: ControlType.ComponentInstance,
    title: "Out of Stock",
    description: "Display when product/variant is out of stock.",
  },
  maxQuantity: {
    type: ControlType.ComponentInstance,
    title: "Limit Reached",
    description:
      "Display when maximum cart quantity is reached.  \n\n –––– \n\n Connect each state to button component off-page. \n\n If you detatch the button component, you'll need to reconnect the states.",
  },
  BuyNowATC: {
    title: "Buy Now",
    type: ControlType.Boolean,
    enabledTitle: "Yes",
    disabledTitle: "No",
    defaultValue: false,
  },
  skipLoading: {
    title: "Loading State",
    type: ControlType.Boolean,
    enabledTitle: "No",
    disabledTitle: "Yes",
    defaultValue: false,
  },
  openCart: {
    title: "Trigger Cart",
    description:
      "If button is inside the cart, select No to keep the cart open.",
    type: ControlType.Boolean,
    enabledTitle: "Yes",
    disabledTitle: "No",
    defaultValue: true,
    hidden: (props) => props.BuyNowATC,
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
  shopifyProductVariantId: {
    type: ControlType.String,
    title: "Variant ID",
    description:
      "Advanced: Manually set a specific product variant ID (optional).",
  },
}); // Utility to clean Shopify GID to just the numeric ID
const cleanShopifyId = (gid) => gid?.split("/").pop();
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FC_ProductPurchaseButton",
      slots: [],
      annotations: { framerDisableUnlink: "", framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./FC_ProductPurchaseButton.map
