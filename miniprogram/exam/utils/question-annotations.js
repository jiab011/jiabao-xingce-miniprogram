Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../@swc/runtime/_async_to_generator.js"),
  r = require("../../@swc/runtime/_object_spread.js"),
  n = require("../../@swc/runtime/_object_spread_props.js"),
  t = require("../../@swc/runtime/_ts_generator.js"),
  o = require("./cloud.js"),
  i = "jiabao.annotation-device.v1",
  a = {};
function u() {
  return o.signedIn() ? o.profile().uid : "guest";
}
function c() {
  return {
    version: 2,
    revision: 0,
    layouts: {},
    heads: {},
    updatedAt: 0
  };
}
function s(e) {
  for (var r = 2166136261, n = 0; n < e.length; n++) r ^= e.charCodeAt(n), r = Math.imul(r, 16777619);
  return (r >>> 0).toString(36);
}
function l(e, r) {
  return "jiabao.quiz-annotations.v2." + r + "." + e;
}
function f(e) {
  try {
    return wx.setStorageSync(e.key, {
      version: 2,
      remote: e.remote,
      pending: e.pending,
      imported: e.imported
    }), e.localError = !1, !0;
  } catch (r) {
    return e.localError = !0, !1;
  }
}
function g(e) {
  return e.localError ? "标记尚未保存，请检查空间" : "guest" === e.owner ? "登录后同步云端" : e.error ? "同步未完成，点此重试" : e.inflight || e.loading || e.pending.length ? "正在同步标记" : e.loaded ? "云端标记已同步" : "准备同步标记";
}
function d(e) {
  e.listeners.slice().forEach(function (r) {
    return r(g(e));
  });
}
function h(e, r, n) {
  var t = (((e.remote.layouts || {})[String(r)] || {})[n] || []).slice();
  return e.pending.forEach(function (e) {
    e.font === String(r) && e.surface === n && ("clear" === e.tool ? t = [] : t.push(e));
  }), t;
}
function p(e) {
  return "guest" !== e.owner && o.ready() && o.signedIn() && o.profile().uid === e.owner;
}
function y(e, r) {
  if (!r || 2 !== r.version || !r.layouts || !r.heads) throw Error("云端标记格式无效");
  r.revision >= (e.remote.revision || 0) && (e.remote = r);
  try {
    n = wx.getStorageSync(i);
  } catch (e) {}
  if (n && n.id) {
    var n,
      t = e.remote.heads[n.id] || 0;
    if (t > (n.seq || 0)) {
      n.seq = t;
      try {
        wx.setStorageSync(i, n);
      } catch (r) {
        e.localError = !0;
      }
    }
    e.pending = e.pending.filter(function (e) {
      return e.seq > t;
    });
  }
  f(e), d(e);
}
function w(e, t) {
  var o = t.map(function (e) {
    var t,
      o = ((t = wx.getStorageSync(i)) && /^d[a-z0-9]{16,40}$/.test(t.id || "") || (t = {
        id: "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12).padEnd(10, "0") + Math.random().toString(36).slice(2, 8).padEnd(6, "0"),
        seq: 0
      }), t.seq = (t.seq || 0) + 1, wx.setStorageSync(i, t), t);
    return n._(r._({}, JSON.parse(JSON.stringify(e))), {
      font: String(e.font),
      seq: o.seq
    });
  });
  return o.forEach(function (r) {
    "clear" === r.tool && (e.pending = e.pending.filter(function (e) {
      return e.font !== r.font || e.surface !== r.surface;
    }));
  }), e.pending = e.pending.concat(o), f(e), d(e), clearTimeout(e.timer), p(e) && (e.timer = setTimeout(function () {
    return _(e);
  }, 150)), o;
}
function S(e) {
  var t,
    o = u(),
    i = l(e, o);
  if (a[i]) return a[i];
  try {
    t = wx.getStorageSync(i) || {};
  } catch (e) {
    t = {};
  }
  var g = {
    qid: String(e),
    owner: o,
    key: i,
    remote: t.remote || c(),
    pending: t.pending || [],
    imported: t.imported || {},
    listeners: [],
    loaded: !1,
    error: "",
    localError: !1
  };
  return a[i] = g, !function (e) {
    var t = [];
    try {
      t = wx.getStorageInfoSync && wx.getStorageInfoSync().keys || [];
    } catch (e) {}
    if (t.filter(function (e) {
      return 0 === e.indexOf("jiabao.quiz-ink.v1.") && /\.(28|32|36|40)$/.test(e);
    }).forEach(function (r) {
      var n = r.slice(19).split(".");
      if (n[n.length - 2] === e.qid && !e.imported[r]) {
        var t = 4 === n.length ? n[0] : "";
        if (!t || t === e.owner || "guest" === t) try {
          var o = wx.getStorageSync(r + ".annotation-owner");
          if (o && o !== e.owner) return;
          var i = wx.getStorageSync(r);
          if (!Array.isArray(i)) return;
          wx.setStorageSync(r + ".annotation-owner", e.owner);
          var a = i.filter(function (e) {
            return Array.isArray(e.points) && e.points.length;
          }).map(function (e, t) {
            return {
              font: n[n.length - 1],
              surface: "question",
              tool: "pen",
              color: e.color,
              width: "#f4be38" === e.color ? 350 : 70,
              points: e.points,
              legacyId: "m" + s(r) + "_" + t
            };
          });
          a.length && w(e, a), e.imported[r] = !0, f(e);
        } catch (r) {
          e.localError = !0;
        }
      }
    }), "guest" !== e.owner) {
      var o = l(e.qid, "guest");
      try {
        var i = wx.getStorageSync(o),
          a = wx.getStorageSync(o + ".annotation-owner");
        if (i && 2 === i.version && !e.imported[o] && (!a || a === e.owner)) {
          wx.setStorageSync(o + ".annotation-owner", e.owner);
          var u = {
              remote: i.remote || c(),
              pending: i.pending || []
            },
            g = [];
          ["28", "32", "36", "40"].forEach(function (e) {
            return ["question", "analysis", "workspace"].forEach(function (t) {
              return h(u, e, t).forEach(function (i, a) {
                return g.push(n._(r._({}, i), {
                  font: e,
                  surface: t,
                  legacyId: "g" + s(o + e + t) + "_" + a
                }));
              });
            });
          }), g.length && w(e, g), e.imported[o] = !0, f(e);
        }
      } catch (r) {
        e.localError = !0;
      }
    }
  }(g), g;
}
function v(e) {
  return m.apply(this, arguments);
}
function m() {
  return (m = e._(function (e) {
    var r, n;
    return t._(this, function (t) {
      switch (t.label) {
        case 0:
          if (!p(e) || e.loading) return [2, !1];
          e.loading = !0, d(e), t.label = 1;
        case 1:
          return t.trys.push([1, 3, 4, 5]), [4, o.call("readQuestionInk", {
            questionId: e.qid
          })];
        case 2:
          if (r = t.sent(), !p(e)) return [2, !1];
          return y(e, r.document), e.loaded = !0, e.error = "", [2, !0];
        case 3:
          return n = t.sent(), e.error = n.message || "读取失败", [2, !1];
        case 4:
          return e.loading = !1, d(e), [7];
        case 5:
          return [2];
      }
    });
  })).apply(this, arguments);
}
function _(e) {
  return q.apply(this, arguments);
}
function q() {
  return (q = e._(function (r) {
    return t._(this, function (n) {
      return (clearTimeout(r.timer), r.inflight) ? [2, r.inflight] : p(r) ? r.pending.length ? (r.inflight = e._(function () {
        var e, n, a, u, c, s, l, g, h, w, S, v;
        return t._(this, function (t) {
          switch (t.label) {
            case 0:
              t.trys.push([0, 4, 5, 6]), t.label = 1;
            case 1:
              if (!(r.pending.length && p(r))) return [3, 3];
              e = wx.getStorageSync(i), n = [], a = 0, u = !0, c = !1, s = void 0;
              try {
                for (l = r.pending[Symbol.iterator](); !(u = (g = l.next()).done) && (w = ((h = g.value).points || []).length, !(n.length >= 100) && !(a + w > 2e4)); u = !0) n.push(h), a += w;
              } catch (e) {
                c = !0, s = e;
              } finally {
                try {
                  u || null == l.return || l.return();
                } finally {
                  if (c) throw s;
                }
              }
              if (!n.length) throw Error("标记数据过多");
              return [4, o.call("saveQuestionInk", {
                questionId: r.qid,
                device: e.id,
                operations: n
              })];
            case 2:
              if (S = t.sent(), !p(r)) return [2, !1];
              return y(r, S.document), r.loaded = !0, r.error = "", [3, 1];
            case 3:
              return [2, !0];
            case 4:
              return v = t.sent(), r.error = v.message || "同步失败", f(r), [2, !1];
            case 5:
              return r.inflight = null, d(r), [7];
            case 6:
              return [2];
          }
        });
      })(), d(r), [2, r.inflight]) : (d(r), [2, !0]) : (d(r), [2, !1]);
    });
  })).apply(this, arguments);
}
wx.onNetworkStatusChange && wx.onNetworkStatusChange(function (e) {
  e.isConnected && Object.keys(a).forEach(function (e) {
    var r = a[e];
    p(r) && v(r).then(function () {
      return _(r);
    });
  });
}), module.exports = {
  owner: u,
  get: S,
  visible: h,
  append: w,
  flush: _,
  pull: v,
  subscribe: function (e, r) {
    var n = S(e);
    return n.listeners.push(r), v(n).then(function () {
      return _(n);
    }), {
      entry: n,
      unsubscribe: function () {
        n.listeners = n.listeners.filter(function (e) {
          return e !== r;
        });
      }
    };
  },
  status: g
};
