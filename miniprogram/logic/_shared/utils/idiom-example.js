Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../../../@swc/runtime/_to_consumable_array.js");
module.exports = {
  quote: function (t) {
    return t.text || (t.context ? t.context.slice(t.quoteStart, t.quoteEnd) : "");
  },
  parts: function (e) {
    var r = e.text || e.context || "",
      n = e.highlights || [],
      o = e.cueRanges || [],
      a = new Set([0, r.length]),
      u = !0,
      l = !1,
      i = void 0;
    try {
      for (var c, d = n[Symbol.iterator](); !(u = (c = d.next()).done); u = !0) {
        var f = c.value;
        f.s >= 0 && f.e <= r.length && (a.add(f.s), a.add(f.e));
      }
    } catch (t) {
      l = !0, i = t;
    } finally {
      try {
        u || null == d.return || d.return();
      } finally {
        if (l) throw i;
      }
    }
    var s = !0,
      v = !1,
      h = void 0;
    try {
      for (var y, x = o[Symbol.iterator](); !(s = (y = x.next()).done); s = !0) {
        var g = y.value;
        g[0] >= 0 && g[1] <= r.length && (a.add(g[0]), a.add(g[1]));
      }
    } catch (t) {
      v = !0, h = t;
    } finally {
      try {
        s || null == x.return || x.return();
      } finally {
        if (v) throw h;
      }
    }
    for (var p = t._(a).sort(function (t, e) {
        return t - e;
      }), _ = [], m = 0; m < p.length - 1; m++) !function (t) {
      var e = p[t],
        a = p[t + 1],
        u = n.find(function (t) {
          return t.s <= e && t.e >= a;
        });
      _.push({
        text: r.slice(e, a),
        kind: u ? u.k : "plain",
        cue: o.some(function (t) {
          return t[0] <= e && t[1] >= a;
        })
      });
    }(m);
    return _;
  }
};
