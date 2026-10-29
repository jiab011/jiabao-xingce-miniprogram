Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../@swc/runtime/_object_spread.js"),
  r = require("../../@swc/runtime/_object_spread_props.js"),
  n = require("../../data/modules.js"),
  t = require("../../data/foundations.js");
function o(n) {
  return n.reduce(function (e, r, n) {
    return n % 3 == 0 && e.push({
      id: "row-" + n,
      items: [],
      spacers: []
    }), e[e.length - 1].items.push(r), e;
  }, []).map(function (n) {
    return r._(e._({}, n), {
      spacers: Array.from({
        length: 3 - n.items.length
      }, function (e, r) {
        return "empty-" + r;
      })
    });
  });
}
var u = o(n),
  i = o(t);
Page({
  data: {
    moduleRows: u,
    foundations: t,
    foundationRows: i
  },
  onModuleTap: function (e) {
    var r = n.find(function (r) {
      return r.id === e.currentTarget.dataset.id;
    });
    if (r) {
      if (!r.ready) {
        wx.showToast({
          title: "这个模块后续再完善",
          icon: "none"
        });
        return;
      }
      wx.navigateTo({
        url: "logicfill" === r.id ? "/logicHub/index?from=module" : "/exam/hub?module=" + r.id
      });
    }
  },
  onFoundationTap: function (e) {
    var r = t.find(function (r) {
      return r.id === e.currentTarget.dataset.id;
    });
    r && wx.navigateTo({
      url: r.module ? "/exam/hub?module=" + r.module : "/foundation/index?id=" + r.id
    });
  }
});
