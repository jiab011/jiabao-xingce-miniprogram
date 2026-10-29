var e = require("../data/logic-papers.js"),
  r = require("./_shared/utils/paper-practice.js"),
  t = require("../utils/exam-history.js"),
  a = require("../utils/exam-session.js");
Page({
  data: {
    title: "做题记录",
    records: []
  },
  onLoad: function (r) {
    if (this.paper = e.papers.find(function (e) {
      return e.id === r.paper;
    }), !this.paper) {
      wx.navigateBack();
      return;
    }
    this.setData({
      title: this.paper.title
    });
  },
  onShow: function () {
    this.paper && this.setData({
      records: r.records(this.paper.id).map(function (e) {
        return {
          id: e.runId,
          time: t.timeText(e.exam.submittedAt),
          duration: a.time(e.exam.report.elapsedSeconds),
          accuracy: e.exam.report.accuracy,
          correct: e.exam.report.correct,
          gradable: e.exam.report.gradable,
          completion: e.exam.report.completion,
          answered: e.exam.report.answered,
          total: e.exam.report.total
        };
      })
    });
  },
  open: function (e) {
    r.showResult(this.paper.id, e.currentTarget.dataset.id);
  }
});
