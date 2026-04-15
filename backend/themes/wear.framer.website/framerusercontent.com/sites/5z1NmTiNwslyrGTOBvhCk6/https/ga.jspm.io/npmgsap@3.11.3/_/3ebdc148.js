function _defineProperties(e, t) {
  for (var r = 0; r < t.length; r++) {
    var n = t[r];
    n.enumerable = n.enumerable || false;
    n.configurable = true;
    "value" in n && (n.writable = true);
    Object.defineProperty(e, n.key, n);
  }
}
function _createClass(e, t, r) {
  t && _defineProperties(e.prototype, t);
  r && _defineProperties(e, r);
  return e;
}
/*!
 * Observer 3.11.3
 * https://greensock.com
 *
 * @license Copyright 2008-2022, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */ var e,
  t,
  r,
  n,
  i,
  o,
  a,
  s,
  l,
  c,
  u,
  f,
  d = function _getGSAP() {
    return (
      e ||
      ("undefined" !== typeof window &&
        (e = window.gsap) &&
        e.registerPlugin &&
        e)
    );
  },
  p = 1,
  g = [],
  h = [],
  v = [],
  m = Date.now,
  _ = function _bridge(e, t) {
    return t;
  },
  y = function _integrate() {
    var e = l.core,
      t = e.bridge || {},
      r = e._scrollers,
      n = e._proxies;
    r.push.apply(r, h);
    n.push.apply(n, v);
    h = r;
    v = n;
    _ = function _bridge(e, r) {
      return t[e](r);
    };
  },
  b = function _getProxyProp(e, t) {
    return ~v.indexOf(e) && v[v.indexOf(e) + 1][t];
  },
  x = function _isViewport(e) {
    return !!~c.indexOf(e);
  },
  w = function _addListener(e, t, r, n, i) {
    return e.addEventListener(t, r, { passive: !n, capture: !!i });
  },
  S = function _removeListener(e, t, r, n) {
    return e.removeEventListener(t, r, !!n);
  },
  T = "scrollLeft",
  k = "scrollTop",
  P = function _onScroll() {
    return (u && u.isPressed) || h.cache++;
  },
  E = function _scrollCacheFunc(e, t) {
    var n = function cachingFunc(n) {
      if (n || 0 === n) {
        p && (r.history.scrollRestoration = "manual");
        var i = u && u.isPressed;
        n = cachingFunc.v = Math.round(n) || (u && u.iOS ? 1 : 0);
        e(n);
        cachingFunc.cacheID = h.cache;
        i && _("ss", n);
      } else if (t || h.cache !== cachingFunc.cacheID || _("ref")) {
        cachingFunc.cacheID = h.cache;
        cachingFunc.v = e();
      }
      return cachingFunc.v + cachingFunc.offset;
    };
    n.offset = 0;
    return e && n;
  },
  M = {
    s: T,
    p: "left",
    p2: "Left",
    os: "right",
    os2: "Right",
    d: "width",
    d2: "Width",
    a: "x",
    sc: E(function (e) {
      return arguments.length
        ? r.scrollTo(e, C.sc())
        : r.pageXOffset || n[T] || i[T] || o[T] || 0;
    }),
  },
  C = {
    s: k,
    p: "top",
    p2: "Top",
    os: "bottom",
    os2: "Bottom",
    d: "height",
    d2: "Height",
    a: "y",
    op: M,
    sc: E(function (e) {
      return arguments.length
        ? r.scrollTo(M.sc(), e)
        : r.pageYOffset || n[k] || i[k] || o[k] || 0;
    }),
  },
  O = function _getTarget(t) {
    return (
      e.utils.toArray(t)[0] ||
      ("string" === typeof t && false !== e.config().nullTargetWarn
        ? console.warn("Element not found:", t)
        : null)
    );
  },
  A = function _getScrollFunc(t, r) {
    var o = r.s,
      a = r.sc;
    x(t) && (t = n.scrollingElement || i);
    var s = h.indexOf(t),
      l = a === C.sc ? 1 : 2;
    !~s && (s = h.push(t) - 1);
    h[s + l] || t.addEventListener("scroll", P);
    var c = h[s + l],
      u =
        c ||
        (h[s + l] =
          E(b(t, o), true) ||
          (x(t)
            ? a
            : E(function (e) {
                return arguments.length ? (t[o] = e) : t[o];
              })));
    u.target = t;
    c || (u.smooth = "smooth" === e.getProperty(t, "scrollBehavior"));
    return u;
  },
  D = function _getVelocityProp(e, t, r) {
    var n = e,
      i = e,
      o = m(),
      a = o,
      s = t || 50,
      l = Math.max(500, 3 * s),
      c = function update(e, t) {
        var l = m();
        if (t || l - o > s) {
          i = n;
          n = e;
          a = o;
          o = l;
        } else r ? (n += e) : (n = i + ((e - i) / (l - a)) * (o - a));
      },
      u = function reset() {
        i = n = r ? 0 : n;
        a = o = 0;
      },
      f = function getVelocity(e) {
        var t = a,
          s = i,
          u = m();
        (e || 0 === e) && e !== n && c(e);
        return o === a || u - a > l
          ? 0
          : ((n + (r ? s : -s)) / ((r ? u : o) - t)) * 1e3;
      };
    return { update: c, reset: u, getVelocity: f };
  },
  R = function _getEvent(e, t) {
    t && !e._gsapAllow && e.preventDefault();
    return e.changedTouches ? e.changedTouches[0] : e;
  },
  F = function _getAbsoluteMax(e) {
    var t = Math.max.apply(Math, e),
      r = Math.min.apply(Math, e);
    return Math.abs(t) >= Math.abs(r) ? t : r;
  },
  I = function _setScrollTrigger() {
    l = e.core.globals().ScrollTrigger;
    l && l.core && y();
  },
  z = function _initCore(l) {
    e = l || d();
    if (e && "undefined" !== typeof document && document.body) {
      r = window;
      n = document;
      i = n.documentElement;
      o = n.body;
      c = [r, n, i, o];
      e.utils.clamp;
      s = "onpointerenter" in o ? "pointer" : "mouse";
      a = L.isTouch =
        r.matchMedia && r.matchMedia("(hover: none), (pointer: coarse)").matches
          ? 1
          : "ontouchstart" in r ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
          ? 2
          : 0;
      f = L.eventTypes = (
        "ontouchstart" in i
          ? "touchstart,touchmove,touchcancel,touchend"
          : "onpointerdown" in i
          ? "pointerdown,pointermove,pointercancel,pointerup"
          : "mousedown,mousemove,mouseup,mouseup"
      ).split(",");
      setTimeout(function () {
        return (p = 0);
      }, 500);
      I();
      t = 1;
    }
    return t;
  };
M.op = C;
h.cache = 0;
var L = (function () {
  function Observer(e) {
    this.init(e);
  }
  var c = Observer.prototype;
  c.init = function init(c) {
    t || z(e) || console.warn("Please gsap.registerPlugin(Observer)");
    l || I();
    var d = c.tolerance,
      p = c.dragMinimum,
      h = c.type,
      v = c.target,
      _ = c.lineHeight,
      y = c.debounce,
      b = c.preventDefault,
      T = c.onStop,
      k = c.onStopDelay,
      E = c.ignore,
      L = c.wheelSpeed,
      Y = c.event,
      X = c.onDragStart,
      B = c.onDragEnd,
      N = c.onDrag,
      H = c.onPress,
      V = c.onRelease,
      W = c.onRight,
      q = c.onLeft,
      G = c.onUp,
      U = c.onDown,
      j = c.onChangeX,
      K = c.onChangeY,
      Z = c.onChange,
      $ = c.onToggleX,
      J = c.onToggleY,
      Q = c.onHover,
      ee = c.onHoverEnd,
      te = c.onMove,
      re = c.ignoreCheck,
      ne = c.isNormalizer,
      ie = c.onGestureStart,
      oe = c.onGestureEnd,
      ae = c.onWheel,
      se = c.onEnable,
      le = c.onDisable,
      ce = c.onClick,
      ue = c.scrollSpeed,
      fe = c.capture,
      de = c.allowClicks,
      pe = c.lockAxis,
      ge = c.onLockAxis;
    this.target = v = O(v) || i;
    this.vars = c;
    E && (E = e.utils.toArray(E));
    d = d || 1e-9;
    p = p || 0;
    L = L || 1;
    ue = ue || 1;
    h = h || "wheel,touch,pointer";
    y = false !== y;
    _ || (_ = parseFloat(r.getComputedStyle(o).lineHeight) || 22);
    var he,
      ve,
      me,
      _e,
      ye,
      be,
      xe,
      we = this,
      Se = 0,
      Te = 0,
      ke = A(v, M),
      Pe = A(v, C),
      Ee = ke(),
      Me = Pe(),
      Ce =
        ~h.indexOf("touch") && !~h.indexOf("pointer") && "pointerdown" === f[0],
      Oe = x(v),
      Ae = v.ownerDocument || n,
      De = [0, 0, 0],
      Re = [0, 0, 0],
      Fe = 0,
      Ie = function clickCapture() {
        return (Fe = m());
      },
      ze = function _ignoreCheck(e, t) {
        return (
          ((we.event = e) && E && ~E.indexOf(e.target)) ||
          (t && Ce && "touch" !== e.pointerType) ||
          (re && re(e, t))
        );
      },
      Le = function onStopFunc() {
        we._vx.reset();
        we._vy.reset();
        ve.pause();
        T && T(we);
      },
      Ye = function update() {
        var e = (we.deltaX = F(De)),
          t = (we.deltaY = F(Re)),
          r = Math.abs(e) >= d,
          n = Math.abs(t) >= d;
        Z && (r || n) && Z(we, e, t, De, Re);
        if (r) {
          W && we.deltaX > 0 && W(we);
          q && we.deltaX < 0 && q(we);
          j && j(we);
          $ && we.deltaX < 0 !== Se < 0 && $(we);
          Se = we.deltaX;
          De[0] = De[1] = De[2] = 0;
        }
        if (n) {
          U && we.deltaY > 0 && U(we);
          G && we.deltaY < 0 && G(we);
          K && K(we);
          J && we.deltaY < 0 !== Te < 0 && J(we);
          Te = we.deltaY;
          Re[0] = Re[1] = Re[2] = 0;
        }
        if (_e || me) {
          te && te(we);
          if (me) {
            N(we);
            me = false;
          }
          _e = false;
        }
        be && !(be = false) && ge && ge(we);
        if (ye) {
          ae(we);
          ye = false;
        }
        he = 0;
      },
      Xe = function onDelta(e, t, r) {
        De[r] += e;
        Re[r] += t;
        we._vx.update(e);
        we._vy.update(t);
        y ? he || (he = requestAnimationFrame(Ye)) : Ye();
      },
      Be = function onTouchOrPointerDelta(e, t) {
        if (pe && !xe) {
          we.axis = xe = Math.abs(e) > Math.abs(t) ? "x" : "y";
          be = true;
        }
        if ("y" !== xe) {
          De[2] += e;
          we._vx.update(e, true);
        }
        if ("x" !== xe) {
          Re[2] += t;
          we._vy.update(t, true);
        }
        y ? he || (he = requestAnimationFrame(Ye)) : Ye();
      },
      Ne = function _onDrag(e) {
        if (!ze(e, 1)) {
          e = R(e, b);
          var t = e.clientX,
            r = e.clientY,
            n = t - we.x,
            i = r - we.y,
            o = we.isDragging;
          we.x = t;
          we.y = r;
          if (
            o ||
            Math.abs(we.startX - t) >= p ||
            Math.abs(we.startY - r) >= p
          ) {
            N && (me = true);
            o || (we.isDragging = true);
            Be(n, i);
            o || (X && X(we));
          }
        }
      },
      He = (we.onPress = function (e) {
        if (!ze(e, 1)) {
          we.axis = xe = null;
          ve.pause();
          we.isPressed = true;
          e = R(e);
          Se = Te = 0;
          we.startX = we.x = e.clientX;
          we.startY = we.y = e.clientY;
          we._vx.reset();
          we._vy.reset();
          w(ne ? v : Ae, f[1], Ne, b, true);
          we.deltaX = we.deltaY = 0;
          H && H(we);
        }
      }),
      Ve = function _onRelease(t) {
        if (!ze(t, 1)) {
          S(ne ? v : Ae, f[1], Ne, true);
          var n =
              we.isDragging &&
              (Math.abs(we.x - we.startX) > 3 ||
                Math.abs(we.y - we.startY) > 3),
            i = R(t);
          if (!n) {
            we._vx.reset();
            we._vy.reset();
            b &&
              de &&
              e.delayedCall(0.08, function () {
                if (m() - Fe > 300 && !t.defaultPrevented)
                  if (t.target.click) t.target.click();
                  else if (Ae.createEvent) {
                    var e = Ae.createEvent("MouseEvents");
                    e.initMouseEvent(
                      "click",
                      true,
                      true,
                      r,
                      1,
                      i.screenX,
                      i.screenY,
                      i.clientX,
                      i.clientY,
                      false,
                      false,
                      false,
                      false,
                      0,
                      null
                    );
                    t.target.dispatchEvent(e);
                  }
              });
          }
          we.isDragging = we.isGesturing = we.isPressed = false;
          T && !ne && ve.restart(true);
          B && n && B(we);
          V && V(we, n);
        }
      },
      We = function _onGestureStart(e) {
        return (
          e.touches &&
          e.touches.length > 1 &&
          (we.isGesturing = true) &&
          ie(e, we.isDragging)
        );
      },
      qe = function _onGestureEnd() {
        return (we.isGesturing = false) || oe(we);
      },
      Ge = function onScroll(e) {
        if (!ze(e)) {
          var t = ke(),
            r = Pe();
          Xe((t - Ee) * ue, (r - Me) * ue, 1);
          Ee = t;
          Me = r;
          T && ve.restart(true);
        }
      },
      Ue = function _onWheel(e) {
        if (!ze(e)) {
          e = R(e, b);
          ae && (ye = true);
          var t =
            (1 === e.deltaMode ? _ : 2 === e.deltaMode ? r.innerHeight : 1) * L;
          Xe(e.deltaX * t, e.deltaY * t, 0);
          T && !ne && ve.restart(true);
        }
      },
      je = function _onMove(e) {
        if (!ze(e)) {
          var t = e.clientX,
            r = e.clientY,
            n = t - we.x,
            i = r - we.y;
          we.x = t;
          we.y = r;
          _e = true;
          (n || i) && Be(n, i);
        }
      },
      Ke = function _onHover(e) {
        we.event = e;
        Q(we);
      },
      Ze = function _onHoverEnd(e) {
        we.event = e;
        ee(we);
      },
      $e = function _onClick(e) {
        return ze(e) || (R(e, b) && ce(we));
      };
    ve = we._dc = e.delayedCall(k || 0.25, Le).pause();
    we.deltaX = we.deltaY = 0;
    we._vx = D(0, 50, true);
    we._vy = D(0, 50, true);
    we.scrollX = ke;
    we.scrollY = Pe;
    we.isDragging = we.isGesturing = we.isPressed = false;
    we.enable = function (e) {
      if (!we.isEnabled) {
        w(Oe ? Ae : v, "scroll", P);
        h.indexOf("scroll") >= 0 && w(Oe ? Ae : v, "scroll", Ge, b, fe);
        h.indexOf("wheel") >= 0 && w(v, "wheel", Ue, b, fe);
        if ((h.indexOf("touch") >= 0 && a) || h.indexOf("pointer") >= 0) {
          w(v, f[0], He, b, fe);
          w(Ae, f[2], Ve);
          w(Ae, f[3], Ve);
          de && w(v, "click", Ie, false, true);
          ce && w(v, "click", $e);
          ie && w(Ae, "gesturestart", We);
          oe && w(Ae, "gestureend", qe);
          Q && w(v, s + "enter", Ke);
          ee && w(v, s + "leave", Ze);
          te && w(v, s + "move", je);
        }
        we.isEnabled = true;
        e && e.type && He(e);
        se && se(we);
      }
      return we;
    };
    we.disable = function () {
      if (we.isEnabled) {
        g.filter(function (e) {
          return e !== we && x(e.target);
        }).length || S(Oe ? Ae : v, "scroll", P);
        if (we.isPressed) {
          we._vx.reset();
          we._vy.reset();
          S(ne ? v : Ae, f[1], Ne, true);
        }
        S(Oe ? Ae : v, "scroll", Ge, fe);
        S(v, "wheel", Ue, fe);
        S(v, f[0], He, fe);
        S(Ae, f[2], Ve);
        S(Ae, f[3], Ve);
        S(v, "click", Ie, true);
        S(v, "click", $e);
        S(Ae, "gesturestart", We);
        S(Ae, "gestureend", qe);
        S(v, s + "enter", Ke);
        S(v, s + "leave", Ze);
        S(v, s + "move", je);
        we.isEnabled = we.isPressed = we.isDragging = false;
        le && le(we);
      }
    };
    we.kill = function () {
      we.disable();
      var e = g.indexOf(we);
      e >= 0 && g.splice(e, 1);
      u === we && (u = 0);
    };
    g.push(we);
    ne && x(v) && (u = we);
    we.enable(Y);
  };
  _createClass(Observer, [
    {
      key: "velocityX",
      get: function get() {
        return this._vx.getVelocity();
      },
    },
    {
      key: "velocityY",
      get: function get() {
        return this._vy.getVelocity();
      },
    },
  ]);
  return Observer;
})();
L.version = "3.11.3";
L.create = function (e) {
  return new L(e);
};
L.register = z;
L.getAll = function () {
  return g.slice();
};
L.getById = function (e) {
  return g.filter(function (t) {
    return t.vars.id === e;
  })[0];
};
d() && e.registerPlugin(L);
/*!
 * ScrollTrigger 3.11.3
 * https://greensock.com
 *
 * @license Copyright 2008-2022, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */ var Y,
  X,
  B,
  N,
  H,
  V,
  W,
  q,
  G,
  U,
  j,
  K,
  Z,
  $,
  J,
  Q,
  ee,
  te,
  re,
  ne,
  ie,
  oe,
  ae,
  se,
  le,
  ce,
  ue,
  fe,
  de,
  pe,
  ge,
  he,
  ve,
  me,
  _e = 1,
  ye = Date.now,
  be = ye(),
  xe = 0,
  we = 0,
  Se = function _pointerDownHandler() {
    return ($ = 1);
  },
  Te = function _pointerUpHandler() {
    return ($ = 0);
  },
  ke = function _passThrough(e) {
    return e;
  },
  Pe = function _round(e) {
    return Math.round(1e5 * e) / 1e5 || 0;
  },
  Ee = function _windowExists() {
    return "undefined" !== typeof window;
  },
  Me = function _getGSAP() {
    return Y || (Ee() && (Y = window.gsap) && Y.registerPlugin && Y);
  },
  Ce = function _isViewport(e) {
    return !!~W.indexOf(e);
  },
  Oe = function _getBoundsFunc(e) {
    return (
      b(e, "getBoundingClientRect") ||
      (Ce(e)
        ? function () {
            Zt.width = B.innerWidth;
            Zt.height = B.innerHeight;
            return Zt;
          }
        : function () {
            return at(e);
          })
    );
  },
  Ae = function _getSizeFunc(e, t, r) {
    var n = r.d,
      i = r.d2,
      o = r.a;
    return (o = b(e, "getBoundingClientRect"))
      ? function () {
          return o()[n];
        }
      : function () {
          return (t ? B["inner" + i] : e["client" + i]) || 0;
        };
  },
  De = function _getOffsetsFunc(e, t) {
    return !t || ~v.indexOf(e)
      ? Oe(e)
      : function () {
          return Zt;
        };
  },
  Re = function _maxScroll(e, t) {
    var r = t.s,
      n = t.d2,
      i = t.d,
      o = t.a;
    return (r = "scroll" + n) && (o = b(e, r))
      ? o() - Oe(e)()[i]
      : Ce(e)
      ? (H[r] || V[r]) - (B["inner" + n] || H["client" + n] || V["client" + n])
      : e[r] - e["offset" + n];
  },
  Fe = function _iterateAutoRefresh(e, t) {
    for (var r = 0; r < re.length; r += 3)
      (!t || ~t.indexOf(re[r + 1])) && e(re[r], re[r + 1], re[r + 2]);
  },
  Ie = function _isString(e) {
    return "string" === typeof e;
  },
  ze = function _isFunction(e) {
    return "function" === typeof e;
  },
  Le = function _isNumber(e) {
    return "number" === typeof e;
  },
  Ye = function _isObject(e) {
    return "object" === typeof e;
  },
  Xe = function _endAnimation(e, t, r) {
    return e && e.progress(t ? 0 : 1) && r && e.pause();
  },
  Be = function _callback(e, t) {
    if (e.enabled) {
      var r = t(e);
      r && r.totalTime && (e.callbackAnimation = r);
    }
  },
  Ne = Math.abs,
  He = "left",
  Ve = "top",
  We = "right",
  qe = "bottom",
  Ge = "width",
  Ue = "height",
  je = "Right",
  Ke = "Left",
  Ze = "Top",
  $e = "Bottom",
  Je = "padding",
  Qe = "margin",
  et = "Width",
  tt = "Height",
  rt = "px",
  nt = function _getComputedStyle(e) {
    return B.getComputedStyle(e);
  },
  it = function _makePositionable(e) {
    var t = nt(e).position;
    e.style.position = "absolute" === t || "fixed" === t ? t : "relative";
  },
  ot = function _setDefaults(e, t) {
    for (var r in t) r in e || (e[r] = t[r]);
    return e;
  },
  at = function _getBounds(e, t) {
    var r =
        t &&
        "matrix(1, 0, 0, 1, 0, 0)" !== nt(e)[J] &&
        Y.to(e, {
          x: 0,
          y: 0,
          xPercent: 0,
          yPercent: 0,
          rotation: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          skewX: 0,
          skewY: 0,
        }).progress(1),
      n = e.getBoundingClientRect();
    r && r.progress(0).kill();
    return n;
  },
  st = function _getSize(e, t) {
    var r = t.d2;
    return e["offset" + r] || e["client" + r] || 0;
  },
  lt = function _getLabelRatioArray(e) {
    var t,
      r = [],
      n = e.labels,
      i = e.duration();
    for (t in n) r.push(n[t] / i);
    return r;
  },
  ct = function _getClosestLabel(e) {
    return function (t) {
      return Y.utils.snap(lt(e), t);
    };
  },
  ut = function _snapDirectional(e) {
    var t = Y.utils.snap(e),
      r =
        Array.isArray(e) &&
        e.slice(0).sort(function (e, t) {
          return e - t;
        });
    return r
      ? function (e, n, i) {
          void 0 === i && (i = 0.001);
          var o;
          if (!n) return t(e);
          if (n > 0) {
            e -= i;
            for (o = 0; o < r.length; o++) if (r[o] >= e) return r[o];
            return r[o - 1];
          }
          o = r.length;
          e += i;
          while (o--) if (r[o] <= e) return r[o];
          return r[0];
        }
      : function (r, n, i) {
          void 0 === i && (i = 0.001);
          var o = t(r);
          return !n || Math.abs(o - r) < i || o - r < 0 === n < 0
            ? o
            : t(n < 0 ? r - e : r + e);
        };
  },
  ft = function _getLabelAtDirection(e) {
    return function (t, r) {
      return ut(lt(e))(t, r.direction);
    };
  },
  dt = function _multiListener(e, t, r, n) {
    return r.split(",").forEach(function (r) {
      return e(t, r, n);
    });
  },
  pt = function _addListener(e, t, r, n, i) {
    return e.addEventListener(t, r, { passive: !n, capture: !!i });
  },
  gt = function _removeListener(e, t, r, n) {
    return e.removeEventListener(t, r, !!n);
  },
  ht = function _wheelListener(e, t, r) {
    return r && r.wheelHandler && e(t, "wheel", r);
  },
  vt = {
    startColor: "green",
    endColor: "red",
    indent: 0,
    fontSize: "16px",
    fontWeight: "normal",
  },
  mt = { toggleActions: "play", anticipatePin: 0 },
  _t = { top: 0, left: 0, center: 0.5, bottom: 1, right: 1 },
  yt = function _offsetToPx(e, t) {
    if (Ie(e)) {
      var r = e.indexOf("="),
        n = ~r ? +(e.charAt(r - 1) + 1) * parseFloat(e.substr(r + 1)) : 0;
      if (~r) {
        e.indexOf("%") > r && (n *= t / 100);
        e = e.substr(0, r - 1);
      }
      e =
        n +
        (e in _t
          ? _t[e] * t
          : ~e.indexOf("%")
          ? (parseFloat(e) * t) / 100
          : parseFloat(e) || 0);
    }
    return e;
  },
  bt = function _createMarker(e, t, r, n, i, o, a, s) {
    var l = i.startColor,
      c = i.endColor,
      u = i.fontSize,
      f = i.indent,
      d = i.fontWeight;
    var p = N.createElement("div"),
      g = Ce(r) || "fixed" === b(r, "pinType"),
      h = -1 !== e.indexOf("scroller"),
      v = g ? V : r,
      m = -1 !== e.indexOf("start"),
      _ = m ? l : c,
      y =
        "border-color:" +
        _ +
        ";font-size:" +
        u +
        ";color:" +
        _ +
        ";font-weight:" +
        d +
        ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";
    y += "position:" + ((h || s) && g ? "fixed;" : "absolute;");
    (h || s || !g) &&
      (y += (n === C ? We : qe) + ":" + (o + parseFloat(f)) + "px;");
    a &&
      (y +=
        "box-sizing:border-box;text-align:left;width:" + a.offsetWidth + "px;");
    p._isStart = m;
    p.setAttribute("class", "gsap-marker-" + e + (t ? " marker-" + t : ""));
    p.style.cssText = y;
    p.innerText = t || 0 === t ? e + "-" + t : e;
    v.children[0] ? v.insertBefore(p, v.children[0]) : v.appendChild(p);
    p._offset = p["offset" + n.op.d2];
    xt(p, 0, n, m);
    return p;
  },
  xt = function _positionMarker(e, t, r, n) {
    var i = { display: "block" },
      o = r[n ? "os2" : "p2"],
      a = r[n ? "p2" : "os2"];
    e._isFlipped = n;
    i[r.a + "Percent"] = n ? -100 : 0;
    i[r.a] = n ? "1px" : 0;
    i["border" + o + et] = 1;
    i["border" + a + et] = 0;
    i[r.p] = t + "px";
    Y.set(e, i);
  },
  wt = [],
  St = {},
  Tt = function _sync() {
    return ye() - xe > 34 && (ge || (ge = requestAnimationFrame(Nt)));
  },
  kt = function _onScroll() {
    if (!ae || !ae.isPressed || ae.startX > V.clientWidth) {
      h.cache++;
      ae ? ge || (ge = requestAnimationFrame(Nt)) : Nt();
      xe || At("scrollStart");
      xe = ye();
    }
  },
  Pt = function _setBaseDimensions() {
    ce = B.innerWidth;
    le = B.innerHeight;
  },
  Et = function _onResize() {
    h.cache++;
    !Z &&
      !oe &&
      !N.fullscreenElement &&
      !N.webkitFullscreenElement &&
      (!se ||
        ce !== B.innerWidth ||
        Math.abs(B.innerHeight - le) > 0.25 * B.innerHeight) &&
      q.restart(true);
  },
  Mt = {},
  Ct = [],
  Ot = function _softRefresh() {
    return gt(tr, "scrollEnd", _softRefresh) || Yt(true);
  },
  At = function _dispatch(e) {
    return (
      (Mt[e] &&
        Mt[e].map(function (e) {
          return e();
        })) ||
      Ct
    );
  },
  Dt = [],
  Rt = function _revertRecorded(e) {
    for (var t = 0; t < Dt.length; t += 5)
      if (!e || (Dt[t + 4] && Dt[t + 4].query === e)) {
        Dt[t].style.cssText = Dt[t + 1];
        Dt[t].getBBox && Dt[t].setAttribute("transform", Dt[t + 2] || "");
        Dt[t + 3].uncache = 1;
      }
  },
  Ft = function _revertAll(e, t) {
    var r;
    for (Q = 0; Q < wt.length; Q++) {
      r = wt[Q];
      !r || (t && r._ctx !== t) || (e ? r.kill(1) : r.revert(true, true));
    }
    t && Rt(t);
    t || At("revert");
  },
  It = function _clearScrollMemory(e, t) {
    h.cache++;
    (t || !he) &&
      h.forEach(function (e) {
        return ze(e) && e.cacheID++ && (e.rec = 0);
      });
    Ie(e) && (B.history.scrollRestoration = de = e);
  },
  zt = 0,
  Lt = function _queueRefreshAll() {
    if (ve !== zt) {
      var e = (ve = zt);
      requestAnimationFrame(function () {
        return e === zt && Yt(true);
      });
    }
  },
  Yt = function _refreshAll(e, t) {
    if (!xe || e) {
      he = tr.isRefreshing = true;
      h.forEach(function (e) {
        return ze(e) && e.cacheID++ && (e.rec = e());
      });
      var r = At("refreshInit");
      ne && tr.sort();
      t || Ft();
      h.forEach(function (e) {
        if (ze(e)) {
          e.smooth && (e.target.style.scrollBehavior = "auto");
          e(0);
        }
      });
      wt.slice(0).forEach(function (e) {
        return e.refresh();
      });
      wt.forEach(function (e, t) {
        if (e._subPinOffset && e.pin) {
          var r = e.vars.horizontal ? "offsetWidth" : "offsetHeight",
            n = e.pin[r];
          e.revert(true, 1);
          e.adjustPinSpacing(e.pin[r] - n);
          e.revert(false, 1);
        }
      });
      wt.forEach(function (e) {
        return (
          "max" === e.vars.end &&
          e.setPositions(e.start, Math.max(e.start + 1, Re(e.scroller, e._dir)))
        );
      });
      r.forEach(function (e) {
        return e && e.render && e.render(-1);
      });
      h.forEach(function (e) {
        if (ze(e)) {
          e.smooth &&
            requestAnimationFrame(function () {
              return (e.target.style.scrollBehavior = "smooth");
            });
          e.rec && e(e.rec);
        }
      });
      It(de, 1);
      q.pause();
      zt++;
      Nt(2);
      wt.forEach(function (e) {
        return ze(e.vars.onRefresh) && e.vars.onRefresh(e);
      });
      he = tr.isRefreshing = false;
      At("refresh");
    } else pt(tr, "scrollEnd", Ot);
  },
  Xt = 0,
  Bt = 1,
  Nt = function _updateAll(e) {
    if (!he || 2 === e) {
      tr.isUpdating = true;
      me && me.update(0);
      var t = wt.length,
        r = ye(),
        n = r - be >= 50,
        i = t && wt[0].scroll();
      Bt = Xt > i ? -1 : 1;
      Xt = i;
      if (n) {
        if (xe && !$ && r - xe > 200) {
          xe = 0;
          At("scrollEnd");
        }
        j = be;
        be = r;
      }
      if (Bt < 0) {
        Q = t;
        while (Q-- > 0) wt[Q] && wt[Q].update(0, n);
        Bt = 1;
      } else for (Q = 0; Q < t; Q++) wt[Q] && wt[Q].update(0, n);
      tr.isUpdating = false;
    }
    ge = 0;
  },
  Ht = [
    He,
    Ve,
    qe,
    We,
    Qe + $e,
    Qe + je,
    Qe + Ze,
    Qe + Ke,
    "display",
    "flexShrink",
    "float",
    "zIndex",
    "gridColumnStart",
    "gridColumnEnd",
    "gridRowStart",
    "gridRowEnd",
    "gridArea",
    "justifySelf",
    "alignSelf",
    "placeSelf",
    "order",
  ],
  Vt = Ht.concat([
    Ge,
    Ue,
    "boxSizing",
    "max" + et,
    "max" + tt,
    "position",
    Qe,
    Je,
    Je + Ze,
    Je + je,
    Je + $e,
    Je + Ke,
  ]),
  Wt = function _swapPinOut(e, t, r) {
    Ut(r);
    var n = e._gsap;
    if (n.spacerIsNative) Ut(n.spacerState);
    else if (e._gsap.swappedIn) {
      var i = t.parentNode;
      if (i) {
        i.insertBefore(e, t);
        i.removeChild(t);
      }
    }
    e._gsap.swappedIn = false;
  },
  qt = function _swapPinIn(e, t, r, n) {
    if (!e._gsap.swappedIn) {
      var i,
        o = Ht.length,
        a = t.style,
        s = e.style;
      while (o--) {
        i = Ht[o];
        a[i] = r[i];
      }
      a.position = "absolute" === r.position ? "absolute" : "relative";
      "inline" === r.display && (a.display = "inline-block");
      s[qe] = s[We] = "auto";
      a.flexBasis = r.flexBasis || "auto";
      a.overflow = "visible";
      a.boxSizing = "border-box";
      a[Ge] = st(e, M) + rt;
      a[Ue] = st(e, C) + rt;
      a[Je] = s[Qe] = s[Ve] = s[He] = "0";
      Ut(n);
      s[Ge] = s["max" + et] = r[Ge];
      s[Ue] = s["max" + tt] = r[Ue];
      s[Je] = r[Je];
      if (e.parentNode !== t) {
        e.parentNode.insertBefore(t, e);
        t.appendChild(e);
      }
      e._gsap.swappedIn = true;
    }
  },
  Gt = /([A-Z])/g,
  Ut = function _setState(e) {
    if (e) {
      var t,
        r,
        n = e.t.style,
        i = e.length,
        o = 0;
      (e.t._gsap || Y.core.getCache(e.t)).uncache = 1;
      for (; o < i; o += 2) {
        r = e[o + 1];
        t = e[o];
        r
          ? (n[t] = r)
          : n[t] && n.removeProperty(t.replace(Gt, "-$1").toLowerCase());
      }
    }
  },
  jt = function _getState(e) {
    var t = Vt.length,
      r = e.style,
      n = [],
      i = 0;
    for (; i < t; i++) n.push(Vt[i], r[Vt[i]]);
    n.t = e;
    return n;
  },
  Kt = function _copyState(e, t, r) {
    var n,
      i = [],
      o = e.length,
      a = r ? 8 : 0;
    for (; a < o; a += 2) {
      n = e[a];
      i.push(n, n in t ? t[n] : e[a + 1]);
    }
    i.t = e.t;
    return i;
  },
  Zt = { left: 0, top: 0 },
  $t = function _parsePosition(e, t, r, n, i, o, a, s, l, c, u, f, d) {
    ze(e) && (e = e(s));
    Ie(e) &&
      "max" === e.substr(0, 3) &&
      (e = f + ("=" === e.charAt(4) ? yt("0" + e.substr(3), r) : 0));
    var p,
      g,
      h,
      v = d ? d.time() : 0;
    d && d.seek(0);
    if (Le(e)) a && xt(a, r, n, true);
    else {
      ze(t) && (t = t(s));
      var m,
        _,
        y,
        b,
        x = (e || "0").split(" ");
      h = O(t) || V;
      m = at(h) || {};
      if ((!m || (!m.left && !m.top)) && "none" === nt(h).display) {
        b = h.style.display;
        h.style.display = "block";
        m = at(h);
        b ? (h.style.display = b) : h.style.removeProperty("display");
      }
      _ = yt(x[0], m[n.d]);
      y = yt(x[1] || "0", r);
      e = m[n.p] - l[n.p] - c + _ + i - y;
      a && xt(a, y, n, r - y < 20 || (a._isStart && y > 20));
      r -= r - y;
    }
    if (o) {
      var w = e + r,
        S = o._isStart;
      p = "scroll" + n.d2;
      xt(
        o,
        w,
        n,
        (S && w > 20) ||
          (!S && (u ? Math.max(V[p], H[p]) : o.parentNode[p]) <= w + 1)
      );
      if (u) {
        l = at(a);
        u && (o.style[n.op.p] = l[n.op.p] - n.op.m - o._offset + rt);
      }
    }
    if (d && h) {
      p = at(h);
      d.seek(f);
      g = at(h);
      d._caScrollDist = p[n.p] - g[n.p];
      e = (e / d._caScrollDist) * f;
    }
    d && d.seek(v);
    return d ? e : Math.round(e);
  },
  Jt = /(webkit|moz|length|cssText|inset)/i,
  Qt = function _reparent(e, t, r, n) {
    if (e.parentNode !== t) {
      var i,
        o,
        a = e.style;
      if (t === V) {
        e._stOrig = a.cssText;
        o = nt(e);
        for (i in o)
          +i ||
            Jt.test(i) ||
            !o[i] ||
            "string" !== typeof a[i] ||
            "0" === i ||
            (a[i] = o[i]);
        a.top = r;
        a.left = n;
      } else a.cssText = e._stOrig;
      Y.core.getCache(e).uncache = 1;
      t.appendChild(e);
    }
  },
  er = function _getTweenCreator(e, t) {
    var r,
      n,
      i = A(e, t),
      o = "_scroll" + t.p2,
      a = function getTween(t, a, s, l, c) {
        var u = getTween.tween,
          f = a.onComplete,
          d = {};
        s = s || i();
        c = (l && c) || 0;
        l = l || t - s;
        u && u.kill();
        r = Math.round(s);
        a[o] = t;
        a.modifiers = d;
        d[o] = function (e) {
          e = Math.round(i());
          if (
            e !== r &&
            e !== n &&
            Math.abs(e - r) > 3 &&
            Math.abs(e - n) > 3
          ) {
            u.kill();
            getTween.tween = 0;
          } else e = s + l * u.ratio + c * u.ratio * u.ratio;
          n = r;
          return (r = Math.round(e));
        };
        a.onComplete = function () {
          getTween.tween = 0;
          f && f.call(u);
        };
        u = getTween.tween = Y.to(e, a);
        return u;
      };
    e[o] = i;
    i.wheelHandler = function () {
      return a.tween && a.tween.kill() && (a.tween = 0);
    };
    pt(e, "wheel", i.wheelHandler);
    return a;
  };
var tr = (function () {
  function ScrollTrigger(e, t) {
    X ||
      ScrollTrigger.register(Y) ||
      console.warn("Please gsap.registerPlugin(ScrollTrigger)");
    this.init(e, t);
  }
  var e = ScrollTrigger.prototype;
  e.init = function init(e, t) {
    this.progress = this.start = 0;
    this.vars && this.kill(true, true);
    if (we) {
      e = ot(Ie(e) || Le(e) || e.nodeType ? { trigger: e } : e, mt);
      var r,
        n,
        i,
        o,
        a,
        s,
        l,
        c,
        u,
        f,
        d,
        p,
        g,
        m,
        _,
        y,
        x,
        w,
        S,
        T,
        k,
        P,
        E,
        D,
        R,
        F,
        I,
        z,
        L,
        X,
        W,
        q,
        K,
        J,
        ee,
        te,
        re,
        oe,
        ae = e,
        se = ae.onUpdate,
        le = ae.toggleClass,
        ce = ae.id,
        ue = ae.onToggle,
        de = ae.onRefresh,
        ge = ae.scrub,
        ve = ae.trigger,
        be = ae.pin,
        Se = ae.pinSpacing,
        Te = ae.invalidateOnRefresh,
        Ee = ae.anticipatePin,
        Me = ae.onScrubComplete,
        Oe = ae.onSnapComplete,
        Fe = ae.once,
        He = ae.snap,
        Ve = ae.pinReparent,
        We = ae.pinSpacer,
        qe = ae.containerAnimation,
        lt = ae.fastScrollEnd,
        dt = ae.preventOverlaps,
        ht =
          e.horizontal || (e.containerAnimation && false !== e.horizontal)
            ? M
            : C,
        _t = !ge && 0 !== ge,
        xt = O(e.scroller || B),
        Tt = Y.core.getCache(xt),
        Pt = Ce(xt),
        Mt =
          "fixed" ===
          ("pinType" in e ? e.pinType : b(xt, "pinType") || (Pt && "fixed")),
        Ct = [e.onEnter, e.onLeave, e.onEnterBack, e.onLeaveBack],
        At = _t && e.toggleActions.split(" "),
        Dt = "markers" in e ? e.markers : mt.markers,
        Rt = Pt ? 0 : parseFloat(nt(xt)["border" + ht.p2 + et]) || 0,
        Ft = this,
        It =
          e.onRefreshInit &&
          function () {
            return e.onRefreshInit(Ft);
          },
        zt = Ae(xt, Pt, ht),
        Yt = De(xt, Pt),
        Xt = 0,
        Nt = 0,
        Ht = A(xt, ht);
      fe(Ft);
      Ft._dir = ht;
      Ee *= 45;
      Ft.scroller = xt;
      Ft.scroll = qe ? qe.time.bind(qe) : Ht;
      o = Ht();
      Ft.vars = e;
      t = t || e.animation;
      if ("refreshPriority" in e) {
        ne = 1;
        -9999 === e.refreshPriority && (me = Ft);
      }
      Tt.tweenScroll = Tt.tweenScroll || { top: er(xt, C), left: er(xt, M) };
      Ft.tweenTo = r = Tt.tweenScroll[ht.p];
      Ft.scrubDuration = function (e) {
        W = Le(e) && e;
        if (W)
          X
            ? X.duration(e)
            : (X = Y.to(t, {
                ease: "expo",
                totalProgress: "+=0.001",
                duration: W,
                paused: true,
                onComplete: function onComplete() {
                  return Me && Me(Ft);
                },
              }));
        else {
          X && X.progress(1).kill();
          X = 0;
        }
      };
      if (t) {
        t.vars.lazy = false;
        t._initted ||
          (false !== t.vars.immediateRender &&
            false !== e.immediateRender &&
            t.duration() &&
            t.render(0, true, true));
        Ft.animation = t.pause();
        t.scrollTrigger = Ft;
        Ft.scrubDuration(ge);
        z = 0;
        ce || (ce = t.vars.id);
      }
      wt.push(Ft);
      if (He) {
        (Ye(He) && !He.push) || (He = { snapTo: He });
        "scrollBehavior" in V.style &&
          Y.set(Pt ? [V, H] : xt, { scrollBehavior: "auto" });
        h.forEach(function (e) {
          return (
            ze(e) &&
            e.target === (Pt ? N.scrollingElement || H : xt) &&
            (e.smooth = false)
          );
        });
        i = ze(He.snapTo)
          ? He.snapTo
          : "labels" === He.snapTo
          ? ct(t)
          : "labelsDirectional" === He.snapTo
          ? ft(t)
          : false !== He.directional
          ? function (e, t) {
              return ut(He.snapTo)(e, ye() - Nt < 500 ? 0 : t.direction);
            }
          : Y.utils.snap(He.snapTo);
        q = He.duration || { min: 0.1, max: 2 };
        q = Ye(q) ? U(q.min, q.max) : U(q, q);
        K = Y.delayedCall(He.delay || W / 2 || 0.1, function () {
          var e = Ht(),
            n = ye() - Nt < 500,
            o = r.tween;
          if (!(n || Math.abs(Ft.getVelocity()) < 10) || o || $ || Xt === e)
            Ft.isActive && Xt !== e && K.restart(true);
          else {
            var a = (e - s) / g,
              c = t && !_t ? t.totalProgress() : a,
              u = n ? 0 : ((c - L) / (ye() - j)) * 1e3 || 0,
              f = Y.utils.clamp(-a, 1 - a, (Ne(u / 2) * u) / 0.185),
              d = a + (false === He.inertia ? 0 : f),
              p = U(0, 1, i(d, Ft)),
              h = Math.round(s + p * g),
              v = He,
              m = v.onStart,
              _ = v.onInterrupt,
              y = v.onComplete;
            if (e <= l && e >= s && h !== e) {
              if (o && !o._initted && o.data <= Ne(h - e)) return;
              false === He.inertia && (f = p - a);
              r(
                h,
                {
                  duration: q(
                    Ne((0.185 * Math.max(Ne(d - c), Ne(p - c))) / u / 0.05 || 0)
                  ),
                  ease: He.ease || "power3",
                  data: Ne(h - e),
                  onInterrupt: function onInterrupt() {
                    return K.restart(true) && _ && _(Ft);
                  },
                  onComplete: function onComplete() {
                    Ft.update();
                    Xt = Ht();
                    z = L = t && !_t ? t.totalProgress() : Ft.progress;
                    Oe && Oe(Ft);
                    y && y(Ft);
                  },
                },
                e,
                f * g,
                h - e - f * g
              );
              m && m(Ft, r.tween);
            }
          }
        }).pause();
      }
      ce && (St[ce] = Ft);
      ve = Ft.trigger = O(ve || be);
      oe = ve && ve._gsap && ve._gsap.stRevert;
      oe && (oe = oe(Ft));
      be = true === be ? ve : O(be);
      Ie(le) && (le = { targets: ve, className: le });
      if (be) {
        false === Se ||
          Se === Qe ||
          (Se =
            !(
              !Se &&
              be.parentNode &&
              be.parentNode.style &&
              "flex" === nt(be.parentNode).display
            ) && Je);
        Ft.pin = be;
        n = Y.core.getCache(be);
        if (n.spacer) m = n.pinState;
        else {
          if (We) {
            We = O(We);
            We && !We.nodeType && (We = We.current || We.nativeElement);
            n.spacerIsNative = !!We;
            We && (n.spacerState = jt(We));
          }
          n.spacer = x = We || N.createElement("div");
          x.classList.add("pin-spacer");
          ce && x.classList.add("pin-spacer-" + ce);
          n.pinState = m = jt(be);
        }
        false !== e.force3D && Y.set(be, { force3D: true });
        Ft.spacer = x = n.spacer;
        I = nt(be);
        E = I[Se + ht.os2];
        S = Y.getProperty(be);
        T = Y.quickSetter(be, ht.a, rt);
        qt(be, x, I);
        y = jt(be);
      }
      if (Dt) {
        p = Ye(Dt) ? ot(Dt, vt) : vt;
        f = bt("scroller-start", ce, xt, ht, p, 0);
        d = bt("scroller-end", ce, xt, ht, p, 0, f);
        w = f["offset" + ht.op.d2];
        var Vt = O(b(xt, "content") || xt);
        c = this.markerStart = bt("start", ce, Vt, ht, p, w, 0, qe);
        u = this.markerEnd = bt("end", ce, Vt, ht, p, w, 0, qe);
        qe && (re = Y.quickSetter([c, u], ht.a, rt));
        if (!Mt && !(v.length && true === b(xt, "fixedMarkers"))) {
          it(Pt ? V : xt);
          Y.set([f, d], { force3D: true });
          R = Y.quickSetter(f, ht.a, rt);
          F = Y.quickSetter(d, ht.a, rt);
        }
      }
      if (qe) {
        var Gt = qe.vars.onUpdate,
          Zt = qe.vars.onUpdateParams;
        qe.eventCallback("onUpdate", function () {
          Ft.update(0, 0, 1);
          Gt && Gt.apply(Zt || []);
        });
      }
      Ft.previous = function () {
        return wt[wt.indexOf(Ft) - 1];
      };
      Ft.next = function () {
        return wt[wt.indexOf(Ft) + 1];
      };
      Ft.revert = function (e, r) {
        if (!r) return Ft.kill(true);
        var n = false !== e || !Ft.enabled,
          i = Z;
        if (n !== Ft.isReverted) {
          if (n) {
            ee = Math.max(Ht(), Ft.scroll.rec || 0);
            J = Ft.progress;
            te = t && t.progress();
          }
          c &&
            [c, u, f, d].forEach(function (e) {
              return (e.style.display = n ? "none" : "block");
            });
          if (n) {
            Z = 1;
            Ft.update(n);
          }
          be &&
            (n ? Wt(be, x, m) : (!Ve || !Ft.isActive) && qt(be, x, nt(be), D));
          n || Ft.update(n);
          Z = i;
          Ft.isReverted = n;
        }
      };
      Ft.refresh = function (n, i) {
        if ((!Z && Ft.enabled) || i)
          if (be && n && xe) pt(ScrollTrigger, "scrollEnd", Ot);
          else {
            !he && It && It(Ft);
            Z = 1;
            Nt = ye();
            if (r.tween) {
              r.tween.kill();
              r.tween = 0;
            }
            X && X.pause();
            Te && t && t.revert({ kill: false }).invalidate();
            Ft.isReverted || Ft.revert(true, true);
            Ft._subPinOffset = false;
            var p,
              h,
              v,
              b,
              w,
              T,
              E,
              R,
              F,
              I,
              z = zt(),
              L = Yt(),
              B = qe ? qe.duration() : Re(xt, ht),
              N = 0,
              H = 0,
              W = e.end,
              q = e.endTrigger || ve,
              G =
                e.start || (0 !== e.start && ve ? (be ? "0 0" : "0 100%") : 0),
              U = (Ft.pinnedContainer =
                e.pinnedContainer && O(e.pinnedContainer)),
              j = (ve && Math.max(0, wt.indexOf(Ft))) || 0,
              $ = j;
            while ($--) {
              T = wt[$];
              T.end || T.refresh(0, 1) || (Z = 1);
              E = T.pin;
              if (E && (E === ve || E === be) && !T.isReverted) {
                I || (I = []);
                I.unshift(T);
                T.revert(true, true);
              }
              if (T !== wt[$]) {
                j--;
                $--;
              }
            }
            ze(G) && (G = G(Ft));
            s =
              $t(G, ve, z, ht, Ht(), c, f, Ft, L, Rt, Mt, B, qe) ||
              (be ? -0.001 : 0);
            ze(W) && (W = W(Ft));
            if (Ie(W) && !W.indexOf("+="))
              if (~W.indexOf(" ")) W = (Ie(G) ? G.split(" ")[0] : "") + W;
              else {
                N = yt(W.substr(2), z);
                W = Ie(G) ? G : s + N;
                q = ve;
              }
            l =
              Math.max(
                s,
                $t(
                  W || (q ? "100% 0" : B),
                  q,
                  z,
                  ht,
                  Ht() + N,
                  u,
                  d,
                  Ft,
                  L,
                  Rt,
                  Mt,
                  B,
                  qe
                )
              ) || -0.001;
            g = l - s || ((s -= 0.01) && 0.001);
            N = 0;
            $ = j;
            while ($--) {
              T = wt[$];
              E = T.pin;
              if (E && T.start - T._pinPush <= s && !qe && T.end > 0) {
                p = T.end - T.start;
                ((E === ve && T.start - T._pinPush < s) || E === U) &&
                  !Le(G) &&
                  (N += p * (1 - T.progress));
                E === be && (H += p);
              }
            }
            s += N;
            l += N;
            Ft._pinPush = H;
            if (c && N) {
              p = {};
              p[ht.a] = "+=" + N;
              U && (p[ht.p] = "-=" + Ht());
              Y.set([c, u], p);
            }
            if (be) {
              p = nt(be);
              b = ht === C;
              v = Ht();
              k = parseFloat(S(ht.a)) + H;
              !B &&
                l > 1 &&
                ((Pt ? V : xt).style["overflow-" + ht.a] = "scroll");
              qt(be, x, p);
              y = jt(be);
              h = at(be, true);
              R = Mt && A(xt, b ? M : C)();
              if (Se) {
                D = [Se + ht.os2, g + H + rt];
                D.t = x;
                $ = Se === Je ? st(be, ht) + g + H : 0;
                $ && D.push(ht.d, $ + rt);
                Ut(D);
                U &&
                  wt.forEach(function (e) {
                    e.pin === U &&
                      false !== e.vars.pinSpacing &&
                      (e._subPinOffset = true);
                  });
                Mt && Ht(ee);
              }
              if (Mt) {
                w = {
                  top: h.top + (b ? v - s : R) + rt,
                  left: h.left + (b ? R : v - s) + rt,
                  boxSizing: "border-box",
                  position: "fixed",
                };
                w[Ge] = w["max" + et] = Math.ceil(h.width) + rt;
                w[Ue] = w["max" + tt] = Math.ceil(h.height) + rt;
                w[Qe] = w[Qe + Ze] = w[Qe + je] = w[Qe + $e] = w[Qe + Ke] = "0";
                w[Je] = p[Je];
                w[Je + Ze] = p[Je + Ze];
                w[Je + je] = p[Je + je];
                w[Je + $e] = p[Je + $e];
                w[Je + Ke] = p[Je + Ke];
                _ = Kt(m, w, Ve);
                he && Ht(0);
              }
              if (t) {
                F = t._initted;
                ie(1);
                t.render(t.duration(), true, true);
                P = S(ht.a) - k + g + H;
                g !== P && Mt && _.splice(_.length - 2, 2);
                t.render(0, true, true);
                F || t.invalidate(true);
                t.parent || t.totalTime(t.totalTime());
                ie(0);
              } else P = g;
            } else if (ve && Ht() && !qe) {
              h = ve.parentNode;
              while (h && h !== V) {
                if (h._pinOffset) {
                  s -= h._pinOffset;
                  l -= h._pinOffset;
                }
                h = h.parentNode;
              }
            }
            I &&
              I.forEach(function (e) {
                return e.revert(false, true);
              });
            Ft.start = s;
            Ft.end = l;
            o = a = he ? ee : Ht();
            if (!qe && !he) {
              o < ee && Ht(ee);
              Ft.scroll.rec = 0;
            }
            Ft.revert(false, true);
            if (K) {
              Xt = -1;
              Ft.isActive && Ht(s + g * J);
              K.restart(true);
            }
            Z = 0;
            t &&
              _t &&
              (t._initted || te) &&
              t.progress() !== te &&
              t.progress(te, true).render(t.time(), true, true);
            if (J !== Ft.progress || qe) {
              t && !_t && t.totalProgress(J, true);
              Ft.progress = (o - s) / g === J ? 0 : J;
            }
            be && Se && (x._pinOffset = Math.round(Ft.progress * P));
            de && !he && de(Ft);
          }
      };
      Ft.getVelocity = function () {
        return ((Ht() - a) / (ye() - j)) * 1e3 || 0;
      };
      Ft.endAnimation = function () {
        Xe(Ft.callbackAnimation);
        t &&
          (X
            ? X.progress(1)
            : t.paused()
            ? _t || Xe(t, Ft.direction < 0, 1)
            : Xe(t, t.reversed()));
      };
      Ft.labelToScroll = function (e) {
        return (
          (t &&
            t.labels &&
            (s || Ft.refresh() || s) + (t.labels[e] / t.duration()) * g) ||
          0
        );
      };
      Ft.getTrailing = function (e) {
        var t = wt.indexOf(Ft),
          r = Ft.direction > 0 ? wt.slice(0, t).reverse() : wt.slice(t + 1);
        return (
          Ie(e)
            ? r.filter(function (t) {
                return t.vars.preventOverlaps === e;
              })
            : r
        ).filter(function (e) {
          return Ft.direction > 0 ? e.end <= s : e.start >= l;
        });
      };
      Ft.update = function (e, n, i) {
        if (!qe || i || e) {
          var c,
            u,
            d,
            p,
            h,
            v,
            m,
            b,
            w = he ? ee : Ft.scroll(),
            S = e ? 0 : (w - s) / g,
            M = S < 0 ? 0 : S > 1 ? 1 : S || 0,
            O = Ft.progress;
          if (n) {
            a = o;
            o = qe ? Ht() : w;
            if (He) {
              L = z;
              z = t && !_t ? t.totalProgress() : M;
            }
          }
          Ee &&
            !M &&
            be &&
            !Z &&
            !_e &&
            xe &&
            s < w + ((w - a) / (ye() - j)) * Ee &&
            (M = 1e-4);
          if (M !== O && Ft.enabled) {
            c = Ft.isActive = !!M && M < 1;
            u = !!O && O < 1;
            v = c !== u;
            h = v || !!M !== !!O;
            Ft.direction = M > O ? 1 : -1;
            Ft.progress = M;
            if (h && !Z) {
              d = M && !O ? 0 : 1 === M ? 1 : 1 === O ? 2 : 3;
              if (_t) {
                p = (!v && "none" !== At[d + 1] && At[d + 1]) || At[d];
                b = t && ("complete" === p || "reset" === p || p in t);
              }
            }
            dt &&
              (v || b) &&
              (b || ge || !t) &&
              (ze(dt)
                ? dt(Ft)
                : Ft.getTrailing(dt).forEach(function (e) {
                    return e.endAnimation();
                  }));
            if (!_t)
              if (!X || Z || _e) t && t.totalProgress(M, !!Z);
              else {
                (qe || (me && me !== Ft)) && X.render(X._dp._time - X._start);
                if (X.resetTo)
                  X.resetTo("totalProgress", M, t._tTime / t._tDur);
                else {
                  X.vars.totalProgress = M;
                  X.invalidate().restart();
                }
              }
            if (be) {
              e && Se && (x.style[Se + ht.os2] = E);
              if (Mt) {
                if (h) {
                  m = !e && M > O && l + 1 > w && w + 1 >= Re(xt, ht);
                  if (Ve)
                    if (e || (!c && !m)) Qt(be, x);
                    else {
                      var A = at(be, true),
                        D = w - s;
                      Qt(
                        be,
                        V,
                        A.top + (ht === C ? D : 0) + rt,
                        A.left + (ht === C ? 0 : D) + rt
                      );
                    }
                  Ut(c || m ? _ : y);
                  (P !== g && M < 1 && c) || T(k + (1 !== M || m ? 0 : P));
                }
              } else T(Pe(k + P * M));
            }
            He && !r.tween && !Z && !_e && K.restart(true);
            le &&
              (v || (Fe && M && (M < 1 || !pe))) &&
              G(le.targets).forEach(function (e) {
                return e.classList[c || Fe ? "add" : "remove"](le.className);
              });
            se && !_t && !e && se(Ft);
            if (h && !Z) {
              if (_t) {
                b &&
                  ("complete" === p
                    ? t.pause().totalProgress(1)
                    : "reset" === p
                    ? t.restart(true).pause()
                    : "restart" === p
                    ? t.restart(true)
                    : t[p]());
                se && se(Ft);
              }
              if (v || !pe) {
                ue && v && Be(Ft, ue);
                Ct[d] && Be(Ft, Ct[d]);
                Fe && (1 === M ? Ft.kill(false, 1) : (Ct[d] = 0));
                if (!v) {
                  d = 1 === M ? 1 : 3;
                  Ct[d] && Be(Ft, Ct[d]);
                }
              }
              if (
                lt &&
                !c &&
                Math.abs(Ft.getVelocity()) > (Le(lt) ? lt : 2500)
              ) {
                Xe(Ft.callbackAnimation);
                X ? X.progress(1) : Xe(t, "reverse" === p ? 1 : !M, 1);
              }
            } else _t && se && !Z && se(Ft);
          }
          if (F) {
            var I = qe ? (w / qe.duration()) * (qe._caScrollDist || 0) : w;
            R(I + (f._isFlipped ? 1 : 0));
            F(I);
          }
          re && re((-w / qe.duration()) * (qe._caScrollDist || 0));
        }
      };
      Ft.enable = function (e, t) {
        if (!Ft.enabled) {
          Ft.enabled = true;
          pt(xt, "resize", Et);
          pt(Pt ? N : xt, "scroll", kt);
          It && pt(ScrollTrigger, "refreshInit", It);
          if (false !== e) {
            Ft.progress = J = 0;
            o = a = Xt = Ht();
          }
          false !== t && Ft.refresh();
        }
      };
      Ft.getTween = function (e) {
        return e && r ? r.tween : X;
      };
      Ft.setPositions = function (e, t) {
        if (be) {
          k += e - s;
          P += t - e - g;
          Se === Je && Ft.adjustPinSpacing(t - e - g);
        }
        Ft.start = s = e;
        Ft.end = l = t;
        g = t - e;
        Ft.update();
      };
      Ft.adjustPinSpacing = function (e) {
        if (D) {
          var t = D.indexOf(ht.d) + 1;
          D[t] = parseFloat(D[t]) + e + rt;
          D[1] = parseFloat(D[1]) + e + rt;
          Ut(D);
        }
      };
      Ft.disable = function (e, t) {
        if (Ft.enabled) {
          false !== e && Ft.revert(true, true);
          Ft.enabled = Ft.isActive = false;
          t || (X && X.pause());
          ee = 0;
          n && (n.uncache = 1);
          It && gt(ScrollTrigger, "refreshInit", It);
          if (K) {
            K.pause();
            r.tween && r.tween.kill() && (r.tween = 0);
          }
          if (!Pt) {
            var i = wt.length;
            while (i--) if (wt[i].scroller === xt && wt[i] !== Ft) return;
            gt(xt, "resize", Et);
            gt(xt, "scroll", kt);
          }
        }
      };
      Ft.kill = function (r, i) {
        Ft.disable(r, i);
        X && !i && X.kill();
        ce && delete St[ce];
        var o = wt.indexOf(Ft);
        o >= 0 && wt.splice(o, 1);
        o === Q && Bt > 0 && Q--;
        o = 0;
        wt.forEach(function (e) {
          return e.scroller === Ft.scroller && (o = 1);
        });
        o || he || (Ft.scroll.rec = 0);
        if (t) {
          t.scrollTrigger = null;
          r && t.revert({ kill: false });
          i || t.kill();
        }
        c &&
          [c, u, f, d].forEach(function (e) {
            return e.parentNode && e.parentNode.removeChild(e);
          });
        me === Ft && (me = 0);
        if (be) {
          n && (n.uncache = 1);
          o = 0;
          wt.forEach(function (e) {
            return e.pin === be && o++;
          });
          o || (n.spacer = 0);
        }
        e.onKill && e.onKill(Ft);
      };
      Ft.enable(false, false);
      oe && oe(Ft);
      t && t.add && !g
        ? Y.delayedCall(0.01, function () {
            return s || l || Ft.refresh();
          }) &&
          (g = 0.01) &&
          (s = l = 0)
        : Ft.refresh();
      be && Lt();
    } else this.update = this.refresh = this.kill = ke;
  };
  ScrollTrigger.register = function register(e) {
    if (!X) {
      Y = e || Me();
      Ee() && window.document && ScrollTrigger.enable();
      X = we;
    }
    return X;
  };
  ScrollTrigger.defaults = function defaults(e) {
    if (e) for (var t in e) mt[t] = e[t];
    return mt;
  };
  ScrollTrigger.disable = function disable(e, t) {
    we = 0;
    wt.forEach(function (r) {
      return r[t ? "kill" : "disable"](e);
    });
    gt(B, "wheel", kt);
    gt(N, "scroll", kt);
    clearInterval(K);
    gt(N, "touchcancel", ke);
    gt(V, "touchstart", ke);
    dt(gt, N, "pointerdown,touchstart,mousedown", Se);
    dt(gt, N, "pointerup,touchend,mouseup", Te);
    q.kill();
    Fe(gt);
    for (var r = 0; r < h.length; r += 3) {
      ht(gt, h[r], h[r + 1]);
      ht(gt, h[r], h[r + 2]);
    }
  };
  ScrollTrigger.enable = function enable() {
    B = window;
    N = document;
    H = N.documentElement;
    V = N.body;
    if (Y) {
      G = Y.utils.toArray;
      U = Y.utils.clamp;
      fe = Y.core.context || ke;
      ie = Y.core.suppressOverwrites || ke;
      de = B.history.scrollRestoration || "auto";
      Y.core.globals("ScrollTrigger", ScrollTrigger);
      if (V) {
        we = 1;
        L.register(Y);
        ScrollTrigger.isTouch = L.isTouch;
        ue = L.isTouch && /(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent);
        pt(B, "wheel", kt);
        W = [B, N, H, V];
        if (Y.matchMedia) {
          ScrollTrigger.matchMedia = function (e) {
            var t,
              r = Y.matchMedia();
            for (t in e) r.add(t, e[t]);
            return r;
          };
          Y.addEventListener("matchMediaInit", function () {
            return Ft();
          });
          Y.addEventListener("matchMediaRevert", function () {
            return Rt();
          });
          Y.addEventListener("matchMedia", function () {
            Yt(0, 1);
            At("matchMedia");
          });
          Y.matchMedia("(orientation: portrait)", function () {
            Pt();
            return Pt;
          });
        } else console.warn("Requires GSAP 3.11.0 or later");
        Pt();
        pt(N, "scroll", kt);
        var e,
          t,
          r = V.style,
          n = r.borderTopStyle,
          i = Y.core.Animation.prototype;
        i.revert ||
          Object.defineProperty(i, "revert", {
            value: function value() {
              return this.time(-0.01, true);
            },
          });
        r.borderTopStyle = "solid";
        e = at(V);
        C.m = Math.round(e.top + C.sc()) || 0;
        M.m = Math.round(e.left + M.sc()) || 0;
        n ? (r.borderTopStyle = n) : r.removeProperty("border-top-style");
        K = setInterval(Tt, 250);
        Y.delayedCall(0.5, function () {
          return (_e = 0);
        });
        pt(N, "touchcancel", ke);
        pt(V, "touchstart", ke);
        dt(pt, N, "pointerdown,touchstart,mousedown", Se);
        dt(pt, N, "pointerup,touchend,mouseup", Te);
        J = Y.utils.checkPrefix("transform");
        Vt.push(J);
        X = ye();
        q = Y.delayedCall(0.2, Yt).pause();
        re = [
          N,
          "visibilitychange",
          function () {
            var e = B.innerWidth,
              t = B.innerHeight;
            if (N.hidden) {
              ee = e;
              te = t;
            } else (ee === e && te === t) || Et();
          },
          N,
          "DOMContentLoaded",
          Yt,
          B,
          "load",
          Yt,
          B,
          "resize",
          Et,
        ];
        Fe(pt);
        wt.forEach(function (e) {
          return e.enable(0, 1);
        });
        for (t = 0; t < h.length; t += 3) {
          ht(gt, h[t], h[t + 1]);
          ht(gt, h[t], h[t + 2]);
        }
      }
    }
  };
  ScrollTrigger.config = function config(e) {
    "limitCallbacks" in e && (pe = !!e.limitCallbacks);
    var t = e.syncInterval;
    (t && clearInterval(K)) || ((K = t) && setInterval(Tt, t));
    "ignoreMobileResize" in e &&
      (se = 1 === ScrollTrigger.isTouch && e.ignoreMobileResize);
    if ("autoRefreshEvents" in e) {
      Fe(gt) || Fe(pt, e.autoRefreshEvents || "none");
      oe = -1 === (e.autoRefreshEvents + "").indexOf("resize");
    }
  };
  ScrollTrigger.scrollerProxy = function scrollerProxy(e, t) {
    var r = O(e),
      n = h.indexOf(r),
      i = Ce(r);
    ~n && h.splice(n, i ? 6 : 2);
    t && (i ? v.unshift(B, t, V, t, H, t) : v.unshift(r, t));
  };
  ScrollTrigger.clearMatchMedia = function clearMatchMedia(e) {
    wt.forEach(function (t) {
      return t._ctx && t._ctx.query === e && t._ctx.kill(true, true);
    });
  };
  ScrollTrigger.isInViewport = function isInViewport(e, t, r) {
    var n = (Ie(e) ? O(e) : e).getBoundingClientRect(),
      i = n[r ? Ge : Ue] * t || 0;
    return r
      ? n.right - i > 0 && n.left + i < B.innerWidth
      : n.bottom - i > 0 && n.top + i < B.innerHeight;
  };
  ScrollTrigger.positionInViewport = function positionInViewport(e, t, r) {
    Ie(e) && (e = O(e));
    var n = e.getBoundingClientRect(),
      i = n[r ? Ge : Ue],
      o =
        null == t
          ? i / 2
          : t in _t
          ? _t[t] * i
          : ~t.indexOf("%")
          ? (parseFloat(t) * i) / 100
          : parseFloat(t) || 0;
    return r ? (n.left + o) / B.innerWidth : (n.top + o) / B.innerHeight;
  };
  ScrollTrigger.killAll = function killAll(e) {
    wt.forEach(function (e) {
      return "ScrollSmoother" !== e.vars.id && e.kill();
    });
    if (true !== e) {
      var t = Mt.killAll || [];
      Mt = {};
      t.forEach(function (e) {
        return e();
      });
    }
  };
  return ScrollTrigger;
})();
tr.version = "3.11.3";
tr.saveStyles = function (e) {
  return e
    ? G(e).forEach(function (e) {
        if (e && e.style) {
          var t = Dt.indexOf(e);
          t >= 0 && Dt.splice(t, 5);
          Dt.push(
            e,
            e.style.cssText,
            e.getBBox && e.getAttribute("transform"),
            Y.core.getCache(e),
            fe()
          );
        }
      })
    : Dt;
};
tr.revert = function (e, t) {
  return Ft(!e, t);
};
tr.create = function (e, t) {
  return new tr(e, t);
};
tr.refresh = function (e) {
  return e ? Et() : (X || tr.register()) && Yt(true);
};
tr.update = Nt;
tr.clearScrollMemory = It;
tr.maxScroll = function (e, t) {
  return Re(e, t ? M : C);
};
tr.getScrollFunc = function (e, t) {
  return A(O(e), t ? M : C);
};
tr.getById = function (e) {
  return St[e];
};
tr.getAll = function () {
  return wt.filter(function (e) {
    return "ScrollSmoother" !== e.vars.id;
  });
};
tr.isScrolling = function () {
  return !!xe;
};
tr.snapDirectional = ut;
tr.addEventListener = function (e, t) {
  var r = Mt[e] || (Mt[e] = []);
  ~r.indexOf(t) || r.push(t);
};
tr.removeEventListener = function (e, t) {
  var r = Mt[e],
    n = r && r.indexOf(t);
  n >= 0 && r.splice(n, 1);
};
tr.batch = function (e, t) {
  var r,
    n = [],
    i = {},
    o = t.interval || 0.016,
    a = t.batchMax || 1e9,
    s = function proxyCallback(e, t) {
      var r = [],
        n = [],
        i = Y.delayedCall(o, function () {
          t(r, n);
          r = [];
          n = [];
        }).pause();
      return function (e) {
        r.length || i.restart(true);
        r.push(e.trigger);
        n.push(e);
        a <= r.length && i.progress(1);
      };
    };
  for (r in t)
    i[r] =
      "on" === r.substr(0, 2) && ze(t[r]) && "onRefreshInit" !== r
        ? s(r, t[r])
        : t[r];
  if (ze(a)) {
    a = a();
    pt(tr, "refresh", function () {
      return (a = t.batchMax());
    });
  }
  G(e).forEach(function (e) {
    var t = {};
    for (r in i) t[r] = i[r];
    t.trigger = e;
    n.push(tr.create(t));
  });
  return n;
};
var rr,
  nr = function _clampScrollAndGetDurationMultiplier(e, t, r, n) {
    t > n ? e(n) : t < 0 && e(0);
    return r > n ? (n - t) / (r - t) : r < 0 ? t / (t - r) : 1;
  },
  ir = function _allowNativePanning(e, t) {
    true === t
      ? e.style.removeProperty("touch-action")
      : (e.style.touchAction =
          true === t
            ? "auto"
            : t
            ? "pan-" + t + (L.isTouch ? " pinch-zoom" : "")
            : "none");
    e === H && _allowNativePanning(V, t);
  },
  or = { auto: 1, scroll: 1 },
  ar = function _nestedScroll(e) {
    var t = e.event,
      r = e.target,
      n = e.axis;
    var i,
      o = (t.changedTouches ? t.changedTouches[0] : t).target,
      a = o._gsap || Y.core.getCache(o),
      s = ye();
    if (!a._isScrollT || s - a._isScrollT > 2e3) {
      while (o && o.scrollHeight <= o.clientHeight) o = o.parentNode;
      a._isScroll =
        o &&
        !Ce(o) &&
        o !== r &&
        (or[(i = nt(o)).overflowY] || or[i.overflowX]);
      a._isScrollT = s;
    }
    if (a._isScroll || "x" === n) {
      t.stopPropagation();
      t._gsapAllow = true;
    }
  },
  sr = function _inputObserver(e, t, r, n) {
    return L.create({
      target: e,
      capture: true,
      debounce: false,
      lockAxis: true,
      type: t,
      onWheel: (n = n && ar),
      onPress: n,
      onDrag: n,
      onScroll: n,
      onEnable: function onEnable() {
        return r && pt(N, L.eventTypes[0], cr, false, true);
      },
      onDisable: function onDisable() {
        return gt(N, L.eventTypes[0], cr, true);
      },
    });
  },
  lr = /(input|label|select|textarea)/i,
  cr = function _captureInputs(e) {
    var t = lr.test(e.target.tagName);
    if (t || rr) {
      e._gsapAllow = true;
      rr = t;
    }
  },
  ur = function _getScrollNormalizer(e) {
    Ye(e) || (e = {});
    e.preventDefault = e.isNormalizer = e.allowClicks = true;
    e.type || (e.type = "wheel,touch");
    e.debounce = !!e.debounce;
    e.id = e.id || "normalizer";
    var t,
      r,
      n,
      i,
      o,
      a,
      s,
      l,
      c = e,
      u = c.normalizeScrollX,
      f = c.momentum,
      d = c.allowNestedScroll,
      p = O(e.target) || H,
      g = Y.core.globals().ScrollSmoother,
      v = g && g.get(),
      m =
        ue &&
        ((e.content && O(e.content)) ||
          (v && false !== e.content && !v.smooth() && v.content())),
      _ = A(p, C),
      y = A(p, M),
      b = 1,
      x =
        (L.isTouch && B.visualViewport
          ? B.visualViewport.scale * B.visualViewport.width
          : B.outerWidth) / B.innerWidth,
      w = 0,
      S = ze(f)
        ? function () {
            return f(t);
          }
        : function () {
            return f || 2.8;
          },
      T = sr(p, e.type, true, d),
      k = function resumeTouchMove() {
        return (i = false);
      },
      P = ke,
      E = ke,
      D = function updateClamps() {
        r = Re(p, C);
        E = U(ue ? 1 : 0, r);
        u && (P = U(0, Re(p, M)));
        n = zt;
      },
      R = function removeContentOffset() {
        m._gsap.y = Pe(parseFloat(m._gsap.y) + _.offset) + "px";
        m.style.transform =
          "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " +
          parseFloat(m._gsap.y) +
          ", 0, 1)";
        _.offset = _.cacheID = 0;
      },
      F = function ignoreDrag() {
        if (i) {
          requestAnimationFrame(k);
          var e = Pe(t.deltaY / 2),
            r = E(_.v - e);
          if (m && r !== _.v + _.offset) {
            _.offset = r - _.v;
            var n = Pe((parseFloat(m && m._gsap.y) || 0) - _.offset);
            m.style.transform =
              "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " +
              n +
              ", 0, 1)";
            m._gsap.y = n + "px";
            _.cacheID = h.cache;
            Nt();
          }
          return true;
        }
        _.offset && R();
        i = true;
      },
      I = function onResize() {
        D();
        o.isActive() &&
          o.vars.scrollY > r &&
          (_() > r ? o.progress(1) && _(r) : o.resetTo("scrollY", r));
      };
    m && Y.set(m, { y: "+=0" });
    e.ignoreCheck = function (e) {
      return (
        (ue && "touchmove" === e.type && F(e)) ||
        (b > 1.05 && "touchstart" !== e.type) ||
        t.isGesturing ||
        (e.touches && e.touches.length > 1)
      );
    };
    e.onPress = function () {
      var e = b;
      b = Pe(((B.visualViewport && B.visualViewport.scale) || 1) / x);
      o.pause();
      e !== b && ir(p, b > 1.01 || (!u && "x"));
      a = y();
      s = _();
      D();
      n = zt;
    };
    e.onRelease = e.onGestureStart = function (e, t) {
      _.offset && R();
      if (t) {
        h.cache++;
        var n,
          i,
          a = S();
        if (u) {
          n = y();
          i = n + (0.05 * a * -e.velocityX) / 0.227;
          a *= nr(y, n, i, Re(p, M));
          o.vars.scrollX = P(i);
        }
        n = _();
        i = n + (0.05 * a * -e.velocityY) / 0.227;
        a *= nr(_, n, i, Re(p, C));
        o.vars.scrollY = E(i);
        o.invalidate().duration(a).play(0.01);
        ((ue && o.vars.scrollY >= r) || n >= r - 1) &&
          Y.to({}, { onUpdate: I, duration: a });
      } else l.restart(true);
    };
    e.onWheel = function () {
      o._ts && o.pause();
      if (ye() - w > 1e3) {
        n = 0;
        w = ye();
      }
    };
    e.onChange = function (e, t, r, i, o) {
      zt !== n && D();
      t && u && y(P(i[2] === t ? a + (e.startX - e.x) : y() + t - i[1]));
      if (r) {
        _.offset && R();
        var l = o[2] === r,
          c = l ? s + e.startY - e.y : _() + r - o[1],
          f = E(c);
        l && c !== f && (s += f - c);
        _(f);
      }
      (r || t) && Nt();
    };
    e.onEnable = function () {
      ir(p, !u && "x");
      tr.addEventListener("refresh", I);
      pt(B, "resize", I);
      if (_.smooth) {
        _.target.style.scrollBehavior = "auto";
        _.smooth = y.smooth = false;
      }
      T.enable();
    };
    e.onDisable = function () {
      ir(p, true);
      gt(B, "resize", I);
      tr.removeEventListener("refresh", I);
      T.kill();
    };
    e.lockAxis = false !== e.lockAxis;
    t = new L(e);
    t.iOS = ue;
    ue && !_() && _(1);
    ue && Y.ticker.add(ke);
    l = t._dc;
    o = Y.to(t, {
      ease: "power4",
      paused: true,
      scrollX: u ? "+=0.1" : "+=0",
      scrollY: "+=0.1",
      onComplete: l.vars.onComplete,
    });
    return t;
  };
tr.sort = function (e) {
  return wt.sort(
    e ||
      function (e, t) {
        return (
          -1e6 * (e.vars.refreshPriority || 0) +
          e.start -
          (t.start + -1e6 * (t.vars.refreshPriority || 0))
        );
      }
  );
};
tr.observe = function (e) {
  return new L(e);
};
tr.normalizeScroll = function (e) {
  if ("undefined" === typeof e) return ae;
  if (true === e && ae) return ae.enable();
  if (false === e) return ae && ae.kill();
  var t = e instanceof L ? e : ur(e);
  ae && ae.target === t.target && ae.kill();
  Ce(t.target) && (ae = t);
  return t;
};
tr.core = {
  _getVelocityProp: D,
  _inputObserver: sr,
  _scrollers: h,
  _proxies: v,
  bridge: {
    ss: function ss() {
      xe || At("scrollStart");
      xe = ye();
    },
    ref: function ref() {
      return Z;
    },
  },
};
Me() && Y.registerPlugin(tr);
export {
  L as O,
  tr as S,
  x as _,
  h as a,
  A as b,
  b as c,
  v as d,
  D as e,
  C as f,
  M as g,
  O as h,
};

//# sourceMappingURL=3ebdc148.js.map
