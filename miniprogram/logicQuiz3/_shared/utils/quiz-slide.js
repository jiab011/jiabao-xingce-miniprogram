Object.defineProperty(exports, "__esModule", {
  value: !0
});
var i = require("../../../@swc/runtime/_object_spread.js"),
  t = require("../../../@swc/runtime/_object_spread_props.js"),
  e = require("../../../utils/logic-store.js");
module.exports = {
  restoreQuestionSlide: function () {
    var s,
      a = this,
      n = e.session(),
      h = n.questionSlide;
    h && h.id === this.question.id && (e.saveSession(t._(i._({}, n), {
      questionSlide: null
    })), Date.now() - h.at > 2e3 || (this._sliding = !0, this.setData({
      slidePhase: "tracking",
      slideX: h.direction * (this._viewport.width || 375),
      slideOpacity: .9
    }), s = function () {
      a.setData({
        slideX: 0,
        slideOpacity: 1,
        slidePhase: "settling"
      }), a._slideTimer = setTimeout(function () {
        a._sliding = !1, a.scheduleInk();
      }, 280);
    }, wx.nextTick ? wx.nextTick(s) : setTimeout(s, 16)));
  },
  swipeStart: function (i) {
    if (this.cancelAutoAdvance && this.cancelAutoAdvance(), this._sliding || this._wordDragging || this.data.inkMode || this.data.answerCard || this.data.fontPanel || this.data.resultOpen || this.data.wordPreviewOpen || !i.touches || 1 !== i.touches.length) {
      this._swipe = null;
      return;
    }
    var t = i.touches[0];
    this._swipe = {
      x: t.clientX,
      y: t.clientY,
      at: Date.now(),
      horizontal: !1
    };
  },
  swipeMove: function (i) {
    if (this._wordDragging) {
      this.wordDragMove(i);
      return;
    }
    var t = this._swipe,
      e = i.touches && i.touches[0];
    if (t && e && !this.data.inkMode) {
      var s = e.clientX - t.x,
        a = e.clientY - t.y;
      if (!t.horizontal) {
        if (Math.abs(a) > 18 && Math.abs(a) > Math.abs(s)) {
          this._swipe = null, this.setData({
            slideX: 0,
            slideOpacity: 1,
            horizontalSwipe: !1
          });
          return;
        }
        if (12 > Math.abs(s) || Math.abs(s) < 1.4 * Math.abs(a)) return;
        t.horizontal = !0, this.setData({
          horizontalSwipe: !0
        });
      }
      var n = this.reviewIds || this.ids,
        h = n.indexOf(this.question.id),
        o = s > 0 ? 0 === h : h === n.length - 1;
      this.setData({
        slideX: o ? .22 * s : s,
        slideOpacity: Math.max(.85, 1 - Math.abs(s) / this._viewport.width * .12),
        slidePhase: "tracking"
      });
    }
  },
  swipeEnd: function (i) {
    if (this._wordDragging) {
      this.wordDragEnd(i);
      return;
    }
    var t = this._swipe;
    if (this._swipe = null, this.setData({
      horizontalSwipe: !1
    }), !(!t || this.data.inkMode || this.data.answerCard || this.data.resultOpen || this._sliding || Date.now() < (this._ignoreChooseUntil || 0))) {
      var e = i.changedTouches && i.changedTouches[0];
      if (e) {
        var s = e.clientX - t.x,
          a = e.clientY - t.y,
          n = Date.now() - t.at;
        Math.abs(s) >= 55 && Math.abs(s) >= 1.4 * Math.abs(a) && n < 1e3 ? this.animateQuestionMove(s < 0 ? 1 : -1) : this.setData({
          slideX: 0,
          slideOpacity: 1,
          slidePhase: "settling"
        });
      }
    }
  },
  swipeCancel: function () {
    this._swipe = null, this.setData({
      horizontalSwipe: !1
    }), this._wordDragging && this.cancelWordDrag(), this.setData({
      slideX: 0,
      slideOpacity: 1,
      slidePhase: "settling"
    });
  },
  animateQuestionMove: function (s) {
    var a = this,
      n = this.reviewIds || this.ids,
      h = n[n.indexOf(this.question.id) + s];
    if (!h) {
      this.setData({
        slideX: 0,
        slideOpacity: 1,
        slidePhase: "settling"
      }), wx.showToast({
        title: s > 0 ? "已是最后一题" : "已是第一题",
        icon: "none"
      });
      return;
    }
    this._sliding = !0;
    var o = this._viewport.width || 375;
    this.setData({
      slideX: -s * o,
      slideOpacity: .88,
      slidePhase: "departing"
    }), clearTimeout(this._slideTimer), this._slideTimer = setTimeout(function () {
      !a._leaving && (e.saveSession(t._(i._({}, e.session()), {
        questionSlide: {
          id: h,
          direction: s,
          at: Date.now()
        }
      })), a.navigateQuestion(h), a.question && a.question.id === h && a.restoreQuestionSlide());
    }, 180);
  }
};
