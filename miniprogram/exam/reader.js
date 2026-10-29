Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../@swc/runtime/_async_to_generator.js"),
  i = require("../@swc/runtime/_object_spread.js"),
  e = require("../@swc/runtime/_object_spread_props.js"),
  s = require("../@swc/runtime/_ts_generator.js"),
  a = require("./utils/api.js"),
  n = require("./utils/store.js");
function r() {
  try {
    var t = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    return {
      width: t.windowWidth,
      height: t.windowHeight
    };
  } catch (t) {
    return {
      width: 375,
      height: 760
    };
  }
}
Page(require("./utils/analysis-notes.js").install({
  data: {
    ready: !1,
    loading: !1,
    error: "",
    question: null,
    material: null,
    materialExpanded: !1,
    materialResizing: !1,
    materialReset: 0,
    materialSwiping: !1,
    materialSlideX: 0,
    materialSlidePhase: "",
    materialHeight: 220,
    materialMin: 100,
    materialMax: 500,
    materialScrollTop: 0,
    position: 1,
    total: 1,
    selected: "",
    choices: [],
    revealed: !1,
    multiple: !1,
    fontSize: 32,
    fontPx: 16,
    fontPanel: !1,
    fontSizes: [28, 32, 36, 40],
    inkMode: !1,
    penColor: "#202124",
    inkTool: "pen",
    favorite: !1,
    wrong: !1,
    isExam: !0,
    remainingText: "",
    submitError: !1,
    submitted: !1,
    answerCard: !1,
    answerItems: [],
    answeredCount: 0,
    answerSheetHeight: 250,
    resultOpen: !1,
    report: null,
    elapsedText: "",
    analysisParts: [],
    analysisLoading: !1,
    analysisError: "",
    originalAnalysisOpen: !1,
    analysisSummary: [],
    resultText: "",
    materialCaption: "",
    readerHeight: 600,
    workspaceHeight: 596,
    slideX: 0,
    slideOpacity: 1,
    slidePhase: "",
    horizontalSwipe: !1,
    onlyWrong: !1
  },
  onLoad: function (t) {
    var i = this;
    if (this.module = a.moduleInfo(t.module), this.run = n.getRun(t.run), this._owner = n.owner(), this._viewport = r(), this._hidden = !1, this._request = 0, this._materialPositions = {}, this._materialScrollTop = 0, this._questionScrollTop = 0, !this.module || !this.run || this.run.module !== this.module.id) {
      this.setData({
        error: "未找到这次练习，请返回重新进入"
      });
      return;
    }
    this.viewIds = this.run.ids.slice(), this.cursor = this.run.readOnly || this.run.submittedAt ? 0 : Math.max(0, this.run.ids.findIndex(function (t) {
      return !i.run.choices[t];
    }));
    var e = {};
    try {
      e = wx.getStorageSync("jiabao.quiz-preferences.v1") || {};
    } catch (t) {}
    this._materialRatio = Number.isFinite(e.materialPaneRatio) ? e.materialPaneRatio : .35, this.sizeMaterial();
    var s = [28, 32, 36, 40].includes(e.fontSize) ? e.fontSize : 32;
    this.setData({
      ready: !0,
      fontSize: s,
      fontPx: s * (this._viewport.width >= 760 ? .75 : this._viewport.width / 750),
      total: this.run.ids.length,
      isExam: !this.run.readOnly,
      submitted: !!this.run.submittedAt,
      report: this.run.report,
      resultOpen: !!(t.result && this.run.report),
      elapsedText: this.run.report ? n.time(this.run.report.elapsedSeconds) : ""
    }), wx.setNavigationBarTitle({
      title: this.module.name + "真题"
    }), this.data.resultOpen || this.loadQuestion(this.cursor);
  },
  onShow: function () {
    var t = this,
      i = this._hidden;
    if (this._hidden = !1, this.run && this._owner !== n.owner()) {
      wx.showToast({
        title: "账号已切换，请重新进入练习",
        icon: "none"
      }), wx.navigateBack();
      return;
    }
    if (this.run) {
      var e = this.run.currentId;
      this.run = n.getRun(this.run.id) || this.run, e && (this.run.currentId = e), !this.run.submittedAt || this.run.submissionApplied || this.run.readOnly || this.finish(this.run.report.reason), this.tick(), this.run.readOnly || this.run.submittedAt || this._clock || (this._clock = setInterval(function () {
        return t.tick();
      }, 500)), i && this.data.loading && !this.data.resultOpen && this.loadQuestion(this.cursor);
    }
  },
  onHide: function () {
    this.pauseAnalysisNote(), this.abortMaterialResize(), this._materialSwipe = null, this._materialSlideBusy = !1, this._hidden = !0, this._request++, this.cancelAuto(), this.endInk(), this.stopClock(), clearTimeout(this._slideTimer), this._slideBusy = !1, this.setData({
      slideX: 0,
      horizontalSwipe: !1,
      materialSlideX: 0,
      materialSlidePhase: "",
      materialSwiping: !1
    });
  },
  onUnload: function () {
    this.onHide();
  },
  onResize: function () {
    this.endInk(), this.abortMaterialResize(), this._materialSwipe && this.materialSwipeCancel(), this._viewport = r(), this.sizeMaterial(), this.setData({
      fontPx: this.data.fontSize * (this._viewport.width >= 760 ? .75 : this._viewport.width / 750)
    }), this.refreshInk();
  },
  stopClock: function () {
    this._clock && clearInterval(this._clock), this._clock = null;
  },
  tick: function () {
    var t = this;
    if (this.run && !this.run.readOnly && !this._hidden) {
      if (this.run.submittedAt) {
        this.stopClock();
        return;
      }
      var i = Math.max(0, Math.ceil((this.run.deadlineAt - Date.now()) / 1e3));
      this.setData({
        remainingText: n.time(i),
        answeredCount: this.run.ids.filter(function (i) {
          return !!t.run.choices[i];
        }).length
      }), i || this._autoSubmitFailed || this.finish("timeout");
    }
  },
  loadQuestion: function (r) {
    return t._(function () {
      var t, l, h, o, u, d, c, m, f, p, w, g, _, v;
      return s._(this, function (s) {
        switch (s.label) {
          case 0:
            if (t = this, r < 0 || r >= this.viewIds.length) return [2, !1];
            this.endInk(), this.cancelAuto(), this.resetAnalysisNotes(), this.cursor = r, l = this.viewIds[r], h = ++this._request, this.run.currentId = l, this.setData({
              loading: !0,
              error: "",
              analysisError: "",
              originalAnalysisOpen: !1,
              fontPanel: !1
            }), s.label = 1;
          case 1:
            return s.trys.push([1, 3,, 4]), [4, a.question(this.module.id, l)];
          case 2:
            var S, y, k, I, x;
            if (o = s.sent(), h !== this._request || this._hidden || this._owner !== n.owner()) return [2, !1];
            return this.run.currentId = l, u = this.run.choices[l] || "", d = this.run.readOnly || !!this.run.submittedAt, c = o.materialId, (m = this.data.material && this.data.material.id) && m !== c && (this._materialPositions[m] = this._materialScrollTop || 0), f = c === m ? this._materialScrollTop || 0 : this._materialPositions[c] || 0, this._materialScrollTop = f, this._questionScrollTop = 0, p = this.run.blocks.find(function (t) {
              return t.ids.includes(l);
            }), w = c ? p && p.ids.length > 1 ? "共用材料 \xb7 第 " + (p.ids.indexOf(l) + 1) + " / " + p.ids.length + " 小题" : "共用材料" : "", this.setData({
              question: e._(i._({}, o), {
                source: this.run.origins[l] || o.source,
                shortSource: (y = (S = this.run.origins[l] || o.source || {}).title || "", k = S.year || (y.match(/20\d{2}/) || [])[0] || "", I = S.region || "", k + ("national" === S.group || /国家公务员|国考/.test(y) ? "国考" : I ? I.replace(/[省市]$/, "") + "省考" : "考试") + ((x = (y.match(/副省级|地市级|行政执法|县乡|乡镇|公检法|省直|市县|申论[一二三]|综合管理/g) || [])[0] || "") ? "（" + x + "）" : ""))
              }),
              material: o.material,
              materialCaption: w,
              loading: !1,
              position: this.run.ids.indexOf(l) + 1,
              selected: u,
              revealed: d,
              multiple: o.multiple,
              analysisParts: [],
              analysisSummary: [],
              resultText: o.answer ? this.run.readOnly ? "参考答案 " + o.answer : u === o.answer ? "回答正确 \xb7 " + o.answer : u ? "正确答案 " + o.answer : "本题未作答 \xb7 正确答案 " + o.answer : o.answerConflict ? "原库答案存在差异，本题暂不判分" : "原库暂缺标准答案，本题暂不判分"
            }), c !== m && (this.setData({
              materialScrollTop: f + 1
            }), g = function () {
              return t.setData({
                materialScrollTop: f
              });
            }, wx.nextTick ? wx.nextTick(g) : g()), this.updateChoices(u), this.refreshSaved(), this.refreshInk(), d && (this.loadAnalysis(), this.loadAnalysisNotes()), a.prefetch(this.module.id, this.viewIds[r + 1]), (_ = this.materialTarget(1)) >= 0 && _ !== r + 1 && a.prefetch(this.module.id, this.viewIds[_]), [2, !0];
          case 3:
            return v = s.sent(), h === this._request && this.setData({
              loading: !1,
              error: v.message
            }), [2, !1];
          case 4:
            return [2];
        }
      });
    }).apply(this);
  },
  retry: function () {
    this.loadQuestion(this.cursor);
  },
  updateChoices: function (t) {
    if (this.data.question) {
      var s = this.data.question.answer || "",
        a = this.data.revealed;
      this.setData({
        selected: t,
        choices: this.data.question.options.map(function (n) {
          return e._(i._({}, n), {
            selected: t.includes(n.label),
            state: a && s ? s.includes(n.label) ? "correct" : t.includes(n.label) ? "incorrect" : "" : t.includes(n.label) ? "selected" : ""
          });
        })
      });
    }
  },
  refreshSaved: function () {
    if (this.run && this.data.question) {
      var t = n.read(this.module.id),
        i = this.data.question.id,
        e = this.run.origins[i];
      this.setData({
        favorite: t.favorites.includes(i),
        wrong: Object.values(t.wrongs).some(function (t) {
          return t.id === i && t.source.paperId === e.paperId;
        })
      });
    }
  },
  choose: function (t) {
    var i = this;
    if (!(!this.run || this._slideBusy || this.data.loading || this.data.error || this.data.revealed || this.data.answerCard || Date.now() < (this._ignoreChooseUntil || 0) || this.data.inkMode && !this._toolbarAnswer || (this.cancelAuto(), this.tick(), this.run.submittedAt || Date.now() >= this.run.deadlineAt))) {
      var e = t.currentTarget.dataset.label;
      if (this.data.choices.some(function (t) {
        return t.label === e;
      })) {
        var s = e;
        if (this.data.multiple) {
          var a = this.data.selected.split(""),
            r = a.indexOf(e);
          r < 0 ? a.push(e) : a.splice(r, 1), s = a.sort().join("");
        }
        if (n.choose(this.run, s) && (this.updateChoices(s), this.tick(), !this.data.multiple && !this._toolbarAnswer)) {
          var l = this.run.currentId;
          this._autoTimer = setTimeout(function () {
            i._hidden || i.data.answerCard || i.data.fontPanel || i.data.inkMode || i.run.currentId !== l || i.move(1, !1);
          }, 200);
        }
      }
    }
  },
  confirmMultiple: function () {
    if (!this.data.selected) {
      wx.showToast({
        title: "请至少选择一个选项",
        icon: "none"
      });
      return;
    }
    this.cancelAuto(), this.move(1, !0);
  },
  inkAnswer: function (t) {
    this._toolbarAnswer = !0;
    try {
      this.choose(t);
    } finally {
      this._toolbarAnswer = !1;
    }
    this.data.multiple || this.data.selected !== t.currentTarget.dataset.label || this.move(1, !0);
  },
  cancelAuto: function () {
    clearTimeout(this._autoTimer), this._autoTimer = null;
  },
  move: function (i, e) {
    return t._(function () {
      var a, n, r;
      return s._(this, function (l) {
        return this._slideBusy || this.data.loading || this.data.resultOpen || (a = this.cursor + i) < 0 || a >= this.viewIds.length || (this.cancelAuto(), this.endInk(), this._slideBusy = !0, n = this._readerWidth || this._viewport.width, this.setData({
          slideX: -i * n,
          slidePhase: "departing",
          horizontalSwipe: !1
        }), r = this, this._slideTimer = setTimeout(t._(function () {
          var t;
          return s._(this, function (s) {
            switch (s.label) {
              case 0:
                return [4, r.loadQuestion(a)];
              case 1:
                if (!s.sent() || r._hidden) return r._slideBusy = !1, r.setData({
                  slideX: 0
                }), [2];
                return r.setData({
                  slideX: i * n,
                  slidePhase: "tracking",
                  inkMode: !!e && r.data.inkMode
                }), t = function () {
                  r.setData({
                    slideX: 0,
                    slidePhase: "settling"
                  }), r._slideTimer = setTimeout(function () {
                    r._slideBusy = !1, r.refreshInk();
                  }, 280);
                }, wx.nextTick ? wx.nextTick(t) : setTimeout(t, 16), [2];
            }
          });
        }), 180)), [2];
      });
    }).apply(this);
  },
  swipeStart: function (t) {
    if (this.cancelAuto(), this.data.inkMode || this.data.answerCard || this.data.fontPanel || this.data.loading || this.data.resultOpen || this.data.materialResizing || this.data.materialSwiping || this._slideBusy || !t.touches || 1 !== t.touches.length) {
      this._swipe = null;
      return;
    }
    var i = t.touches[0];
    this._swipe = {
      x: i.clientX,
      y: i.clientY,
      at: Date.now(),
      horizontal: !1
    };
  },
  swipeMove: function (t) {
    var i = this._swipe,
      e = t.touches && t.touches[0];
    if (i && e) {
      var s = e.clientX - i.x,
        a = e.clientY - i.y;
      if (!i.horizontal) {
        if (Math.abs(a) > 18 && Math.abs(a) > Math.abs(s)) {
          this._swipe = null;
          return;
        }
        if (12 > Math.abs(s) || Math.abs(s) < 1.4 * Math.abs(a)) return;
        i.horizontal = !0;
      }
      var n = s > 0 ? 0 === this.cursor : this.cursor === this.viewIds.length - 1;
      this.setData({
        horizontalSwipe: !0,
        slideX: n ? .2 * s : s,
        slidePhase: "tracking"
      });
    }
  },
  swipeEnd: function (t) {
    var i = this._swipe;
    if (this._swipe = null, this.setData({
      horizontalSwipe: !1
    }), i) {
      var e = t.changedTouches && t.changedTouches[0];
      if (e) {
        var s = e.clientX - i.x,
          a = e.clientY - i.y;
        Math.abs(s) > 55 && Math.abs(s) > 1.4 * Math.abs(a) && Date.now() - i.at < 1e3 ? this.move(s < 0 ? 1 : -1, !1) : this.setData({
          slideX: 0,
          slidePhase: "settling"
        });
      }
    }
  },
  swipeCancel: function () {
    this._swipe = null, this.setData({
      horizontalSwipe: !1,
      slideX: 0,
      slidePhase: "settling"
    });
  },
  answerItems: function () {
    var t = this,
      i = this.run.report;
    return this.run.ids.map(function (e, s) {
      return {
        id: e,
        no: s + 1,
        state: i ? i.items[s].state : t.run.choices[e] ? "answered" : "unanswered",
        current: e === t.run.currentId
      };
    });
  },
  showAnswerCard: function () {
    var t = this;
    this.run && (this.cancelAuto(), this.endInk(), this._cardInk = this.data.inkMode, this.setData({
      inkMode: !1,
      fontPanel: !1,
      answerCard: !0,
      answerItems: this.answerItems(),
      answeredCount: this.run.ids.filter(function (i) {
        return !!t.run.choices[i];
      }).length,
      answerSheetHeight: Math.min(.58 * this._viewport.height, Math.ceil(this.run.ids.length / 7) * (this._viewport.width >= 760 ? 58 : this._viewport.width / 750 * 92) + 6)
    }));
  },
  closeAnswerCard: function () {
    this.setData({
      answerCard: !1,
      inkMode: !!this._cardInk
    }), this._cardInk = !1, this.refreshInk();
  },
  jump: function (t) {
    this.cancelAuto(), this.viewIds = this.run.ids.slice();
    var i = t.currentTarget.dataset.id;
    this.setData({
      answerCard: !1,
      resultOpen: !1,
      onlyWrong: !1,
      slideX: 0,
      slidePhase: "",
      inkMode: !!this._cardInk
    }), this._cardInk = !1, this.loadQuestion(this.viewIds.indexOf(i));
  },
  askSubmit: function () {
    var t = this;
    if (this.cancelAuto(), this.run.report) {
      this.run.submissionApplied || this.run.readOnly ? this.showResults() : this.finish(this.run.report.reason);
      return;
    }
    if (!this.run.readOnly && (this.tick(), !this.run.submittedAt)) {
      var i = this.run.ids.filter(function (i) {
        return !!t.run.choices[i];
      }).length;
      wx.showModal({
        title: "确认交卷",
        content: "已完成 " + i + "/" + this.run.ids.length + " 道题，确定现在交卷吗？",
        confirmText: "确认交卷",
        cancelText: "继续作答",
        success: function (i) {
          i.confirm && (t._autoSubmitFailed = !1, t.finish("manual"));
        }
      });
    }
  },
  finish: function (t) {
    if (!this._submitting) {
      this._submitting = !0, this.cancelAuto(), this.endInk();
      var i = n.submit(this.run, t);
      if (this._submitting = !1, !i) {
        this._autoSubmitFailed = !0, this.stopClock(), this.setData({
          submitError: !0
        });
        return;
      }
      this.showResults();
    }
  },
  showResults: function () {
    this._materialSwipe = null, this._materialSlideBusy = !1, this.abortMaterialResize(), this.stopClock(), this.endInk(), clearTimeout(this._slideTimer), this._slideBusy = !1, this._request++, this.setData({
      loading: !1,
      report: this.run.report,
      elapsedText: n.time(this.run.report.elapsedSeconds),
      submitted: !0,
      resultOpen: !0,
      materialSlideX: 0,
      materialSwiping: !1,
      materialSlidePhase: "",
      answerCard: !1,
      inkMode: !1,
      submitError: !1
    });
  },
  reviewAll: function () {
    this.viewIds = this.run.ids.slice(), this.setData({
      resultOpen: !1,
      onlyWrong: !1,
      slideX: 0
    }), this.loadQuestion(0);
  },
  reviewWrong: function () {
    var t = this.run.report.items.filter(function (t) {
      return "incorrect" === t.state;
    }).map(function (t) {
      return t.id;
    });
    t.length && (this.viewIds = t, this.setData({
      resultOpen: !1,
      onlyWrong: !0,
      slideX: 0
    }), this.loadQuestion(0));
  },
  showAll: function () {
    this.viewIds = this.run.ids.slice(), this.setData({
      onlyWrong: !1
    }), this.loadQuestion(this.viewIds.indexOf(this.run.currentId));
  },
  leave: function () {
    wx.navigateBack();
  },
  noop: function () {},
  imageChoice: function (t) {
    this.choose({
      currentTarget: {
        dataset: {
          label: t.detail.label
        }
      }
    });
  },
  previewing: function () {
    this.cancelAuto(), this._ignoreChooseUntil = Date.now() + 900;
  },
  favorite: function () {
    if (this.data.question) {
      var t = n.toggleFavorite(this.module.id, this.data.question.id);
      null !== t && this.setData({
        favorite: t
      });
    }
  },
  removeWrong: function () {
    var t = this.data.question.id,
      i = this.run.origins[t],
      e = n.read(this.module.id),
      s = Object.keys(e.wrongs).filter(function (s) {
        return e.wrongs[s].id === t && e.wrongs[s].source.paperId === i.paperId;
      });
    n.removeWrong(this.module.id, s) && this.refreshSaved();
  },
  loadAnalysis: function () {
    return t._(function () {
      var t, n, r, l, h, o, u, d, c, m, f, p, w, g, _, v, S, y, k, I;
      return s._(this, function (s) {
        switch (s.label) {
          case 0:
            if (!this.data.question) return [2];
            n = (t = this.data.question).id, this.setData({
              analysisLoading: !0,
              analysisError: ""
            }), s.label = 1;
          case 1:
            return s.trys.push([1, 3,, 4]), [4, a.analysis(this.module.id, t)];
          case 2:
            if (r = s.sent(), this._hidden || !this.data.question || this.data.question.id !== n) return [2];
            l = 0, h = Array.isArray(t.simpleAnalysis) ? t.simpleAnalysis.map(function (t) {
              return {
                type: "text",
                text: t
              };
            }) : [], o = !0, u = !1, d = void 0;
            try {
              for (c = (h.length ? [] : r)[Symbol.iterator](); !(o = (m = c.next()).done) && (f = m.value, !(l > 260)); o = !0) if ("text" === f.type) {
                p = (f.text.match(/[^。！？]+[。！？]?/g) || []).filter(Boolean), w = "", g = !0, _ = !1, v = void 0;
                try {
                  for (S = p[Symbol.iterator](); !(g = (y = S.next()).done) && (k = y.value, (!(w.length + k.length > 320) || !w) && !((w += k).length > 200)); g = !0);
                } catch (t) {
                  _ = !0, v = t;
                } finally {
                  try {
                    g || null == S.return || S.return();
                  } finally {
                    if (_) throw v;
                  }
                }
                w && (h.push(e._(i._({}, f), {
                  text: w
                })), l += w.length);
              } else h.push(f), l += 20;
            } catch (t) {
              u = !0, d = t;
            } finally {
              try {
                o || null == c.return || c.return();
              } finally {
                if (u) throw d;
              }
            }
            return this.setData({
              analysisParts: r,
              analysisSummary: h,
              analysisLoading: !1
            }), this.refreshInk(), [3, 4];
          case 3:
            return I = s.sent(), this.setData({
              analysisLoading: !1,
              analysisError: I.message
            }), [3, 4];
          case 4:
            return [2];
        }
      });
    }).apply(this);
  },
  toggleOriginal: function () {
    this.setData({
      originalAnalysisOpen: !this.data.originalAnalysisOpen
    }), this.refreshInk();
  },
  openFont: function () {
    this.cancelAuto(), this.setData({
      fontPanel: !this.data.fontPanel
    });
  },
  selectFont: function (t) {
    this.endInk();
    var s = Number(t.currentTarget.dataset.size);
    if ([28, 32, 36, 40].includes(s)) {
      this.setData({
        fontSize: s,
        fontPx: s * (this._viewport.width >= 760 ? .75 : this._viewport.width / 750),
        fontPanel: !1
      });
      try {
        wx.setStorageSync("jiabao.quiz-preferences.v1", e._(i._({}, wx.getStorageSync("jiabao.quiz-preferences.v1") || {}), {
          fontSize: s
        }));
      } catch (t) {}
      this.refreshInk();
    }
  },
  toggleInk: function () {
    this.cancelAuto(), this.endInk(), this.setData({
      inkMode: !this.data.inkMode,
      fontPanel: !1
    }), this.refreshInk();
  },
  inkColor: function (t) {
    this.endInk(), this.setData({
      penColor: t.currentTarget.dataset.color,
      inkTool: "pen"
    });
  },
  eraser: function () {
    this.endInk(), this.setData({
      inkTool: "eraser" === this.data.inkTool ? "pen" : "eraser"
    });
  },
  clearInk: function () {
    for (var t = 0, i = ["#questionInk", "#materialInk"]; t < i.length; t++) {
      var e = i[t],
        s = this.selectComponent(e);
      s && s.clear();
    }
  },
  endInk: function () {
    if (this.selectComponent) for (var t = 0, i = ["#questionInk", "#materialInk"]; t < i.length; t++) {
      var e = i[t],
        s = this.selectComponent(e);
      s && s.end();
    }
  },
  materialScroll: function (t) {
    this._materialScrollTop = t.detail.scrollTop || 0, this.syncInkScroll("#materialInk", this._materialScrollTop);
  },
  questionScroll: function (t) {
    this._questionScrollTop = t.detail.scrollTop || 0, this.syncInkScroll("#questionInk", this._questionScrollTop);
  },
  syncInkScroll: function (t, i) {
    var e = this.selectComponent && this.selectComponent(t);
    e && e.setScrollTop && e.setScrollTop(i);
  },
  materialTarget: function (t) {
    var i = this;
    if (!this.run || !this.data.material) return -1;
    var e = this.run.blocks,
      s = e.findIndex(function (t) {
        return t.ids.includes(i.run.currentId);
      });
    if (s < 0) return -1;
    for (var a = s + t; a >= 0 && a < e.length; a += t) {
      var n = e[a];
      if (n.materialId && n.materialId !== this.data.material.id) {
        var r = n.ids.find(function (t) {
          return i.viewIds.includes(t);
        });
        if (r) return this.viewIds.indexOf(r);
      }
    }
    return -1;
  },
  materialSwipeStart: function (t) {
    if (this.cancelAuto(), this.data.inkMode || this.data.materialResizing || this.data.loading || this.data.answerCard || this.data.fontPanel || this.data.resultOpen || this._slideBusy || !t.touches || 1 !== t.touches.length) {
      this._materialSwipe = null;
      return;
    }
    var i = t.touches[0];
    this._materialSwipe = {
      x: i.clientX,
      y: i.clientY,
      at: Date.now(),
      horizontal: !1
    };
  },
  materialSwipeMove: function (t) {
    var i = this._materialSwipe,
      e = t.touches && t.touches[0];
    if (i && e) {
      var s = e.clientX - i.x,
        n = e.clientY - i.y;
      if (!i.horizontal) {
        if (Math.abs(n) > 18 && Math.abs(n) > Math.abs(s)) {
          this._materialSwipe = null;
          return;
        }
        if (12 > Math.abs(s) || Math.abs(s) < 1.4 * Math.abs(n)) return;
        i.horizontal = !0;
        var r = this.materialTarget(s < 0 ? 1 : -1);
        r >= 0 && a.prefetch(this.module.id, this.viewIds[r]);
      }
      var l = 0 > this.materialTarget(s < 0 ? 1 : -1);
      this.setData({
        materialSwiping: !0,
        materialSlideX: l ? .18 * s : s,
        materialSlidePhase: "tracking"
      });
    }
  },
  materialSwipeEnd: function (t) {
    var i = this._materialSwipe;
    this._materialSwipe = null, this.setData({
      materialSwiping: !1
    });
    var e = t.changedTouches && t.changedTouches[0];
    if (i && e && i.horizontal && Math.abs(e.clientX - i.x) > 55 && Math.abs(e.clientX - i.x) > 1.4 * Math.abs(e.clientY - i.y) && Date.now() - i.at < 1200) {
      this.moveMaterial(e.clientX < i.x ? 1 : -1);
      return;
    }
    this.setData({
      materialSlideX: 0,
      materialSlidePhase: "settling"
    });
  },
  materialSwipeCancel: function () {
    this._materialSwipe = null, this.setData({
      materialSwiping: !1,
      materialSlideX: 0,
      materialSlidePhase: "settling"
    });
  },
  moveMaterial: function (i) {
    var e = this.materialTarget(i);
    if (e < 0 || this._slideBusy || this.data.loading) {
      this.setData({
        materialSlideX: 0,
        materialSlidePhase: "settling"
      });
      return;
    }
    this.cancelAuto(), this.endInk(), this._slideBusy = !0, this._materialSlideBusy = !0;
    var a = this._viewport.width;
    this.setData({
      materialSwiping: !1,
      materialSlideX: -i * a,
      materialSlidePhase: "departing"
    });
    var n = this;
    this._slideTimer = setTimeout(t._(function () {
      var t;
      return s._(this, function (s) {
        switch (s.label) {
          case 0:
            return [4, n.loadQuestion(e)];
          case 1:
            if (!s.sent() || n._hidden) return n._slideBusy = !1, n._materialSlideBusy = !1, n.setData({
              materialSlideX: 0
            }), [2];
            return n.setData({
              materialSlideX: i * a,
              materialSlidePhase: "tracking"
            }), t = function () {
              n.setData({
                materialSlideX: 0,
                materialSlidePhase: "settling"
              }), n._slideTimer = setTimeout(function () {
                n._slideBusy = !1, n._materialSlideBusy = !1, n.refreshInk();
              }, 280);
            }, wx.nextTick ? wx.nextTick(t) : setTimeout(t, 16), [2];
        }
      });
    }), 180);
  },
  materialLimits: function () {
    var t = this._viewport.width,
      i = Math.max(180, this._viewport.height - (t >= 760 ? 102 : 104 * t / 750 + 22)),
      e = Math.min(t >= 760 ? 140 : 100, .3 * i);
    return {
      total: i,
      min: e,
      max: Math.max(e, Math.min(.76 * i, i - 175))
    };
  },
  sizeMaterial: function () {
    var t = this.materialLimits(),
      i = Math.max(.15, Math.min(.78, this._materialRatio || .35)),
      e = Math.round(Math.max(t.min, Math.min(t.max, t.total * i)));
    this.setData({
      materialHeight: e,
      materialMin: t.min,
      materialMax: t.max,
      materialExpanded: e / t.total >= .5,
      materialResizing: !1
    });
  },
  abortMaterialResize: function () {
    this._materialResizing && (this._materialResizing = !1, this.setData({
      materialResizing: !1,
      materialReset: this.data.materialReset + 1
    }));
  },
  startMaterialResize: function () {
    this.cancelAuto(), this.endInk(), this._swipe = null, this._materialResizing = !0, this.setData({
      materialResizing: !0,
      horizontalSwipe: !1,
      slideX: 0
    });
  },
  finishMaterialResize: function (t) {
    var i = this.materialLimits(),
      e = Math.round(Math.max(i.min, Math.min(i.max, Number(t.height) || this.data.materialHeight)));
    this._materialResizing = !1, this._materialRatio = e / i.total, this.setData({
      materialHeight: e,
      materialExpanded: this._materialRatio >= .5,
      materialResizing: !1
    }), this.saveMaterialSize(), this.refreshInk();
  },
  saveMaterialSize: function () {
    try {
      var t = wx.getStorageSync("jiabao.quiz-preferences.v1") || {};
      wx.setStorageSync("jiabao.quiz-preferences.v1", e._(i._({}, t), {
        materialPaneRatio: this._materialRatio
      }));
    } catch (t) {}
  },
  toggleMaterial: function () {
    this.endInk(), this._materialRatio = this.data.materialExpanded ? .35 : .56, this.sizeMaterial(), this.saveMaterialSize(), this.refreshInk();
  },
  refreshInk: function () {
    var t = this;
    clearTimeout(this._inkRefresh), this._inkRefresh = setTimeout(function () {
      if (!t._hidden && wx.createSelectorQuery) {
        wx.createSelectorQuery().in(t).select(".question-scroll").boundingClientRect(function (i) {
          i && (t._readerWidth = i.width, t.data.readerHeight !== i.height && t.setData({
            readerHeight: i.height,
            workspaceHeight: Math.max(0, i.height - 8)
          }));
        }).exec();
        for (var i = 0, e = ["#questionInk", "#materialInk"]; i < e.length; i++) {
          var s = e[i],
            a = t.selectComponent(s);
          a && (a.setScrollTop && a.setScrollTop("#materialInk" === s ? t._materialScrollTop : t._questionScrollTop), a.refresh());
        }
      }
    }, 80);
  }
}));
