/**
 * Initialization utilities for Framer Commerce
 * This file contains functions that should run when the application first loads
 */ import {
  getUTMParameters,
  getSCARefParameters,
} from "https://framerusercontent.com/modules/w24ELWa2giT3SFaWpV77/398w6fPyag8B92ojouQr/utmParams.js";
/**
 * Initialize global functionality for the store
 * This includes capturing UTM parameters, setting up event listeners, etc.
 */ export function initializeStore() {
  // Capture UTM and SCA ref parameters when the page loads
  if (typeof window !== "undefined") {
    // Initialize UTM parameter tracking
    getUTMParameters(); // Initialize SCA ref parameter tracking
    getSCARefParameters(); // Add a listener for history changes to capture tracking parameters
    // when users navigate between pages
    try {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      history.pushState = function () {
        originalPushState.apply(this, arguments);
        getUTMParameters(); // Capture UTM parameters after navigation
        getSCARefParameters(); // Capture SCA ref parameters after navigation
      };
      history.replaceState = function () {
        originalReplaceState.apply(this, arguments);
        getUTMParameters(); // Capture UTM parameters after navigation
        getSCARefParameters(); // Capture SCA ref parameters after navigation
      }; // Also listen for popstate events (back/forward navigation)
      window.addEventListener("popstate", () => {
        getUTMParameters();
        getSCARefParameters();
      });
    } catch (error) {
      console.error("Error setting up history listeners:", error);
    }
  }
} // Auto-initialize if this module is loaded
initializeStore();
export default initializeStore;
export const __FramerMetadata__ = {
  exports: {
    initializeStore: {
      type: "function",
      annotations: { framerContractVersion: "1" },
    },
    default: { type: "function", annotations: { framerContractVersion: "1" } },
    __FramerMetadata__: { type: "variable" },
  },
};
