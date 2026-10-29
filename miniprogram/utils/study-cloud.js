Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_async_to_generator.js"),
  t = require("../@swc/runtime/_object_spread.js"),
  r = require("../@swc/runtime/_object_spread_props.js"),
  n = require("../@swc/runtime/_ts_generator.js"),
  a = require("../config/study-cloud.js"),
  i = require("./public-study-cache.js"),
  u = "jiabao.study-profile.v1",
  c = !1;
function s() {
  return !!(a.enabled && a.envId && wx.cloud);
}
function l() {
  return !!((a.sourceEnabled || a.enabled) && a.envId && wx.cloud);
}
function o(e) {
  return (e ? !!l() : !!s()) && (c || (wx.cloud.init({
    env: a.envId,
    traceUser: !0
  }), c = !0), !0);
}
function f() {
  try {
    return wx.getStorageSync(u) || {};
  } catch (e) {
    return {};
  }
}
function p(e) {
  try {
    return wx.setStorageSync(u, e), !0;
  } catch (e) {
    return !1;
  }
}
function d(e, t, r) {
  return h.apply(this, arguments);
}
function h() {
  return (h = e._(function (r, u, c) {
    return n._(this, function (s) {
      return [2, i.request(r, u, e._(function () {
        var e;
        return n._(this, function (n) {
          switch (n.label) {
            case 0:
              if (!o("source" === r)) throw Error("云端服务还未连接");
              return [4, wx.cloud.callFunction({
                name: a.functionName,
                data: t._({
                  action: r
                }, u)
              })];
            case 1:
              if (!(e = n.sent()).result || !e.result.ok) throw Error(e.result && e.result.message || "暂时无法同步，请稍后再试");
              return [2, e.result];
          }
        });
      }), c)];
    });
  })).apply(this, arguments);
}
function v() {
  return _.apply(this, arguments);
}
function _() {
  return (_ = e._(function () {
    var e, a, i;
    return n._(this, function (n) {
      switch (n.label) {
        case 0:
          return [4, d("login")];
        case 1:
          return e = n.sent(), i = !(a = f()).uid || a.uid === e.uid, require("./logic-store.js").activateAccount(e.uid), p(r._(t._({}, i ? a : {}), {
            nickname: e.profile.nickname || (i ? a.nickname : "") || "",
            avatarPath: i && a.avatarPath || "",
            avatarFileID: e.profile.avatarFileID || "",
            uid: e.uid,
            loggedIn: !0,
            profileSynced: !!e.profile.nickname,
            shareNotes: !1 !== a.shareNotes
          })), [2, e];
      }
    });
  })).apply(this, arguments);
}
function g(e) {
  return y.apply(this, arguments);
}
function y() {
  return (y = e._(function (e) {
    var t;
    return n._(this, function (r) {
      switch (r.label) {
        case 0:
          if ((t = f()).uid) return [3, 2];
          return [4, v()];
        case 1:
          r.sent(), t = f(), r.label = 2;
        case 2:
          return [4, wx.cloud.uploadFile({
            cloudPath: "study-avatars/" + t.uid + "/" + Date.now() + ".png",
            filePath: e
          })];
        case 3:
          return [2, r.sent().fileID];
      }
    });
  })).apply(this, arguments);
}
function w() {
  return (w = e._(function (e, a) {
    var i, u, c, s, l;
    return n._(this, function (n) {
      switch (n.label) {
        case 0:
          if (u = (i = f()).avatarFileID || "", !(a && !a.startsWith("cloud://"))) return [3, 7];
          n.label = 1;
        case 1:
          if (n.trys.push([1, 5,, 6]), !(i.pendingAvatarPath === a && i.pendingAvatarFileID)) return [3, 2];
          return c = i.pendingAvatarFileID, [3, 4];
        case 2:
          return [4, g(a)];
        case 3:
          c = n.sent(), n.label = 4;
        case 4:
          return u = c, p(r._(t._({}, f()), {
            pendingAvatarPath: a,
            pendingAvatarFileID: u
          })), [3, 6];
        case 5:
          throw (s = n.sent()).stage = "头像上传", s;
        case 6:
          return [3, 8];
        case 7:
          a && (u = a), n.label = 8;
        case 8:
          return [4, d("profile", {
            nickname: e,
            avatarFileID: u
          })];
        case 9:
          return l = n.sent(), p(r._(t._({}, f(), l.profile), {
            profileSynced: !0,
            pendingAvatarPath: "",
            pendingAvatarFileID: ""
          })), [2, l.profile];
      }
    });
  })).apply(this, arguments);
}
function b() {
  return (b = e._(function () {
    var e, t;
    return n._(this, function (r) {
      switch (r.label) {
        case 0:
          if ((e = f()).avatarPath) return [2, e.avatarPath];
          if (!e.avatarFileID || !o()) return [2, ""];
          return [4, wx.cloud.getTempFileURL({
            fileList: [e.avatarFileID]
          })];
        case 1:
          return [2, (t = r.sent()).fileList && t.fileList[0] && t.fileList[0].tempFileURL || ""];
      }
    });
  })).apply(this, arguments);
}
module.exports = {
  prioritize: i.promote,
  cancelSources: i.cancelSource,
  ready: s,
  sourceReady: l,
  signedIn: function () {
    var e = f();
    return !!(e.loggedIn && e.uid);
  },
  init: o,
  profile: f,
  saveProfile: p,
  call: d,
  login: v,
  uploadAvatar: g,
  updateProfile: function (e, t) {
    return w.apply(this, arguments);
  },
  avatarURL: function () {
    return b.apply(this, arguments);
  },
  logout: function () {
    p(r._(t._({}, f()), {
      loggedIn: !1
    }));
  },
  timeText: function (e) {
    var t = new Date(e);
    if (!Number.isFinite(t.getTime())) return "";
    var r = function (e) {
      return String(e).padStart(2, "0");
    };
    return t.getFullYear() + "-" + r(t.getMonth() + 1) + "-" + r(t.getDate()) + " " + r(t.getHours()) + ":" + r(t.getMinutes());
  }
};
