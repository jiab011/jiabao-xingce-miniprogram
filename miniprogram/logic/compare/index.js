var t = require("../lib.js");
Page({
  data: {
    pairs: [],
    title: ""
  },
  onLoad: function (i) {
    this.type = "sound" === i.type ? "sound" : "idiom";
    var e = "sound" === this.type ? "同音异义" : "近义成语";
    this.setData({
      pairs: t.pairs(this.type),
      title: e
    }), wx.setNavigationBarTitle({
      title: e
    });
  },
  word: function (i) {
    t.openWord(i.currentTarget.dataset.id);
  },
  questions: function (t) {
    wx.navigateTo({
      url: "/logic/questions/index?pair=" + t.currentTarget.dataset.id + "&type=" + this.type
    });
  }
});
