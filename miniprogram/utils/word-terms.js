var r = require("../data/word-id-index.js"),
  t = require("../data/word-kinds.js"),
  n = [],
  e = {};
Object.keys(r).forEach(function (i, o) {
  var u = {
    id: r[i],
    term: i,
    kind: "i" === t[o] ? "idiom" : "r" === t[o] ? "real" : "other"
  };
  n.push(u), e[u.id] = u;
});
var i = null,
  o = null,
  u = null;
function a(r, t) {
  o || (o = require("../data/question-word-options.js").split("|"), u = {}, Object.keys(require("../data/logic-question-routes.js")).forEach(function (r, t) {
    return u[r] = t;
  }));
  var e = u[r],
    i = ["A", "B", "C", "D"].indexOf(t);
  if (void 0 === e || i < 0) return [];
  var a = o[e].split("/")[i];
  return a ? a.split(".").map(function (r) {
    return n[parseInt(r, 36)].id;
  }).filter(function (r, t, n) {
    return n.indexOf(r) === t;
  }) : [];
}
module.exports = {
  byId: function (r) {
    return Object.prototype.hasOwnProperty.call(e, r) ? e[r] : null;
  },
  parts: function (r) {
    var t = String(r || "");
    i || (i = {}, n.forEach(function (r) {
      var t = i,
        n = !0,
        e = !1,
        o = void 0;
      try {
        for (var u, a = r.term[Symbol.iterator](); !(n = (u = a.next()).done); n = !0) {
          var d = u.value;
          t = t[d] || (t[d] = {});
        }
      } catch (r) {
        e = !0, o = r;
      } finally {
        try {
          n || null == a.return || a.return();
        } finally {
          if (e) throw o;
        }
      }
      t.word = r;
    }));
    for (var e = [], o = "", u = 0; u < t.length;) {
      for (var a = i, d = null, l = u, f = u; f < t.length && a[t[f]]; f++) (a = a[t[f]]).word && (d = a.word, l = f + 1);
      d ? (o && (e.push({
        text: o,
        id: ""
      }), o = ""), e.push({
        text: t.slice(u, l),
        id: d.id
      }), u = l) : o += t[u++];
    }
    return o && e.push({
      text: o,
      id: ""
    }), e;
  },
  optionWords: a,
  missed: function (r, t) {
    var n = require("../data/logic-answer-index.js")[r];
    if (!n || n === t) return [];
    var e = a(r, n),
      i = a(r, t),
      o = e.filter(function (r) {
        return !i.includes(r);
      });
    return o.length ? o : e;
  }
};
