Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_object_spread.js"),
  t = require("../@swc/runtime/_object_spread_props.js"),
  a = require("../data/logic-papers.js"),
  i = require("./_shared/utils/random-practice.js"),
  s = require("../utils/logic-store.js");
Page({
  data: {
    groups: a.groups,
    years: ["全部年份"].concat(i.years),
    yearIndex: 0,
    scopes: i.scopes.map(function (e) {
      return e.name;
    }),
    scopeIndex: 0,
    questionCount: "20",
    available: 0,
    canResume: !1,
    randomResumeText: "继续上次随机练习",
    initError: !1
  },
  onLoad: function () {
    this.initialize();
  },
  onShow: function () {
    var e = s.session();
    this.setData({
      canResume: "random" === e.kind,
      randomResumeText: e.exam && e.exam.submittedAt ? "查看上次随机练习成绩" : "继续上次随机练习"
    });
  },
  initialize: function () {
    try {
      this.refreshPool(), this.setData({
        initError: !1
      });
    } catch (e) {
      console.error("practice-initialize-failed", e.message || "初始化失败"), this.setData({
        initError: !0
      });
    }
  },
  openSearch: function () {
    wx.navigateTo({
      url: "/logicSearch/index"
    });
  },
  open: function (e) {
    wx.navigateTo({
      url: "/logicHub/papers?group=" + e.currentTarget.dataset.id
    });
  },
  year: function (e) {
    this.setData({
      yearIndex: Number(e.detail.value)
    }), this.refreshPool();
  },
  scope: function (e) {
    this.setData({
      scopeIndex: Number(e.detail.value)
    }), this.refreshPool();
  },
  count: function (e) {
    this.setData({
      questionCount: e.detail.value
    });
  },
  quickCount: function (e) {
    this.setData({
      questionCount: String(e.currentTarget.dataset.count)
    });
  },
  refreshPool: function () {
    this.setData({
      available: i.pool(this.data.yearIndex ? this.data.years[this.data.yearIndex] : "", i.scopes[this.data.scopeIndex].id).length
    });
  },
  startRandom: function () {
    var e = Number(this.data.questionCount);
    if (!Number.isInteger(e) || e < 1 || e > this.data.available) {
      wx.showToast({
        title: "请输入1至" + this.data.available + "之间的题数",
        icon: "none"
      });
      return;
    }
    i.start(this.data.yearIndex ? this.data.years[this.data.yearIndex] : "", i.scopes[this.data.scopeIndex].id, e);
  },
  resumeRandom: function () {
    var a = s.session();
    if ("random" === a.kind) {
      if (a.exam && a.exam.submittedAt) s.saveSession(t._(e._({}, a), {
        examOpenResult: !0
      })), s.openQuestion(a.ids[0], null, !1);else {
        var i = a.exam ? a.choices || {} : a.answers || {};
        s.openQuestion(a.ids.find(function (e) {
          return !i[e];
        }) || a.ids[0], null, !1);
      }
    }
  }
});
