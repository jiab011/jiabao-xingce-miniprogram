Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../../@swc/runtime/_object_spread.js"),
  r = require("../../../@swc/runtime/_object_spread_props.js");
module.exports = {
  match: function (t, n, c) {
    var s = String(n || "").trim().split(/\s+/).filter(Boolean);
    return s.length ? t.filter(function (e) {
      return s.every(function (r) {
        var t = e.correct.includes(r),
          n = e.distractor.includes(r),
          s = e.unknown.includes(r);
        return "correct" === c ? t : "distractor" === c ? n : "stem" === c ? e.stem.includes(r) : t || n || s || e.stem.includes(r);
      });
    }).map(function (t) {
      return r._(e._({}, t), {
        matchCorrect: s.some(function (e) {
          return t.correct.includes(e);
        }),
        matchDistractor: s.some(function (e) {
          return t.distractor.includes(e);
        }),
        matchStem: s.some(function (e) {
          return t.stem.includes(e);
        })
      });
    }) : [];
  }
};
