Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_define_property.js"),
  t = require("../@swc/runtime/_object_spread.js"),
  r = require("../@swc/runtime/_object_spread_props.js"),
  n = require("./logic-store.js"),
  a = require("../data/logic-answer-index.js");
function s() {
  return "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
function i(e) {
  var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Date.now(),
    r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 60,
    n = 30 === r ? 30 : 60;
  return {
    version: 1,
    startedAt: t,
    deadlineAt: t + e.length * n * 1e3,
    durationSeconds: e.length * n,
    secondsPerQuestion: n,
    submittedAt: 0
  };
}
function o(e) {
  return !!e.exam || "practice" === e.mode && (!!e.paperId || "random" === e.kind);
}
function d(e) {
  var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Date.now();
  if (!o(e)) return e;
  if (!e.exam || 1 !== e.exam.version) {
    var a = t._({}, e.choices);
    e.ids.forEach(function (t) {
      var r = (e.answers || {})[t];
      !a[t] && r && /^[ABCD]$/.test(r.selected) && (a[t] = r.selected);
    }), c(e = r._(t._({}, e), {
      runId: e.runId || s(),
      choices: a,
      answers: {},
      exam: i(e.ids, n)
    }));
  }
  return e;
}
function c(e) {
  if (!n.saveSession(e)) return !1;
  if (e.paperId) {
    var a = n.read().paperProgress[e.paperId];
    if (a && a.active && a.active.runId === e.runId && !a.active.completed) return n.savePaperProgress(e.paperId, r._(t._({}, a), {
      active: r._(t._({}, a.active), {
        choices: t._({}, e.choices),
        answers: e.answers || {},
        exam: e.exam
      })
    }));
  }
  return !0;
}
function u(e, t, r) {
  var n = Math.min(r, e.exam.deadlineAt),
    s = {},
    i = [],
    o = 0,
    d = 0,
    c = 0,
    u = 0,
    l = 0;
  return e.ids.forEach(function (t, r) {
    var m = /^[ABCD]$/.test((e.choices || {})[t]) ? e.choices[t] : "",
      h = /^[ABCD]$/.test(a[t]) ? a[t] : "";
    h && l++, m && o++;
    var p = "unanswered";
    if (m) {
      if (h) {
        var x = m === h;
        p = x ? "correct" : "incorrect", x ? d++ : c++, s[t] = {
          selected: m,
          correct: x,
          at: n
        };
      } else u++, p = "ungraded", s[t] = {
        selected: m,
        ungraded: !0,
        at: n
      };
    }
    i.push({
      id: t,
      no: r + 1,
      state: p,
      selected: m,
      answer: h
    });
  }), {
    answers: s,
    report: {
      total: e.ids.length,
      answered: o,
      correct: d,
      wrong: c,
      unanswered: e.ids.length - o,
      ungraded: u,
      gradable: l,
      unknownAnswers: e.ids.length - l,
      accuracy: l ? Math.round(d / l * 100) : null,
      completion: e.ids.length ? Math.round(o / e.ids.length * 100) : 0,
      elapsedSeconds: Math.max(0, Math.floor((n - e.exam.startedAt) / 1e3)),
      reason: r >= e.exam.deadlineAt ? "timeout" : t,
      items: i
    }
  };
}
function l() {
  var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "manual",
    a = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Date.now(),
    s = d(n.session(), a);
  if (!s.exam) return null;
  if (s.exam.submittedAt) return s.exam.report;
  var i = u(s, e, a),
    o = r._(t._({}, s), {
      answers: i.answers,
      exam: r._(t._({}, s.exam), {
        submittedAt: Math.min(a, s.exam.deadlineAt),
        report: i.report
      })
    });
  return n.commitExam(o) ? n.session().exam.report : null;
}
module.exports = {
  create: i,
  ensure: d,
  eligible: o,
  persist: c,
  metrics: function (e) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Date.now(),
      r = e.exam;
    return r ? {
      answered: e.ids.filter(function (t) {
        return /^[ABCD]$/.test((e.choices || {})[t]);
      }).length,
      total: e.ids.length,
      remaining: Math.max(0, Math.ceil((r.deadlineAt - t) / 1e3)),
      elapsed: Math.max(0, Math.floor((Math.min(r.submittedAt || t, r.deadlineAt) - r.startedAt) / 1e3))
    } : null;
  },
  time: function (e) {
    var t = function (e) {
      return String(e).padStart(2, "0");
    };
    return (e = Math.max(0, Math.floor(e))) >= 3600 ? t(Math.floor(e / 3600)) + ":" + t(Math.floor(e % 3600 / 60)) + ":" + t(e % 60) : t(Math.floor(e / 60)) + ":" + t(e % 60);
  },
  choose: function (a, s) {
    var i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : Date.now(),
      o = d(n.session(), i),
      u = n.read().lastExamReceipt;
    return (o.exam && !o.exam.submittedAt && u && u.runId === o.runId && (o = r._(t._({}, o), {
      exam: u.exam,
      answers: u.answers,
      choices: u.choices || o.choices
    }), n.saveSession(o)), o.exam && o.exam.submittedAt) ? {
      ok: !1,
      submitted: !0
    } : !o.exam || 0 > o.ids.indexOf(a) || !/^[ABCD]$/.test(s) ? {
      ok: !1
    } : i >= o.exam.deadlineAt ? {
      ok: !1,
      submitted: !!l("timeout", i)
    } : (o.choices = r._(t._({}, o.choices), e._({}, a, s)), {
      ok: c(o)
    });
  },
  submit: l,
  items: function (e) {
    return e.exam && e.exam.submittedAt ? e.exam.report.items : e.ids.map(function (t, r) {
      return {
        id: t,
        no: r + 1,
        state: (e.choices || {})[t] ? "answered" : "unanswered"
      };
    });
  },
  runId: s,
  grade: u
};
