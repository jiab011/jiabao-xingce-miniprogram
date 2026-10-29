Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../../@swc/runtime/_async_to_generator.js"),
  e = require("../../@swc/runtime/_object_spread.js"),
  a = require("../../@swc/runtime/_object_spread_props.js"),
  r = require("../../@swc/runtime/_ts_generator.js"),
  i = require("../../utils/study-cloud.js"),
  s = require("../../utils/logic-store.js");
Page({
  data: {
    signedIn: !1,
    nickname: "",
    avatar: "",
    editing: !1,
    editNickname: "",
    editAvatar: "",
    busy: !1,
    profileError: "",
    shareNotes: !0,
    wordFavorites: 0,
    questionFavorites: 0,
    wrongCount: 0
  },
  onShow: function () {
    this.refresh();
  },
  refresh: function () {
    var t = this,
      e = i.profile(),
      a = s.read();
    this.setData({
      signedIn: i.signedIn(),
      nickname: e.nickname || "",
      avatar: e.avatarPath || "",
      shareNotes: !1 !== e.shareNotes,
      wordFavorites: a.wordFavorites.length,
      questionFavorites: a.questionFavorites.length,
      wrongCount: a.wrongIds.length
    }), i.signedIn() && !e.avatarPath && i.avatarURL().then(function (e) {
      return t.setData({
        avatar: e
      });
    }).catch(function () {});
  },
  login: function () {
    return t._(function () {
      return r._(this, function (t) {
        switch (t.label) {
          case 0:
            if (this.data.busy) return [2];
            this.setData({
              busy: !0
            }), t.label = 1;
          case 1:
            return t.trys.push([1, 4, 5, 6]), [4, new Promise(function (t, e) {
              return wx.login({
                success: t,
                fail: e
              });
            })];
          case 2:
            return t.sent(), [4, i.login()];
          case 3:
            return t.sent(), this.refresh(), i.profile().profileSynced ? wx.showToast({
              title: "登录成功",
              icon: "success"
            }) : this.editProfile(), [3, 6];
          case 4:
            return t.sent(), wx.showToast({
              title: "暂时无法连接，请稍后再试",
              icon: "none"
            }), [3, 6];
          case 5:
            return this.setData({
              busy: !1
            }), [7];
          case 6:
            return [2];
        }
      });
    }).apply(this);
  },
  editProfile: function () {
    var t = i.profile(),
      e = wx.getStorageSync("jiabao.profile-draft.v1"),
      a = e && e.uid === t.uid ? e : null;
    this.newAvatar = !!(a && a.newAvatar), this.savedEditAvatar = a && a.savedAvatar || "", this.setData({
      editing: !0,
      profileError: "",
      editNickname: a ? a.nickname : t.nickname || "",
      editAvatar: a ? a.avatar : t.avatarPath || this.data.avatar || ""
    });
  },
  cancelEdit: function () {
    this.setData({
      editing: !1
    });
  },
  saveEditDraft: function () {
    wx.setStorageSync("jiabao.profile-draft.v1", {
      uid: i.profile().uid,
      nickname: this.data.editNickname,
      avatar: this.data.editAvatar,
      newAvatar: !!this.newAvatar,
      savedAvatar: this.savedEditAvatar || ""
    });
  },
  nicknameInput: function (t) {
    this.setData({
      editNickname: t.detail.value
    }), this.saveEditDraft();
  },
  chooseAvatar: function (t) {
    this.newAvatar = !0, this.savedEditAvatar = "", this.setData({
      editAvatar: t.detail.avatarUrl,
      profileError: ""
    }), this.saveEditDraft();
  },
  saveProfile: function (s) {
    return t._(function () {
      var t, n, o, c, u, l;
      return r._(this, function (r) {
        switch (r.label) {
          case 0:
            if (this.data.busy) return [2];
            if (!(t = String(s.detail.value.nickname || "").trim())) return wx.showToast({
              title: "请确认你的昵称",
              icon: "none"
            }), [2];
            this.setData({
              busy: !0,
              editNickname: t,
              profileError: ""
            }), this.saveEditDraft(), n = "头像保存", r.label = 1;
          case 1:
            if (r.trys.push([1, 5, 6, 7]), o = this.savedEditAvatar || this.data.editAvatar, !(this.newAvatar && o && !this.savedEditAvatar)) return [3, 3];
            return [4, new Promise(function (t, e) {
              return wx.getFileSystemManager().saveFile({
                tempFilePath: o,
                success: function (e) {
                  return t(e.savedFilePath);
                },
                fail: e
              });
            })];
          case 2:
            o = r.sent(), this.savedEditAvatar = o, this.setData({
              editAvatar: o
            }), this.saveEditDraft(), r.label = 3;
          case 3:
            return n = "云端资料保存", c = this.newAvatar || !i.profile().avatarFileID && !!o, [4, i.updateProfile(t, c ? o : "")];
          case 4:
            return r.sent(), i.saveProfile(a._(e._({}, i.profile()), {
              avatarPath: c ? o : i.profile().avatarPath || ""
            })), this.newAvatar = !1, wx.setStorageSync("jiabao.profile-draft.v1", {}), this.setData({
              editing: !1
            }), this.refresh(), wx.showToast({
              title: "资料已保存",
              icon: "success"
            }), [3, 7];
          case 5:
            return l = String((u = r.sent()).errMsg || u.message || "请求失败").replace(/o[a-zA-Z0-9_-]{27}/g, "[用户身份]"), console.error("profile-save-failed", u.stage || n, l), this.setData({
              profileError: (u.stage || n) + "未完成，已保留你的修改。请稍后重试。"
            }), wx.showToast({
              title: "资料尚未保存",
              icon: "none"
            }), [3, 7];
          case 6:
            return this.setData({
              busy: !1
            }), [7];
          case 7:
            return [2];
        }
      });
    }).apply(this);
  },
  changeShare: function (t) {
    i.saveProfile(a._(e._({}, i.profile()), {
      shareNotes: t.detail.value
    })), this.setData({
      shareNotes: t.detail.value
    });
  },
  openCollection: function (t) {
    var e = t.currentTarget.dataset.type;
    wx.navigateTo({
      url: "wrong" === e ? "/logicHub/wrong-books" : "words" === e ? "/logic/words/index?mode=favorites" : "/logic/questions/index?mode=" + e
    });
  },
  logout: function () {
    var t = this;
    wx.showModal({
      title: "退出当前登录",
      content: "已保存的笔记和草稿会保留。",
      confirmText: "退出",
      success: function (e) {
        e.confirm && (i.logout(), t.setData({
          editing: !1
        }), t.refresh());
      }
    });
  }
});
