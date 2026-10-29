Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../@swc/runtime/_async_to_generator.js"),
  r = require("../../@swc/runtime/_object_spread.js"),
  t = require("../../@swc/runtime/_ts_generator.js"),
  s = require("../../utils/study-cloud.js");
function n() {
  return (n = e._(function (e, n) {
    var u;
    return t._(this, function (t) {
      switch (t.label) {
        case 0:
          if (!s.init()) throw Error("云端题库暂未连接");
          return [4, wx.cloud.callFunction({
            name: "examBank",
            data: r._({
              action: e
            }, n)
          })];
        case 1:
          if (!(u = t.sent()).result || !u.result.ok) throw Error(u.result && u.result.message || "题库读取失败，请重试");
          return [2, u.result];
      }
    });
  })).apply(this, arguments);
}
module.exports = {
  call: function (e, r) {
    return n.apply(this, arguments);
  },
  ready: s.ready,
  signedIn: s.signedIn,
  profile: s.profile
};
