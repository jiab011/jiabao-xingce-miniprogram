var e = require("../../../data/logic-papers.js"),
  r = require("../../../utils/logic-store.js");
function n(r, n) {
  var t = Object.create(null),
    i = [];
  return e.papers.forEach(function (e) {
    r && String(e.year) !== String(r) || "provinces" === n && "national" === e.group || "all" !== n && "provinces" !== n && e.group !== n || e.ids.forEach(function (r) {
      t[r] || (t[r] = !0, i.push({
        id: r,
        title: e.title,
        no: e.nos[r],
        paperId: e.id
      }));
    });
  }), i;
}
var t = [];
e.papers.forEach(function (e) {
  var r = String(e.year);
  0 > t.indexOf(r) && t.push(r);
}), t.sort(function (e, r) {
  return Number(r) - Number(e);
}), module.exports = {
  scopes: [{
    id: "provinces",
    name: "全部省市（不含国考）"
  }, {
    id: "all",
    name: "全部试卷（含国考）"
  }, {
    id: "hebei",
    name: "河北省考"
  }, {
    id: "other",
    name: "其他省市"
  }],
  pool: n,
  start: function (e, t, i) {
    var o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : Math.random,
      a = n(e, t);
    if (!Number.isInteger(i) || i < 1 || i > a.length) return !1;
    for (var u = a.length - 1; u > 0; u--) {
      var s,
        c = Math.floor(o() * (u + 1));
      s = [a[c], a[u]], a[u] = s[0], a[c] = s[1];
    }
    var l = a.slice(0, i),
      p = l.map(function (e) {
        return e.id;
      }),
      d = {},
      f = require("../../../utils/exam-session.js");
    l.forEach(function (e) {
      d[e.id] = {
        title: e.title,
        no: e.no,
        paperId: e.paperId
      };
    });
    try {
      wx.setStorageSync("jiabao.logic-queue.v1", {
        ids: p,
        mode: "practice",
        kind: "random",
        runId: f.runId(),
        exam: f.create(p),
        choices: {},
        label: (e || "全部年份") + " \xb7 随机练习",
        sourceOverrides: d,
        answers: {}
      });
    } catch (e) {
      return wx.showToast({
        title: "练习未能开始，请重试",
        icon: "none"
      }), !1;
    }
    return r.openQuestion(p[0], null, !1), !0;
  },
  years: t
};
