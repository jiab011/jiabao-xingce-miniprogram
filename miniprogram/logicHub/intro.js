var i = require("./_shared/utils/idiom-navigation.js"),
  n = require("../utils/logic-store.js");
Page({
  data: {
    total: i.index.length,
    learned: 0,
    remaining: i.index.length,
    hasProgress: !1
  },
  onShow: function () {
    var r = n.read(),
      e = i.index.filter(function (i) {
        return r.learnedIds.includes(i.id);
      }).length;
    this.setData({
      learned: e,
      remaining: i.index.length - e,
      hasProgress: !!i.byId[r.libraryCursors["idiom-high"]]
    });
  },
  start: function () {
    var r = n.read().libraryCursors["idiom-high"];
    i.openWord(i.byId[r] ? r : i.index[0].id);
  },
  clear: function () {
    var r = this;
    wx.showModal({
      title: "清除此词库的学习进度",
      content: "将清除这 439 个成语的已学标记和阅读位置。收藏、笔记、错题和作答记录会保留。",
      confirmText: "清除进度",
      confirmColor: "#f14455",
      success: function (e) {
        e.confirm && n.clearProgress("idiom-high", i.index.map(function (i) {
          return i.id;
        })) && r.onShow();
      }
    });
  },
  browse: function () {
    wx.navigateTo({
      url: "/logic/words/index?bank=idiom-high"
    });
  }
});
