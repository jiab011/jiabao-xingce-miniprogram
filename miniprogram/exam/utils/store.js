Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../@swc/runtime/_define_property.js"),
  r = require("../../@swc/runtime/_object_spread.js"),
  t = require("../../@swc/runtime/_object_spread_props.js"),
  n = require("../../@swc/runtime/_to_consumable_array.js"),
  a = require("../../utils/study-cloud.js"),
  i = "jiabao.exam.v1.",
  o = {},
  u = ["verbal", "figure", "definition", "analogy", "deduction", "quantity", "analysis", "common", "politics", "language", "reasoning"];
function s() {
  return a.signedIn() ? a.profile().uid : "guest";
}
function c() {
  var e = s();
  return !function (e) {
    if ("guest" !== e) try {
      if (wx.getStorageSync(i + "guest-owner")) return;
      var a = i + "guest.",
        o = wx.getStorageInfoSync ? wx.getStorageInfoSync().keys.filter(function (e) {
          return 0 === e.indexOf(a);
        }) : [];
      if (!o.length) return;
      var s = !0,
        c = !1,
        l = void 0;
      try {
        for (var p, f = o[Symbol.iterator](); !(s = (p = f.next()).done); s = !0) {
          var g = p.value,
            w = i + e + "." + g.slice(a.length),
            v = wx.getStorageSync(g);
          if (v) {
            var h = wx.getStorageSync(w);
            if (0 === g.indexOf(a + "run.")) h || wx.setStorageSync(w, t._(r._({}, v), {
              owner: e
            }));else if (u.includes(g.slice(a.length))) {
              var y = h || d();
              wx.setStorageSync(w, t._(r._({}, v, y), {
                favorites: Array.from(new Set(n._(v.favorites || []).concat(n._(y.favorites || [])))),
                wrongs: r._({}, v.wrongs || {}, y.wrongs || {}),
                papers: r._({}, v.papers || {}, y.papers || {}),
                records: Array.from(new Set(n._(y.records || []).concat(n._(v.records || [])))),
                activeRun: y.activeRun || v.activeRun || ""
              }));
            }
          }
        }
      } catch (e) {
        c = !0, l = e;
      } finally {
        try {
          s || null == f.return || f.return();
        } finally {
          if (c) throw l;
        }
      }
      wx.setStorageSync(i + "guest-owner", e);
    } catch (e) {}
  }(e), i + e + ".";
}
function d() {
  return {
    version: 1,
    favorites: [],
    wrongs: {},
    papers: {},
    records: [],
    activeRun: "",
    applied: {}
  };
}
function l(e) {
  return c() + function (e) {
    if (!u.includes(e)) throw Error("模块不存在");
    return e;
  }(e);
}
function p(e) {
  try {
    return r._({}, d(), wx.getStorageSync(l(e)) || {});
  } catch (e) {
    return d();
  }
}
function f(e, r) {
  try {
    return wx.setStorageSync(l(e), r), !0;
  } catch (e) {
    return wx.showToast({
      title: "记录未保存，请检查本机空间",
      icon: "none"
    }), !1;
  }
}
function g(e) {
  if (!/^r[a-z0-9]+$/.test(e || "")) throw Error("练习记录无效");
  return c() + "run." + e;
}
function w(e) {
  try {
    return wx.setStorageSync(g(e.id), e), !0;
  } catch (e) {
    return wx.showToast({
      title: "作答未保存，请检查本机空间",
      icon: "none"
    }), !1;
  }
}
function v(e) {
  try {
    var r = o[e] || wx.getStorageSync(g(e)) || null;
    return r && r.owner === s() ? JSON.parse(JSON.stringify(r)) : null;
  } catch (e) {
    return null;
  }
}
function h(e, r) {
  var t = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : Date.now(),
    n = 0,
    a = 0,
    i = 0,
    o = 0,
    u = 0,
    s = e.ids.map(function (r, t) {
      var s = e.choices[r] || "",
        c = e.keys[r] || "";
      c && i++, s && a++;
      var d = "unanswered";
      return s && !c ? (o++, d = "ungraded") : s && ("correct" == (d = s === c ? "correct" : "incorrect") ? n++ : u++), {
        id: r,
        no: t + 1,
        selected: s,
        answer: c,
        state: d
      };
    }),
    c = Math.max(0, Math.floor((Math.min(t, e.deadlineAt) - e.startedAt) / 1e3));
  return {
    reason: r,
    total: e.ids.length,
    answered: a,
    correct: n,
    wrong: u,
    ungraded: o,
    unanswered: e.ids.length - a,
    gradable: i,
    accuracy: i ? Math.round(n / i * 100) : null,
    completion: Math.round(a / e.ids.length * 100),
    elapsedSeconds: c,
    items: s
  };
}
function y(e) {
  var r = e.report;
  return r.answered > 0 && r.elapsedSeconds >= .2 * e.durationSeconds && !(r.accuracy >= 10 && r.accuracy <= 20);
}
module.exports = {
  owner: s,
  read: p,
  save: f,
  saveRun: w,
  getRun: v,
  create: function (e) {
    var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
      a = r._(t._(r._({}, e), {
        id: "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
        owner: s(),
        choices: {},
        createdAt: Date.now(),
        startedAt: Date.now(),
        deadlineAt: Date.now() + 6e4 * e.ids.length,
        durationSeconds: 60 * e.ids.length,
        readOnly: !!n.readOnly,
        submittedAt: 0,
        report: null
      }), n);
    if (a.readOnly) return o[a.id] = a, a;
    if (!w(a)) return null;
    var i = p(e.module);
    if (i.activeRun = a.id, e.paperId) {
      var u = i.papers[e.paperId] || {};
      i.papers[e.paperId] = t._(r._({}, u), {
        activeRun: a.id
      });
    }
    return f(e.module, i) ? a : null;
  },
  choose: function (n, a) {
    var i = v(n.id);
    return !(!i || i.owner !== s() || i.submittedAt || i.readOnly || Date.now() >= i.deadlineAt) && !!i.ids.includes(n.currentId) && "string" == typeof a && !!/^[A-H]{0,8}$/.test(a) && (i.choices = t._(r._({}, i.choices), e._({}, n.currentId, a)), !!w(i) && (Object.assign(n, i), !0));
  },
  grade: h,
  submit: function (e, n) {
    var a = v(e.id);
    if (!a || a.owner !== s() || a.readOnly) return null;
    if (a.submissionApplied) return Object.assign(e, a), a.report;
    if (!a.submittedAt && ((a = t._(r._({}, a), {
      submittedAt: Math.min(Date.now(), a.deadlineAt)
    })).report = h(a, n, a.submittedAt), !w(a))) return null;
    var i = p(a.module);
    if (i.applied = i.applied || {}, i.applied[a.id]) return a.submissionApplied = !0, w(a), Object.assign(e, a), a.report;
    if (a.report.items.filter(function (e) {
      return "incorrect" === e.state;
    }).forEach(function (e) {
      var r = a.origins[e.id],
        t = (r.paperId || "random") + ":" + e.id;
      (!i.wrongs[t] || i.wrongs[t].at <= a.submittedAt) && (i.wrongs[t] = {
        key: t,
        id: e.id,
        source: r,
        selected: e.selected,
        at: a.submittedAt
      });
    }), a.paperId) {
      var o = i.papers[a.paperId] || {};
      o.lastSubmitted !== a.id && (i.papers[a.paperId] = t._(r._({}, o), {
        lastSubmitted: a.id,
        completed: (o.completed || 0) + 1
      }));
    }
    return (y(a) && !i.records.includes(a.id) && i.records.unshift(a.id), i.applied[a.id] = !0, f(a.module, i)) ? (a.submissionApplied = !0, w(a), Object.assign(e, a), a.report) : null;
  },
  effective: y,
  records: function (e, r) {
    return p(e).records.map(v).filter(function (e) {
      return e && e.report && (!r || e.paperId === r);
    });
  },
  toggleFavorite: function (e, r) {
    var t = p(e),
      n = t.favorites.indexOf(r);
    return n < 0 ? t.favorites.push(r) : t.favorites.splice(n, 1), f(e, t) ? n < 0 : null;
  },
  removeWrong: function (e, r) {
    var t = p(e);
    return r.forEach(function (e) {
      return delete t.wrongs[e];
    }), f(e, t);
  },
  time: function (e) {
    return String(Math.floor((e = Math.max(0, Math.floor(e))) / 60)).padStart(2, "0") + ":" + String(e % 60).padStart(2, "0");
  },
  date: function (e) {
    var r = new Date(e),
      t = function (e) {
        return String(e).padStart(2, "0");
      };
    return r.getFullYear() + "-" + t(r.getMonth() + 1) + "-" + t(r.getDate()) + " " + t(r.getHours()) + ":" + t(r.getMinutes());
  }
};
