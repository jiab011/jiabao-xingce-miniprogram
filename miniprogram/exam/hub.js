var e = require("./utils/api.js"),
  t = require("./utils/store.js");
Page({
  data: {
    module: null,
    favorites: 0,
    wrongs: 0
  },
  onLoad: function (t) {
    var o = this;
    if (this.module = e.moduleInfo(t.module), !this.module) {
      wx.showToast({
        title: "模块不存在",
        icon: "none"
      });
      return;
    }
    this.setData({
      module: this.module
    }), wx.setNavigationBarTitle({
      title: this.module.name
    }), e.cleanAssets(), setTimeout(function () {
      return e.warm(o.module.id);
    }, 120);
  },
  onShow: function () {
    if (this.module) {
      var e = t.read(this.module.id);
      this.setData({
        favorites: e.favorites.length,
        wrongs: Object.keys(e.wrongs).length
      });
    }
  },
  search: function () {
    wx.navigateTo({
      url: "/exam/search?module=" + this.module.id
    });
  },
  practice: function () {
    wx.navigateTo({
      url: "/exam/practice?module=" + this.module.id
    });
  },
  favorites: function () {
    wx.navigateTo({
      url: "/exam/collections?module=" + this.module.id + "&kind=favorites"
    });
  },
  wrongs: function () {
    wx.navigateTo({
      url: "/exam/collections?module=" + this.module.id + "&kind=wrong"
    });
  }
});
