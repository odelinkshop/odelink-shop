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
 * © 2024 Framer Commerce. All Rights Reserved.
 */ import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useState, cloneElement } from "react";
import { addPropertyControls, ControlType } from "framer";
/**
 * @framerDisableUnlink
 */ export default function FC_CartClearButton(props) {
  var _content_props;
  const { Default } = props;
  const [isClearing, setIsClearing] = useState(false);
  const waitForShopXTools = (timeout = 1e4) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkCondition = () => {
        if (window.shopXtools && window.shopXtools.handleCartMutation) {
          resolve();
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error("shopXtools not initialized within timeout"));
        } else {
          setTimeout(checkCondition, 100);
        }
      };
      checkCondition();
    });
  };
  const clearCart = useCallback(
    async (e) => {
      if (isClearing) return;
      setIsClearing(true);
      try {
        var _currentCart_lines_edges, _currentCart_lines;
        await waitForShopXTools();
        const cartId = localStorage.getItem("shopX_cart_id");
        if (!cartId) {
          return;
        }
        const currentCart = window.shopXtools.cart;
        const lineIds =
          (currentCart === null || currentCart === void 0
            ? void 0
            : (_currentCart_lines = currentCart.lines) === null ||
              _currentCart_lines === void 0
            ? void 0
            : (_currentCart_lines_edges = _currentCart_lines.edges) === null ||
              _currentCart_lines_edges === void 0
            ? void 0
            : _currentCart_lines_edges.map((edge) => edge.node.id)) || [];
        if (lineIds.length === 0) {
          return;
        }
        const clearCartMutation = `
                mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
                    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
                        cart {
                            id
                            lines(first: 100) {
                                edges {
                                    node {
                                        id
                                        quantity
                                    }
                                }
                            }
                        }
                        userErrors {
                            message
                            field
                        }
                    }
                }
            `;
        const data = await window.shopXtools.handleCartMutation(
          clearCartMutation,
          { cartId, lineIds }
        );
        if (data) {
          localStorage.setItem(
            "shopXtools.cart",
            JSON.stringify(data.cartLinesRemove.cart)
          );
          window.shopXtools.cart = data.cartLinesRemove.cart;
          window.dispatchEvent(new Event("shopXtools-cart-update"));
        }
      } catch (error) {
        // Silent error handling - logging removed
      } finally {
        setIsClearing(false);
      }
    },
    [isClearing]
  );
  let content =
    (Default === null || Default === void 0 ? void 0 : Default[0]) || null;
  if (!content) {
    return null;
  }
  const clonedElement = /*#__PURE__*/ cloneElement(content, {
    style: {
      ...(((_content_props = content.props) === null ||
      _content_props === void 0
        ? void 0
        : _content_props.style) || {}),
      width: "100%",
      height: "100%",
    },
    onClick: clearCart,
  });
  return /*#__PURE__*/ _jsx("div", {
    style: { height: "100%", width: "100%" },
    children: clonedElement,
  });
}
FC_CartClearButton.defaultProps = { Default: null };
addPropertyControls(FC_CartClearButton, {
  Default: { type: ControlType.ComponentInstance, title: "Button Design" },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FC_CartClearButton",
      slots: [],
      annotations: { framerDisableUnlink: "", framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./FC_CartClear.map
