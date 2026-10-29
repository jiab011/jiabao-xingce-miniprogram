Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../../@swc/runtime/_object_spread.js"),
  t = require("../../../@swc/runtime/_object_spread_props.js"),
  r = require("../../../utils/study-cloud.js");
function n() {
  return "jiabao.word-study-clock.v1." + (r.signedIn() ? r.profile().uid : "guest");
}
function o() {
  try {
    return wx.getStorageSync(n()) || {};
  } catch (e) {
    return {};
  }
}
function u(e) {
  try {
    return wx.setStorageSync(n(), e), !0;
  } catch (e) {
    return wx.showToast({
      title: "学习时间尚未保存，请检查空间",
      icon: "none"
    }), !1;
  }
}
module.exports = {
  enter: function (e) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Date.now(),
      r = o();
    return r[e] || (r[e] = {
      startedAt: t,
      deadlineAt: t + 3e5,
      launchedAt: 0
    }, u(r)) ? r[e] : null;
  },
  launch: function (r) {
    var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Date.now(),
      a = o();
    return !!a[r] && (a[r] = t._(e._({}, a[r]), {
      launchedAt: n
    }), u(a));
  },
  restart: function (e) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Date.now(),
      r = o();
    return r[e] = {
      startedAt: t,
      deadlineAt: t + 3e5,
      launchedAt: 0
    }, u(r);
  }
};
