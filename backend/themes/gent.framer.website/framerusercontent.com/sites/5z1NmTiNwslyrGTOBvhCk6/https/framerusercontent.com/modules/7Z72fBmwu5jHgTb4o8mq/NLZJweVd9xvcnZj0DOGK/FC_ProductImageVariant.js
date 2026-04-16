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
import { useEffect, useState } from "react";
import { addPropertyControls, ControlType } from "framer";
import { useIsBrowser } from "https://framerusercontent.com/modules/ncBs5KPMI9I5GEta13fn/zGXDjuZapa1SGy6D8P5e/IsBrowser.js";
/**
 * @framerDisableUnlink
 */ export default function FC_ProductImageVariant(props) {
  const isBrowser = useIsBrowser();
  const [currentImageNumber, setCurrentImageNumber] = useState(1); // Filter out empty images and create array of valid images
  const validImages = Array.from({ length: 250 }, (_, i) => ({
    image: props[`image${i + 1}`],
    imageNumber: i + 1,
  })).filter((item) => item.image); // Find current image based on image number
  const currentImage =
    validImages.find((item) => item.imageNumber === currentImageNumber)
      ?.image ||
    validImages[0]?.image ||
    ""; // Handle image match events
  useEffect(() => {
    if (!isBrowser || !validImages.length) return;
    function handleImageMatch(e) {
      if (e.detail && e.detail.imageNumber) {
        if (
          props.shopifyProductID &&
          e.detail.shopifyProductID !==
            `gid://shopify/Product/${props.shopifyProductID}`
        ) {
          return;
        }
        const imageNumber = parseInt(e.detail.imageNumber);
        if (
          !isNaN(imageNumber) &&
          validImages.some((item) => item.imageNumber === imageNumber)
        ) {
          setCurrentImageNumber(imageNumber);
        }
      }
    }
    document.addEventListener("variant__image__match", handleImageMatch);
    return () => {
      document.removeEventListener("variant__image__match", handleImageMatch);
    };
  }, [isBrowser, validImages]);
  if (!isBrowser) {
    return /*#__PURE__*/ _jsx("div", {
      style: { width: "100%", height: "100%" },
    });
  }
  return /*#__PURE__*/ _jsx("div", {
    style: {
      width: "100%",
      height: "100%",
      display: props.type === "Fill" ? "block" : "flex",
      alignItems: props.type === "Fill" ? "stretch" : "center",
      justifyContent: props.type === "Fill" ? "stretch" : "center",
      backgroundColor: props.Style?.backgroundColor || "#f5f5f5",
      padding: props.Style?.paddingPerSide
        ? `${props.Style.paddingTop}px ${props.Style.paddingRight}px ${props.Style.paddingBottom}px ${props.Style.paddingLeft}px`
        : props.Style?.padding || 0,
      borderRadius: props.Style?.radiusPerCorner
        ? `${props.Style.radiusTopLeft}px ${props.Style.radiusTopRight}px ${props.Style.radiusBottomRight}px ${props.Style.radiusBottomLeft}px`
        : `${props.Style?.borderRadius || 0}px`,
      overflow: "hidden",
      position: "relative",
    },
    children: currentImage
      ? /*#__PURE__*/ _jsx("img", {
          src: currentImage,
          alt: "",
          style: {
            width: "100%",
            height: "100%",
            objectFit: props.type === "Fill" ? "cover" : "contain",
            borderRadius: props.Style?.radiusPerCorner
              ? `${props.Style.radiusTopLeft}px ${props.Style.radiusTopRight}px ${props.Style.radiusBottomRight}px ${props.Style.radiusBottomLeft}px`
              : `${props.Style?.borderRadius || 0}px`,
            display: "block",
            position: props.type === "Fill" ? "absolute" : "relative",
            top: props.type === "Fill" ? 0 : "auto",
            left: props.type === "Fill" ? 0 : "auto",
            minHeight: 0,
            minWidth: 0,
          },
        }) // Show placeholder in canvas mode
      : typeof window !== "undefined" &&
        window.location.hostname.includes("framercanvas.com") &&
        /*#__PURE__*/ _jsxs("svg", {
          width: "40%",
          height: "40%",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "#9e9e9e",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            /*#__PURE__*/ _jsx("rect", {
              x: "3",
              y: "3",
              width: "18",
              height: "18",
              rx: "2",
              ry: "2",
            }),
            /*#__PURE__*/ _jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
            /*#__PURE__*/ _jsx("polyline", { points: "21 15 16 10 5 21" }),
          ],
        }),
  });
} // Generate image property controls dynamically
const controls = {
  shopifyProductID: {
    type: ControlType.String,
    title: "Product ID",
    description: "Connect to Product ID from CMS (required)",
  },
  Style: {
    type: ControlType.Object,
    title: "Style",
    controls: {
      backgroundColor: {
        type: ControlType.Color,
        title: "BG",
        defaultValue: "#FFFFFF00",
      },
      borderRadius: {
        type: ControlType.FusedNumber,
        title: "Radius",
        defaultValue: 0,
        toggleKey: "radiusPerCorner",
        toggleTitles: ["All", "Corners"],
        valueKeys: [
          "radiusTopLeft",
          "radiusTopRight",
          "radiusBottomRight",
          "radiusBottomLeft",
        ],
        valueLabels: ["TL", "TR", "BR", "BL"],
        min: 0,
        max: 100,
        unit: "px",
      },
      padding: {
        type: ControlType.FusedNumber,
        title: "Padding",
        defaultValue: 0,
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
    },
  },
  type: {
    type: ControlType.Enum,
    title: "Type",
    options: ["Fill", "Fit"],
    defaultValue: "Fill",
    displaySegmentedControl: true,
  },
  images: {
    type: ControlType.Enum,
    title: "Images",
    options: ["Auto", "Set"],
    defaultValue: "Auto",
    displaySegmentedControl: true,
  },
}; // Add Amount control that only shows when images mode is "Set"
const shouldShowAmount = (props) => props.images === "Set";
controls.amount = {
  type: ControlType.Number,
  title: "Amount",
  defaultValue: 8,
  min: 1,
  max: 250,
  step: 1,
  displayStepper: true,
  hidden: (props) => !shouldShowAmount(props),
};
for (let i = 1; i <= 250; i++) {
  const shouldShow = (props) => {
    if (props.images === "Set") {
      // In Set mode, show images up to the amount specified
      return i <= (props.amount || 8);
    } else {
      // In Auto mode, show first image always, then only show next if previous is filled
      return i === 1 || props[`image${i - 1}`];
    }
  };
  controls[`image${i}`] = {
    type: ControlType.Image,
    title: `Image ${i}`,
    hidden: (props) => !shouldShow(props),
  };
}
addPropertyControls(FC_ProductImageVariant, controls); // Generate default props for all 250 images
const defaultProps = {
  shopifyProductID: "",
  type: "Fill",
  images: "Auto",
  amount: 8,
  Style: { backgroundColor: "#f5f5f5", borderRadius: 0, padding: 0 },
};
for (let i = 1; i <= 250; i++) {
  defaultProps[`image${i}`] = "";
}
FC_ProductImageVariant.defaultProps = defaultProps;
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FC_ProductImageVariant",
      slots: [],
      annotations: { framerDisableUnlink: "", framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./FC_ProductImageVariant.map
