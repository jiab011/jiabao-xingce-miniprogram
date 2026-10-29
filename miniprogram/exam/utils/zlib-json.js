var e = require("./inflate.js").inflate;
module.exports = function (r) {
  return JSON.parse(e(function (e) {
    if ("undefined" != typeof wx && wx.base64ToArrayBuffer) return new Uint8Array(wx.base64ToArrayBuffer(e));
    for (var r = new Uint8Array(3 * e.length / 4 - (e.endsWith("==") ? 2 : e.endsWith("=") ? 1 : 0)), n = 0, t = 0, f = 0, i = 0; i < e.length && "=" !== e[i]; i++) t = t << 6 | "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(e[i]), (n += 6) >= 8 && (n -= 8, r[f++] = t >> n & 255);
    return r;
  }(r), {
    to: "string"
  }));
};
