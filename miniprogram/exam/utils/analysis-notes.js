Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../../@swc/runtime/_async_to_generator.js"),
  e = require("../../@swc/runtime/_object_spread.js"),
  n = require("../../@swc/runtime/_object_spread_props.js"),
  s = require("../../@swc/runtime/_ts_generator.js"),
  i = require("../../utils/study-cloud.js");
function o() {
  var t = i.profile();
  return t.loggedIn && t.uid || "";
}
function r(t, e) {
  return "jiabao.analysis-note-draft.v1." + t + "." + e;
}
function a(t, e) {
  try {
    return wx.getStorageSync(r(t, e)) || null;
  } catch (t) {
    return null;
  }
}
function u(t, e, n) {
  if (!t || !e) return !1;
  try {
    return wx.setStorageSync(r(t, e), n), !0;
  } catch (t) {
    return !1;
  }
}
function h(t, e) {
  try {
    wx.removeStorageSync(r(t, e));
  } catch (t) {}
}
function l(t, e) {
  return c.apply(this, arguments);
}
function c() {
  return (c = t._(function (t, r) {
    var a;
    return s._(this, function (s) {
      switch (s.label) {
        case 0:
          if (!i.init()) throw Error("云端暂未连接，草稿会保留");
          return [4, wx.cloud.callFunction({
            name: "analysisNotes",
            data: n._(e._({
              action: t
            }, r), {
              expectedUid: o()
            })
          })];
        case 1:
          if (!(a = s.sent()).result || !a.result.ok) throw Error(a.result && a.result.message || "暂时无法读取解析笔记");
          return [2, a.result];
      }
    });
  })).apply(this, arguments);
}
function d(t) {
  return n._(e._({}, t), {
    date: i.timeText(t.updatedAt),
    initial: (t.author.nickname || "同学").slice(0, 1)
  });
}
module.exports = {
  install: function (e) {
    return Object.assign(e.data, {
      analysisNotes: [],
      noteListError: "",
      noteListLoading: !1,
      noteOpen: !1,
      noteTab: "text",
      noteText: "",
      noteStrokes: [],
      noteSeed: [],
      noteColor: "#202124",
      noteTool: "pen",
      noteBusy: !1,
      noteReady: !1,
      noteError: "",
      noteConflict: !1,
      noteAuthor: "",
      noteDate: ""
    }), Object.assign(e, {
      resetAnalysisNotes: function () {
        this._noteListToken = (this._noteListToken || 0) + 1, this._analysisMine = null, this._noteTap = null, this.setData({
          analysisNotes: [],
          noteListError: "",
          noteListLoading: !1
        });
      },
      loadAnalysisNotes: function () {
        return t._(function () {
          var t, e, n, i, r;
          return s._(this, function (s) {
            switch (s.label) {
              case 0:
                if (t = this.data.question, e = o(), !t || !this.data.revealed || !e) return [2];
                n = (this._noteListToken || 0) + 1, this._noteListToken = n, this.setData({
                  noteListLoading: !0,
                  noteListError: ""
                }), s.label = 1;
              case 1:
                return s.trys.push([1, 3,, 4]), [4, l("list", {
                  questionId: t.id
                })];
              case 2:
                if (i = s.sent(), n !== this._noteListToken || this._hidden || !this.data.question || t.id !== this.data.question.id || o() !== e) return [2];
                return this._analysisMine = i.mine, this._noteFetchedId = t.id, this.setData({
                  analysisNotes: i.rows.map(d),
                  noteListLoading: !1
                }), this.refreshInk(), [2, i];
              case 3:
                return r = s.sent(), n === this._noteListToken && this.setData({
                  noteListLoading: !1,
                  noteListError: r.message
                }), [3, 4];
              case 4:
                return [2];
            }
          });
        }).apply(this);
      },
      analysisNoteTap: function (t) {
        var e = t.currentTarget.dataset.id || "base",
          n = Date.now(),
          s = this._noteTap;
        this._noteTap = {
          id: e,
          at: n
        }, s && s.id === e && n - s.at < 360 && (this._noteTap = null, this.openAnalysisNote());
      },
      openAnalysisNote: function () {
        return t._(function () {
          var t, e, n, r, u, h, c;
          return s._(this, function (s) {
            switch (s.label) {
              case 0:
                if (this.data.noteOpen || !this.data.revealed || !this.data.question) return [2];
                if (this.cancelAuto(), this.endInk(), t = i.profile(), !o()) return wx.showToast({
                  title: "请先登录后发布解析笔记",
                  icon: "none"
                }), [2];
                e = this.data.question.id, n = o(), this._noteOwner = n, this._noteQid = e, this._noteBeforeInk = this.data.inkMode, this.setData({
                  noteOpen: !0,
                  noteBusy: !0,
                  noteError: "",
                  noteTab: "ink",
                  inkMode: !1,
                  noteAuthor: t.nickname || "",
                  noteDate: ""
                }), this.setData({
                  noteText: "",
                  noteStrokes: [],
                  noteSeed: [],
                  noteConflict: !1,
                  noteReady: !1
                }), s.label = 1;
              case 1:
                return s.trys.push([1, 3,, 4]), [4, l("list", {
                  questionId: e
                })];
              case 2:
                return r = s.sent(), [3, 4];
              case 3:
                return s.sent(), this.data.noteOpen && this.setData({
                  noteBusy: !1,
                  noteError: "暂时无法读取已有笔记，请重试"
                }), this._noteReadFailed = !0, [2];
              case 4:
                if (!this.data.noteOpen || this._noteQid !== e || o() !== n) return [2];
                return this._noteReadFailed = !1, this._analysisMine = r.mine, u = a(n, e), h = r.mine || {
                  revision: 0,
                  text: "",
                  strokes: []
                }, this._noteRevision = h.revision, c = u || h, u && u.baseRevision !== h.revision && (this._noteReadFailed = !0, this.setData({
                  noteConflict: !0,
                  noteError: "云端笔记已有更新，请选择要继续编辑的版本。",
                  noteBusy: !1
                })), this._noteDraftRequest = c.requestId || "", this.setData({
                  noteText: c.text || "",
                  noteStrokes: c.strokes || [],
                  noteSeed: c.strokes || [],
                  noteDate: h.updatedAt ? i.timeText(h.updatedAt) : "",
                  noteBusy: !1,
                  noteReady: !this._noteReadFailed,
                  analysisNotes: r.rows.map(d)
                }), [2];
            }
          });
        }).apply(this);
      },
      noteTextInput: function (t) {
        this.setData({
          noteText: t.detail.value,
          noteError: ""
        }), this.queueNoteDraft();
      },
      noteInkChange: function (t) {
        this.setData({
          noteStrokes: t.detail.strokes,
          noteError: ""
        }), this.queueNoteDraft();
      },
      notePadError: function (t) {
        this.setData({
          noteError: t.detail.message
        });
      },
      resolveNoteConflict: function (t) {
        if ("cloud" === t.currentTarget.dataset.version) {
          var e = this._analysisMine || {
            text: "",
            strokes: []
          };
          this.setData({
            noteText: e.text,
            noteStrokes: e.strokes,
            noteSeed: e.strokes
          });
        }
        this._noteReadFailed = !1, this._noteDraftRequest = "", this.setData({
          noteConflict: !1,
          noteReady: !0,
          noteError: ""
        }), this.flushNoteDraft();
      },
      retryAnalysisNote: function () {
        this.setData({
          noteOpen: !1,
          inkMode: !!this._noteBeforeInk
        }), this.openAnalysisNote();
      },
      queueNoteDraft: function () {
        var t = this;
        this._noteDraftRequest = "", clearTimeout(this._noteDraftTimer), this._noteDraftTimer = setTimeout(function () {
          return t.flushNoteDraft();
        }, 350);
      },
      flushNoteDraft: function () {
        if (clearTimeout(this._noteDraftTimer), this.data.noteOpen && this._noteOwner && !this._noteReadFailed) {
          var t = {
            text: this.data.noteText,
            strokes: this.data.noteStrokes,
            baseRevision: this._noteRevision,
            requestId: this._noteDraftRequest || "",
            updatedAt: Date.now()
          };
          u(this._noteOwner, this._noteQid, t) || this.setData({
            noteError: "本机草稿未保存，请保留此页面并重试发布"
          });
        }
      },
      finishNotePad: function () {
        return t._(function () {
          var t, e;
          return s._(this, function (n) {
            switch (n.label) {
              case 0:
                if (!((t = this.selectComponent && this.selectComponent("#analysisNotePad")) && t.finish)) return [3, 2];
                return [4, t.finish()];
              case 1:
                e = n.sent(), this.setData({
                  noteStrokes: e
                }), n.label = 2;
              case 2:
                return [2];
            }
          });
        }).apply(this);
      },
      selectNoteTab: function (e) {
        return t._(function () {
          return s._(this, function (t) {
            switch (t.label) {
              case 0:
                return [4, this.finishNotePad()];
              case 1:
                return t.sent(), this.setData({
                  noteTab: e.currentTarget.dataset.tab,
                  noteSeed: this.data.noteStrokes
                }), this.flushNoteDraft(), [2];
            }
          });
        }).apply(this);
      },
      notePen: function (e) {
        return t._(function () {
          return s._(this, function (t) {
            switch (t.label) {
              case 0:
                return [4, this.finishNotePad()];
              case 1:
                return t.sent(), this.setData({
                  noteColor: e.currentTarget.dataset.color,
                  noteTool: "pen"
                }), [2];
            }
          });
        }).apply(this);
      },
      noteEraser: function () {
        return t._(function () {
          return s._(this, function (t) {
            switch (t.label) {
              case 0:
                return [4, this.finishNotePad()];
              case 1:
                return t.sent(), this.setData({
                  noteTool: "eraser" === this.data.noteTool ? "pen" : "eraser"
                }), [2];
            }
          });
        }).apply(this);
      },
      noteClear: function () {
        return t._(function () {
          var t;
          return s._(this, function (e) {
            switch (e.label) {
              case 0:
                if (!((t = this.selectComponent && this.selectComponent("#analysisNotePad")) && t.clear)) return [3, 2];
                return [4, t.clear()];
              case 1:
                return e.sent(), [3, 3];
              case 2:
                this.noteInkChange({
                  detail: {
                    strokes: []
                  }
                }), e.label = 3;
              case 3:
                return [2];
            }
          });
        }).apply(this);
      },
      closeAnalysisNote: function () {
        return t._(function () {
          return s._(this, function (t) {
            switch (t.label) {
              case 0:
                if (this.data.noteBusy) return [2];
                return [4, this.finishNotePad()];
              case 1:
                return t.sent(), this.flushNoteDraft(), this.setData({
                  noteOpen: !1,
                  inkMode: !!this._noteBeforeInk
                }), this.refreshInk(), [2];
            }
          });
        }).apply(this);
      },
      pauseAnalysisNote: function () {
        var t = this;
        this.data.noteOpen && this.finishNotePad().then(function () {
          return t.flushNoteDraft();
        });
      },
      publishAnalysisNote: function () {
        return t._(function () {
          var t, e, n, i, r, a, u;
          return s._(this, function (s) {
            switch (s.label) {
              case 0:
                if (this.data.noteBusy || this._noteReadFailed) return [2];
                return this.setData({
                  noteBusy: !0,
                  noteError: ""
                }), [4, this.finishNotePad()];
              case 1:
                if (s.sent(), o() !== this._noteOwner) return this.setData({
                  noteBusy: !1,
                  noteError: "账号已切换，请关闭后重新打开"
                }), [2];
                if (t = this.data.noteText.trim(), e = this.data.noteStrokes, !t && !e.some(function (t) {
                  return "pen" === t.tool;
                })) return this.setData({
                  noteBusy: !1,
                  noteError: "请写下文字或手写笔记"
                }), [2];
                n = this._noteOwner, i = this._noteQid, this._noteDraftRequest || (this._noteDraftRequest = "a" + Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)), this.flushNoteDraft(), r = this._noteDraftRequest, s.label = 2;
              case 2:
                return s.trys.push([2, 4,, 5]), [4, l("publish", {
                  questionId: i,
                  editorVersion: 1,
                  text: t,
                  strokes: e,
                  requestId: r,
                  baseRevision: this._noteRevision
                })];
              case 3:
                if (a = s.sent(), o() !== n || this._noteQid !== i) return [2];
                return h(n, i), this._analysisMine = a.mine, this.setData({
                  noteOpen: !1,
                  noteBusy: !1,
                  inkMode: !!this._noteBeforeInk
                }), wx.showToast({
                  title: "已发布",
                  icon: "success"
                }), this.loadAnalysisNotes(), this.refreshInk(), [3, 5];
              case 4:
                return u = s.sent(), o() === n && this._noteQid === i && (this.setData({
                  noteBusy: !1,
                  noteError: u.message || "发布未完成，草稿已保留"
                }), this.flushNoteDraft()), [3, 5];
              case 5:
                return [2];
            }
          });
        }).apply(this);
      },
      previewNoteImage: function (t) {
        var e = t.currentTarget.dataset.src;
        e && wx.previewImage({
          current: e,
          urls: [e]
        });
      }
    }), e;
  },
  read: a,
  write: u,
  remove: h,
  call: l
};
