Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../../../@swc/runtime/_define_property.js"),
  e = require("../../../@swc/runtime/_object_spread.js"),
  i = require("../../../@swc/runtime/_object_spread_props.js"),
  s = require("../../../utils/logic-store.js"),
  n = require("../../../utils/exam-session.js"),
  a = require("./quiz-ink.js"),
  o = "jiabao.quiz-preferences.v1";
function r() {
  try {
    var t = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    return {
      width: t.windowWidth || 375,
      height: t.windowHeight || 720
    };
  } catch (t) {
    return {
      width: 375,
      height: 720
    };
  }
}
module.exports = function (h) {
  var d = {
    data: {
      readerHeight: 600,
      workspaceHeight: 596,
      readerCanScroll: !1,
      readerScrollTop: 0,
      horizontalSwipe: !1,
      answerSheetHeight: 200,
      isTablet: !1,
      tabletAnswerItems: [],
      slideX: 0,
      slideOpacity: 1,
      slidePhase: "",
      wordDragging: !1,
      wordPreviewOpen: !1,
      question: null,
      choices: [],
      favorite: !1,
      wrong: !1,
      revealed: !1,
      originalAnalysisOpen: !1,
      selected: "",
      result: "",
      position: 1,
      total: 1,
      mode: "review",
      isExam: !1,
      submitted: !1,
      remainingText: "",
      remainingSeconds: 0,
      answeredCount: 0,
      answerCard: !1,
      answerItems: [],
      resultOpen: !1,
      report: null,
      elapsedText: "",
      onlyWrong: !1,
      submitError: !1,
      fontPanel: !1,
      fontSize: 32,
      fontSizes: [28, 32, 36, 40],
      floatX: 5,
      floatY: 400,
      inkMode: !1,
      inkTool: "pen",
      inkSyncText: "",
      inkCount: 0,
      penColor: "#202124"
    },
    onLoad: function (t) {
      this._leaving = !1, this._scrollTop = 0;
      try {
        e = wx.getStorageSync(o) || {};
      } catch (t) {
        e = {};
      }
      var e,
        i = r();
      this._viewport = i, this.setData({
        readerHeight: i.height - 52,
        workspaceHeight: i.height - 56,
        isTablet: i.width >= 1e3,
        fontSize: [28, 32, 36, 40].includes(e.fontSize) ? e.fontSize : 32,
        floatX: Math.max(0, Math.min(i.width - 64, Number(e.floatX) || 5)),
        floatY: Math.max(70, Math.min(i.height - 95, Number(e.floatY) || Math.floor(.64 * i.height)))
      }), this.loadQuestion(t.id), this.question && this.restoreQuestionSlide();
    },
    loadQuestion: function (t) {
      if (this.cancelAutoAdvance(), this.flushInk(), this.question = h[t], !this.question) {
        wx.showToast({
          title: "题目不存在",
          icon: "none"
        });
        return;
      }
      var a,
        o = s.session();
      this.ids = o.ids.includes(t) ? o.ids : [t], this.isExam = n.eligible(o) && o.ids.includes(t), this.isExam && (o = n.ensure(o)), this.sessionRun = o.runId || "", this.mode = o.mode || "review", this.index = this.ids.indexOf(t), o.paperId && o.ids.includes(t) && (this.question = i._(e._({}, this.question), {
        source: i._(e._({}, this.question.source), {
          title: o.paperTitle,
          no: (o.paperNos || {})[t]
        })
      })), o.sourceOverrides && o.sourceOverrides[t] && (this.question = i._(e._({}, this.question), {
        source: e._({}, this.question.source, o.sourceOverrides[t])
      }));
      var r = !!(this.isExam && o.exam && o.exam.submittedAt);
      r && (this.reviewIds = o.examReviewIds || null), a = this.isExam ? r ? (o.answers || {})[t] : {
        selected: (o.choices || {})[t] || ""
      } : "practice" === this.mode ? (o.answers || {})[t] : "wrongReview" === o.kind && ((o.answers || {})[t] || ((o.wrongSources || {})[t] || {}).attempt) || s.read().answers[t], this._scrollTop = 0, this._swipe = null, this.setData({
        readerScrollTop: 0,
        horizontalSwipe: !1,
        slideX: 0,
        slideOpacity: 1,
        question: this.question,
        originalAnalysisOpen: !1,
        position: this.index + 1,
        total: this.ids.length,
        mode: this.mode,
        isExam: this.isExam,
        submitted: r,
        report: r ? o.exam.report : null,
        elapsedText: r ? n.time(o.exam.report.elapsedSeconds) : "",
        answerCard: !1,
        fontPanel: !1,
        onlyWrong: !!this.reviewIds
      }), this.updateChoices(a ? a.selected : "", this.isExam ? r : "study" === this.mode || !!a), this.refreshSaved(), this.loadInk(), this.refreshTabletCard(), r && o.examOpenResult && (this.setData({
        resultOpen: !0
      }), s.saveSession(i._(e._({}, o), {
        examOpenResult: !1
      }))), this.isExam && !r && this.tick();
    },
    onReady: function () {
      this.scheduleInk();
    },
    onShow: function () {
      var t = this;
      if (this.question) {
        this._leaving = !1;
        var e = s.session();
        if (this.isExam && this.sessionRun !== e.runId) {
          wx.showToast({
            title: "练习已切换，请从试卷列表继续",
            icon: "none"
          }), wx.navigateBack();
          return;
        }
        this.refreshSaved(), this.syncInkOwner(), !this.isExam || this.data.submitted || (this.tick(), this.data.submitted || this._clock || (this._clock = setInterval(function () {
          return t.tick();
        }, 500)));
      }
    },
    onHide: function () {
      this.cancelAutoAdvance(), clearTimeout(this._slideTimer), this._sliding = !1, this._swipe = null, this._wordDragging && this.cancelWordDrag(), this.setData({
        slideX: 0,
        slideOpacity: 1,
        horizontalSwipe: !1
      }), this.stopClock(), this.inkEnd(), this.flushInk();
    },
    onUnload: function () {
      this.cancelAutoAdvance(), clearTimeout(this._slideTimer), this._leaving = !0, this._wordPreviewRequest = (this._wordPreviewRequest || 0) + 1, this.stopClock(), this.destroyInk();
    },
    readerScroll: function (t) {
      var e = Math.max(0, Number(t.detail && t.detail.scrollTop) || 0);
      this._scrollTop = e, Math.abs(e - this.data.readerScrollTop) > .5 && this.setData({
        readerScrollTop: e
      });
    },
    onPageScroll: function () {},
    onResize: function () {
      this.inkEnd(), this._viewport = r(), this.setData({
        isTablet: this._viewport.width >= 1e3,
        floatX: Math.min(this.data.floatX, this._viewport.width - 64),
        floatY: Math.min(this.data.floatY, this._viewport.height - 95)
      }), this.refreshTabletCard(), this.scheduleInk();
    },
    refreshTabletCard: function () {
      var t = this;
      if (this.data.isTablet && this.question) {
        var a = s.session(),
          o = this.isExam ? n.items(a) : this.ids.map(function (t, e) {
            return {
              id: t,
              no: e + 1,
              state: (a.answers || {})[t] ? a.answers[t].ungraded ? "ungraded" : a.answers[t].correct ? "correct" : "incorrect" : "unanswered"
            };
          });
        this.setData({
          tabletAnswerItems: o.map(function (s) {
            return i._(e._({}, s), {
              current: s.id === t.question.id
            });
          }),
          answeredCount: this.isExam ? a.exam && a.exam.submittedAt ? a.exam.report.answered : Object.keys(a.choices || {}).filter(function (e) {
            return t.ids.includes(e);
          }).length : o.filter(function (t) {
            return "unanswered" !== t.state;
          }).length
        });
      }
    },
    refreshSaved: function () {
      this.question && this.setData({
        favorite: s.read().questionFavorites.includes(this.question.id),
        wrong: s.hasWrong(this.question.id)
      });
    },
    updateChoices: function (t, e) {
      var i = this.question;
      this.setData({
        originalAnalysisOpen: !!e && this.data.originalAnalysisOpen,
        stemParts: require("../../../utils/word-terms.js").parts(i.stem),
        selected: t || "",
        revealed: e,
        result: i.answer ? t ? t === i.answer ? "回答正确" : "正确答案 " + i.answer : "本题未作答 \xb7 正确答案 " + i.answer : "原库暂无标准答案",
        choices: i.options.map(function (s) {
          return {
            label: s.label,
            text: s.text,
            parts: require("../../../utils/word-terms.js").parts(s.text),
            state: e && i.answer ? s.label === i.answer ? "correct" : s.label === t ? "incorrect" : "" : s.label === t ? "selected" : ""
          };
        })
      }), this.refreshTabletCard(), this.scheduleInk();
    },
    choose: function (a) {
      if (!(this._sliding || this._wordDragging || this.data.revealed || this.data.inkMode && !this._allowInkAnswer || !this._allowInkAnswer && Date.now() < (this._ignoreChooseUntil || 0))) {
        var o = a.currentTarget.dataset.label;
        if (/^[ABCD]$/.test(o)) {
          if (this.cancelAutoAdvance(), this.isExam) {
            var r = n.choose(this.question.id, o);
            if (r.submitted) {
              this.showSubmitted();
              return;
            }
            r.ok && (this.updateChoices(o, !1), this.tick(), this.data.submitted || this.queueAutoAdvance());
            return;
          }
          if (!this.question.answer) {
            var h = s.session();
            if (h.ids.includes(this.question.id) && !s.saveSession(i._(e._({}, h), {
              answers: i._(e._({}, h.answers || {}), t._({}, this.question.id, {
                selected: o,
                ungraded: !0,
                at: Date.now()
              }))
            }))) return;
            this.updateChoices(o, !0), this.queueAutoAdvance();
            return;
          }
          s.recordAnswer(this.question.id, o, this.question.answer) && (require("./paper-practice.js").record(this.question.id, o), this.updateChoices(o, !0), this.refreshSaved(), this.queueAutoAdvance());
        }
      }
    },
    cancelAutoAdvance: function () {
      clearTimeout(this._autoNextTimer), this._autoNextTimer = null;
    },
    queueAutoAdvance: function () {
      var t = this;
      if (!this._allowInkAnswer && !this.data.inkMode && !this.data.submitted && !this.data.resultOpen) {
        var n = this.reviewIds || this.ids,
          a = this.question.id,
          o = this.sessionRun;
        n[n.indexOf(a) + 1] && (this._autoNextTimer = setTimeout(function () {
          if (t._autoNextTimer = null, !t._leaving && t.question && t.question.id === a && t.sessionRun === o && (s.session().runId || "") === o && !t.data.inkMode && !t.data.answerCard && !t.data.fontPanel && !t.data.resultOpen && !t.data.submitted && !t.data.wordPreviewOpen && !t._wordDragging && !t._sliding) {
            var n = s.session();
            (!n.inkContinue || s.saveSession(i._(e._({}, n), {
              inkContinue: !1
            }))) && t.animateQuestionMove(1);
          }
        }, 200));
      }
    },
    tick: function () {
      if (this.isExam && !this._leaving) {
        var t = s.session();
        if (t.runId !== this.sessionRun || t.exam && t.exam.submittedAt) {
          this.stopClock();
          return;
        }
        var e = n.metrics(t);
        !e || (this.setData({
          remainingText: n.time(e.remaining),
          remainingSeconds: e.remaining,
          answeredCount: e.answered
        }), e.remaining || this._autoSubmitFailed || this.finishExam("timeout"));
      }
    },
    stopClock: function () {
      this._clock && (clearInterval(this._clock), this._clock = null);
    },
    askSubmit: function () {
      var t = this;
      if (this.cancelAutoAdvance(), this.data.submitted) {
        this.showSubmitted();
        return;
      }
      var e = s.session(),
        i = n.metrics(e);
      if (i) {
        if (!i.remaining) {
          this._autoSubmitFailed = !1, this.finishExam("timeout");
          return;
        }
        wx.showModal({
          title: "确认交卷",
          content: "已完成 " + i.answered + "/" + i.total + " 道题" + (i.answered < i.total ? "，还有 " + (i.total - i.answered) + " 道未作答" : "") + "，确定现在交卷吗？",
          confirmText: "确认交卷",
          cancelText: "继续作答",
          success: function (e) {
            e.confirm && t.finishExam("manual");
          }
        });
      }
    },
    finishExam: function (t) {
      if (this.cancelAutoAdvance(), !this._submitting) {
        this._submitting = !0, this.inkEnd();
        var e = n.submit(t);
        if (this._submitting = !1, !e) {
          this._autoSubmitFailed = !0, this.stopClock(), this.setData({
            submitError: !0
          }), wx.showToast({
            title: "交卷尚未保存，点击计时处重试",
            icon: "none"
          });
          return;
        }
        this.stopClock(), this.showSubmitted();
      }
    },
    showSubmitted: function () {
      var t = s.session();
      t.exam && t.exam.submittedAt && (this.stopClock(), this.setData({
        submitted: !0,
        submitError: !1,
        inkMode: !1,
        answerCard: !1,
        fontPanel: !1,
        resultOpen: !0,
        report: t.exam.report,
        elapsedText: n.time(t.exam.report.elapsedSeconds),
        answeredCount: t.exam.report.answered
      }), this.updateChoices((t.answers[this.question.id] || {}).selected || "", !0), this.refreshSaved());
    },
    showAnswerCard: function () {
      var t = this;
      if (this.cancelAutoAdvance(), !this.data.answerCard) {
        this.inkEnd(), this._cardInkMode = !!this.data.inkMode;
        var a = this._viewport || r(),
          o = a.width >= 760 ? 58 : a.width / 750 * 92;
        this.setData({
          inkMode: !1,
          fontPanel: !1,
          horizontalSwipe: !1,
          slideX: 0,
          slideOpacity: 1,
          answerSheetHeight: Math.min(.58 * a.height, Math.ceil(this.ids.length / 7) * o + 6)
        }), this._swipe = null;
        var h = s.session();
        this.setData({
          answerCard: !0,
          answerItems: (this.isExam ? n.items(h) : this.ids.map(function (t, e) {
            return {
              id: t,
              no: e + 1,
              state: (h.answers || {})[t] ? h.answers[t].ungraded ? "ungraded" : h.answers[t].correct ? "correct" : "incorrect" : "unanswered"
            };
          })).map(function (s) {
            return i._(e._({}, s), {
              current: s.id === t.question.id
            });
          })
        });
      }
    },
    closeAnswerCard: function () {
      this.setData({
        answerCard: !1,
        inkMode: !!this._cardInkMode
      }), this._cardInkMode = !1, this.scheduleInk();
    },
    jumpQuestion: function (t) {
      this.setReviewIds(null), this.setData({
        resultOpen: !1,
        onlyWrong: !1
      }), this.navigateQuestion(t.currentTarget.dataset.id);
    },
    noop: function () {},
    reviewAll: function () {
      this.setReviewIds(null), this.setData({
        resultOpen: !1,
        onlyWrong: !1
      }), this.navigateQuestion(this.ids[0]);
    },
    reviewWrong: function () {
      var t = this.data.report;
      t && t.wrong && (this.setReviewIds(t.items.filter(function (t) {
        return "incorrect" === t.state;
      }).map(function (t) {
        return t.id;
      })), this.setData({
        resultOpen: !1,
        onlyWrong: !0
      }), this.navigateQuestion(this.reviewIds[0]));
    },
    showAllQuestions: function () {
      this.setReviewIds(null), this.setData({
        onlyWrong: !1
      });
    },
    setReviewIds: function (t) {
      this.reviewIds = t;
      var n = s.session();
      this.isExam && s.saveSession(i._(e._({}, n), {
        examReviewIds: t
      }));
    },
    leaveExam: function () {
      wx.navigateBack();
    },
    toggleOriginalAnalysis: function () {
      this.setData({
        originalAnalysisOpen: !this.data.originalAnalysisOpen
      }), this.scheduleInk();
    },
    reveal: function () {
      this.isExam || this.updateChoices("", !0);
    },
    redo: function () {
      this.isExam || this.updateChoices("", !1);
    },
    favorite: function () {
      this.setData({
        favorite: s.toggle("questionFavorites", this.question.id)
      });
    },
    removeWrong: function () {
      s.removeWrong(this.question.id), this.refreshSaved();
    },
    swipeStart: function (t) {
      if (this.data.inkMode || this.data.answerCard || this.data.fontPanel || this.data.resultOpen || !t.touches || 1 !== t.touches.length) {
        this._swipe = null;
        return;
      }
      var e = t.touches[0];
      this._swipe = {
        x: e.clientX,
        y: e.clientY,
        at: Date.now()
      };
    },
    swipeEnd: function (t) {
      var e = this._swipe;
      if (this._swipe = null, e && !this.data.inkMode && !this.data.answerCard && !this.data.resultOpen) {
        var i = t.changedTouches && t.changedTouches[0];
        if (i) {
          var s = i.clientX - e.x,
            n = i.clientY - e.y;
          Date.now() - e.at > 1e3 || 55 > Math.abs(s) || Math.abs(s) < 1.4 * Math.abs(n) || this.move(s < 0 ? 1 : -1);
        }
      }
    },
    previous: function () {
      this.move(-1);
    },
    next: function () {
      this.move(1);
    },
    move: function (t) {
      var e = this.reviewIds || this.ids,
        i = e.indexOf(this.question.id),
        s = e[i + t];
      s ? this.navigateQuestion(s) : wx.showToast({
        title: t > 0 ? "已是最后一题" : "已是第一题",
        icon: "none"
      });
    },
    navigateQuestion: function (t, e) {
      this.cancelAutoAdvance(), t && (this.inkEnd(), this.flushInk(), this.setData({
        answerCard: !1,
        inkMode: !!e
      }), h[t] ? (this.loadQuestion(t), wx.pageScrollTo && wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      })) : (this.stopClock(), s.openQuestion(t, null, !0)));
    },
    addNeedStudy: function (t) {
      var e = t.currentTarget.dataset.wordId;
      e && (this._ignoreChooseUntil = Date.now() + 600, require("../../../utils/needs-study.js").add(e, this.question.id) && wx.showToast({
        title: "已加入需要学习",
        icon: "none"
      }));
    },
    openFont: function () {
      this.cancelAutoAdvance(), this.inkEnd(), this.setData({
        fontPanel: !this.data.fontPanel,
        inkMode: !1
      });
    },
    selectFont: function (t) {
      var e = Number(t.currentTarget.dataset.size);
      [28, 32, 36, 40].includes(e) && (this.flushInk(), this.setData({
        fontSize: e,
        fontPanel: !1
      }), this.savePreferences(), this.loadInk());
    },
    savePreferences: function () {
      try {
        wx.setStorageSync(o, {
          fontSize: this.data.fontSize,
          floatX: this.data.floatX,
          floatY: this.data.floatY
        });
      } catch (t) {}
    },
    floatStart: function (t) {
      var e = t.touches && t.touches[0];
      e && (this._floatStart = {
        x: e.clientX,
        y: e.clientY,
        left: this.data.floatX,
        top: this.data.floatY,
        at: Date.now()
      }, this._floatMoved = !1);
    },
    floatMove: function (t) {
      if (this._floatStart) {
        var e = t.touches && t.touches[0];
        if (e) {
          var i = this._floatStart,
            s = e.clientX - i.x,
            n = e.clientY - i.y;
          if (Math.abs(s) + Math.abs(n) > 12 && (this._floatMoved = !0), this._floatMoved) {
            var a = this._viewport || r();
            this.setData({
              floatX: Math.max(0, Math.min(a.width - 64, i.left + s)),
              floatY: Math.max(65, Math.min(a.height - 95, i.top + n))
            });
          }
        }
      }
    },
    floatEnd: function (t) {
      if (this._floatStart) {
        var e = this._floatMoved;
        this._floatStart = null, this._floatMoved = !1, this._floatIgnoreTapUntil = Date.now() + 400, e ? this.savePreferences() : t && "touchcancel" === t.type || this.showAnswerCard();
      }
    },
    floatTap: function () {
      Date.now() < (this._floatIgnoreTapUntil || 0) || this.showAnswerCard();
    }
  };
  return Object.assign(d, a, require("./quiz-word-actions.js"), require("./quiz-slide.js")), d;
};
