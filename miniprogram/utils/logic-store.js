Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_object_spread.js"),
  r = require("../@swc/runtime/_object_spread_props.js"),
  t = "jiabao.logic-learning.v1",
  n = "jiabao.logic-queue.v1";
function s() {
  var e;
  try {
    e = wx.getStorageSync(t);
  } catch (e) {}
  return e && "object" == typeof e || (e = {}), ["wordFavorites", "questionFavorites", "wrongIds", "learnedIds"].forEach(function (r) {
    Array.isArray(e[r]) || (e[r] = []);
  }), ["answers", "notes", "libraryCursors", "usageOverrides", "notePosts", "understandings", "paperProgress", "wrongRecords", "needsStudy"].forEach(function (r) {
    (!e[r] || "object" != typeof e[r] || Array.isArray(e[r])) && (e[r] = {});
  }), require("./wrong-records.js").normalize(e, a());
}
function o(e) {
  try {
    return wx.setStorageSync(t, e), !0;
  } catch (e) {
    return wx.showToast({
      title: "保存失败，请检查存储空间",
      icon: "none"
    }), !1;
  }
}
function a() {
  try {
    var e = wx.getStorageSync(n);
    return Array.isArray(e) ? {
      ids: e,
      mode: "review",
      answers: {}
    } : e && Array.isArray(e.ids) ? e : {
      ids: [],
      mode: "review",
      answers: {}
    };
  } catch (e) {
    return {
      ids: [],
      mode: "review",
      answers: {}
    };
  }
}
function i(e) {
  try {
    return wx.setStorageSync(n, e), !0;
  } catch (e) {
    return wx.showToast({
      title: "作答尚未保存，请检查存储空间",
      icon: "none"
    }), !1;
  }
}
module.exports = {
  saveNeedsRemoval: o,
  enqueueNeeds: function (e, r) {
    var t = s(),
      n = require("./needs-study.js").apply(t, e, r);
    return o(t) ? n.length : 0;
  },
  read: s,
  toggle: function (t, n) {
    var i = s();
    if (!Array.isArray(i[t])) return !1;
    var c = i[t].includes(n);
    if (i[t] = c ? i[t].filter(function (e) {
      return e !== n;
    }) : i[t].concat(n), "wrongIds" === t) {
      if (c) Object.keys(i.wrongRecords).forEach(function (e) {
        i.wrongRecords[e].qid === n && delete i.wrongRecords[e];
      });else {
        var d = require("./wrong-records.js").fromSession(n, a());
        i.wrongRecords[d.key] = r._(e._({}, d), {
          at: Date.now()
        });
      }
    }
    return o(i) ? !c : c;
  },
  recordAnswer: function (t, i, c) {
    if (!/^[ABCD]$/.test(c) || !/^[ABCD]$/.test(i)) return !1;
    var d = s(),
      u = a(),
      w = {
        selected: i,
        correct: i === c,
        at: Date.now()
      };
    if (d.answers[t] = w, i !== c) {
      d.wrongIds.includes(t) || d.wrongIds.push(t);
      var g = require("./wrong-records.js").fromSession(t, u);
      d.wrongRecords[g.key] = r._(e._({}, g), {
        at: w.at,
        attempt: e._({}, w)
      }), require("./needs-study.js").apply(d, require("./word-terms.js").missed(t, i), {
        reason: "wrong",
        questionId: t
      }, w.at);
    }
    if (!o(d)) return !1;
    if (u.ids.includes(t)) {
      u.answers = u.answers || {}, u.answers[t] = w;
      try {
        wx.setStorageSync(n, u);
      } catch (e) {}
    }
    return !0;
  },
  hasWrong: function (e) {
    var r = s();
    return require("./wrong-records.js").selected(r, e, a()).length > 0;
  },
  removeWrong: function (e) {
    var r = s();
    return require("./wrong-records.js").selected(r, e, a()).forEach(function (e) {
      delete r.wrongRecords[e.key];
    }), Object.keys(r.wrongRecords).some(function (t) {
      return r.wrongRecords[t].qid === e;
    }) || (r.wrongIds = r.wrongIds.filter(function (r) {
      return r !== e;
    })), o(r);
  },
  openQuestion: function (t, s, o, a, i) {
    var c = require("../data/logic-question-routes.js");
    if (!c[t]) {
      wx.showToast({
        title: "暂未收录这道题",
        icon: "none"
      });
      return;
    }
    if (s) try {
      wx.setStorageSync(n, r._(e._({}, i), {
        ids: s,
        mode: a || "review",
        answers: {}
      }));
    } catch (e) {
      wx.showToast({
        title: "练习队列保存失败",
        icon: "none"
      });
      return;
    }
    var d = {
      url: c[t] + "?id=" + encodeURIComponent(t)
    };
    o ? wx.redirectTo(d) : wx.navigateTo(d);
  },
  queue: function () {
    return a().ids;
  },
  session: a,
  setLearned: function (e, r) {
    var t = s();
    return t.learnedIds = t.learnedIds.filter(function (r) {
      return r !== e;
    }), r && t.learnedIds.push(e), o(t);
  },
  setCursor: function (e, r) {
    var t = s();
    return t.libraryCursors[e] = r, o(t);
  },
  clearProgress: function (e, r) {
    var t = s(),
      n = new Set(r);
    return t.learnedIds = t.learnedIds.filter(function (e) {
      return !n.has(e);
    }), delete t.libraryCursors[e], o(t);
  },
  saveNote: function (e, r) {
    var t = s();
    return r.trim() ? t.notes[e] = {
      text: r,
      updatedAt: Date.now()
    } : delete t.notes[e], o(t);
  },
  setUsage: function (r, t, n) {
    var a = s();
    return a.usageOverrides[r] = {
      fields: e._({}, t),
      updatedAt: Number(n) || Date.now()
    }, o(a);
  },
  addPost: function (e, r) {
    var t = s();
    return t.notePosts[e] = [r].concat(t.notePosts[e] || []), delete t.notes[e], o(t);
  },
  updatePost: function (r, t, n) {
    var a = s();
    return a.notePosts[r] = (a.notePosts[r] || []).map(function (r) {
      return r.id === t ? e._({}, r, n) : r;
    }), o(a);
  },
  removePost: function (e, r) {
    var t = s();
    return t.notePosts[e] = (t.notePosts[e] || []).filter(function (e) {
      return e.id !== r;
    }), o(t);
  },
  activateAccount: function (e) {
    if (!e) return !1;
    var r = s();
    if (r.activeStudyAccount === e) return !0;
    if (r.studyAccounts = r.studyAccounts || {}, r.activeStudyAccount) {
      try {
        wx.setStorageSync(n, {
          ids: [],
          mode: "review",
          answers: {}
        });
      } catch (e) {}
      r.studyAccounts[r.activeStudyAccount] = {
        notes: r.notes,
        notePosts: r.notePosts,
        usageOverrides: r.usageOverrides,
        understandings: r.understandings,
        paperProgress: r.paperProgress,
        needsStudy: r.needsStudy
      };
      var t = r.studyAccounts[e] || {};
      r.notes = t.notes || {}, r.notePosts = t.notePosts || {}, r.usageOverrides = t.usageOverrides || {}, r.understandings = t.understandings || {}, r.paperProgress = t.paperProgress || {}, r.needsStudy = t.needsStudy || {};
    }
    return r.activeStudyAccount = e, o(r);
  },
  saveUnderstanding: function (r, t) {
    var n = s();
    return n.understandings[r] = e._({}, t), o(n);
  },
  savePaperProgress: function (e, r) {
    var t = s();
    return t.paperProgress[e] = r, o(t);
  },
  recordUngradedForSession: function (e, r) {
    var t = a();
    if (!t.ids.includes(e) || !/^[ABCD]$/.test(r)) return !1;
    t.answers = t.answers || {}, t.answers[e] = {
      selected: r,
      ungraded: !0
    };
    try {
      return wx.setStorageSync(n, t), !0;
    } catch (e) {
      return !1;
    }
  },
  saveSession: i,
  commitExam: function (t) {
    var n = s(),
      a = t.paperId && n.paperProgress[t.paperId],
      c = n.lastExamReceipt;
    if (c && c.runId === t.runId) return i(r._(e._({}, t), {
      exam: c.exam,
      answers: c.answers,
      choices: c.choices || t.choices
    }));
    if (a && a.active && a.active.runId === t.runId && a.active.exam && a.active.exam.submittedAt) return i(r._(e._({}, t), {
      exam: a.active.exam,
      answers: a.active.answers
    }));
    if (t.ids.forEach(function (s) {
      var o = t.answers[s];
      if (o && !o.ungraded && /^[ABCD]$/.test(o.selected) && (n.answers[s] = e._({}, o), !o.correct)) {
        n.wrongIds.includes(s) || n.wrongIds.push(s);
        var a = require("./wrong-records.js").fromSession(s, t);
        n.wrongRecords[a.key] = r._(e._({}, a), {
          at: o.at,
          attempt: e._({}, o)
        }), require("./needs-study.js").apply(n, require("./word-terms.js").missed(s, o.selected), {
          reason: "wrong",
          questionId: s
        }, o.at);
      }
    }), a && a.active && a.active.runId === t.runId) {
      var d = r._(e._({}, a.active), {
        choices: e._({}, t.choices),
        answers: t.answers,
        exam: t.exam,
        completed: !0,
        completedAt: t.exam.submittedAt
      });
      n.paperProgress[t.paperId] = r._(e._({}, a), {
        active: d,
        examHistory: require("./exam-history.js").record(a, t),
        completedCount: (a.completedCount || 0) + (a.active.completed ? 0 : 1),
        lastExam: {
          runId: t.runId,
          choices: e._({}, t.choices),
          exam: {
            version: 1,
            startedAt: t.exam.startedAt,
            deadlineAt: t.exam.deadlineAt,
            durationSeconds: t.exam.durationSeconds,
            submittedAt: t.exam.submittedAt,
            reason: t.exam.report.reason
          }
        }
      });
    }
    return n.lastExamReceipt = {
      runId: t.runId,
      exam: t.exam,
      answers: t.answers,
      choices: t.choices
    }, !!o(n) && i(t);
  }
};
