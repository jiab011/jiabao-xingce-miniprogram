Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../../@swc/runtime/_define_property.js"),
  r = require("../../../@swc/runtime/_object_spread.js"),
  s = require("../../../@swc/runtime/_object_spread_props.js"),
  t = require("../../../utils/logic-store.js"),
  i = require("../../../data/logic-papers.js");
function a(e, r) {
  var s = i.papers.find(function (r) {
    return r.id === e;
  });
  return s ? require("../../../utils/exam-history.js").list((r || t.read().paperProgress)[e], s.ids) : [];
}
module.exports = {
  open: function (e) {
    var a = i.papers.find(function (r) {
      return r.id === e;
    });
    if (a) {
      var o = require("../../../utils/exam-session.js"),
        n = t.read().paperProgress[e],
        c = n && n.active && !n.active.completed ? n.active : {
          runId: o.runId(),
          startedAt: Date.now(),
          answers: {},
          choices: {},
          completed: !1,
          exam: o.create(a.ids)
        },
        p = s._(r._({}, n), {
          completedCount: n && n.completedCount || 0,
          active: c
        });
      if (t.savePaperProgress(e, p)) {
        var d = o.ensure({
          ids: a.ids,
          mode: "practice",
          kind: "paper",
          answers: c.answers,
          choices: c.choices || {},
          paperId: e,
          paperTitle: a.title,
          paperNos: a.nos,
          runId: c.runId,
          exam: c.exam
        });
        if (t.saveSession(d)) {
          var u = a.ids.find(function (e) {
            return !d.choices[e];
          }) || a.ids[0];
          t.openQuestion(u, null, !1);
        }
      }
    }
  },
  record: function (i, a) {
    var o = t.session();
    if (!o.exam && o.paperId && "practice" === o.mode && o.ids.includes(i)) {
      o.choices = s._(r._({}, o.choices), e._({}, i, a));
      var n = t.read().paperProgress[o.paperId];
      if (n && n.active && n.active.runId === o.runId) {
        var c = s._(r._({}, n.active), {
            choices: o.choices,
            answers: o.answers
          }),
          p = n.completedCount || 0;
        !c.completed && o.ids.every(function (e) {
          return c.choices[e];
        }) && (c.completed = !0, c.completedAt = Date.now(), p++), t.savePaperProgress(o.paperId, s._(r._({}, n), {
          completedCount: p,
          active: c
        })), wx.setStorageSync("jiabao.logic-queue.v1", o);
      }
    }
  },
  status: function (e, r) {
    var s = (r || t.read().paperProgress)[e];
    return s ? {
      completed: s.completedCount || 0,
      answered: s.active ? Object.keys(s.active.choices || {}).length : 0,
      inProgress: !!(s.active && !s.active.completed)
    } : {
      completed: 0,
      answered: 0,
      inProgress: !1
    };
  },
  result: function (e) {
    i.papers.some(function (r) {
      return r.id === e;
    }) && wx.navigateTo({
      url: "/logicSearch/records?paper=" + encodeURIComponent(e)
    });
  },
  records: a,
  showResult: function (e, o) {
    var n = i.papers.find(function (r) {
        return r.id === e;
      }),
      c = a(e).find(function (e) {
        return e.runId === o;
      });
    if (!c || !n) {
      wx.showToast({
        title: "未找到这次做题记录",
        icon: "none"
      });
      return;
    }
    var p = s._(r._({}, c), {
      ids: n.ids,
      paperId: e,
      paperTitle: n.title,
      paperNos: n.nos,
      kind: "paper",
      mode: "review",
      examOpenResult: !0
    });
    if (!p.exam.report || !Object.keys(p.answers || {}).length) {
      var d = require("../../../utils/exam-session.js").grade(p, p.exam.reason || "manual", p.exam.submittedAt);
      p.answers = d.answers, p.exam = s._(r._({}, p.exam), {
        report: d.report
      });
    }
    t.saveSession(p) && t.openQuestion(p.ids[0], null, !1);
  }
};
