Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../../../@swc/runtime/_object_spread.js"),
  i = require("../../../@swc/runtime/_object_spread_props.js"),
  s = require("./word-study-clock.js"),
  e = require("../../../utils/exam-session.js"),
  d = require("../../../utils/logic-store.js");
module.exports = function (r) {
  var o = r.onLoad,
    c = r.onShow,
    n = r.onHide,
    a = r.onUnload;
  return r.data = i._(t._({}, r.data), {
    studyClockText: "05:00"
  }), r.onLoad = function (t) {
    this._studyVisitStarted = !1, o.call(this, t), this.word && this.startStudyClock();
  }, r.onShow = function () {
    c.call(this), this.word && this.startStudyClock();
  }, r.onHide = function () {
    this._studyVisitStarted = !1, this.stopStudyClock(), n.call(this);
  }, r.onUnload = function () {
    this.stopStudyClock(), a.call(this);
  }, r.stopStudyClock = function () {
    this._studyClock && (clearInterval(this._studyClock), this._studyClock = null);
  }, r.startStudyClock = function () {
    var t = this;
    if (!this._studyVisitStarted) {
      var i = s.enter(this.word.id),
        e = d.read().needsStudy[this.word.id];
      i && i.launchedAt && e && e.updatedAt >= i.launchedAt && (s.restart(this.word.id), i = s.enter(this.word.id)), i && !i.launchedAt && s.restart(this.word.id), this._studyVisitStarted = !0;
    }
    this._launchingStudyPractice = !1, this.tickStudyClock(), !this._studyClock && this._studyClockPending && (this._studyClock = setInterval(function () {
      return t.tickStudyClock();
    }, 500));
  }, r.tickStudyClock = function () {
    if (this.word && !this.leaving) {
      var t = s.enter(this.word.id);
      if (!t) {
        this._studyClockPending = !1, this.setData({
          studyClockText: "点击重试"
        });
        return;
      }
      var i = Math.max(0, Math.ceil((t.deadlineAt - Date.now()) / 1e3));
      if (this._studyClockPending = !t.launchedAt, this.setData({
        studyClockText: t.launchedAt ? "本轮已练" : e.time(i)
      }), t.launchedAt) {
        this.stopStudyClock();
        return;
      }
      i || this._launchingStudyPractice || this.startTimedWordPractice();
    }
  }, r.studyClockTap = function () {
    var t = this,
      i = s.enter(this.word.id);
    wx.showModal({
      title: i && i.launchedAt ? "重新学习本词" : "进入真题练习",
      content: i && i.launchedAt ? "重新开始本词的5分钟学习？已学习标记和笔记会保留。" : "结束本词学习，进入关联真题练习？每道题折算30秒。",
      confirmText: i && i.launchedAt ? "重新学习" : "开始练习",
      success: function (e) {
        e.confirm && (i && i.launchedAt ? s.restart(t.word.id) && t.startStudyClock() : t.startTimedWordPractice());
      }
    });
  }, r.startTimedWordPractice = function () {
    if (!this._launchingStudyPractice && this.word && this.word.qids.length) {
      this._launchingStudyPractice = !0, this._studyClockPending = !1, this.flushNote(), s.enter(this.word.id);
      var t = this.word.qids,
        i = {
          ids: t,
          kind: "vocabulary",
          mode: "practice",
          libraryId: this.bank,
          wordId: this.word.id,
          runId: e.runId(),
          choices: {},
          answers: {},
          exam: e.create(t, Date.now(), 30)
        };
      if (!d.saveSession(i) || !s.launch(this.word.id)) {
        this._launchingStudyPractice = !1, this.setData({
          studyClockText: "点击重试"
        });
        return;
      }
      this.stopStudyClock(), d.openQuestion(t[0], null, !1);
    }
  }, r.practice = function () {
    this.startTimedWordPractice();
  }, r;
};
