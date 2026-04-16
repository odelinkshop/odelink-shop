/**
 * Paste into Framer → Assets → Code (or replace Shopfiy.tsx).
 * OAuth handoff: Vercel serves a tiny HTML page that sets window.name then location.replace(your Framer URL).
 * Must match server lib/framer-handoff.ts (FRAMER_WINNAME_PREFIX).
 * Console: filter `[Shopfiy membership]`. Set DEBUG_MEMBERSHIP = false when done.
 */ import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { forwardRef } from "react";
const VERCEL_ORIGIN = "https://shopfiy-eight.vercel.app";
const VERCEL_MEMBERSHIP_URL = `${VERCEL_ORIGIN}/api/customer/membership`;
const VARIANT_NON_MEMBER = "Qf7SE1Lvj";
const VARIANT_MEMBER = "XwkSHQPTT";
const LINK_NON_MEMBER = `${VERCEL_ORIGIN}/api/auth/shopify/login`;
const LINK_MEMBER = "https://shopify.com/67917185093/account";
const DEBUG_MEMBERSHIP = true;
const FRAMER_AT_STORAGE_KEY = "shopify_customer_access_token";
const FRAMER_ID_TOKEN_STORAGE_KEY = "shopify_oidc_id_token";
/** Must match Vercel `lib/framer-handoff.ts` — do not change without deploying API. */ const FRAMER_WINNAME_PREFIX =
  "__shopify_member_x__:";
function dbg(...args) {
  if (!DEBUG_MEMBERSHIP || typeof console === "undefined") return;
  console.info("[Shopfiy membership]", ...args);
}
function framerSessionHeaders() {
  try {
    const t = sessionStorage.getItem(FRAMER_AT_STORAGE_KEY);
    if (t) return { Authorization: `Bearer ${t}` };
  } catch {
    /* ignore */
  }
  return {};
}
export function clearVercelShopifyFramerSession() {
  try {
    sessionStorage.removeItem(FRAMER_AT_STORAGE_KEY);
    sessionStorage.removeItem(FRAMER_ID_TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
let hydrateInFlight = null;
async function hydrateExchangeFromUrlIfNeeded() {
  if (typeof window === "undefined") return;
  let sealed = null;
  let from = null;
  try {
    if (
      typeof window.name === "string" &&
      window.name.startsWith(FRAMER_WINNAME_PREFIX)
    ) {
      sealed = window.name.slice(FRAMER_WINNAME_PREFIX.length);
      from = "window.name";
    }
  } catch {
    /* ignore */
  }
  if (!sealed?.trim()) {
    const q = new URLSearchParams(window.location.search);
    if (q.has("shopify_exchange")) {
      sealed = q.get("shopify_exchange");
      from = "query";
    } else {
      const raw = window.location.hash.replace(/^#/, "");
      if (raw.includes("shopify_exchange=")) {
        const hp = new URLSearchParams(raw);
        sealed = hp.get("shopify_exchange");
        from = "hash";
      }
    }
  }
  if (!sealed?.trim()) {
    dbg("hydrate: no handoff (window.name / ?shopify_exchange / hash)", {
      hint: "Vercel: FRAMER_EXCHANGE_SECRET + SHOPIFY_OAUTH_SUCCESS_REDIRECT = this site",
      hasStoredToken: Boolean(
        (() => {
          try {
            return sessionStorage.getItem(FRAMER_AT_STORAGE_KEY);
          } catch {
            return null;
          }
        })()
      ),
    });
    return;
  }
  dbg("hydrate: found sealed token", { from, len: sealed.length });
  try {
    const res = await fetch(`${VERCEL_ORIGIN}/api/auth/framer/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exchange: sealed }),
    });
    const data = await res.json();
    if (typeof data.access_token === "string" && data.access_token) {
      sessionStorage.setItem(FRAMER_AT_STORAGE_KEY, data.access_token);
      if (typeof data.id_token === "string" && data.id_token) {
        sessionStorage.setItem(FRAMER_ID_TOKEN_STORAGE_KEY, data.id_token);
      }
      try {
        window.name = "";
      } catch {
        /* ignore */
      }
      if (
        window.location.search.includes("shopify_exchange=") ||
        window.location.hash.includes("shopify_exchange=")
      ) {
        const q = new URLSearchParams(window.location.search);
        q.delete("shopify_exchange");
        const qs = q.toString();
        const raw = window.location.hash.replace(/^#/, "");
        const hp = new URLSearchParams(raw);
        hp.delete("shopify_exchange");
        const restHash = hp.toString();
        window.history.replaceState(
          {},
          "",
          window.location.pathname +
            (qs ? `?${qs}` : "") +
            (restHash ? `#${restHash}` : "")
        );
      }
      dbg("exchange OK → sessionStorage (Bearer on next GET)");
    } else {
      dbg("exchange POST failed", { status: res.status, data });
    }
  } catch (e) {
    dbg("exchange POST threw", e);
  }
}
function ensureHydrated() {
  if (typeof window === "undefined") return Promise.resolve();
  if (!hydrateInFlight) {
    hydrateInFlight = hydrateExchangeFromUrlIfNeeded().finally(() => {
      hydrateInFlight = null;
    });
  }
  return hydrateInFlight;
}
async function fetchMembership() {
  await ensureHydrated();
  dbg("GET start", {
    url: VERCEL_MEMBERSHIP_URL,
    hasBearer: Boolean(framerSessionHeaders().Authorization),
  });
  try {
    const res = await fetch(VERCEL_MEMBERSHIP_URL, {
      method: "GET",
      credentials: "include",
      headers: framerSessionHeaders(),
    });
    dbg("GET response", { ok: res.ok, status: res.status });
    if (!res.ok) {
      const snippet = await res
        .text()
        .then((t) => t.slice(0, 400))
        .catch(() => "");
      dbg("GET non-OK body (truncated)", snippet || "(empty)");
      return null;
    }
    const json = await res.json();
    dbg("GET JSON (parsed)", json);
    return json;
  } catch (e) {
    dbg("GET fetch threw", e);
    return null;
  }
}
export function withVercelShopifyMemberVariant(Component) {
  return /*#__PURE__*/ forwardRef(function VercelShopifyMemberVariant(
    props,
    ref
  ) {
    const [ready, setReady] = React.useState(false);
    const [isMember, setIsMember] = React.useState(false);
    const reqIdRef = React.useRef(0);
    const run = React.useCallback(async () => {
      const id = ++reqIdRef.current;
      dbg("run() start", { reqId: id });
      try {
        const data = await fetchMembership();
        if (id !== reqIdRef.current) {
          dbg("run() stale ignored", { reqId: id });
          return;
        }
        const member = Boolean(data?.isMember);
        dbg("run() apply", {
          isLoggedIn: data?.isLoggedIn,
          isMember: member,
          membershipStatus: data?.membershipStatus,
        });
        setIsMember(member);
      } catch (e) {
        if (id !== reqIdRef.current) return;
        dbg("run() error", e);
        setIsMember(false);
      } finally {
        if (id === reqIdRef.current) {
          setReady(true);
          dbg("run() ready", { reqId: id });
        }
      }
    }, []);
    React.useEffect(() => {
      void run();
      const onVisible = () => {
        if (document.visibilityState === "visible") {
          dbg("focus/visible → refetch");
          void run();
        }
      };
      window.addEventListener("focus", onVisible);
      document.addEventListener("visibilitychange", onVisible);
      return () => {
        window.removeEventListener("focus", onVisible);
        document.removeEventListener("visibilitychange", onVisible);
      };
    }, [run]);
    const variant =
      typeof window === "undefined"
        ? VARIANT_NON_MEMBER
        : !ready || !isMember
        ? VARIANT_NON_MEMBER
        : VARIANT_MEMBER;
    const link =
      typeof window === "undefined"
        ? LINK_NON_MEMBER
        : !ready || !isMember
        ? LINK_NON_MEMBER
        : LINK_MEMBER;
    React.useEffect(() => {
      if (typeof window === "undefined") return;
      dbg("override → variant prop", { ready, isMember, variant, link });
    }, [ready, isMember, variant, link]);
    if (typeof window === "undefined") {
      return /*#__PURE__*/ _jsx(Component, { ref: ref, ...props });
    }
    const { variant: _v, link: _link, ...rest } = props;
    return /*#__PURE__*/ _jsx(
      Component,
      { ref: ref, ...rest, variant: variant, link: link },
      `${variant}:${link}`
    );
  });
}
export const __FramerMetadata__ = {
  exports: {
    withVercelShopifyMemberVariant: {
      type: "reactHoc",
      name: "withVercelShopifyMemberVariant",
      annotations: { framerContractVersion: "1" },
    },
    clearVercelShopifyFramerSession: {
      type: "function",
      annotations: { framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./Shopfiy.map
