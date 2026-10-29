Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_object_spread.js"),
  r = require("../@swc/runtime/_object_spread_props.js"),
  t = require("./_shared/data/logic-catalog.js"),
  a = require("../utils/logic-store.js");
Page({
  data: {
    libraries: t.libraries.slice(0, 6),
    wordFavorites: 0,
    questionFavorites: 0,
    wrongCount: 0,
    targetNames: t.libraries.slice(0, 6).map(function (e) {
      return e.name;
    }),
    targetIndex: 0,
    targetLearned: 0,
    targetTotal: 439,
    targetPercent: 0,
    needLearned: 0,
    needTotal: 0
  },
  onShow: function () {
    var n = a.read(),
      o = require("./_shared/data/study-bank-flags.js"),
      i = {
        "idiom-high": 1,
        "idiom-correct": 2,
        "national-high": 4,
        "national-all": 8,
        "real-high": 16,
        "real-correct": 32
      },
      l = 0;
    try {
      l = Math.max(0, Math.min(5, Number(wx.getStorageSync("jiabao.study-target.v1")) || 0));
    } catch (e) {}
    var s = require("../utils/needs-study.js").list(),
      c = t.libraries.slice(0, 6).map(function (t) {
        return r._(e._({}, t), {
          learned: n.learnedIds.filter(function (e) {
            return o[e] & i[t.id];
          }).length
        });
      }),
      d = c[l];
    this.setData({
      libraries: c,
      needLearned: s.filter(function (e) {
        return e.learned;
      }).length,
      needTotal: s.length,
      targetIndex: l,
      targetLearned: d.learned,
      targetTotal: d.count,
      targetPercent: Math.round(d.learned / d.count * 100),
      wordFavorites: n.wordFavorites.length,
      questionFavorites: n.questionFavorites.length,
      wrongCount: n.wrongIds.length
    });
  },
  targetChange: function (e) {
    var r = Math.max(0, Math.min(5, Number(e.detail.value) || 0));
    try {
      wx.setStorageSync("jiabao.study-target.v1", r);
    } catch (e) {}
    this.onShow();
  },
  openNeeds: function () {
    wx.navigateTo({
      url: "/logicSearch/needs"
    });
  },
  openPractice: function () {
    var e = "/logicHub/practice",
      r = function (e) {
        console.error("practice-open-failed", e.errMsg || "跳转失败"), wx.showToast({
          title: "暂时无法打开，请重新进入小程序后重试",
          icon: "none"
        });
      };
    getCurrentPages().length >= 10 ? wx.redirectTo({
      url: e,
      fail: r
    }) : wx.navigateTo({
      url: e,
      fail: r
    });
  },
  openSearch: function () {
    wx.navigateTo({
      url: "/logic/words/index?mode=search"
    });
  },
  openCollection: function (e) {
    var r = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: "wrong" === r ? "/logicHub/wrong-books" : "words" === r ? "/logic/words/index?mode=favorites" : "/logic/questions/index?mode=" + r
    });
  },
  openLibrary: function (e) {
    require("./_shared/utils/idiom-navigation.js").openLibrary(e.currentTarget.dataset.id);
  },
  openMore: function () {
    wx.navigateTo({
      url: "/logic/libraries/index"
    });
  },
  openCompare: function (e) {
    wx.navigateTo({
      url: "/logic/compare/index?type=" + e.currentTarget.dataset.type
    });
  }
});
