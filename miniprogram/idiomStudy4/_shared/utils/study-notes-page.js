Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../../../@swc/runtime/_async_to_generator.js"),
  e = require("../../../@swc/runtime/_object_spread.js"),
  s = require("../../../@swc/runtime/_object_spread_props.js"),
  r = require("../../../@swc/runtime/_ts_generator.js"),
  i = require("../../../utils/logic-store.js"),
  n = require("../../../utils/study-cloud.js");
module.exports = {
  refreshPosts: function () {
    if (this.word) {
      var t = i.read().notePosts[this.word.id] || [],
        r = this.remotePosts || [],
        o = new Set(r.map(function (t) {
          return t.id;
        })),
        a = r.concat(t.filter(function (t) {
          return !t.remoteId || !o.has(t.remoteId);
        }).map(function (t) {
          return s._(e._({}, t), {
            mine: !0,
            localId: t.id
          });
        })).sort(function (t, e) {
          return e.createdAt - t.createdAt;
        });
      this.setData({
        posts: a.map(function (t) {
          return s._(e._({}, t), {
            displayId: t.localId || t.id,
            authorName: t.author && t.author.nickname || "我",
            avatar: t.author && (t.author.avatarUrl || t.author.avatarPath) || "",
            initial: Array.from(t.author && t.author.nickname || "我")[0],
            timeText: n.timeText(t.createdAt),
            statusText: "published" === t.status ? "已分享" : "pending" === t.status ? "审核中" : "syncing" === t.status ? "同步中" : "仅自己可见"
          });
        })
      });
    }
  },
  toggleShare: function (t) {
    this.setData({
      shareNotes: t.detail.value
    });
  },
  saveNote: function () {
    return t._(function () {
      var t, e, s;
      return r._(this, function (r) {
        switch (r.label) {
          case 0:
            if (this.data.noteSaving) return [2];
            if (!(t = this.data.note.trim())) return wx.showToast({
              title: "先写下你的学习笔记",
              icon: "none"
            }), [2];
            if (!n.signedIn() || !n.profile().nickname || n.ready() && !n.profile().profileSynced) return this.goAccount(), [2];
            if (e = n.profile(), s = {
              id: "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12),
              text: t,
              createdAt: Date.now(),
              status: "local",
              author: {
                nickname: e.nickname,
                avatarPath: e.avatarPath || "",
                uid: e.uid || ""
              }
            }, !i.addPost(this.word.id, s)) return [2];
            if (this.noteDirty = !1, this.setData({
              note: "",
              noteState: n.ready() && this.data.shareNotes ? "笔记正在同步" : "笔记已保存，仅自己可见"
            }), this.refreshPosts(), !(n.ready() && this.data.shareNotes)) return [3, 2];
            return [4, this.publishPost(s)];
          case 1:
            return r.sent(), [3, 3];
          case 2:
            wx.showToast({
              title: "笔记已保存",
              icon: "success"
            }), r.label = 3;
          case 3:
            return [2];
        }
      });
    }).apply(this);
  },
  publishPost: function (e) {
    return t._(function () {
      var t;
      return r._(this, function (s) {
        switch (s.label) {
          case 0:
            this.setData({
              noteSaving: !0
            }), i.updatePost(this.word.id, e.id, {
              status: "syncing"
            }), this.refreshPosts(), s.label = 1;
          case 1:
            return s.trys.push([1, 4, 5, 6]), [4, n.call("publish", {
              wordId: this.word.id,
              text: e.text,
              requestId: e.id
            })];
          case 2:
            return t = s.sent(), i.updatePost(this.word.id, e.id, {
              remoteId: t.id,
              status: t.status,
              createdAt: t.createdAt
            }), this.setData({
              noteState: "published" === t.status ? "笔记已分享给同学" : "笔记已保存，审核后会显示给同学"
            }), [4, this.loadPosts()];
          case 3:
            return s.sent(), [3, 6];
          case 4:
            return s.sent(), i.updatePost(this.word.id, e.id, {
              status: "local"
            }), wx.showToast({
              title: "已存本机，暂未分享成功",
              icon: "none"
            }), [3, 6];
          case 5:
            return this.leaving || (this.setData({
              noteSaving: !1
            }), this.refreshPosts()), [7];
          case 6:
            return [2];
        }
      });
    }).apply(this);
  },
  retryPost: function (e) {
    return t._(function () {
      var t;
      return r._(this, function (s) {
        switch (s.label) {
          case 0:
            if (!((t = (i.read().notePosts[this.word.id] || []).find(function (t) {
              return t.id === e.currentTarget.dataset.id;
            })) && n.ready())) return [3, 2];
            return [4, this.publishPost(t)];
          case 1:
            s.sent(), s.label = 2;
          case 2:
            return [2];
        }
      });
    }).apply(this);
  },
  loadPosts: function (e) {
    return t._(function () {
      var t, s;
      return r._(this, function (r) {
        switch (r.label) {
          case 0:
            if (t = this, !n.ready() || this.data.notesLoading) return [2];
            this.setData({
              notesLoading: !0
            }), r.label = 1;
          case 1:
            return r.trys.push([1, 3, 4, 5]), [4, n.call("list", {
              wordId: this.word.id,
              cursor: e ? this.notesCursor : null
            })];
          case 2:
            if (s = r.sent(), this.leaving) return [2];
            return this.remotePosts = e ? (this.remotePosts || []).concat(s.rows.filter(function (e) {
              return !(t.remotePosts || []).some(function (t) {
                return t.id === e.id;
              });
            })) : s.rows, this.notesCursor = s.cursor, this.setData({
              notesMore: !!s.cursor
            }), this.refreshPosts(), [3, 5];
          case 3:
            return r.sent(), this.leaving || this.setData({
              noteState: "本机笔记可用，共享笔记暂未同步"
            }), [3, 5];
          case 4:
            return this.leaving || this.setData({
              notesLoading: !1
            }), [7];
          case 5:
            return [2];
        }
      });
    }).apply(this);
  },
  moreNotes: function () {
    this.loadPosts(!0);
  },
  refreshNotes: function () {
    this.loadPosts(!1);
  },
  deletePost: function (e) {
    var s = e.currentTarget.dataset.id,
      o = this.data.posts.find(function (t) {
        return t.displayId === s;
      });
    if (o && o.mine) {
      var a,
        u = this;
      wx.showModal({
        title: "删除这条笔记",
        content: "删除后，这条笔记将不再显示。",
        confirmText: "删除",
        success: (a = t._(function (t) {
          var e;
          return r._(this, function (s) {
            switch (s.label) {
              case 0:
                if (!t.confirm) return [2];
                s.label = 1;
              case 1:
                if (s.trys.push([1, 4,, 5]), !(o.remoteId || !o.localId)) return [3, 3];
                if (!n.ready()) throw Error("联网后可删除共享笔记");
                return [4, n.call("delete", {
                  wordId: u.word.id,
                  id: o.remoteId || o.id
                })];
              case 2:
                s.sent(), s.label = 3;
              case 3:
                return o.localId ? i.removePost(u.word.id, o.localId) : (e = (i.read().notePosts[u.word.id] || []).find(function (t) {
                  return t.remoteId === o.id;
                })) && i.removePost(u.word.id, e.id), u.remotePosts = (u.remotePosts || []).filter(function (t) {
                  return t.id !== (o.remoteId || o.id);
                }), u.refreshPosts(), [3, 5];
              case 4:
                return s.sent(), wx.showToast({
                  title: "暂未删除，请稍后再试",
                  icon: "none"
                }), [3, 5];
              case 5:
                return [2];
            }
          });
        }), function (t) {
          return a.apply(this, arguments);
        })
      });
    }
  },
  goAccount: function () {
    this.flushNote(), wx.showModal({
      title: "先登录并确认个人资料",
      content: "在“我的”确认头像昵称后，各模块的笔记都会使用这份资料。",
      confirmText: "去我的",
      success: function (t) {
        t.confirm && wx.switchTab({
          url: "/pages/profile/index"
        });
      }
    });
  }
};
