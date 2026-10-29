var e = require("./utils/api.js"),
  t = require("./utils/store.js");
Page({
  data: {
    rows: []
  },
  onLoad: function (t) {
    this.module = e.moduleInfo(t.module), this.paper = t.paper || "", wx.setNavigationBarTitle({
      title: "做题记录"
    });
  },
  onShow: function () {
    this.setData({
      rows: t.records(this.module.id, this.paper).map(function (e) {
        return {
          id: e.id,
          date: t.date(e.submittedAt),
          elapsed: t.time(e.report.elapsedSeconds),
          accuracy: e.report.accuracy,
          correct: e.report.correct,
          gradable: e.report.gradable,
          completion: e.report.completion,
          answered: e.report.answered,
          total: e.report.total
        };
      })
    });
  },
  open: function (e) {
    wx.navigateTo({
      url: "/exam/reader?module=" + this.module.id + "&run=" + e.currentTarget.dataset.id + "&result=1"
    });
  }
});
