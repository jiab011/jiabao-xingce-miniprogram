var i = require("../data/foundations.js");
Page({
  data: {
    module: null
  },
  onLoad: function (a) {
    var e = i.find(function (i) {
      return i.id === a.id;
    });
    if (!e) {
      wx.switchTab({
        url: "/pages/index/index"
      });
      return;
    }
    this.setData({
      module: e
    }), wx.setNavigationBarTitle({
      title: e.name
    });
  },
  goHome: function () {
    wx.switchTab({
      url: "/pages/index/index"
    });
  }
});
