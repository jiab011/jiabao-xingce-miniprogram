Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../@swc/runtime/_async_to_generator.js"),
  r = require("../../@swc/runtime/_object_spread.js"),
  t = require("../../@swc/runtime/_ts_generator.js"),
  n = require("./api.js"),
  i = require("./store.js");
function a() {
  return (a = e._(function (e, a) {
    var s,
      u,
      o,
      l,
      c,
      d = arguments;
    return t._(this, function (t) {
      switch (t.label) {
        case 0:
          if (s = d.length > 2 && void 0 !== d[2] ? d[2] : {}, "paper" === a.kind && !s.readOnly && (o = (u = i.read(e).papers[a.paperId]) && u.activeRun && i.getRun(u.activeRun)) && !o.submittedAt) return wx.navigateTo({
            url: "/exam/reader?module=" + e + "&run=" + o.id
          }), [2, o];
          return [4, n.call("start", r._({
            module: e
          }, a))];
        case 1:
          return l = t.sent().run, s.origins && (l.origins = r._({}, l.origins, s.origins)), [4, n.question(e, l.ids[0])];
        case 2:
          if (t.sent(), !(c = i.create(l, s))) throw Error("练习未能保存");
          return wx.navigateTo({
            url: "/exam/reader?module=" + e + "&run=" + c.id
          }), [2, c];
      }
    });
  })).apply(this, arguments);
}
module.exports = {
  start: function (e, r) {
    return a.apply(this, arguments);
  }
};
