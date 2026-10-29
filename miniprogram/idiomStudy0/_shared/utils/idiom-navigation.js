var i = require("../data/idiom-study-index.js"),
  e = {};
i.forEach(function (i) {
  e[i.id] = i;
}), module.exports = {
  index: i,
  byId: e,
  sequence: function (e) {
    if ("needs" === e) return require("../../../utils/needs-study.js").list().map(function (i, e) {
      return {
        id: i.id,
        term: i.term,
        position: e + 1
      };
    });
    if (!e || "idiom-high" === e) return i;
    var n = {
      "idiom-correct": 2,
      "national-high": 4,
      "national-all": 8,
      "real-high": 16,
      "real-correct": 32
    }[e];
    if (!n) return i;
    var r = require("../data/study-bank-flags.js"),
      o = require("../../../data/word-id-index.js"),
      t = {};
    return Object.keys(o).forEach(function (i) {
      t[o[i]] = i;
    }), Object.keys(r).filter(function (i) {
      return r[i] & n;
    }).map(function (i, e) {
      return {
        id: i,
        term: t[i],
        position: e + 1
      };
    });
  },
  openWord: function (i, n, r) {
    require("../data/study-bank-flags.js");
    var o = {
      url: (e[i] && (!r || ["idiom-high", "idiom-correct", "national-high", "national-all", "needs"].includes(r)) ? e[i].route : "/logic/word/index") + "?id=" + encodeURIComponent(i) + (r ? "&bank=" + encodeURIComponent(r) : "")
    };
    n ? wx.redirectTo(o) : wx.navigateTo(o);
  },
  openLibrary: function (i) {
    wx.navigateTo({
      url: "idiom-high" === i ? "/logicHub/intro" : "/logic/intro/index?bank=" + encodeURIComponent(i)
    });
  }
};
