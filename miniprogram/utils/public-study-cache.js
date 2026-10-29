Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_type_of.js"),
  r = "jiabao.public-study-content.20261024",
  t = !1,
  n = {},
  o = [],
  i = null,
  u = 0,
  c = 0,
  a = {},
  f = [];
function s(e, r) {
  return r && /^w[0-9a-z]+$/i.test(r.wordId || "") ? "wordDetail" === e ? e + ":" + r.wordId : "wordQuestions" === e ? e + ":" + r.wordId + ":" + (r.filter || "correct") + ":" + (r.offset || 0) : "source" === e ? e + ":" + r.wordId + ":" + r.index : "" : "";
}
function l(e) {
  return JSON.parse(JSON.stringify(e));
}
function d() {
  for (; u < 3 && f.length;) {
    var t = function () {
      var e = f.findIndex(function (e) {
        return !e.background;
      });
      if (e < 0) {
        if (c >= 1) return {
          v: void 0
        };
        e = 0;
      }
      var t = f.splice(e, 1)[0];
      u++, t.background && c++, Promise.resolve().then(t.loader).then(function (e) {
        (!t.key.startsWith("source:") || e.completeSentence && e.characters > 100) && function (e, t) {
          n[e] = {
            at: Date.now(),
            value: t
          }, (o = o.filter(function (r) {
            return r !== e;
          })).push(e);
          for (var u = JSON.stringify(n).length; o.length > 192 || u > 21e4;) delete n[o.shift()], u = JSON.stringify(n).length;
          i && clearTimeout(i), i = setTimeout(function () {
            var e = {
              rows: n,
              order: o
            };
            try {
              wx.setStorage ? wx.setStorage({
                key: r,
                data: e,
                fail: function () {}
              }) : wx.setStorageSync(r, e);
            } catch (e) {}
          }, 250);
        }(t.key, e), t.resolve(e);
      }, t.reject).finally(function () {
        u--, t.background && c--, delete a[t.key], d();
      });
    }();
    if ("object" === e._(t)) return t.v;
  }
}
function v(e, r) {
  var t = s(e, r),
    n = f.find(function (e) {
      return e.key === t;
    });
  n && (n.background = !1, d());
}
module.exports = {
  request: function (e, i, u) {
    var c,
      y,
      g = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {},
      h = s(e, i);
    if (!h) return u();
    if (!function () {
      if (!t) {
        t = !0;
        try {
          var e = wx.getStorageSync(r);
          if (e) {
            n = e.rows || {}, o = (e.order || []).filter(function (e) {
              return n[e] && Date.now() - n[e].at < 6048e5;
            });
            var i = {};
            o.forEach(function (e) {
              return i[e] = n[e];
            }), n = i;
          }
        } catch (e) {}
      }
    }(), n[h] && Date.now() - n[h].at < 6048e5) return Promise.resolve(l(n[h].value));
    if (a[h]) return !1 !== g.priority && v(e, i), a[h].then(l);
    var w = new Promise(function (e, r) {
      c = e, y = r;
    });
    return a[h] = w, f.push({
      key: h,
      loader: u,
      resolve: c,
      reject: y,
      background: "source" === e && !1 === g.priority
    }), d(), w.then(l);
  },
  promote: v,
  cancelSource: function (e) {
    for (var r = f.length - 1; r >= 0; r--) {
      var t = f[r];
      t.background && t.key.startsWith("source:" + e + ":") && (f.splice(r, 1), delete a[t.key], t.reject(Error("预取已取消")));
    }
  }
};
