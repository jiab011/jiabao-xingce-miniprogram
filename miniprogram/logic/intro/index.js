var n = require("../lib.js");
Page({
  data: {
    bank: null,
    total: 0,
    learned: 0,
    remaining: 0,
    hasProgress: !1,
    kind: ""
  },
  onLoad: function (t) {
    var i = this;
    if (this.bankId = t.bank, this.bank = n.libraries.find(function (n) {
      return n.id === i.bankId;
    }), !this.bank) {
      wx.navigateBack();
      return;
    }
    this.words = n.list(this.bankId), this.setData({
      bank: this.bank,
      total: this.words.length,
      kind: this.bankId.includes("real") ? "实词" : "all" === this.bankId ? "全部词语" : "成语"
    }), wx.setNavigationBarTitle({
      title: this.bank.name
    });
  },
  onShow: function () {
    var t = this;
    if (this.words) {
      var i = n.store.read(),
        r = this.words.filter(function (n) {
          return i.learnedIds.includes(n.id);
        }).length;
      this.setData({
        learned: r,
        remaining: this.words.length - r,
        hasProgress: this.words.some(function (n) {
          return n.id === i.libraryCursors[t.bankId];
        })
      });
    }
  },
  start: function () {
    var t = n.store.read().libraryCursors[this.bankId],
      i = this.words.find(function (n) {
        return n.id === t;
      }) || this.words[0];
    i && n.openWord(i.id, this.bankId);
  },
  browse: function () {
    wx.navigateTo({
      url: "/logic/words/index?bank=" + encodeURIComponent(this.bankId)
    });
  },
  clear: function () {
    var t = this;
    wx.showModal({
      title: "清除本词库学习进度",
      content: "清除这 " + this.words.length + " 个词语的已学标记和阅读位置，笔记、收藏、错题及作答记录会保留。",
      confirmText: "清除进度",
      confirmColor: "#f14455",
      success: function (i) {
        i.confirm && n.store.clearProgress(t.bankId, t.words.map(function (n) {
          return n.id;
        })) && t.onShow();
      }
    });
  }
});
