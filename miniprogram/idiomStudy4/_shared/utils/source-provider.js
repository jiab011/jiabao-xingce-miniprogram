Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../../@swc/runtime/_type_of.js"),
  r = require("../../../utils/study-cloud.js"),
  t = "jiabao.authoritative-source.v2",
  i = !1,
  n = {},
  o = [],
  c = [],
  u = 0,
  f = 0,
  a = null,
  s = {};
function l() {
  for (; u < 2 && c.length;) {
    var i = function () {
      var e = c.findIndex(function (e) {
        return e.priority;
      });
      if (e < 0) {
        if (f >= 1) return {
          v: void 0
        };
        e = 0;
      }
      var i = c.splice(e, 1)[0],
        d = !i.priority;
      u++, d && f++, r.call("source", {
        wordId: i.wordId,
        index: i.index
      }, {
        priority: !d
      }).then(function (e) {
        if (!e.completeSentence || e.characters <= 100) throw Error("出处正文暂未更新");
        (function (e, r) {
          n[e] = r, (o = o.filter(function (r) {
            return r !== e;
          })).push(e);
          for (var i = o.reduce(function (e, r) {
            return e + JSON.stringify(n[r]).length;
          }, 0); o.length > 128 || i > 21e4;) {
            var c = o.shift();
            i -= JSON.stringify(n[c]).length, delete n[c];
          }
          a && clearTimeout(a), a = setTimeout(function () {
            try {
              var e = {
                version: 2,
                rows: n,
                order: o
              };
              wx.setStorage ? wx.setStorage({
                key: t,
                data: e,
                fail: function () {}
              }) : wx.setStorageSync(t, e);
            } catch (e) {}
          }, 350);
        })(i.key, e), i.resolve(e);
      }).catch(i.reject).finally(function () {
        u--, d && f--, delete s[i.key], l();
      });
    }();
    if ("object" === e._(i)) return i.v;
  }
}
function d(e, u, f) {
  !function () {
    if (!i) {
      i = !0;
      try {
        var e = wx.getStorageSync(t);
        e && 2 === e.version && (n = e.rows || {}, o = (e.order || []).filter(function (e) {
          return n[e];
        }));
      } catch (e) {}
    }
  }();
  var a,
    d,
    v = e + ":" + u;
  if (n[v]) return Promise.resolve(n[v]);
  if (s[v]) {
    if (f) {
      r.prioritize && r.prioritize("source", {
        wordId: e,
        index: u
      });
      var y = c.findIndex(function (e) {
        return e.key === v;
      });
      if (y >= 0) {
        var h = c.splice(y, 1)[0];
        h.priority = !0, c.unshift(h);
      }
      l();
    }
    return s[v];
  }
  if (!r.sourceReady()) return Promise.reject(Error("出处暂未连接"));
  var p = new Promise(function (e, r) {
    a = e, d = r;
  });
  s[v] = p;
  var w = {
    key: v,
    wordId: e,
    index: u,
    resolve: a,
    reject: d,
    priority: !!f
  };
  return f ? c.unshift(w) : c.push(w), l(), p;
}
module.exports = {
  get: d,
  prefetch: function (e, t) {
    r.sourceReady() && t.slice(0, 2).forEach(function (r) {
      return d(e, r, !1).catch(function () {});
    });
  },
  cancel: function (e) {
    for (var t = c.length - 1; t >= 0; t--) {
      var i = c[t];
      i.wordId !== e || i.priority || (c.splice(t, 1), delete s[i.key], i.reject(Error("预取已取消")));
    }
    r.cancelSources && r.cancelSources(e);
  }
};
