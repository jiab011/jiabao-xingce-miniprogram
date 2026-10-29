Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../../@swc/runtime/_async_to_generator.js"),
  r = require("../../../@swc/runtime/_object_spread.js"),
  t = require("../../../@swc/runtime/_ts_generator.js"),
  i = require("../../../utils/word-terms.js"),
  o = require("../../../utils/study-cloud.js"),
  n = {};
function a(e) {
  var r = e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0];
  return r ? {
    x: void 0 === r.clientX ? r.pageX : r.clientX,
    y: void 0 === r.clientY ? r.pageY : r.clientY
  } : null;
}
module.exports = {
  wordTouchStart: function (e) {
    var r = e.currentTarget.dataset.wordId;
    r && (this._wordTouch = {
      id: r,
      point: a(e)
    });
  },
  startWordDrag: function (e) {
    var t = this,
      o = e.currentTarget.dataset.wordId,
      n = i.byId(o);
    if (n && !this.data.inkMode && !this._sliding) {
      var s = a(e) || this._wordTouch && this._wordTouch.point || {
        x: 150,
        y: 180
      };
      this._swipe = null, this._ignoreChooseUntil = Date.now() + 700, this._wordDragging = r._({}, n);
      var d = this._viewport || {
          width: 375
        },
        w = d.width >= 760,
        g = w ? .625 : d.width / 750,
        h = w ? 145 : 205 * g,
        u = 12 * g,
        c = w ? 24 : 18 * g,
        l = w ? 75 : 110 * g,
        p = w ? 70 : 98 * g;
      if (this._wordTargets = [{
        action: "view",
        left: d.width - c - 2 * h - u,
        right: d.width - c - h - u,
        top: l,
        bottom: l + p
      }, {
        action: "learn",
        left: d.width - c - h,
        right: d.width - c,
        top: l,
        bottom: l + p
      }], this.setData({
        wordDragging: !0,
        dragWord: n.term,
        wordDragX: s.x,
        wordDragY: s.y - 42,
        wordDragTarget: ""
      }), wx.vibrateShort && wx.vibrateShort({
        type: "light",
        fail: function () {}
      }), wx.createSelectorQuery) {
        var v = function () {
          if (t._wordDragging) {
            var e = wx.createSelectorQuery().in(t);
            ["view", "learn"].forEach(function (r) {
              return e.select(".word-drop-" + r).boundingClientRect(function (e) {
                e && t._wordDragging && Object.assign(t._wordTargets.find(function (e) {
                  return e.action === r;
                }), e, {
                  right: e.left + e.width,
                  bottom: e.top + e.height
                });
              });
            }), e.exec();
          }
        };
        wx.nextTick ? wx.nextTick(v) : setTimeout(v, 16);
      }
    }
  },
  wordDragMove: function (e) {
    if (this._wordDragging) {
      var r = a(e);
      if (r) {
        var t = this._wordTargets.find(function (e) {
          return r.x >= e.left && r.x <= e.right && r.y >= e.top && r.y <= e.bottom;
        });
        this.setData({
          wordDragX: r.x,
          wordDragY: r.y - 42,
          wordDragTarget: t ? t.action : ""
        });
      }
    }
  },
  wordDragEnd: function (e) {
    if (this._wordDragging) {
      this.wordDragMove(e);
      var r = this._wordDragging,
        t = this.data.wordDragTarget;
      this._wordDragging = null, this._wordTouch = null, this._ignoreChooseUntil = Date.now() + 600, this.setData({
        wordDragging: !1,
        wordDragTarget: ""
      }), "learn" === t ? require("../../../utils/needs-study.js").add(r.id, this.question.id) && wx.showToast({
        title: "已加入需要学习",
        icon: "none"
      }) : "view" === t && this.openWordMeaning(r.id);
    }
  },
  cancelWordDrag: function () {
    this._wordDragging = null, this._wordTouch = null, this._ignoreChooseUntil = Date.now() + 600, this.setData({
      wordDragging: !1,
      wordDragTarget: ""
    });
  },
  openWordMeaning: function (r) {
    return e._(function () {
      var e, a, s, d, w;
      return t._(this, function (t) {
        switch (t.label) {
          case 0:
            if (!(e = i.byId(r))) return [2];
            a = (this._wordPreviewRequest || 0) + 1, this._wordPreviewRequest = a, this.setData({
              wordPreviewOpen: !0,
              previewWord: e,
              previewCore: "正在查词…",
              previewMemory: "",
              previewExample: null,
              previewError: !1,
              previewNotice: "",
              previewMeaningSource: ""
            }), t.label = 1;
          case 1:
            if (t.trys.push([1, 4,, 5]), d = n[r]) return [3, 3];
            return [4, o.call("wordDetail", {
              wordId: r
            })];
          case 2:
            d = t.sent().card, t.label = 3;
          case 3:
            if (s = d, this._leaving || this._wordPreviewRequest !== a) return [2];
            if (!s) throw Error("词义暂不可用");
            return n[r] = s, Object.keys(n).length > 32 && delete n[Object.keys(n)[0]], w = o.signedIn() ? require("../../../utils/logic-store.js").read().understandings[r] : null, this.setData({
              previewCore: s.core,
              previewMemory: w && w.text || s.memory,
              previewExample: s.examples && s.examples[0] || null,
              previewNotice: s.exampleNotice || "",
              previewMeaningSource: s.meaningSource || ""
            }), [3, 5];
          case 4:
            return t.sent(), this._wordPreviewRequest === a && this.setData({
              previewCore: "暂时无法读取词义",
              previewError: !0
            }), [3, 5];
          case 5:
            return [2];
        }
      });
    }).apply(this);
  },
  retryWordMeaning: function () {
    this.data.previewWord && this.openWordMeaning(this.data.previewWord.id);
  },
  closeWordMeaning: function () {
    this._wordPreviewRequest = (this._wordPreviewRequest || 0) + 1, this.setData({
      wordPreviewOpen: !1
    });
  },
  openWordLearning: function () {
    var e = this.data.previewWord;
    e && (this.closeWordMeaning(), require("./idiom-navigation.js").openWord(e.id, !1, "all"));
  }
};
