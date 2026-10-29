Object.defineProperty(exports, "__esModule", {
  value: !0
});
var r,
  e,
  n = require("../@swc/runtime/_object_spread.js"),
  i = require("../@swc/runtime/_object_spread_props.js");
function t() {
  return r || (r = require("../data/logic-papers.js")), r.papers;
}
function a(r, e) {
  return t().find(function (n) {
    return n.id === r && n.ids.indexOf(e) >= 0;
  });
}
function o(r, e) {
  return {
    key: "vocabulary:" + r,
    qid: r,
    kind: "vocabulary",
    group: "vocabulary",
    legacy: !!e
  };
}
function d(r, e) {
  return {
    key: "paper:" + r.id + ":" + e,
    qid: e,
    kind: "paper",
    group: r.group,
    paperId: r.id,
    title: r.title,
    no: r.nos[e],
    year: r.year,
    region: r.region
  };
}
function s(r, s) {
  if (!s || !Array.isArray(s.ids) || 0 > s.ids.indexOf(r)) return o(r, !0);
  if (s.wrongSources && s.wrongSources[r]) return n._({}, s.wrongSources[r]);
  if ("vocabulary" === s.kind) return i._(n._({}, o(r, !1)), {
    wordId: s.wordId || "",
    libraryId: s.libraryId || ""
  });
  var u = s.sourceOverrides && s.sourceOverrides[r],
    c = a(s.paperId || u && u.paperId, r);
  if (!c) {
    e || (e = require("../data/logic-question-meta.js"));
    var f = u || e[r];
    f && (c = t().find(function (e) {
      return e.title === f.title && e.ids.indexOf(r) >= 0;
    }));
  }
  return c ? d(c, r) : o(r, !0);
}
module.exports = {
  fromSession: s,
  normalize: function (r, e) {
    var t = r.wrongRecords || {},
      u = Object.create(null);
    return Object.keys(t).forEach(function (e) {
      var n = t[e];
      !n || !n.qid || 0 > r.wrongIds.indexOf(n.qid) ? delete t[e] : u[n.qid] = !0;
    }), r.wrongIds.forEach(function (c) {
      if (!u[c]) {
        var f = !1;
        Object.keys(r.paperProgress || {}).forEach(function (e) {
          var o = (r.paperProgress[e] || {}).active,
            s = o && o.answers && o.answers[c],
            u = s && !1 === s.correct && a(e, c);
          if (u) {
            var p = d(u, c);
            t[p.key] = i._(n._({}, p), {
              at: s.at || 0,
              attempt: n._({}, s)
            }), f = !0;
          }
        });
        var p = e && e.answers && e.answers[c];
        if (!f && p && !1 === p.correct && (e.paperId || "random" === e.kind || "vocabulary" === e.kind)) {
          var l = s(c, e);
          t[l.key] = i._(n._({}, l), {
            at: p.at || 0,
            attempt: n._({}, p)
          }), f = !0;
        }
        if (!f) {
          var y = o(c, !0);
          t[y.key] = i._(n._({}, y), {
            at: (r.answers[c] || {}).at || 0
          });
        }
      }
    }), r.wrongRecords = t, r;
  },
  selected: function (r, e, n) {
    var i = Object.keys(r.wrongRecords).map(function (e) {
      return r.wrongRecords[e];
    }).filter(function (r) {
      return r.qid === e;
    });
    if (n && n.ids && n.ids.indexOf(e) >= 0) {
      var t = s(e, n).key;
      return i.filter(function (r) {
        return r.key === t;
      });
    }
    return i;
  }
};
