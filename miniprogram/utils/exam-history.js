Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_object_spread.js"),
  r = require("../@swc/runtime/_object_spread_props.js");
function t(r) {
  return {
    runId: r.runId,
    choices: e._({}, r.choices),
    answers: r.answers || {},
    exam: e._({}, r.exam)
  };
}
function a(t, a) {
  return t.exam && t.exam.report ? t.exam.report : t.exam && t.exam.submittedAt ? require("./exam-session.js").grade(r._(e._({}, t), {
    ids: a
  }), t.exam.reason || "manual", t.exam.submittedAt).report : null;
}
function n(e, r) {
  var t = a(e, r);
  if (!t || !t.answered) return !1;
  var n = e.exam.durationSeconds || 60 * r.length;
  return !(t.elapsedSeconds < .2 * n) && !(null !== t.accuracy && t.accuracy >= 10 && t.accuracy <= 20);
}
function u(e, r) {
  var u = (e && e.examHistory || []).slice();
  e && e.lastExam && u.push(e.lastExam), e && e.active && e.active.completed && u.push(e.active);
  var s = {},
    i = [];
  return u.sort(function (e, r) {
    return (r.exam && r.exam.submittedAt || 0) - (e.exam && e.exam.submittedAt || 0);
  }).forEach(function (e) {
    if (e.runId && !s[e.runId] && n(e, r)) {
      s[e.runId] = !0;
      var u = t(e);
      u.exam.report = a(e, r), i.push(u);
    }
  }), i;
}
module.exports = {
  snapshot: t,
  report: a,
  qualifies: n,
  list: u,
  record: function (e, r) {
    var a = u(e, r.ids);
    return n(r, r.ids) && !a.some(function (e) {
      return e.runId === r.runId;
    }) && a.unshift(t(r)), a;
  },
  timeText: function (e) {
    var r = new Date(e),
      t = function (e) {
        return String(e).padStart(2, "0");
      };
    return r.getFullYear() + "-" + t(r.getMonth() + 1) + "-" + t(r.getDate()) + " " + t(r.getHours()) + ":" + t(r.getMinutes());
  }
};
