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
import { useEffect, useState, useMemo } from "react";
import { addPropertyControls, ControlType, RenderTarget } from "framer";
import { useIsBrowser } from "https://framerusercontent.com/modules/ncBs5KPMI9I5GEta13fn/zGXDjuZapa1SGy6D8P5e/IsBrowser.js";
import {
  currencyMaps,
  knownCurrenciesWithCodeAsSymbol,
} from "https://framerusercontent.com/modules/k9s4cejdkBGDjmzudhzM/18cq93eooqM4YmdbL7E2/currencyMaps.js";
import { COUNTRY_DATA } from "https://framerusercontent.com/modules/N4sehPZvaJy8xzJ4hqGI/VFyWNOlzImx2jSkBS7Mm/countryFlags.js"; // Transform the shared COUNTRY_DATA into the format needed for dropdowns
const COMMON_COUNTRIES = Object.entries(COUNTRY_DATA).map(([code, data]) => ({
  code,
  name: data.name,
})); // Extract just the country codes for validation
const COMMON_COUNTRY_CODES = COMMON_COUNTRIES.map((country) => country.code); // Extract currency codes from currencyMaps for dropdown options
const AVAILABLE_CURRENCIES = Object.keys(currencyMaps).sort();
/**
 * @framerDisableUnlink
 * @framerSupportedLayoutWidth fixed | fill | fit
 * @framerSupportedLayoutHeight fixed | auto
 */ export default function FC_GlobalMarketActive(props) {
  const [activeCurrency, setActiveCurrency] = useState("");
  const [activeCountry, setActiveCountry] = useState("");
  const [activeCountryCode, setActiveCountryCode] = useState("");
  const [activeCurrencySymbol, setActiveCurrencySymbol] = useState("");
  const isBrowser = useIsBrowser();
  useEffect(() => {
    if (!isBrowser) return;
    const getStoredCurrencyData = () => {
      const storedCurrency = localStorage.getItem("selectedCurrency");
      const storedCountry = localStorage.getItem("selectedCountry");
      const storedCountryCode = localStorage.getItem("selectedCountryCode");
      const storedCurrencySymbol = localStorage.getItem(
        "selectedCurrencySymbol"
      );
      if (storedCurrency) setActiveCurrency(storedCurrency);
      if (storedCountry) setActiveCountry(storedCountry);
      if (storedCountryCode) setActiveCountryCode(storedCountryCode);
      if (storedCurrencySymbol) setActiveCurrencySymbol(storedCurrencySymbol);
    };
    getStoredCurrencyData(); // Listen for currency change events
    const handleCurrencyChange = (event) => {
      const { currency, country, countryCode } = event.detail; // Check if the currency is in the known list
      if (knownCurrenciesWithCodeAsSymbol.includes(currency)) {
        // If the currency is in the list, use the ISO code as the symbol
        setActiveCurrencySymbol(currency); // Set the ISO code
      } else {
        // Otherwise, use the symbol from currencyMaps or default to "$"
        const currencySymbol = currencyMaps[currency];
        setActiveCurrencySymbol(currencySymbol || "$");
      } // Set the active currency, country, and country code
      setActiveCurrency(currency);
      setActiveCountry(country);
      setActiveCountryCode(countryCode);
    };
    window.addEventListener("currency_changed", handleCurrencyChange); //console.log("Currency change event listener added")
    return () => {
      window.removeEventListener("currency_changed", handleCurrencyChange);
    };
  }, [isBrowser]);
  const formatDisplay = useMemo(() => {
    if (RenderTarget.current() === RenderTarget.canvas) {
      // Use preview props for canvas display
      const previewCountry = COMMON_COUNTRIES.find(
        (country) => country.code === props.previewCountry
      );
      const previewCurrencyCode = props.previewCurrency; // Determine currency symbol using existing logic
      let previewCurrencySymbol;
      if (knownCurrenciesWithCodeAsSymbol.includes(previewCurrencyCode)) {
        previewCurrencySymbol = previewCurrencyCode;
      } else {
        previewCurrencySymbol = currencyMaps[previewCurrencyCode] || "$";
      }
      return props.format
        .replace("{{CUC}}", previewCurrencyCode)
        .replace("{{CN}}", previewCountry?.name || "United States")
        .replace("{{CC}}", props.previewCountry)
        .replace("{{CUS}}", previewCurrencySymbol);
    }
    if (
      !activeCurrency ||
      !activeCountry ||
      !activeCountryCode ||
      !activeCurrencySymbol
    ) {
      return ""; // Do not display anything while loading
    }
    return props.format
      .replace("{{CUC}}", activeCurrency)
      .replace("{{CN}}", activeCountry)
      .replace("{{CC}}", activeCountryCode)
      .replace("{{CUS}}", activeCurrencySymbol || "$");
  }, [
    activeCurrency,
    activeCountry,
    activeCountryCode,
    activeCurrencySymbol,
    props.format,
    props.previewCountry,
    props.previewCurrency,
    isBrowser,
  ]); // console.log(
  //     "Rendering activeCurrency and activeCountry",
  //     activeCurrency,
  //     activeCountry,
  //     activeCountryCode
  // )
  return /*#__PURE__*/ _jsx("div", {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent:
        props.font?.textAlign === "center"
          ? "center"
          : props.font?.textAlign === "right"
          ? "flex-end"
          : "flex-start",
    },
    children: /*#__PURE__*/ _jsx("div", {
      style: {
        ...props.font,
        color: props.color,
        textTransform: props.textTransform,
        width: "100%",
      },
      children: formatDisplay,
    }),
  });
}
FC_GlobalMarketActive.defaultProps = {
  font: { textAlign: "left" },
  color: "#000000",
  textTransform: "none",
  format: "{{CN}} ({{CUC}})",
  previewCountry: "US",
  previewCurrency: "USD",
};
addPropertyControls(FC_GlobalMarketActive, {
  font: { type: ControlType.Font, title: "Font", controls: "extended" },
  color: {
    type: ControlType.Color,
    title: "Text Color",
    defaultValue: "#000000",
  },
  textTransform: {
    type: ControlType.Enum,
    title: "Transform",
    options: ["None", "Uppercase", "Lowercase", "Capitalize"],
    defaultValue: "None",
  },
  format: {
    type: ControlType.String,
    title: "Display",
    defaultValue: "{{CN}} / {{CC}} / {{CUS}} / {{CUC}}",
    placeholder: "{{CN}} / {{CC}} / {{CUS}} / {{CUC}}",
    description:
      "Available placeholders:\n\n{{CN}} = Country Name (e.g. United States, Japan)\n\n{{CC}} = Country Code (e.g. US, JP)\n\n{{CUS}} = Currency Symbol (e.g. $, \xa5)\n\n{{CUC}} = Currency Code (e.g. USD, JPY)",
  },
  previewCountry: {
    type: ControlType.Enum,
    title: "Preview Country",
    defaultValue: "US",
    options: COMMON_COUNTRY_CODES,
    optionTitles: COMMON_COUNTRIES.map((country) => country.name),
  },
  previewCurrency: {
    type: ControlType.Enum,
    title: "Preview Currency",
    defaultValue: "USD",
    options: AVAILABLE_CURRENCIES,
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FC_GlobalMarketActive",
      slots: [],
      annotations: {
        framerContractVersion: "1",
        framerDisableUnlink: "* @framerSupportedLayoutWidth fixed | fill | fit",
        framerSupportedLayoutHeight: "fixed | auto",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./FC_GlobalMarketActive.map
