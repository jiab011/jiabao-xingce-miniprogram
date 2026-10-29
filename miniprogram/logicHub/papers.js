Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_to_consumable_array.js"),
  t = require("../data/logic-papers.js"),
  r = require("./_shared/utils/paper-practice.js");
Page({
  data: {
    title: "试卷列表",
    papers: [],
    query: "",
    years: ["全部年份"],
    regions: ["全部地区"],
    yearIndex: 0,
    regionIndex: 0,
    total: 0
  },
  onLoad: function (r) {
    var a = this;
    this.group = r.group || "national";
    var i = t.groups.find(function (e) {
      return e.id === a.group;
    });
    this.all = t.papers.filter(function (e) {
      return e.group === a.group;
    });
    var n = ["全部年份"].concat(e._(this.all.map(function (e) {
        return String(e.year);
      }).filter(function (e, t, r) {
        return r.indexOf(e) === t;
      }).sort(function (e, t) {
        return Number(t) - Number(e);
      }))),
      s = ["全部地区"].concat(e._(this.all.map(function (e) {
        return e.region;
      }).filter(function (e, t, r) {
        return r.indexOf(e) === t;
      }).sort()));
    this.setData({
      title: i ? i.name : "试卷列表",
      years: n,
      regions: s,
      showRegions: "other" === this.group
    }), wx.setNavigationBarTitle({
      title: (i ? i.name : "") + " \xb7 逻辑填空"
    });
  },
  onShow: function () {
    this.refresh();
  },
  input: function (e) {
    this.setData({
      query: e.detail.value
    }), this.refresh();
  },
  yearChange: function (e) {
    this.setData({
      yearIndex: Number(e.detail.value)
    }), this.refresh();
  },
  regionChange: function (e) {
    this.setData({
      regionIndex: Number(e.detail.value)
    }), this.refresh();
  },
  refresh: function () {
    var e = this;
    if (this.all) {
      var t = this.data.query.trim(),
        a = this.data.years[this.data.yearIndex],
        i = this.data.regions[this.data.regionIndex],
        n = require("../utils/logic-store.js").read().paperProgress,
        s = this.all.filter(function (r) {
          return (!t || r.title.includes(t)) && (!e.data.yearIndex || String(r.year) === a) && (!e.data.regionIndex || r.region === i);
        }).map(function (e) {
          var t = r.status(e.id, n);
          return {
            id: e.id,
            title: e.title,
            region: e.region,
            year: e.year,
            count: e.count,
            status: t.inProgress ? "进行中 " + t.answered + "/" + e.count + (t.completed ? " \xb7 已完成" + t.completed + "次" : "") : t.completed ? "完成 " + t.completed + " 次" : "未开始",
            inProgress: t.inProgress,
            completed: t.completed,
            hasReport: r.records(e.id, n).length > 0
          };
        });
      this.setData({
        papers: s,
        total: s.length
      });
    }
  },
  open: function (e) {
    r.open(e.currentTarget.dataset.id);
  },
  lastResult: function (e) {
    r.result(e.currentTarget.dataset.id);
  }
});
