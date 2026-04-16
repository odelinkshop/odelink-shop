function _assertThisInitialized(t) {
  if (void 0 === t)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function _inheritsLoose(t, e) {
  t.prototype = Object.create(e.prototype);
  t.prototype.constructor = t;
  t.__proto__ = e;
}
/*!
 * GSAP 3.11.4
 * https://greensock.com
 *
 * @license Copyright 2008-2022, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */ var t,
  e,
  i,
  r,
  n,
  s,
  a,
  o,
  u,
  h,
  l,
  _ = {
    autoSleep: 120,
    force3D: "auto",
    nullTargetWarn: 1,
    units: { lineHeight: "" },
  },
  c = { duration: 0.5, overwrite: false, delay: 0 },
  d = 1e8,
  p = 1 / d,
  m = 2 * Math.PI,
  g = m / 4,
  v = 0,
  T = Math.sqrt,
  y = Math.cos,
  w = Math.sin,
  b = function _isString(t) {
    return "string" === typeof t;
  },
  k = function _isFunction(t) {
    return "function" === typeof t;
  },
  x = function _isNumber(t) {
    return "number" === typeof t;
  },
  D = function _isUndefined(t) {
    return "undefined" === typeof t;
  },
  M = function _isObject(t) {
    return "object" === typeof t;
  },
  C = function _isNotFalse(t) {
    return false !== t;
  },
  A = function _windowExists() {
    return "undefined" !== typeof window;
  },
  E = function _isFuncOrString(t) {
    return k(t) || b(t);
  },
  P =
    ("function" === typeof ArrayBuffer && ArrayBuffer.isView) || function () {},
  R = Array.isArray,
  S = /(?:-?\.?\d|\.)+/gi,
  O = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,
  z = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
  I = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,
  L = /[+-]=-?[.\d]+/,
  F = /[^,'"\[\]\s]+/gi,
  B = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,
  U = {},
  N = {},
  q = function _install(t) {
    return (N = gt(t, U)) && Oi;
  },
  j = function _missingPlugin(t, e) {
    return console.warn(
      "Invalid property",
      t,
      "set to",
      e,
      "Missing plugin? gsap.registerPlugin()"
    );
  },
  V = function _warn(t, e) {
    return !e && console.warn(t);
  },
  Q = function _addGlobal(t, e) {
    return (t && (U[t] = e) && N && (N[t] = e)) || U;
  },
  Y = function _emptyFunc() {
    return 0;
  },
  G = { suppressEvents: true, isStart: true, kill: false },
  W = { suppressEvents: true, kill: false },
  K = { suppressEvents: true },
  H = {},
  Z = [],
  $ = {},
  J = {},
  X = {},
  tt = 30,
  et = [],
  it = "",
  rt = function _harness(t) {
    var e,
      i,
      r = t[0];
    M(r) || k(r) || (t = [t]);
    if (!(e = (r._gsap || {}).harness)) {
      i = et.length;
      while (i-- && !et[i].targetTest(r));
      e = et[i];
    }
    i = t.length;
    while (i--)
      (t[i] && (t[i]._gsap || (t[i]._gsap = new Qe(t[i], e)))) ||
        t.splice(i, 1);
    return t;
  },
  nt = function _getCache(t) {
    return t._gsap || rt(te(t))[0]._gsap;
  },
  st = function _getProperty(t, e, i) {
    return (i = t[e]) && k(i)
      ? t[e]()
      : (D(i) && t.getAttribute && t.getAttribute(e)) || i;
  },
  at = function _forEachName(t, e) {
    return (t = t.split(",")).forEach(e) || t;
  },
  ot = function _round(t) {
    return Math.round(1e5 * t) / 1e5 || 0;
  },
  ut = function _roundPrecise(t) {
    return Math.round(1e7 * t) / 1e7 || 0;
  },
  ht = function _parseRelative(t, e) {
    var i = e.charAt(0),
      r = parseFloat(e.substr(2));
    t = parseFloat(t);
    return "+" === i ? t + r : "-" === i ? t - r : "*" === i ? t * r : t / r;
  },
  lt = function _arrayContainsAny(t, e) {
    var i = e.length,
      r = 0;
    for (; t.indexOf(e[r]) < 0 && ++r < i; );
    return r < i;
  },
  ft = function _lazyRender() {
    var t,
      e,
      i = Z.length,
      r = Z.slice(0);
    $ = {};
    Z.length = 0;
    for (t = 0; t < i; t++) {
      e = r[t];
      e && e._lazy && (e.render(e._lazy[0], e._lazy[1], true)._lazy = 0);
    }
  },
  _t = function _lazySafeRender(t, i, r, n) {
    Z.length && !e && ft();
    t.render(i, r, n || (e && i < 0 && (t._initted || t._startAt)));
    Z.length && !e && ft();
  },
  ct = function _numericIfPossible(t) {
    var e = parseFloat(t);
    return (e || 0 === e) && (t + "").match(F).length < 2
      ? e
      : b(t)
      ? t.trim()
      : t;
  },
  dt = function _passThrough(t) {
    return t;
  },
  pt = function _setDefaults(t, e) {
    for (var i in e) i in t || (t[i] = e[i]);
    return t;
  },
  mt = function _setKeyframeDefaults(t) {
    return function (e, i) {
      for (var r in i)
        r in e || ("duration" === r && t) || "ease" === r || (e[r] = i[r]);
    };
  },
  gt = function _merge(t, e) {
    for (var i in e) t[i] = e[i];
    return t;
  },
  vt = function _mergeDeep(t, e) {
    for (var i in e)
      "__proto__" !== i &&
        "constructor" !== i &&
        "prototype" !== i &&
        (t[i] = M(e[i]) ? _mergeDeep(t[i] || (t[i] = {}), e[i]) : e[i]);
    return t;
  },
  Tt = function _copyExcluding(t, e) {
    var i,
      r = {};
    for (i in t) i in e || (r[i] = t[i]);
    return r;
  },
  yt = function _inheritDefaults(t) {
    var e = t.parent || r,
      i = t.keyframes ? mt(R(t.keyframes)) : pt;
    if (C(t.inherit))
      while (e) {
        i(t, e.vars.defaults);
        e = e.parent || e._dp;
      }
    return t;
  },
  wt = function _arraysMatch(t, e) {
    var i = t.length,
      r = i === e.length;
    while (r && i-- && t[i] === e[i]);
    return i < 0;
  },
  bt = function _addLinkedListItem(t, e, i, r, n) {
    void 0 === i && (i = "_first");
    void 0 === r && (r = "_last");
    var s,
      a = t[r];
    if (n) {
      s = e[n];
      while (a && a[n] > s) a = a._prev;
    }
    if (a) {
      e._next = a._next;
      a._next = e;
    } else {
      e._next = t[i];
      t[i] = e;
    }
    e._next ? (e._next._prev = e) : (t[r] = e);
    e._prev = a;
    e.parent = e._dp = t;
    return e;
  },
  kt = function _removeLinkedListItem(t, e, i, r) {
    void 0 === i && (i = "_first");
    void 0 === r && (r = "_last");
    var n = e._prev,
      s = e._next;
    n ? (n._next = s) : t[i] === e && (t[i] = s);
    s ? (s._prev = n) : t[r] === e && (t[r] = n);
    e._next = e._prev = e.parent = null;
  },
  xt = function _removeFromParent(t, e) {
    t.parent && (!e || t.parent.autoRemoveChildren) && t.parent.remove(t);
    t._act = 0;
  },
  Dt = function _uncache(t, e) {
    if (t && (!e || e._end > t._dur || e._start < 0)) {
      var i = t;
      while (i) {
        i._dirty = 1;
        i = i.parent;
      }
    }
    return t;
  },
  Mt = function _recacheAncestors(t) {
    var e = t.parent;
    while (e && e.parent) {
      e._dirty = 1;
      e.totalDuration();
      e = e.parent;
    }
    return t;
  },
  Ct = function _rewindStartAt(t, i, r, n) {
    return (
      t._startAt &&
      (e
        ? t._startAt.revert(W)
        : (t.vars.immediateRender && !t.vars.autoRevert) ||
          t._startAt.render(i, true, n))
    );
  },
  At = function _hasNoPausedAncestors(t) {
    return !t || (t._ts && _hasNoPausedAncestors(t.parent));
  },
  Et = function _elapsedCycleDuration(t) {
    return t._repeat ? Pt(t._tTime, (t = t.duration() + t._rDelay)) * t : 0;
  },
  Pt = function _animationCycle(t, e) {
    var i = Math.floor((t /= e));
    return t && i === t ? i - 1 : i;
  },
  Rt = function _parentToChildTotalTime(t, e) {
    return (
      (t - e._start) * e._ts +
      (e._ts >= 0 ? 0 : e._dirty ? e.totalDuration() : e._tDur)
    );
  },
  St = function _setEnd(t) {
    return (t._end = ut(
      t._start + (t._tDur / Math.abs(t._ts || t._rts || p) || 0)
    ));
  },
  Ot = function _alignPlayhead(t, e) {
    var i = t._dp;
    if (i && i.smoothChildTiming && t._ts) {
      t._start = ut(
        i._time -
          (t._ts > 0
            ? e / t._ts
            : ((t._dirty ? t.totalDuration() : t._tDur) - e) / -t._ts)
      );
      St(t);
      i._dirty || Dt(i, t);
    }
    return t;
  },
  zt = function _postAddChecks(t, e) {
    var i;
    if (e._time || (e._initted && !e._dur)) {
      i = Rt(t.rawTime(), e);
      (!e._dur || Kt(0, e.totalDuration(), i) - e._tTime > p) &&
        e.render(i, true);
    }
    if (Dt(t, e)._dp && t._initted && t._time >= t._dur && t._ts) {
      if (t._dur < t.duration()) {
        i = t;
        while (i._dp) {
          i.rawTime() >= 0 && i.totalTime(i._tTime);
          i = i._dp;
        }
      }
      t._zTime = -p;
    }
  },
  It = function _addToTimeline(t, e, i, n) {
    e.parent && xt(e);
    e._start = ut((x(i) ? i : i || t !== r ? Yt(t, i, e) : t._time) + e._delay);
    e._end = ut(e._start + (e.totalDuration() / Math.abs(e.timeScale()) || 0));
    bt(t, e, "_first", "_last", t._sort ? "_start" : 0);
    Ut(e) || (t._recent = e);
    n || zt(t, e);
    t._ts < 0 && Ot(t, t._tTime);
    return t;
  },
  Lt = function _scrollTrigger(t, e) {
    return (
      (U.ScrollTrigger || j("scrollTrigger", e)) && U.ScrollTrigger.create(e, t)
    );
  },
  Ft = function _attemptInitTween(t, i, r, n, s) {
    Xe(t, i, s);
    if (!t._initted) return 1;
    if (
      !r &&
      t._pt &&
      !e &&
      ((t._dur && false !== t.vars.lazy) || (!t._dur && t.vars.lazy)) &&
      u !== Ee.frame
    ) {
      Z.push(t);
      t._lazy = [s, n];
      return 1;
    }
  },
  Bt = function _parentPlayheadIsBeforeStart(t) {
    var e = t.parent;
    return (
      e &&
      e._ts &&
      e._initted &&
      !e._lock &&
      (e.rawTime() < 0 || _parentPlayheadIsBeforeStart(e))
    );
  },
  Ut = function _isFromOrFromStart(t) {
    var e = t.data;
    return "isFromStart" === e || "isStart" === e;
  },
  Nt = function _renderZeroDurationTween(t, i, r, n) {
    var s,
      a,
      o,
      u = t.ratio,
      h =
        i < 0 ||
        (!i &&
          ((!t._start && Bt(t) && !(!t._initted && Ut(t))) ||
            ((t._ts < 0 || t._dp._ts < 0) && !Ut(t))))
          ? 0
          : 1,
      l = t._rDelay,
      _ = 0;
    if (l && t._repeat) {
      _ = Kt(0, t._tDur, i);
      a = Pt(_, l);
      t._yoyo && 1 & a && (h = 1 - h);
      if (a !== Pt(t._tTime, l)) {
        u = 1 - h;
        t.vars.repeatRefresh && t._initted && t.invalidate();
      }
    }
    if (h !== u || e || n || t._zTime === p || (!i && t._zTime)) {
      if (!t._initted && Ft(t, i, n, r, _)) return;
      o = t._zTime;
      t._zTime = i || (r ? p : 0);
      r || (r = i && !o);
      t.ratio = h;
      t._from && (h = 1 - h);
      t._time = 0;
      t._tTime = _;
      s = t._pt;
      while (s) {
        s.r(h, s.d);
        s = s._next;
      }
      i < 0 && Ct(t, i, r, true);
      t._onUpdate && !r && ge(t, "onUpdate");
      _ && t._repeat && !r && t.parent && ge(t, "onRepeat");
      if ((i >= t._tDur || i < 0) && t.ratio === h) {
        h && xt(t, 1);
        if (!r && !e) {
          ge(t, h ? "onComplete" : "onReverseComplete", true);
          t._prom && t._prom();
        }
      }
    } else t._zTime || (t._zTime = i);
  },
  qt = function _findNextPauseTween(t, e, i) {
    var r;
    if (i > e) {
      r = t._first;
      while (r && r._start <= i) {
        if ("isPause" === r.data && r._start > e) return r;
        r = r._next;
      }
    } else {
      r = t._last;
      while (r && r._start >= i) {
        if ("isPause" === r.data && r._start < e) return r;
        r = r._prev;
      }
    }
  },
  jt = function _setDuration(t, e, i, r) {
    var n = t._repeat,
      s = ut(e) || 0,
      a = t._tTime / t._tDur;
    a && !r && (t._time *= s / t._dur);
    t._dur = s;
    t._tDur = n ? (n < 0 ? 1e10 : ut(s * (n + 1) + t._rDelay * n)) : s;
    a > 0 && !r && Ot(t, (t._tTime = t._tDur * a));
    t.parent && St(t);
    i || Dt(t.parent, t);
    return t;
  },
  Vt = function _onUpdateTotalDuration(t) {
    return t instanceof Ge ? Dt(t) : jt(t, t._dur);
  },
  Qt = { _start: 0, endTime: Y, totalDuration: Y },
  Yt = function _parsePosition(t, e, i) {
    var r,
      n,
      s,
      a = t.labels,
      o = t._recent || Qt,
      u = t.duration() >= d ? o.endTime(false) : t._dur;
    if (b(e) && (isNaN(e) || e in a)) {
      n = e.charAt(0);
      s = "%" === e.substr(-1);
      r = e.indexOf("=");
      if ("<" === n || ">" === n) {
        r >= 0 && (e = e.replace(/=/, ""));
        return (
          ("<" === n ? o._start : o.endTime(o._repeat >= 0)) +
          (parseFloat(e.substr(1)) || 0) *
            (s ? (r < 0 ? o : i).totalDuration() / 100 : 1)
        );
      }
      if (r < 0) {
        e in a || (a[e] = u);
        return a[e];
      }
      n = parseFloat(e.charAt(r - 1) + e.substr(r + 1));
      s && i && (n = (n / 100) * (R(i) ? i[0] : i).totalDuration());
      return r > 1 ? _parsePosition(t, e.substr(0, r - 1), i) + n : u + n;
    }
    return null == e ? u : +e;
  },
  Gt = function _createTweenType(t, e, i) {
    var r,
      n,
      s = x(e[1]),
      a = (s ? 2 : 1) + (t < 2 ? 0 : 1),
      o = e[a];
    s && (o.duration = e[1]);
    o.parent = i;
    if (t) {
      r = o;
      n = i;
      while (n && !("immediateRender" in r)) {
        r = n.vars.defaults || {};
        n = C(n.vars.inherit) && n.parent;
      }
      o.immediateRender = C(r.immediateRender);
      t < 2 ? (o.runBackwards = 1) : (o.startAt = e[a - 1]);
    }
    return new ai(e[0], o, e[a + 1]);
  },
  Wt = function _conditionalReturn(t, e) {
    return t || 0 === t ? e(t) : e;
  },
  Kt = function _clamp(t, e, i) {
    return i < t ? t : i > e ? e : i;
  },
  Ht = function getUnit(t, e) {
    return b(t) && (e = B.exec(t)) ? e[1] : "";
  },
  Zt = function clamp(t, e, i) {
    return Wt(i, function (i) {
      return Kt(t, e, i);
    });
  },
  $t = [].slice,
  Jt = function _isArrayLike(t, e) {
    return (
      t &&
      M(t) &&
      "length" in t &&
      ((!e && !t.length) || (t.length - 1 in t && M(t[0]))) &&
      !t.nodeType &&
      t !== n
    );
  },
  Xt = function _flatten(t, e, i) {
    void 0 === i && (i = []);
    return (
      t.forEach(function (t) {
        var r;
        return (b(t) && !e) || Jt(t, 1)
          ? (r = i).push.apply(r, te(t))
          : i.push(t);
      }) || i
    );
  },
  te = function toArray(t, e, r) {
    return i && !e && i.selector
      ? i.selector(t)
      : !b(t) || r || (!s && Pe())
      ? R(t)
        ? Xt(t, r)
        : Jt(t)
        ? $t.call(t, 0)
        : t
        ? [t]
        : []
      : $t.call((e || a).querySelectorAll(t), 0);
  },
  ee = function selector(t) {
    t = te(t)[0] || V("Invalid scope") || {};
    return function (e) {
      var i = t.current || t.nativeElement || t;
      return te(
        e,
        i.querySelectorAll
          ? i
          : i === t
          ? V("Invalid scope") || a.createElement("div")
          : t
      );
    };
  },
  ie = function shuffle(t) {
    return t.sort(function () {
      return 0.5 - Math.random();
    });
  },
  re = function distribute(t) {
    if (k(t)) return t;
    var e = M(t) ? t : { each: t },
      i = Ue(e.ease),
      r = e.from || 0,
      n = parseFloat(e.base) || 0,
      s = {},
      a = r > 0 && r < 1,
      o = isNaN(r) || a,
      u = e.axis,
      h = r,
      l = r;
    if (b(r)) h = l = { center: 0.5, edges: 0.5, end: 1 }[r] || 0;
    else if (!a && o) {
      h = r[0];
      l = r[1];
    }
    return function (t, a, _) {
      var c,
        p,
        m,
        g,
        v,
        y,
        w,
        b,
        k,
        x = (_ || e).length,
        D = s[x];
      if (!D) {
        k = "auto" === e.grid ? 0 : (e.grid || [1, d])[1];
        if (!k) {
          w = -d;
          while (w < (w = _[k++].getBoundingClientRect().left) && k < x);
          k--;
        }
        D = s[x] = [];
        c = o ? Math.min(k, x) * h - 0.5 : r % k;
        p = k === d ? 0 : o ? (x * l) / k - 0.5 : (r / k) | 0;
        w = 0;
        b = d;
        for (y = 0; y < x; y++) {
          m = (y % k) - c;
          g = p - ((y / k) | 0);
          D[y] = v = u ? Math.abs("y" === u ? g : m) : T(m * m + g * g);
          v > w && (w = v);
          v < b && (b = v);
        }
        "random" === r && ie(D);
        D.max = w - b;
        D.min = b;
        D.v = x =
          (parseFloat(e.amount) ||
            parseFloat(e.each) *
              (k > x
                ? x - 1
                : u
                ? "y" === u
                  ? x / k
                  : k
                : Math.max(k, x / k)) ||
            0) * ("edges" === r ? -1 : 1);
        D.b = x < 0 ? n - x : n;
        D.u = Ht(e.amount || e.each) || 0;
        i = i && x < 0 ? Fe(i) : i;
      }
      x = (D[t] - D.min) / D.max || 0;
      return ut(D.b + (i ? i(x) : x) * D.v) + D.u;
    };
  },
  ne = function _roundModifier(t) {
    var e = Math.pow(10, ((t + "").split(".")[1] || "").length);
    return function (i) {
      var r = ut(Math.round(parseFloat(i) / t) * t * e);
      return (r - (r % 1)) / e + (x(i) ? 0 : Ht(i));
    };
  },
  se = function snap(t, e) {
    var i,
      r,
      n = R(t);
    if (!n && M(t)) {
      i = n = t.radius || d;
      if (t.values) {
        t = te(t.values);
        (r = !x(t[0])) && (i *= i);
      } else t = ne(t.increment);
    }
    return Wt(
      e,
      n
        ? k(t)
          ? function (e) {
              r = t(e);
              return Math.abs(r - e) <= i ? r : e;
            }
          : function (e) {
              var n,
                s,
                a = parseFloat(r ? e.x : e),
                o = parseFloat(r ? e.y : 0),
                u = d,
                h = 0,
                l = t.length;
              while (l--) {
                if (r) {
                  n = t[l].x - a;
                  s = t[l].y - o;
                  n = n * n + s * s;
                } else n = Math.abs(t[l] - a);
                if (n < u) {
                  u = n;
                  h = l;
                }
              }
              h = !i || u <= i ? t[h] : e;
              return r || h === e || x(e) ? h : h + Ht(e);
            }
        : ne(t)
    );
  },
  ae = function random(t, e, i, r) {
    return Wt(R(t) ? !e : true === i ? !!(i = 0) : !r, function () {
      return R(t)
        ? t[~~(Math.random() * t.length)]
        : (i = i || 1e-5) &&
            (r = i < 1 ? Math.pow(10, (i + "").length - 2) : 1) &&
            Math.floor(
              Math.round((t - i / 2 + Math.random() * (e - t + 0.99 * i)) / i) *
                i *
                r
            ) / r;
    });
  },
  oe = function pipe() {
    for (var t = arguments.length, e = new Array(t), i = 0; i < t; i++)
      e[i] = arguments[i];
    return function (t) {
      return e.reduce(function (t, e) {
        return e(t);
      }, t);
    };
  },
  ue = function unitize(t, e) {
    return function (i) {
      return t(parseFloat(i)) + (e || Ht(i));
    };
  },
  he = function normalize(t, e, i) {
    return de(t, e, 0, 1, i);
  },
  le = function _wrapArray(t, e, i) {
    return Wt(i, function (i) {
      return t[~~e(i)];
    });
  },
  fe = function wrap(t, e, i) {
    var r = e - t;
    return R(t)
      ? le(t, wrap(0, t.length), e)
      : Wt(i, function (e) {
          return ((r + ((e - t) % r)) % r) + t;
        });
  },
  _e = function wrapYoyo(t, e, i) {
    var r = e - t,
      n = 2 * r;
    return R(t)
      ? le(t, wrapYoyo(0, t.length - 1), e)
      : Wt(i, function (e) {
          e = (n + ((e - t) % n)) % n || 0;
          return t + (e > r ? n - e : e);
        });
  },
  ce = function _replaceRandom(t) {
    var e,
      i,
      r,
      n,
      s = 0,
      a = "";
    while (~(e = t.indexOf("random(", s))) {
      r = t.indexOf(")", e);
      n = "[" === t.charAt(e + 7);
      i = t.substr(e + 7, r - e - 7).match(n ? F : S);
      a += t.substr(s, e - s) + ae(n ? i : +i[0], n ? 0 : +i[1], +i[2] || 1e-5);
      s = r + 1;
    }
    return a + t.substr(s, t.length - s);
  },
  de = function mapRange(t, e, i, r, n) {
    var s = e - t,
      a = r - i;
    return Wt(n, function (e) {
      return i + (((e - t) / s) * a || 0);
    });
  },
  pe = function interpolate(t, e, i, r) {
    var n = isNaN(t + e)
      ? 0
      : function (i) {
          return (1 - i) * t + i * e;
        };
    if (!n) {
      var s,
        a,
        o,
        u,
        h,
        l = b(t),
        _ = {};
      true === i && (r = 1) && (i = null);
      if (l) {
        t = { p: t };
        e = { p: e };
      } else if (R(t) && !R(e)) {
        o = [];
        u = t.length;
        h = u - 2;
        for (a = 1; a < u; a++) o.push(interpolate(t[a - 1], t[a]));
        u--;
        n = function func(t) {
          t *= u;
          var e = Math.min(h, ~~t);
          return o[e](t - e);
        };
        i = e;
      } else r || (t = gt(R(t) ? [] : {}, t));
      if (!o) {
        for (s in e) Ze.call(_, t, s, "get", e[s]);
        n = function func(e) {
          return pi(e, _) || (l ? t.p : t);
        };
      }
    }
    return Wt(i, n);
  },
  me = function _getLabelInDirection(t, e, i) {
    var r,
      n,
      s,
      a = t.labels,
      o = d;
    for (r in a) {
      n = a[r] - e;
      if (n < 0 === !!i && n && o > (n = Math.abs(n))) {
        s = r;
        o = n;
      }
    }
    return s;
  },
  ge = function _callback(t, e, r) {
    var n,
      s,
      a,
      o = t.vars,
      u = o[e],
      h = i,
      l = t._ctx;
    if (u) {
      n = o[e + "Params"];
      s = o.callbackScope || t;
      r && Z.length && ft();
      l && (i = l);
      a = n ? u.apply(s, n) : u.call(s);
      i = h;
      return a;
    }
  },
  ve = function _interrupt(t) {
    xt(t);
    t.scrollTrigger && t.scrollTrigger.kill(!!e);
    t.progress() < 1 && ge(t, "onInterrupt");
    return t;
  },
  Te = function _createPlugin(t) {
    t = (!t.name && t.default) || t;
    var e = t.name,
      i = k(t),
      r =
        e && !i && t.init
          ? function () {
              this._props = [];
            }
          : t,
      n = { init: Y, render: pi, add: Ze, kill: gi, modifier: mi, rawVars: 0 },
      s = { targetTest: 0, get: 0, getSetter: fi, aliases: {}, register: 0 };
    Pe();
    if (t !== r) {
      if (J[e]) return;
      pt(r, pt(Tt(t, n), s));
      gt(r.prototype, gt(n, Tt(t, s)));
      J[(r.prop = e)] = r;
      if (t.targetTest) {
        et.push(r);
        H[e] = 1;
      }
      e =
        ("css" === e ? "CSS" : e.charAt(0).toUpperCase() + e.substr(1)) +
        "Plugin";
    }
    Q(e, r);
    t.register && t.register(Oi, r, yi);
  },
  ye = 255,
  we = {
    aqua: [0, ye, ye],
    lime: [0, ye, 0],
    silver: [192, 192, 192],
    black: [0, 0, 0],
    maroon: [128, 0, 0],
    teal: [0, 128, 128],
    blue: [0, 0, ye],
    navy: [0, 0, 128],
    white: [ye, ye, ye],
    olive: [128, 128, 0],
    yellow: [ye, ye, 0],
    orange: [ye, 165, 0],
    gray: [128, 128, 128],
    purple: [128, 0, 128],
    green: [0, 128, 0],
    red: [ye, 0, 0],
    pink: [ye, 192, 203],
    cyan: [0, ye, ye],
    transparent: [ye, ye, ye, 0],
  },
  be = function _hue(t, e, i) {
    t += t < 0 ? 1 : t > 1 ? -1 : 0;
    return (
      ((6 * t < 1
        ? e + (i - e) * t * 6
        : t < 0.5
        ? i
        : 3 * t < 2
        ? e + (i - e) * (2 / 3 - t) * 6
        : e) *
        ye +
        0.5) |
      0
    );
  },
  ke = function splitColor(t, e, i) {
    var r,
      n,
      s,
      a,
      o,
      u,
      h,
      l,
      _,
      c,
      d = t ? (x(t) ? [t >> 16, (t >> 8) & ye, t & ye] : 0) : we.black;
    if (!d) {
      "," === t.substr(-1) && (t = t.substr(0, t.length - 1));
      if (we[t]) d = we[t];
      else if ("#" === t.charAt(0)) {
        if (t.length < 6) {
          r = t.charAt(1);
          n = t.charAt(2);
          s = t.charAt(3);
          t =
            "#" +
            r +
            r +
            n +
            n +
            s +
            s +
            (5 === t.length ? t.charAt(4) + t.charAt(4) : "");
        }
        if (9 === t.length) {
          d = parseInt(t.substr(1, 6), 16);
          return [
            d >> 16,
            (d >> 8) & ye,
            d & ye,
            parseInt(t.substr(7), 16) / 255,
          ];
        }
        t = parseInt(t.substr(1), 16);
        d = [t >> 16, (t >> 8) & ye, t & ye];
      } else if ("hsl" === t.substr(0, 3)) {
        d = c = t.match(S);
        if (e) {
          if (~t.indexOf("=")) {
            d = t.match(O);
            i && d.length < 4 && (d[3] = 1);
            return d;
          }
        } else {
          a = (+d[0] % 360) / 360;
          o = +d[1] / 100;
          u = +d[2] / 100;
          n = u <= 0.5 ? u * (o + 1) : u + o - u * o;
          r = 2 * u - n;
          d.length > 3 && (d[3] *= 1);
          d[0] = be(a + 1 / 3, r, n);
          d[1] = be(a, r, n);
          d[2] = be(a - 1 / 3, r, n);
        }
      } else d = t.match(S) || we.transparent;
      d = d.map(Number);
    }
    if (e && !c) {
      r = d[0] / ye;
      n = d[1] / ye;
      s = d[2] / ye;
      h = Math.max(r, n, s);
      l = Math.min(r, n, s);
      u = (h + l) / 2;
      if (h === l) a = o = 0;
      else {
        _ = h - l;
        o = u > 0.5 ? _ / (2 - h - l) : _ / (h + l);
        a =
          h === r
            ? (n - s) / _ + (n < s ? 6 : 0)
            : h === n
            ? (s - r) / _ + 2
            : (r - n) / _ + 4;
        a *= 60;
      }
      d[0] = ~~(a + 0.5);
      d[1] = ~~(100 * o + 0.5);
      d[2] = ~~(100 * u + 0.5);
    }
    i && d.length < 4 && (d[3] = 1);
    return d;
  },
  xe = function _colorOrderData(t) {
    var e = [],
      i = [],
      r = -1;
    t.split(Me).forEach(function (t) {
      var n = t.match(z) || [];
      e.push.apply(e, n);
      i.push((r += n.length + 1));
    });
    e.c = i;
    return e;
  },
  De = function _formatColors(t, e, i) {
    var r,
      n,
      s,
      a,
      o = "",
      u = (t + o).match(Me),
      h = e ? "hsla(" : "rgba(",
      l = 0;
    if (!u) return t;
    u = u.map(function (t) {
      return (
        (t = ke(t, e, 1)) &&
        h +
          (e ? t[0] + "," + t[1] + "%," + t[2] + "%," + t[3] : t.join(",")) +
          ")"
      );
    });
    if (i) {
      s = xe(t);
      r = i.c;
      if (r.join(o) !== s.c.join(o)) {
        n = t.replace(Me, "1").split(z);
        a = n.length - 1;
        for (; l < a; l++)
          o +=
            n[l] +
            (~r.indexOf(l)
              ? u.shift() || h + "0,0,0,0)"
              : (s.length ? s : u.length ? u : i).shift());
      }
    }
    if (!n) {
      n = t.split(Me);
      a = n.length - 1;
      for (; l < a; l++) o += n[l] + u[l];
    }
    return o + n[a];
  },
  Me = (function () {
    var t,
      e =
        "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b";
    for (t in we) e += "|" + t + "\\b";
    return new RegExp(e + ")", "gi");
  })(),
  Ce = /hsl[a]?\(/,
  Ae = function _colorStringFilter(t) {
    var e,
      i = t.join(" ");
    Me.lastIndex = 0;
    if (Me.test(i)) {
      e = Ce.test(i);
      t[1] = De(t[1], e);
      t[0] = De(t[0], e, xe(t[1]));
      return true;
    }
  },
  Ee = (function () {
    var t,
      e,
      i,
      r,
      u,
      h,
      _ = Date.now,
      c = 500,
      d = 33,
      p = _(),
      m = p,
      g = 1e3 / 240,
      v = g,
      T = [],
      y = function _tick(i) {
        var n,
          s,
          a,
          o,
          l = _() - m,
          y = true === i;
        l > c && (p += l - d);
        m += l;
        a = m - p;
        n = a - v;
        if (n > 0 || y) {
          o = ++r.frame;
          u = a - 1e3 * r.time;
          r.time = a /= 1e3;
          v += n + (n >= g ? 4 : g - n);
          s = 1;
        }
        y || (t = e(_tick));
        if (s) for (h = 0; h < T.length; h++) T[h](a, u, o, i);
      };
    r = {
      time: 0,
      frame: 0,
      tick: function tick() {
        y(true);
      },
      deltaRatio: function deltaRatio(t) {
        return u / (1e3 / (t || 60));
      },
      wake: function wake() {
        if (o) {
          if (!s && A()) {
            n = s = window;
            a = n.document || {};
            U.gsap = Oi;
            (n.gsapVersions || (n.gsapVersions = [])).push(Oi.version);
            q(N || n.GreenSockGlobals || (!n.gsap && n) || {});
            i = n.requestAnimationFrame;
          }
          t && r.sleep();
          e =
            i ||
            function (t) {
              return setTimeout(t, (v - 1e3 * r.time + 1) | 0);
            };
          l = 1;
          y(2);
        }
      },
      sleep: function sleep() {
        (i ? n.cancelAnimationFrame : clearTimeout)(t);
        l = 0;
        e = Y;
      },
      lagSmoothing: function lagSmoothing(t, e) {
        c = t || Infinity;
        d = Math.min(e || 33, c);
      },
      fps: function fps(t) {
        g = 1e3 / (t || 240);
        v = 1e3 * r.time + g;
      },
      add: function add(t, e, i) {
        var n = e
          ? function (e, i, s, a) {
              t(e, i, s, a);
              r.remove(n);
            }
          : t;
        r.remove(t);
        T[i ? "unshift" : "push"](n);
        Pe();
        return n;
      },
      remove: function remove(t, e) {
        ~(e = T.indexOf(t)) && T.splice(e, 1) && h >= e && h--;
      },
      _listeners: T,
    };
    return r;
  })(),
  Pe = function _wake() {
    return !l && Ee.wake();
  },
  Re = {},
  Se = /^[\d.\-M][\d.\-,\s]/,
  Oe = /["']/g,
  ze = function _parseObjectInString(t) {
    var e,
      i,
      r,
      n = {},
      s = t.substr(1, t.length - 3).split(":"),
      a = s[0],
      o = 1,
      u = s.length;
    for (; o < u; o++) {
      i = s[o];
      e = o !== u - 1 ? i.lastIndexOf(",") : i.length;
      r = i.substr(0, e);
      n[a] = isNaN(r) ? r.replace(Oe, "").trim() : +r;
      a = i.substr(e + 1).trim();
    }
    return n;
  },
  Ie = function _valueInParentheses(t) {
    var e = t.indexOf("(") + 1,
      i = t.indexOf(")"),
      r = t.indexOf("(", e);
    return t.substring(e, ~r && r < i ? t.indexOf(")", i + 1) : i);
  },
  Le = function _configEaseFromString(t) {
    var e = (t + "").split("("),
      i = Re[e[0]];
    return i && e.length > 1 && i.config
      ? i.config.apply(
          null,
          ~t.indexOf("{") ? [ze(e[1])] : Ie(t).split(",").map(ct)
        )
      : Re._CE && Se.test(t)
      ? Re._CE("", t)
      : i;
  },
  Fe = function _invertEase(t) {
    return function (e) {
      return 1 - t(1 - e);
    };
  },
  Be = function _propagateYoyoEase(t, e) {
    var i,
      r = t._first;
    while (r) {
      if (r instanceof Ge) _propagateYoyoEase(r, e);
      else if (r.vars.yoyoEase && (!r._yoyo || !r._repeat) && r._yoyo !== e)
        if (r.timeline) _propagateYoyoEase(r.timeline, e);
        else {
          i = r._ease;
          r._ease = r._yEase;
          r._yEase = i;
          r._yoyo = e;
        }
      r = r._next;
    }
  },
  Ue = function _parseEase(t, e) {
    return (t && (k(t) ? t : Re[t] || Le(t))) || e;
  },
  Ne = function _insertEase(t, e, i, r) {
    void 0 === i &&
      (i = function easeOut(t) {
        return 1 - e(1 - t);
      });
    void 0 === r &&
      (r = function easeInOut(t) {
        return t < 0.5 ? e(2 * t) / 2 : 1 - e(2 * (1 - t)) / 2;
      });
    var n,
      s = { easeIn: e, easeOut: i, easeInOut: r };
    at(t, function (t) {
      Re[t] = U[t] = s;
      Re[(n = t.toLowerCase())] = i;
      for (var e in s)
        Re[n + ("easeIn" === e ? ".in" : "easeOut" === e ? ".out" : ".inOut")] =
          Re[t + "." + e] = s[e];
    });
    return s;
  },
  qe = function _easeInOutFromOut(t) {
    return function (e) {
      return e < 0.5 ? (1 - t(1 - 2 * e)) / 2 : 0.5 + t(2 * (e - 0.5)) / 2;
    };
  },
  je = function _configElastic(t, e, i) {
    var r = e >= 1 ? e : 1,
      n = (i || (t ? 0.3 : 0.45)) / (e < 1 ? e : 1),
      s = (n / m) * (Math.asin(1 / r) || 0),
      a = function easeOut(t) {
        return 1 === t ? 1 : r * Math.pow(2, -10 * t) * w((t - s) * n) + 1;
      },
      o =
        "out" === t
          ? a
          : "in" === t
          ? function (t) {
              return 1 - a(1 - t);
            }
          : qe(a);
    n = m / n;
    o.config = function (e, i) {
      return _configElastic(t, e, i);
    };
    return o;
  },
  Ve = function _configBack(t, e) {
    void 0 === e && (e = 1.70158);
    var i = function easeOut(t) {
        return t ? --t * t * ((e + 1) * t + e) + 1 : 0;
      },
      r =
        "out" === t
          ? i
          : "in" === t
          ? function (t) {
              return 1 - i(1 - t);
            }
          : qe(i);
    r.config = function (e) {
      return _configBack(t, e);
    };
    return r;
  };
at("Linear,Quad,Cubic,Quart,Quint,Strong", function (t, e) {
  var i = e < 5 ? e + 1 : e;
  Ne(
    t + ",Power" + (i - 1),
    e
      ? function (t) {
          return Math.pow(t, i);
        }
      : function (t) {
          return t;
        },
    function (t) {
      return 1 - Math.pow(1 - t, i);
    },
    function (t) {
      return t < 0.5
        ? Math.pow(2 * t, i) / 2
        : 1 - Math.pow(2 * (1 - t), i) / 2;
    }
  );
});
Re.Linear.easeNone = Re.none = Re.Linear.easeIn;
Ne("Elastic", je("in"), je("out"), je());
(function (t, e) {
  var i = 1 / e,
    r = 2 * i,
    n = 2.5 * i,
    s = function easeOut(s) {
      return s < i
        ? t * s * s
        : s < r
        ? t * Math.pow(s - 1.5 / e, 2) + 0.75
        : s < n
        ? t * (s -= 2.25 / e) * s + 0.9375
        : t * Math.pow(s - 2.625 / e, 2) + 0.984375;
    };
  Ne(
    "Bounce",
    function (t) {
      return 1 - s(1 - t);
    },
    s
  );
})(7.5625, 2.75);
Ne("Expo", function (t) {
  return t ? Math.pow(2, 10 * (t - 1)) : 0;
});
Ne("Circ", function (t) {
  return -(T(1 - t * t) - 1);
});
Ne("Sine", function (t) {
  return 1 === t ? 1 : 1 - y(t * g);
});
Ne("Back", Ve("in"), Ve("out"), Ve());
Re.SteppedEase =
  Re.steps =
  U.SteppedEase =
    {
      config: function config(t, e) {
        void 0 === t && (t = 1);
        var i = 1 / t,
          r = t + (e ? 0 : 1),
          n = e ? 1 : 0,
          s = 1 - p;
        return function (t) {
          return (((r * Kt(0, s, t)) | 0) + n) * i;
        };
      },
    };
c.ease = Re["quad.out"];
at(
  "onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",
  function (t) {
    return (it += t + "," + t + "Params,");
  }
);
var Qe = function GSCache(t, e) {
  this.id = v++;
  t._gsap = this;
  this.target = t;
  this.harness = e;
  this.get = e ? e.get : st;
  this.set = e ? e.getSetter : fi;
};
var Ye = (function () {
  function Animation(t) {
    this.vars = t;
    this._delay = +t.delay || 0;
    if ((this._repeat = Infinity === t.repeat ? -2 : t.repeat || 0)) {
      this._rDelay = t.repeatDelay || 0;
      this._yoyo = !!t.yoyo || !!t.yoyoEase;
    }
    this._ts = 1;
    jt(this, +t.duration, 1, 1);
    this.data = t.data;
    if (i) {
      this._ctx = i;
      i.data.push(this);
    }
    l || Ee.wake();
  }
  var t = Animation.prototype;
  t.delay = function delay(t) {
    if (t || 0 === t) {
      this.parent &&
        this.parent.smoothChildTiming &&
        this.startTime(this._start + t - this._delay);
      this._delay = t;
      return this;
    }
    return this._delay;
  };
  t.duration = function duration(t) {
    return arguments.length
      ? this.totalDuration(
          this._repeat > 0 ? t + (t + this._rDelay) * this._repeat : t
        )
      : this.totalDuration() && this._dur;
  };
  t.totalDuration = function totalDuration(t) {
    if (!arguments.length) return this._tDur;
    this._dirty = 0;
    return jt(
      this,
      this._repeat < 0
        ? t
        : (t - this._repeat * this._rDelay) / (this._repeat + 1)
    );
  };
  t.totalTime = function totalTime(t, e) {
    Pe();
    if (!arguments.length) return this._tTime;
    var i = this._dp;
    if (i && i.smoothChildTiming && this._ts) {
      Ot(this, t);
      !i._dp || i.parent || zt(i, this);
      while (i && i.parent) {
        i.parent._time !==
          i._start +
            (i._ts >= 0
              ? i._tTime / i._ts
              : (i.totalDuration() - i._tTime) / -i._ts) &&
          i.totalTime(i._tTime, true);
        i = i.parent;
      }
      !this.parent &&
        this._dp.autoRemoveChildren &&
        ((this._ts > 0 && t < this._tDur) ||
          (this._ts < 0 && t > 0) ||
          (!this._tDur && !t)) &&
        It(this._dp, this, this._start - this._delay);
    }
    if (
      this._tTime !== t ||
      (!this._dur && !e) ||
      (this._initted && Math.abs(this._zTime) === p) ||
      (!t && !this._initted && (this.add || this._ptLookup))
    ) {
      this._ts || (this._pTime = t);
      _t(this, t, e);
    }
    return this;
  };
  t.time = function time(t, e) {
    return arguments.length
      ? this.totalTime(
          Math.min(this.totalDuration(), t + Et(this)) %
            (this._dur + this._rDelay) || (t ? this._dur : 0),
          e
        )
      : this._time;
  };
  t.totalProgress = function totalProgress(t, e) {
    return arguments.length
      ? this.totalTime(this.totalDuration() * t, e)
      : this.totalDuration()
      ? Math.min(1, this._tTime / this._tDur)
      : this.ratio;
  };
  t.progress = function progress(t, e) {
    return arguments.length
      ? this.totalTime(
          this.duration() * (!this._yoyo || 1 & this.iteration() ? t : 1 - t) +
            Et(this),
          e
        )
      : this.duration()
      ? Math.min(1, this._time / this._dur)
      : this.ratio;
  };
  t.iteration = function iteration(t, e) {
    var i = this.duration() + this._rDelay;
    return arguments.length
      ? this.totalTime(this._time + (t - 1) * i, e)
      : this._repeat
      ? Pt(this._tTime, i) + 1
      : 1;
  };
  t.timeScale = function timeScale(t) {
    if (!arguments.length) return this._rts === -p ? 0 : this._rts;
    if (this._rts === t) return this;
    var e = this.parent && this._ts ? Rt(this.parent._time, this) : this._tTime;
    this._rts = +t || 0;
    this._ts = this._ps || t === -p ? 0 : this._rts;
    this.totalTime(Kt(-this._delay, this._tDur, e), true);
    St(this);
    return Mt(this);
  };
  t.paused = function paused(t) {
    if (!arguments.length) return this._ps;
    if (this._ps !== t) {
      this._ps = t;
      if (t) {
        this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
        this._ts = this._act = 0;
      } else {
        Pe();
        this._ts = this._rts;
        this.totalTime(
          this.parent && !this.parent.smoothChildTiming
            ? this.rawTime()
            : this._tTime || this._pTime,
          1 === this.progress() &&
            Math.abs(this._zTime) !== p &&
            (this._tTime -= p)
        );
      }
    }
    return this;
  };
  t.startTime = function startTime(t) {
    if (arguments.length) {
      this._start = t;
      var e = this.parent || this._dp;
      e && (e._sort || !this.parent) && It(e, this, t - this._delay);
      return this;
    }
    return this._start;
  };
  t.endTime = function endTime(t) {
    return (
      this._start +
      (C(t) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1)
    );
  };
  t.rawTime = function rawTime(t) {
    var e = this.parent || this._dp;
    return e
      ? t &&
        (!this._ts || (this._repeat && this._time && this.totalProgress() < 1))
        ? this._tTime % (this._dur + this._rDelay)
        : this._ts
        ? Rt(e.rawTime(t), this)
        : this._tTime
      : this._tTime;
  };
  t.revert = function revert(t) {
    void 0 === t && (t = K);
    var i = e;
    e = t;
    if (this._initted || this._startAt) {
      this.timeline && this.timeline.revert(t);
      this.totalTime(-0.01, t.suppressEvents);
    }
    "nested" !== this.data && false !== t.kill && this.kill();
    e = i;
    return this;
  };
  t.globalTime = function globalTime(t) {
    var e = this,
      i = arguments.length ? t : e.rawTime();
    while (e) {
      i = e._start + i / (e._ts || 1);
      e = e._dp;
    }
    return !this.parent && this._sat
      ? this._sat.vars.immediateRender
        ? -1
        : this._sat.globalTime(t)
      : i;
  };
  t.repeat = function repeat(t) {
    if (arguments.length) {
      this._repeat = Infinity === t ? -2 : t;
      return Vt(this);
    }
    return -2 === this._repeat ? Infinity : this._repeat;
  };
  t.repeatDelay = function repeatDelay(t) {
    if (arguments.length) {
      var e = this._time;
      this._rDelay = t;
      Vt(this);
      return e ? this.time(e) : this;
    }
    return this._rDelay;
  };
  t.yoyo = function yoyo(t) {
    if (arguments.length) {
      this._yoyo = t;
      return this;
    }
    return this._yoyo;
  };
  t.seek = function seek(t, e) {
    return this.totalTime(Yt(this, t), C(e));
  };
  t.restart = function restart(t, e) {
    return this.play().totalTime(t ? -this._delay : 0, C(e));
  };
  t.play = function play(t, e) {
    null != t && this.seek(t, e);
    return this.reversed(false).paused(false);
  };
  t.reverse = function reverse(t, e) {
    null != t && this.seek(t || this.totalDuration(), e);
    return this.reversed(true).paused(false);
  };
  t.pause = function pause(t, e) {
    null != t && this.seek(t, e);
    return this.paused(true);
  };
  t.resume = function resume() {
    return this.paused(false);
  };
  t.reversed = function reversed(t) {
    if (arguments.length) {
      !!t !== this.reversed() && this.timeScale(-this._rts || (t ? -p : 0));
      return this;
    }
    return this._rts < 0;
  };
  t.invalidate = function invalidate() {
    this._initted = this._act = 0;
    this._zTime = -p;
    return this;
  };
  t.isActive = function isActive() {
    var t,
      e = this.parent || this._dp,
      i = this._start;
    return !!(
      !e ||
      (this._ts &&
        this._initted &&
        e.isActive() &&
        (t = e.rawTime(true)) >= i &&
        t < this.endTime(true) - p)
    );
  };
  t.eventCallback = function eventCallback(t, e, i) {
    var r = this.vars;
    if (arguments.length > 1) {
      if (e) {
        r[t] = e;
        i && (r[t + "Params"] = i);
        "onUpdate" === t && (this._onUpdate = e);
      } else delete r[t];
      return this;
    }
    return r[t];
  };
  t.then = function then(t) {
    var e = this;
    return new Promise(function (i) {
      var r = k(t) ? t : dt,
        n = function _resolve() {
          var t = e.then;
          e.then = null;
          k(r) && (r = r(e)) && (r.then || r === e) && (e.then = t);
          i(r);
          e.then = t;
        };
      (e._initted && 1 === e.totalProgress() && e._ts >= 0) ||
      (!e._tTime && e._ts < 0)
        ? n()
        : (e._prom = n);
    });
  };
  t.kill = function kill() {
    ve(this);
  };
  return Animation;
})();
pt(Ye.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: false,
  parent: null,
  _initted: false,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -p,
  _prom: 0,
  _ps: false,
  _rts: 1,
});
var Ge = (function (t) {
  _inheritsLoose(Timeline, t);
  function Timeline(e, i) {
    var n;
    void 0 === e && (e = {});
    n = t.call(this, e) || this;
    n.labels = {};
    n.smoothChildTiming = !!e.smoothChildTiming;
    n.autoRemoveChildren = !!e.autoRemoveChildren;
    n._sort = C(e.sortChildren);
    r && It(e.parent || r, _assertThisInitialized(n), i);
    e.reversed && n.reverse();
    e.paused && n.paused(true);
    e.scrollTrigger && Lt(_assertThisInitialized(n), e.scrollTrigger);
    return n;
  }
  var i = Timeline.prototype;
  i.to = function to(t, e, i) {
    Gt(0, arguments, this);
    return this;
  };
  i.from = function from(t, e, i) {
    Gt(1, arguments, this);
    return this;
  };
  i.fromTo = function fromTo(t, e, i, r) {
    Gt(2, arguments, this);
    return this;
  };
  i.set = function set(t, e, i) {
    e.duration = 0;
    e.parent = this;
    yt(e).repeatDelay || (e.repeat = 0);
    e.immediateRender = !!e.immediateRender;
    new ai(t, e, Yt(this, i), 1);
    return this;
  };
  i.call = function call(t, e, i) {
    return It(this, ai.delayedCall(0, t, e), i);
  };
  i.staggerTo = function staggerTo(t, e, i, r, n, s, a) {
    i.duration = e;
    i.stagger = i.stagger || r;
    i.onComplete = s;
    i.onCompleteParams = a;
    i.parent = this;
    new ai(t, i, Yt(this, n));
    return this;
  };
  i.staggerFrom = function staggerFrom(t, e, i, r, n, s, a) {
    i.runBackwards = 1;
    yt(i).immediateRender = C(i.immediateRender);
    return this.staggerTo(t, e, i, r, n, s, a);
  };
  i.staggerFromTo = function staggerFromTo(t, e, i, r, n, s, a, o) {
    r.startAt = i;
    yt(r).immediateRender = C(r.immediateRender);
    return this.staggerTo(t, e, r, n, s, a, o);
  };
  i.render = function render(t, i, n) {
    var s,
      a,
      o,
      u,
      h,
      l,
      _,
      c,
      d,
      m,
      g,
      v,
      T = this._time,
      y = this._dirty ? this.totalDuration() : this._tDur,
      w = this._dur,
      b = t <= 0 ? 0 : ut(t),
      k = this._zTime < 0 !== t < 0 && (this._initted || !w);
    this !== r && b > y && t >= 0 && (b = y);
    if (b !== this._tTime || n || k) {
      if (T !== this._time && w) {
        b += this._time - T;
        t += this._time - T;
      }
      s = b;
      d = this._start;
      c = this._ts;
      l = !c;
      if (k) {
        w || (T = this._zTime);
        (t || !i) && (this._zTime = t);
      }
      if (this._repeat) {
        g = this._yoyo;
        h = w + this._rDelay;
        if (this._repeat < -1 && t < 0)
          return this.totalTime(100 * h + t, i, n);
        s = ut(b % h);
        if (b === y) {
          u = this._repeat;
          s = w;
        } else {
          u = ~~(b / h);
          if (u && u === b / h) {
            s = w;
            u--;
          }
          s > w && (s = w);
        }
        m = Pt(this._tTime, h);
        !T && this._tTime && m !== u && (m = u);
        if (g && 1 & u) {
          s = w - s;
          v = 1;
        }
        if (u !== m && !this._lock) {
          var x = g && 1 & m,
            D = x === (g && 1 & u);
          u < m && (x = !x);
          T = x ? 0 : w;
          this._lock = 1;
          this.render(T || (v ? 0 : ut(u * h)), i, !w)._lock = 0;
          this._tTime = b;
          !i && this.parent && ge(this, "onRepeat");
          this.vars.repeatRefresh && !v && (this.invalidate()._lock = 1);
          if (
            (T && T !== this._time) ||
            l !== !this._ts ||
            (this.vars.onRepeat && !this.parent && !this._act)
          )
            return this;
          w = this._dur;
          y = this._tDur;
          if (D) {
            this._lock = 2;
            T = x ? w : -1e-4;
            this.render(T, true);
            this.vars.repeatRefresh && !v && this.invalidate();
          }
          this._lock = 0;
          if (!this._ts && !l) return this;
          Be(this, v);
        }
      }
      if (this._hasPause && !this._forcing && this._lock < 2) {
        _ = qt(this, ut(T), ut(s));
        _ && (b -= s - (s = _._start));
      }
      this._tTime = b;
      this._time = s;
      this._act = !c;
      if (!this._initted) {
        this._onUpdate = this.vars.onUpdate;
        this._initted = 1;
        this._zTime = t;
        T = 0;
      }
      if (!T && s && !i) {
        ge(this, "onStart");
        if (this._tTime !== b) return this;
      }
      if (s >= T && t >= 0) {
        a = this._first;
        while (a) {
          o = a._next;
          if ((a._act || s >= a._start) && a._ts && _ !== a) {
            if (a.parent !== this) return this.render(t, i, n);
            a.render(
              a._ts > 0
                ? (s - a._start) * a._ts
                : (a._dirty ? a.totalDuration() : a._tDur) +
                    (s - a._start) * a._ts,
              i,
              n
            );
            if (s !== this._time || (!this._ts && !l)) {
              _ = 0;
              o && (b += this._zTime = -p);
              break;
            }
          }
          a = o;
        }
      } else {
        a = this._last;
        var M = t < 0 ? t : s;
        while (a) {
          o = a._prev;
          if ((a._act || M <= a._end) && a._ts && _ !== a) {
            if (a.parent !== this) return this.render(t, i, n);
            a.render(
              a._ts > 0
                ? (M - a._start) * a._ts
                : (a._dirty ? a.totalDuration() : a._tDur) +
                    (M - a._start) * a._ts,
              i,
              n || (e && (a._initted || a._startAt))
            );
            if (s !== this._time || (!this._ts && !l)) {
              _ = 0;
              o && (b += this._zTime = M ? -p : p);
              break;
            }
          }
          a = o;
        }
      }
      if (_ && !i) {
        this.pause();
        _.render(s >= T ? 0 : -p)._zTime = s >= T ? 1 : -1;
        if (this._ts) {
          this._start = d;
          St(this);
          return this.render(t, i, n);
        }
      }
      this._onUpdate && !i && ge(this, "onUpdate", true);
      if (
        ((b === y && this._tTime >= this.totalDuration()) || (!b && T)) &&
        (d === this._start || Math.abs(c) !== Math.abs(this._ts)) &&
        !this._lock
      ) {
        (t || !w) &&
          ((b === y && this._ts > 0) || (!b && this._ts < 0)) &&
          xt(this, 1);
        if (!i && !(t < 0 && !T) && (b || T || !y)) {
          ge(
            this,
            b === y && t >= 0 ? "onComplete" : "onReverseComplete",
            true
          );
          this._prom && !(b < y && this.timeScale() > 0) && this._prom();
        }
      }
    }
    return this;
  };
  i.add = function add(t, e) {
    var i = this;
    x(e) || (e = Yt(this, e, t));
    if (!(t instanceof Ye)) {
      if (R(t)) {
        t.forEach(function (t) {
          return i.add(t, e);
        });
        return this;
      }
      if (b(t)) return this.addLabel(t, e);
      if (!k(t)) return this;
      t = ai.delayedCall(0, t);
    }
    return this !== t ? It(this, t, e) : this;
  };
  i.getChildren = function getChildren(t, e, i, r) {
    void 0 === t && (t = true);
    void 0 === e && (e = true);
    void 0 === i && (i = true);
    void 0 === r && (r = -d);
    var n = [],
      s = this._first;
    while (s) {
      if (s._start >= r)
        if (s instanceof ai) e && n.push(s);
        else {
          i && n.push(s);
          t && n.push.apply(n, s.getChildren(true, e, i));
        }
      s = s._next;
    }
    return n;
  };
  i.getById = function getById(t) {
    var e = this.getChildren(1, 1, 1),
      i = e.length;
    while (i--) if (e[i].vars.id === t) return e[i];
  };
  i.remove = function remove(t) {
    if (b(t)) return this.removeLabel(t);
    if (k(t)) return this.killTweensOf(t);
    kt(this, t);
    t === this._recent && (this._recent = this._last);
    return Dt(this);
  };
  i.totalTime = function totalTime(e, i) {
    if (!arguments.length) return this._tTime;
    this._forcing = 1;
    !this._dp &&
      this._ts &&
      (this._start = ut(
        Ee.time -
          (this._ts > 0 ? e / this._ts : (this.totalDuration() - e) / -this._ts)
      ));
    t.prototype.totalTime.call(this, e, i);
    this._forcing = 0;
    return this;
  };
  i.addLabel = function addLabel(t, e) {
    this.labels[t] = Yt(this, e);
    return this;
  };
  i.removeLabel = function removeLabel(t) {
    delete this.labels[t];
    return this;
  };
  i.addPause = function addPause(t, e, i) {
    var r = ai.delayedCall(0, e || Y, i);
    r.data = "isPause";
    this._hasPause = 1;
    return It(this, r, Yt(this, t));
  };
  i.removePause = function removePause(t) {
    var e = this._first;
    t = Yt(this, t);
    while (e) {
      e._start === t && "isPause" === e.data && xt(e);
      e = e._next;
    }
  };
  i.killTweensOf = function killTweensOf(t, e, i) {
    var r = this.getTweensOf(t, i),
      n = r.length;
    while (n--) We !== r[n] && r[n].kill(t, e);
    return this;
  };
  i.getTweensOf = function getTweensOf(t, e) {
    var i,
      r = [],
      n = te(t),
      s = this._first,
      a = x(e);
    while (s) {
      s instanceof ai
        ? lt(s._targets, n) &&
          (a
            ? (!We || (s._initted && s._ts)) &&
              s.globalTime(0) <= e &&
              s.globalTime(s.totalDuration()) > e
            : !e || s.isActive()) &&
          r.push(s)
        : (i = s.getTweensOf(n, e)).length && r.push.apply(r, i);
      s = s._next;
    }
    return r;
  };
  i.tweenTo = function tweenTo(t, e) {
    e = e || {};
    var i,
      r = this,
      n = Yt(r, t),
      s = e,
      a = s.startAt,
      o = s.onStart,
      u = s.onStartParams,
      h = s.immediateRender,
      l = ai.to(
        r,
        pt(
          {
            ease: e.ease || "none",
            lazy: false,
            immediateRender: false,
            time: n,
            overwrite: "auto",
            duration:
              e.duration ||
              Math.abs(
                (n - (a && "time" in a ? a.time : r._time)) / r.timeScale()
              ) ||
              p,
            onStart: function onStart() {
              r.pause();
              if (!i) {
                var t =
                  e.duration ||
                  Math.abs(
                    (n - (a && "time" in a ? a.time : r._time)) / r.timeScale()
                  );
                l._dur !== t && jt(l, t, 0, 1).render(l._time, true, true);
                i = 1;
              }
              o && o.apply(l, u || []);
            },
          },
          e
        )
      );
    return h ? l.render(0) : l;
  };
  i.tweenFromTo = function tweenFromTo(t, e, i) {
    return this.tweenTo(e, pt({ startAt: { time: Yt(this, t) } }, i));
  };
  i.recent = function recent() {
    return this._recent;
  };
  i.nextLabel = function nextLabel(t) {
    void 0 === t && (t = this._time);
    return me(this, Yt(this, t));
  };
  i.previousLabel = function previousLabel(t) {
    void 0 === t && (t = this._time);
    return me(this, Yt(this, t), 1);
  };
  i.currentLabel = function currentLabel(t) {
    return arguments.length
      ? this.seek(t, true)
      : this.previousLabel(this._time + p);
  };
  i.shiftChildren = function shiftChildren(t, e, i) {
    void 0 === i && (i = 0);
    var r,
      n = this._first,
      s = this.labels;
    while (n) {
      if (n._start >= i) {
        n._start += t;
        n._end += t;
      }
      n = n._next;
    }
    if (e) for (r in s) s[r] >= i && (s[r] += t);
    return Dt(this);
  };
  i.invalidate = function invalidate(e) {
    var i = this._first;
    this._lock = 0;
    while (i) {
      i.invalidate(e);
      i = i._next;
    }
    return t.prototype.invalidate.call(this, e);
  };
  i.clear = function clear(t) {
    void 0 === t && (t = true);
    var e,
      i = this._first;
    while (i) {
      e = i._next;
      this.remove(i);
      i = e;
    }
    this._dp && (this._time = this._tTime = this._pTime = 0);
    t && (this.labels = {});
    return Dt(this);
  };
  i.totalDuration = function totalDuration(t) {
    var e,
      i,
      n,
      s = 0,
      a = this,
      o = a._last,
      u = d;
    if (arguments.length)
      return a.timeScale(
        (a._repeat < 0 ? a.duration() : a.totalDuration()) /
          (a.reversed() ? -t : t)
      );
    if (a._dirty) {
      n = a.parent;
      while (o) {
        e = o._prev;
        o._dirty && o.totalDuration();
        i = o._start;
        if (i > u && a._sort && o._ts && !a._lock) {
          a._lock = 1;
          It(a, o, i - o._delay, 1)._lock = 0;
        } else u = i;
        if (i < 0 && o._ts) {
          s -= i;
          if ((!n && !a._dp) || (n && n.smoothChildTiming)) {
            a._start += i / a._ts;
            a._time -= i;
            a._tTime -= i;
          }
          a.shiftChildren(-i, false, -Infinity);
          u = 0;
        }
        o._end > s && o._ts && (s = o._end);
        o = e;
      }
      jt(a, a === r && a._time > s ? a._time : s, 1, 1);
      a._dirty = 0;
    }
    return a._tDur;
  };
  Timeline.updateRoot = function updateRoot(t) {
    if (r._ts) {
      _t(r, Rt(t, r));
      u = Ee.frame;
    }
    if (Ee.frame >= tt) {
      tt += _.autoSleep || 120;
      var e = r._first;
      if ((!e || !e._ts) && _.autoSleep && Ee._listeners.length < 2) {
        while (e && !e._ts) e = e._next;
        e || Ee.sleep();
      }
    }
  };
  return Timeline;
})(Ye);
pt(Ge.prototype, { _lock: 0, _hasPause: 0, _forcing: 0 });
var We,
  Ke,
  He = function _addComplexStringPropTween(t, e, i, r, n, s, a) {
    var o,
      u,
      h,
      l,
      _,
      c,
      d,
      p,
      m = new yi(this._pt, t, e, 0, 1, di, null, n),
      g = 0,
      v = 0;
    m.b = i;
    m.e = r;
    i += "";
    r += "";
    (d = ~r.indexOf("random(")) && (r = ce(r));
    if (s) {
      p = [i, r];
      s(p, t, e);
      i = p[0];
      r = p[1];
    }
    u = i.match(I) || [];
    while ((o = I.exec(r))) {
      l = o[0];
      _ = r.substring(g, o.index);
      h ? (h = (h + 1) % 5) : "rgba(" === _.substr(-5) && (h = 1);
      if (l !== u[v++]) {
        c = parseFloat(u[v - 1]) || 0;
        m._pt = {
          _next: m._pt,
          p: _ || 1 === v ? _ : ",",
          s: c,
          c: "=" === l.charAt(1) ? ht(c, l) - c : parseFloat(l) - c,
          m: h && h < 4 ? Math.round : 0,
        };
        g = I.lastIndex;
      }
    }
    m.c = g < r.length ? r.substring(g, r.length) : "";
    m.fp = a;
    (L.test(r) || d) && (m.e = 0);
    this._pt = m;
    return m;
  },
  Ze = function _addPropTween(t, e, i, r, n, s, a, o, u, h) {
    k(r) && (r = r(n || 0, t, s));
    var l,
      c = t[e],
      d =
        "get" !== i
          ? i
          : k(c)
          ? u
            ? t[
                e.indexOf("set") || !k(t["get" + e.substr(3)])
                  ? e
                  : "get" + e.substr(3)
              ](u)
            : t[e]()
          : c,
      p = k(c) ? (u ? hi : ui) : oi;
    if (b(r)) {
      ~r.indexOf("random(") && (r = ce(r));
      if ("=" === r.charAt(1)) {
        l = ht(d, r) + (Ht(d) || 0);
        (l || 0 === l) && (r = l);
      }
    }
    if (!h || d !== r || Ke) {
      if (!isNaN(d * r) && "" !== r) {
        l = new yi(
          this._pt,
          t,
          e,
          +d || 0,
          r - (d || 0),
          "boolean" === typeof c ? ci : _i,
          0,
          p
        );
        u && (l.fp = u);
        a && l.modifier(a, this, t);
        return (this._pt = l);
      }
      !c && !(e in t) && j(e, r);
      return He.call(this, t, e, d, r, p, o || _.stringFilter, u);
    }
  },
  $e = function _processVars(t, e, i, r, n) {
    k(t) && (t = ri(t, n, e, i, r));
    if (!M(t) || (t.style && t.nodeType) || R(t) || P(t))
      return b(t) ? ri(t, n, e, i, r) : t;
    var s,
      a = {};
    for (s in t) a[s] = ri(t[s], n, e, i, r);
    return a;
  },
  Je = function _checkPlugin(t, e, i, r, n, s) {
    var a, o, u, l;
    if (
      J[t] &&
      false !==
        (a = new J[t]()).init(
          n,
          a.rawVars ? e[t] : $e(e[t], r, n, s, i),
          i,
          r,
          s
        )
    ) {
      i._pt = o = new yi(i._pt, n, t, 0, 1, a.render, a, 0, a.priority);
      if (i !== h) {
        u = i._ptLookup[i._targets.indexOf(n)];
        l = a._props.length;
        while (l--) u[a._props[l]] = o;
      }
    }
    return a;
  },
  Xe = function _initTween(i, n, s) {
    var a,
      o,
      u,
      h,
      l,
      _,
      m,
      g,
      v,
      T,
      y,
      w,
      b,
      k = i.vars,
      x = k.ease,
      D = k.startAt,
      M = k.immediateRender,
      A = k.lazy,
      E = k.onUpdate,
      P = k.onUpdateParams,
      R = k.callbackScope,
      S = k.runBackwards,
      O = k.yoyoEase,
      z = k.keyframes,
      I = k.autoRevert,
      L = i._dur,
      F = i._startAt,
      B = i._targets,
      U = i.parent,
      N = U && "nested" === U.data ? U.vars.targets : B,
      q = "auto" === i._overwrite && !t,
      j = i.timeline;
    j && (!z || !x) && (x = "none");
    i._ease = Ue(x, c.ease);
    i._yEase = O ? Fe(Ue(true === O ? x : O, c.ease)) : 0;
    if (O && i._yoyo && !i._repeat) {
      O = i._yEase;
      i._yEase = i._ease;
      i._ease = O;
    }
    i._from = !j && !!k.runBackwards;
    if (!j || (z && !k.stagger)) {
      g = B[0] ? nt(B[0]).harness : 0;
      w = g && k[g.prop];
      a = Tt(k, H);
      if (F) {
        F._zTime < 0 && F.progress(1);
        n < 0 && S && M && !I ? F.render(-1, true) : F.revert(S && L ? W : G);
        F._lazy = 0;
      }
      if (D) {
        xt(
          (i._startAt = ai.set(
            B,
            pt(
              {
                data: "isStart",
                overwrite: false,
                parent: U,
                immediateRender: true,
                lazy: !F && C(A),
                startAt: null,
                delay: 0,
                onUpdate: E,
                onUpdateParams: P,
                callbackScope: R,
                stagger: 0,
              },
              D
            )
          ))
        );
        i._startAt._dp = 0;
        i._startAt._sat = i;
        n < 0 && (e || (!M && !I)) && i._startAt.revert(W);
        if (M && L && n <= 0 && s <= 0) {
          n && (i._zTime = n);
          return;
        }
      } else if (S && L && !F) {
        n && (M = false);
        u = pt(
          {
            overwrite: false,
            data: "isFromStart",
            lazy: M && !F && C(A),
            immediateRender: M,
            stagger: 0,
            parent: U,
          },
          a
        );
        w && (u[g.prop] = w);
        xt((i._startAt = ai.set(B, u)));
        i._startAt._dp = 0;
        i._startAt._sat = i;
        n < 0 && (e ? i._startAt.revert(W) : i._startAt.render(-1, true));
        i._zTime = n;
        if (M) {
          if (!n) return;
        } else _initTween(i._startAt, p, p);
      }
      i._pt = i._ptCache = 0;
      A = (L && C(A)) || (A && !L);
      for (o = 0; o < B.length; o++) {
        l = B[o];
        m = l._gsap || rt(B)[o]._gsap;
        i._ptLookup[o] = T = {};
        $[m.id] && Z.length && ft();
        y = N === B ? o : N.indexOf(l);
        if (g && false !== (v = new g()).init(l, w || a, i, y, N)) {
          i._pt = h = new yi(
            i._pt,
            l,
            v.name,
            0,
            1,
            v.render,
            v,
            0,
            v.priority
          );
          v._props.forEach(function (t) {
            T[t] = h;
          });
          v.priority && (_ = 1);
        }
        if (!g || w)
          for (u in a)
            J[u] && (v = Je(u, a, i, y, l, N))
              ? v.priority && (_ = 1)
              : (T[u] = h =
                  Ze.call(i, l, u, "get", a[u], y, N, 0, k.stringFilter));
        i._op && i._op[o] && i.kill(l, i._op[o]);
        if (q && i._pt) {
          We = i;
          r.killTweensOf(l, T, i.globalTime(n));
          b = !i.parent;
          We = 0;
        }
        i._pt && A && ($[m.id] = 1);
      }
      _ && Ti(i);
      i._onInit && i._onInit(i);
    }
    i._onUpdate = E;
    i._initted = (!i._op || i._pt) && !b;
    z && n <= 0 && j.render(d, true, true);
  },
  ti = function _updatePropTweens(t, e, i, r, n, s, a) {
    var o,
      u,
      h,
      l,
      _ = ((t._pt && t._ptCache) || (t._ptCache = {}))[e];
    if (!_) {
      _ = t._ptCache[e] = [];
      h = t._ptLookup;
      l = t._targets.length;
      while (l--) {
        o = h[l][e];
        if (o && o.d && o.d._pt) {
          o = o.d._pt;
          while (o && o.p !== e && o.fp !== e) o = o._next;
        }
        if (!o) {
          Ke = 1;
          t.vars[e] = "+=0";
          Xe(t, a);
          Ke = 0;
          return 1;
        }
        _.push(o);
      }
    }
    l = _.length;
    while (l--) {
      u = _[l];
      o = u._pt || u;
      o.s = (!r && 0 !== r) || n ? o.s + (r || 0) + s * o.c : r;
      o.c = i - o.s;
      u.e && (u.e = ot(i) + Ht(u.e));
      u.b && (u.b = o.s + Ht(u.b));
    }
  },
  ei = function _addAliasesToVars(t, e) {
    var i,
      r,
      n,
      s,
      a = t[0] ? nt(t[0]).harness : 0,
      o = a && a.aliases;
    if (!o) return e;
    i = gt({}, e);
    for (r in o)
      if (r in i) {
        s = o[r].split(",");
        n = s.length;
        while (n--) i[s[n]] = i[r];
      }
    return i;
  },
  ii = function _parseKeyframe(t, e, i, r) {
    var n,
      s,
      a = e.ease || r || "power1.inOut";
    if (R(e)) {
      s = i[t] || (i[t] = []);
      e.forEach(function (t, i) {
        return s.push({ t: (i / (e.length - 1)) * 100, v: t, e: a });
      });
    } else
      for (n in e) {
        s = i[n] || (i[n] = []);
        "ease" === n || s.push({ t: parseFloat(t), v: e[n], e: a });
      }
  },
  ri = function _parseFuncOrString(t, e, i, r, n) {
    return k(t)
      ? t.call(e, i, r, n)
      : b(t) && ~t.indexOf("random(")
      ? ce(t)
      : t;
  },
  ni = it + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",
  si = {};
at(ni + ",id,stagger,delay,duration,paused,scrollTrigger", function (t) {
  return (si[t] = 1);
});
var ai = (function (e) {
  _inheritsLoose(Tween, e);
  function Tween(i, n, s, a) {
    var o;
    if ("number" === typeof n) {
      s.duration = n;
      n = s;
      s = null;
    }
    o = e.call(this, a ? n : yt(n)) || this;
    var u,
      h,
      l,
      c,
      d,
      m,
      g,
      v,
      T = o.vars,
      y = T.duration,
      w = T.delay,
      b = T.immediateRender,
      k = T.stagger,
      D = T.overwrite,
      A = T.keyframes,
      S = T.defaults,
      O = T.scrollTrigger,
      z = T.yoyoEase,
      I = n.parent || r,
      L = (R(i) || P(i) ? x(i[0]) : "length" in n) ? [i] : te(i);
    o._targets = L.length
      ? rt(L)
      : V(
          "GSAP target " + i + " not found. https://greensock.com",
          !_.nullTargetWarn
        ) || [];
    o._ptLookup = [];
    o._overwrite = D;
    if (A || k || E(y) || E(w)) {
      n = o.vars;
      u = o.timeline = new Ge({
        data: "nested",
        defaults: S || {},
        targets: I && "nested" === I.data ? I.vars.targets : L,
      });
      u.kill();
      u.parent = u._dp = _assertThisInitialized(o);
      u._start = 0;
      if (k || E(y) || E(w)) {
        c = L.length;
        g = k && re(k);
        if (M(k))
          for (d in k)
            if (~ni.indexOf(d)) {
              v || (v = {});
              v[d] = k[d];
            }
        for (h = 0; h < c; h++) {
          l = Tt(n, si);
          l.stagger = 0;
          z && (l.yoyoEase = z);
          v && gt(l, v);
          m = L[h];
          l.duration = +ri(y, _assertThisInitialized(o), h, m, L);
          l.delay =
            (+ri(w, _assertThisInitialized(o), h, m, L) || 0) - o._delay;
          if (!k && 1 === c && l.delay) {
            o._delay = w = l.delay;
            o._start += w;
            l.delay = 0;
          }
          u.to(m, l, g ? g(h, m, L) : 0);
          u._ease = Re.none;
        }
        u.duration() ? (y = w = 0) : (o.timeline = 0);
      } else if (A) {
        yt(pt(u.vars.defaults, { ease: "none" }));
        u._ease = Ue(A.ease || n.ease || "none");
        var F,
          B,
          U,
          N = 0;
        if (R(A)) {
          A.forEach(function (t) {
            return u.to(L, t, ">");
          });
          u.duration();
        } else {
          l = {};
          for (d in A)
            "ease" === d || "easeEach" === d || ii(d, A[d], l, A.easeEach);
          for (d in l) {
            F = l[d].sort(function (t, e) {
              return t.t - e.t;
            });
            N = 0;
            for (h = 0; h < F.length; h++) {
              B = F[h];
              U = {
                ease: B.e,
                duration: ((B.t - (h ? F[h - 1].t : 0)) / 100) * y,
              };
              U[d] = B.v;
              u.to(L, U, N);
              N += U.duration;
            }
          }
          u.duration() < y && u.to({}, { duration: y - u.duration() });
        }
      }
      y || o.duration((y = u.duration()));
    } else o.timeline = 0;
    if (true === D && !t) {
      We = _assertThisInitialized(o);
      r.killTweensOf(L);
      We = 0;
    }
    It(I, _assertThisInitialized(o), s);
    n.reversed && o.reverse();
    n.paused && o.paused(true);
    if (
      b ||
      (!y &&
        !A &&
        o._start === ut(I._time) &&
        C(b) &&
        At(_assertThisInitialized(o)) &&
        "nested" !== I.data)
    ) {
      o._tTime = -p;
      o.render(Math.max(0, -w) || 0);
    }
    O && Lt(_assertThisInitialized(o), O);
    return o;
  }
  var i = Tween.prototype;
  i.render = function render(t, e, i) {
    var r,
      n,
      s,
      a,
      o,
      u,
      h,
      l,
      _,
      c = this._time,
      d = this._tDur,
      m = this._dur,
      g = t < 0,
      v = t > d - p && !g ? d : t < p ? 0 : t;
    if (m) {
      if (
        v !== this._tTime ||
        !t ||
        i ||
        (!this._initted && this._tTime) ||
        (this._startAt && this._zTime < 0 !== g)
      ) {
        r = v;
        l = this.timeline;
        if (this._repeat) {
          a = m + this._rDelay;
          if (this._repeat < -1 && g) return this.totalTime(100 * a + t, e, i);
          r = ut(v % a);
          if (v === d) {
            s = this._repeat;
            r = m;
          } else {
            s = ~~(v / a);
            if (s && s === v / a) {
              r = m;
              s--;
            }
            r > m && (r = m);
          }
          u = this._yoyo && 1 & s;
          if (u) {
            _ = this._yEase;
            r = m - r;
          }
          o = Pt(this._tTime, a);
          if (r === c && !i && this._initted) {
            this._tTime = v;
            return this;
          }
          if (s !== o) {
            l && this._yEase && Be(l, u);
            if (this.vars.repeatRefresh && !u && !this._lock) {
              this._lock = i = 1;
              this.render(ut(a * s), true).invalidate()._lock = 0;
            }
          }
        }
        if (!this._initted) {
          if (Ft(this, g ? t : r, i, e, v)) {
            this._tTime = 0;
            return this;
          }
          if (c !== this._time) return this;
          if (m !== this._dur) return this.render(t, e, i);
        }
        this._tTime = v;
        this._time = r;
        if (!this._act && this._ts) {
          this._act = 1;
          this._lazy = 0;
        }
        this.ratio = h = (_ || this._ease)(r / m);
        this._from && (this.ratio = h = 1 - h);
        if (r && !c && !e) {
          ge(this, "onStart");
          if (this._tTime !== v) return this;
        }
        n = this._pt;
        while (n) {
          n.r(h, n.d);
          n = n._next;
        }
        (l &&
          l.render(
            t < 0 ? t : !r && u ? -p : l._dur * l._ease(r / this._dur),
            e,
            i
          )) ||
          (this._startAt && (this._zTime = t));
        if (this._onUpdate && !e) {
          g && Ct(this, t, e, i);
          ge(this, "onUpdate");
        }
        this._repeat &&
          s !== o &&
          this.vars.onRepeat &&
          !e &&
          this.parent &&
          ge(this, "onRepeat");
        if ((v === this._tDur || !v) && this._tTime === v) {
          g && !this._onUpdate && Ct(this, t, true, true);
          (t || !m) &&
            ((v === this._tDur && this._ts > 0) || (!v && this._ts < 0)) &&
            xt(this, 1);
          if (!e && !(g && !c) && (v || c || u)) {
            ge(this, v === d ? "onComplete" : "onReverseComplete", true);
            this._prom && !(v < d && this.timeScale() > 0) && this._prom();
          }
        }
      }
    } else Nt(this, t, e, i);
    return this;
  };
  i.targets = function targets() {
    return this._targets;
  };
  i.invalidate = function invalidate(t) {
    (!t || !this.vars.runBackwards) && (this._startAt = 0);
    this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
    this._ptLookup = [];
    this.timeline && this.timeline.invalidate(t);
    return e.prototype.invalidate.call(this, t);
  };
  i.resetTo = function resetTo(t, e, i, r) {
    l || Ee.wake();
    this._ts || this.play();
    var n,
      s = Math.min(this._dur, (this._dp._time - this._start) * this._ts);
    this._initted || Xe(this, s);
    n = this._ease(s / this._dur);
    if (ti(this, t, e, i, r, n, s)) return this.resetTo(t, e, i, r);
    Ot(this, 0);
    this.parent ||
      bt(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
    return this.render(0);
  };
  i.kill = function kill(t, e) {
    void 0 === e && (e = "all");
    if (!t && (!e || "all" === e)) {
      this._lazy = this._pt = 0;
      return this.parent ? ve(this) : this;
    }
    if (this.timeline) {
      var i = this.timeline.totalDuration();
      this.timeline.killTweensOf(t, e, We && true !== We.vars.overwrite)
        ._first || ve(this);
      this.parent &&
        i !== this.timeline.totalDuration() &&
        jt(this, (this._dur * this.timeline._tDur) / i, 0, 1);
      return this;
    }
    var r,
      n,
      s,
      a,
      o,
      u,
      h,
      l = this._targets,
      _ = t ? te(t) : l,
      c = this._ptLookup,
      d = this._pt;
    if ((!e || "all" === e) && wt(l, _)) {
      "all" === e && (this._pt = 0);
      return ve(this);
    }
    r = this._op = this._op || [];
    if ("all" !== e) {
      if (b(e)) {
        o = {};
        at(e, function (t) {
          return (o[t] = 1);
        });
        e = o;
      }
      e = ei(l, e);
    }
    h = l.length;
    while (h--)
      if (~_.indexOf(l[h])) {
        n = c[h];
        if ("all" === e) {
          r[h] = e;
          a = n;
          s = {};
        } else {
          s = r[h] = r[h] || {};
          a = e;
        }
        for (o in a) {
          u = n && n[o];
          if (u) {
            ("kill" in u.d && true !== u.d.kill(o)) || kt(this, u, "_pt");
            delete n[o];
          }
          "all" !== s && (s[o] = 1);
        }
      }
    this._initted && !this._pt && d && ve(this);
    return this;
  };
  Tween.to = function to(t, e) {
    return new Tween(t, e, arguments[2]);
  };
  Tween.from = function from(t, e) {
    return Gt(1, arguments);
  };
  Tween.delayedCall = function delayedCall(t, e, i, r) {
    return new Tween(e, 0, {
      immediateRender: false,
      lazy: false,
      overwrite: false,
      delay: t,
      onComplete: e,
      onReverseComplete: e,
      onCompleteParams: i,
      onReverseCompleteParams: i,
      callbackScope: r,
    });
  };
  Tween.fromTo = function fromTo(t, e, i) {
    return Gt(2, arguments);
  };
  Tween.set = function set(t, e) {
    e.duration = 0;
    e.repeatDelay || (e.repeat = 0);
    return new Tween(t, e);
  };
  Tween.killTweensOf = function killTweensOf(t, e, i) {
    return r.killTweensOf(t, e, i);
  };
  return Tween;
})(Ye);
pt(ai.prototype, { _targets: [], _lazy: 0, _startAt: 0, _op: 0, _onInit: 0 });
at("staggerTo,staggerFrom,staggerFromTo", function (t) {
  ai[t] = function () {
    var e = new Ge(),
      i = $t.call(arguments, 0);
    i.splice("staggerFromTo" === t ? 5 : 4, 0, 0);
    return e[t].apply(e, i);
  };
});
var oi = function _setterPlain(t, e, i) {
    return (t[e] = i);
  },
  ui = function _setterFunc(t, e, i) {
    return t[e](i);
  },
  hi = function _setterFuncWithParam(t, e, i, r) {
    return t[e](r.fp, i);
  },
  li = function _setterAttribute(t, e, i) {
    return t.setAttribute(e, i);
  },
  fi = function _getSetter(t, e) {
    return k(t[e]) ? ui : D(t[e]) && t.setAttribute ? li : oi;
  },
  _i = function _renderPlain(t, e) {
    return e.set(e.t, e.p, Math.round(1e6 * (e.s + e.c * t)) / 1e6, e);
  },
  ci = function _renderBoolean(t, e) {
    return e.set(e.t, e.p, !!(e.s + e.c * t), e);
  },
  di = function _renderComplexString(t, e) {
    var i = e._pt,
      r = "";
    if (!t && e.b) r = e.b;
    else if (1 === t && e.e) r = e.e;
    else {
      while (i) {
        r =
          i.p +
          (i.m ? i.m(i.s + i.c * t) : Math.round(1e4 * (i.s + i.c * t)) / 1e4) +
          r;
        i = i._next;
      }
      r += e.c;
    }
    e.set(e.t, e.p, r, e);
  },
  pi = function _renderPropTweens(t, e) {
    var i = e._pt;
    while (i) {
      i.r(t, i.d);
      i = i._next;
    }
  },
  mi = function _addPluginModifier(t, e, i, r) {
    var n,
      s = this._pt;
    while (s) {
      n = s._next;
      s.p === r && s.modifier(t, e, i);
      s = n;
    }
  },
  gi = function _killPropTweensOf(t) {
    var e,
      i,
      r = this._pt;
    while (r) {
      i = r._next;
      (r.p === t && !r.op) || r.op === t
        ? kt(this, r, "_pt")
        : r.dep || (e = 1);
      r = i;
    }
    return !e;
  },
  vi = function _setterWithModifier(t, e, i, r) {
    r.mSet(t, e, r.m.call(r.tween, i, r.mt), r);
  },
  Ti = function _sortPropTweensByPriority(t) {
    var e,
      i,
      r,
      n,
      s = t._pt;
    while (s) {
      e = s._next;
      i = r;
      while (i && i.pr > s.pr) i = i._next;
      (s._prev = i ? i._prev : n) ? (s._prev._next = s) : (r = s);
      (s._next = i) ? (i._prev = s) : (n = s);
      s = e;
    }
    t._pt = r;
  };
var yi = (function () {
  function PropTween(t, e, i, r, n, s, a, o, u) {
    this.t = e;
    this.s = r;
    this.c = n;
    this.p = i;
    this.r = s || _i;
    this.d = a || this;
    this.set = o || oi;
    this.pr = u || 0;
    this._next = t;
    t && (t._prev = this);
  }
  var t = PropTween.prototype;
  t.modifier = function modifier(t, e, i) {
    this.mSet = this.mSet || this.set;
    this.set = vi;
    this.m = t;
    this.mt = i;
    this.tween = e;
  };
  return PropTween;
})();
at(
  it +
    "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger",
  function (t) {
    return (H[t] = 1);
  }
);
U.TweenMax = U.TweenLite = ai;
U.TimelineLite = U.TimelineMax = Ge;
r = new Ge({
  sortChildren: false,
  defaults: c,
  autoRemoveChildren: true,
  id: "root",
  smoothChildTiming: true,
});
_.stringFilter = Ae;
var wi = [],
  bi = {},
  ki = [],
  xi = 0,
  Di = function _dispatch(t) {
    return (bi[t] || ki).map(function (t) {
      return t();
    });
  },
  Mi = function _onMediaChange() {
    var t = Date.now(),
      e = [];
    if (t - xi > 2) {
      Di("matchMediaInit");
      wi.forEach(function (t) {
        var i,
          r,
          s,
          a,
          o = t.queries,
          u = t.conditions;
        for (r in o) {
          i = n.matchMedia(o[r]).matches;
          i && (s = 1);
          if (i !== u[r]) {
            u[r] = i;
            a = 1;
          }
        }
        if (a) {
          t.revert();
          s && e.push(t);
        }
      });
      Di("matchMediaRevert");
      e.forEach(function (t) {
        return t.onMatch(t);
      });
      xi = t;
      Di("matchMedia");
    }
  };
var Ci = (function () {
  function Context(t, e) {
    this.selector = e && ee(e);
    this.data = [];
    this._r = [];
    this.isReverted = false;
    t && this.add(t);
  }
  var t = Context.prototype;
  t.add = function add(t, e, r) {
    if (k(t)) {
      r = e;
      e = t;
      t = k;
    }
    var n = this,
      s = function f() {
        var t,
          s = i,
          a = n.selector;
        s && s !== n && s.data.push(n);
        r && (n.selector = ee(r));
        i = n;
        t = e.apply(n, arguments);
        k(t) && n._r.push(t);
        i = s;
        n.selector = a;
        n.isReverted = false;
        return t;
      };
    n.last = s;
    return t === k ? s(n) : t ? (n[t] = s) : s;
  };
  t.ignore = function ignore(t) {
    var e = i;
    i = null;
    t(this);
    i = e;
  };
  t.getTweens = function getTweens() {
    var t = [];
    this.data.forEach(function (e) {
      return e instanceof Context
        ? t.push.apply(t, e.getTweens())
        : e instanceof ai &&
            !(e.parent && "nested" === e.parent.data) &&
            t.push(e);
    });
    return t;
  };
  t.clear = function clear() {
    this._r.length = this.data.length = 0;
  };
  t.kill = function kill(t, e) {
    var i = this;
    if (t) {
      var r = this.getTweens();
      this.data.forEach(function (t) {
        if ("isFlip" === t.data) {
          t.revert();
          t.getChildren(true, true, false).forEach(function (t) {
            return r.splice(r.indexOf(t), 1);
          });
        }
      });
      r.map(function (t) {
        return { g: t.globalTime(0), t: t };
      })
        .sort(function (t, e) {
          return e.g - t.g || -1;
        })
        .forEach(function (e) {
          return e.t.revert(t);
        });
      this.data.forEach(function (e) {
        return !(e instanceof Ye) && e.revert && e.revert(t);
      });
      this._r.forEach(function (e) {
        return e(t, i);
      });
      this.isReverted = true;
    } else
      this.data.forEach(function (t) {
        return t.kill && t.kill();
      });
    this.clear();
    if (e) {
      var n = wi.indexOf(this);
      !!~n && wi.splice(n, 1);
    }
  };
  t.revert = function revert(t) {
    this.kill(t || {});
  };
  return Context;
})();
var Ai = (function () {
  function MatchMedia(t) {
    this.contexts = [];
    this.scope = t;
  }
  var t = MatchMedia.prototype;
  t.add = function add(t, e, i) {
    M(t) || (t = { matches: t });
    var r,
      s,
      a,
      o = new Ci(0, i || this.scope),
      u = (o.conditions = {});
    this.contexts.push(o);
    e = o.add("onMatch", e);
    o.queries = t;
    for (s in t)
      if ("all" === s) a = 1;
      else {
        r = n.matchMedia(t[s]);
        if (r) {
          wi.indexOf(o) < 0 && wi.push(o);
          (u[s] = r.matches) && (a = 1);
          r.addListener ? r.addListener(Mi) : r.addEventListener("change", Mi);
        }
      }
    a && e(o);
    return this;
  };
  t.revert = function revert(t) {
    this.kill(t || {});
  };
  t.kill = function kill(t) {
    this.contexts.forEach(function (e) {
      return e.kill(t, true);
    });
  };
  return MatchMedia;
})();
var Ei = {
  registerPlugin: function registerPlugin() {
    for (var t = arguments.length, e = new Array(t), i = 0; i < t; i++)
      e[i] = arguments[i];
    e.forEach(function (t) {
      return Te(t);
    });
  },
  timeline: function timeline(t) {
    return new Ge(t);
  },
  getTweensOf: function getTweensOf(t, e) {
    return r.getTweensOf(t, e);
  },
  getProperty: function getProperty(t, e, i, r) {
    b(t) && (t = te(t)[0]);
    var n = nt(t || {}).get,
      s = i ? dt : ct;
    "native" === i && (i = "");
    return t
      ? e
        ? s(((J[e] && J[e].get) || n)(t, e, i, r))
        : function (e, i, r) {
            return s(((J[e] && J[e].get) || n)(t, e, i, r));
          }
      : t;
  },
  quickSetter: function quickSetter(t, e, i) {
    t = te(t);
    if (t.length > 1) {
      var r = t.map(function (t) {
          return Oi.quickSetter(t, e, i);
        }),
        n = r.length;
      return function (t) {
        var e = n;
        while (e--) r[e](t);
      };
    }
    t = t[0] || {};
    var s = J[e],
      a = nt(t),
      o = (a.harness && (a.harness.aliases || {})[e]) || e,
      u = s
        ? function (e) {
            var r = new s();
            h._pt = 0;
            r.init(t, i ? e + i : e, h, 0, [t]);
            r.render(1, r);
            h._pt && pi(1, h);
          }
        : a.set(t, o);
    return s
      ? u
      : function (e) {
          return u(t, o, i ? e + i : e, a, 1);
        };
  },
  quickTo: function quickTo(t, e, i) {
    var r;
    var n = Oi.to(
        t,
        gt(((r = {}), (r[e] = "+=0.1"), (r.paused = true), r), i || {})
      ),
      s = function func(t, i, r) {
        return n.resetTo(e, t, i, r);
      };
    s.tween = n;
    return s;
  },
  isTweening: function isTweening(t) {
    return r.getTweensOf(t, true).length > 0;
  },
  defaults: function defaults(t) {
    t && t.ease && (t.ease = Ue(t.ease, c.ease));
    return vt(c, t || {});
  },
  config: function config(t) {
    return vt(_, t || {});
  },
  registerEffect: function registerEffect(t) {
    var e = t.name,
      i = t.effect,
      r = t.plugins,
      n = t.defaults,
      s = t.extendTimeline;
    (r || "").split(",").forEach(function (t) {
      return t && !J[t] && !U[t] && V(e + " effect requires " + t + " plugin.");
    });
    X[e] = function (t, e, r) {
      return i(te(t), pt(e || {}, n), r);
    };
    s &&
      (Ge.prototype[e] = function (t, i, r) {
        return this.add(X[e](t, M(i) ? i : (r = i) && {}, this), r);
      });
  },
  registerEase: function registerEase(t, e) {
    Re[t] = Ue(e);
  },
  parseEase: function parseEase(t, e) {
    return arguments.length ? Ue(t, e) : Re;
  },
  getById: function getById(t) {
    return r.getById(t);
  },
  exportRoot: function exportRoot(t, e) {
    void 0 === t && (t = {});
    var i,
      n,
      s = new Ge(t);
    s.smoothChildTiming = C(t.smoothChildTiming);
    r.remove(s);
    s._dp = 0;
    s._time = s._tTime = r._time;
    i = r._first;
    while (i) {
      n = i._next;
      (!e &&
        !i._dur &&
        i instanceof ai &&
        i.vars.onComplete === i._targets[0]) ||
        It(s, i, i._start - i._delay);
      i = n;
    }
    It(r, s, 0);
    return s;
  },
  context: function context(t, e) {
    return t ? new Ci(t, e) : i;
  },
  matchMedia: function matchMedia(t) {
    return new Ai(t);
  },
  matchMediaRefresh: function matchMediaRefresh() {
    return (
      wi.forEach(function (t) {
        var e,
          i,
          r = t.conditions;
        for (i in r)
          if (r[i]) {
            r[i] = false;
            e = 1;
          }
        e && t.revert();
      }) || Mi()
    );
  },
  addEventListener: function addEventListener(t, e) {
    var i = bi[t] || (bi[t] = []);
    ~i.indexOf(e) || i.push(e);
  },
  removeEventListener: function removeEventListener(t, e) {
    var i = bi[t],
      r = i && i.indexOf(e);
    r >= 0 && i.splice(r, 1);
  },
  utils: {
    wrap: fe,
    wrapYoyo: _e,
    distribute: re,
    random: ae,
    snap: se,
    normalize: he,
    getUnit: Ht,
    clamp: Zt,
    splitColor: ke,
    toArray: te,
    selector: ee,
    mapRange: de,
    pipe: oe,
    unitize: ue,
    interpolate: pe,
    shuffle: ie,
  },
  install: q,
  effects: X,
  ticker: Ee,
  updateRoot: Ge.updateRoot,
  plugins: J,
  globalTimeline: r,
  core: {
    PropTween: yi,
    globals: Q,
    Tween: ai,
    Timeline: Ge,
    Animation: Ye,
    getCache: nt,
    _removeLinkedListItem: kt,
    reverting: function reverting() {
      return e;
    },
    context: function context(t) {
      if (t && i) {
        i.data.push(t);
        t._ctx = i;
      }
      return i;
    },
    suppressOverwrites: function suppressOverwrites(e) {
      return (t = e);
    },
  },
};
at("to,from,fromTo,delayedCall,set,killTweensOf", function (t) {
  return (Ei[t] = ai[t]);
});
Ee.add(Ge.updateRoot);
h = Ei.to({}, { duration: 0 });
var Pi = function _getPluginPropTween(t, e) {
    var i = t._pt;
    while (i && i.p !== e && i.op !== e && i.fp !== e) i = i._next;
    return i;
  },
  Ri = function _addModifiers(t, e) {
    var i,
      r,
      n,
      s = t._targets;
    for (i in e) {
      r = s.length;
      while (r--) {
        n = t._ptLookup[r][i];
        if (n && (n = n.d)) {
          n._pt && (n = Pi(n, i));
          n && n.modifier && n.modifier(e[i], t, s[r], i);
        }
      }
    }
  },
  Si = function _buildModifierPlugin(t, e) {
    return {
      name: t,
      rawVars: 1,
      init: function init(t, i, r) {
        r._onInit = function (t) {
          var r, n;
          if (b(i)) {
            r = {};
            at(i, function (t) {
              return (r[t] = 1);
            });
            i = r;
          }
          if (e) {
            r = {};
            for (n in i) r[n] = e(i[n]);
            i = r;
          }
          Ri(t, i);
        };
      },
    };
  };
var Oi =
  Ei.registerPlugin(
    {
      name: "attr",
      init: function init(t, e, i, r, n) {
        var s, a, o;
        this.tween = i;
        for (s in e) {
          o = t.getAttribute(s) || "";
          a = this.add(t, "setAttribute", (o || 0) + "", e[s], r, n, 0, 0, s);
          a.op = s;
          a.b = o;
          this._props.push(s);
        }
      },
      render: function render(t, i) {
        var r = i._pt;
        while (r) {
          e ? r.set(r.t, r.p, r.b, r) : r.r(t, r.d);
          r = r._next;
        }
      },
    },
    {
      name: "endArray",
      init: function init(t, e) {
        var i = e.length;
        while (i--) this.add(t, i, t[i] || 0, e[i], 0, 0, 0, 0, 0, 1);
      },
    },
    Si("roundProps", ne),
    Si("modifiers"),
    Si("snap", se)
  ) || Ei;
ai.version = Ge.version = Oi.version = "3.11.4";
o = 1;
A() && Pe();
var zi = Re.Power0,
  Ii = Re.Power1,
  Li = Re.Power2,
  Fi = Re.Power3,
  Bi = Re.Power4,
  Ui = Re.Linear,
  Ni = Re.Quad,
  qi = Re.Cubic,
  ji = Re.Quart,
  Vi = Re.Quint,
  Qi = Re.Strong,
  Yi = Re.Elastic,
  Gi = Re.Back,
  Wi = Re.SteppedEase,
  Ki = Re.Bounce,
  Hi = Re.Sine,
  Zi = Re.Expo,
  $i = Re.Circ;
export {
  Ye as Animation,
  Gi as Back,
  Ki as Bounce,
  $i as Circ,
  qi as Cubic,
  Yi as Elastic,
  Zi as Expo,
  Qe as GSCache,
  Ui as Linear,
  zi as Power0,
  Ii as Power1,
  Li as Power2,
  Fi as Power3,
  Bi as Power4,
  yi as PropTween,
  Ni as Quad,
  ji as Quart,
  Vi as Quint,
  Hi as Sine,
  Wi as SteppedEase,
  Qi as Strong,
  Ge as Timeline,
  Ge as TimelineLite,
  Ge as TimelineMax,
  ai as Tween,
  ai as TweenLite,
  ai as TweenMax,
  Je as _checkPlugin,
  Me as _colorExp,
  Ae as _colorStringFilter,
  _ as _config,
  at as _forEachName,
  nt as _getCache,
  st as _getProperty,
  fi as _getSetter,
  b as _isString,
  D as _isUndefined,
  j as _missingPlugin,
  O as _numExp,
  z as _numWithUnitExp,
  ht as _parseRelative,
  J as _plugins,
  L as _relExp,
  kt as _removeLinkedListItem,
  di as _renderComplexString,
  ce as _replaceRandom,
  ot as _round,
  ne as _roundModifier,
  pt as _setDefaults,
  Ti as _sortPropTweensByPriority,
  Ee as _ticker,
  Zt as clamp,
  Oi as default,
  re as distribute,
  Ht as getUnit,
  Oi as gsap,
  pe as interpolate,
  de as mapRange,
  he as normalize,
  oe as pipe,
  ae as random,
  ee as selector,
  ie as shuffle,
  se as snap,
  ke as splitColor,
  te as toArray,
  ue as unitize,
  fe as wrap,
  _e as wrapYoyo,
};

//# sourceMappingURL=gsap-core.js.map
