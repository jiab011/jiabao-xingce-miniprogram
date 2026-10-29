Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_object_spread.js"),
  r = require("../@swc/runtime/_object_spread_props.js"),
  t = require("./word-terms.js");
module.exports = {
  apply: function (e, r, n) {
    var d = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : Date.now();
    e.needsStudy = e.needsStudy || {};
    var u = r.filter(function (e, r, n) {
      return n.indexOf(e) === r && t.byId(e);
    });
    return u.forEach(function (r) {
      var t = e.needsStudy[r];
      e.needsStudy[r] = {
        createdAt: t ? t.createdAt : d,
        updatedAt: d,
        reason: n && n.reason || "manual",
        questionId: n && n.questionId || ""
      };
    }), e.learnedIds = e.learnedIds.filter(function (e) {
      return !u.includes(e);
    }), u;
  },
  list: function (n) {
    var d = require("./logic-store.js").read();
    return Object.keys(d.needsStudy).map(function (n) {
      return r._(e._({}, d.needsStudy[n], t.byId(n)), {
        learned: d.learnedIds.includes(n)
      });
    }).filter(function (e) {
      return e.id && ("learned" === n ? e.learned : "pending" !== n || !e.learned);
    }).sort(function (e, r) {
      return r.updatedAt - e.updatedAt;
    });
  },
  add: function (e, r) {
    return require("./logic-store.js").enqueueNeeds([e], {
      reason: "manual",
      questionId: r
    });
  },
  remove: function (e) {
    var r = require("./logic-store.js"),
      t = r.read();
    return !Object.prototype.hasOwnProperty.call(t.needsStudy, e) || (delete t.needsStudy[e], r.saveNeedsRemoval(t));
  }
};
