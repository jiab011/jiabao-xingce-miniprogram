var t = require("./data.js"),
  i = require("./_shared/utils/question-search.js"),
  e = require("../data/logic-question-meta.js"),
  r = require("../utils/logic-store.js");
Page({
  data: {
    query: "",
    mode: "all",
    visible: [],
    total: 0,
    searched: !1,
    more: !1
  },
  onLoad: function (t) {
    this.limit = 25, t.q && (this.setData({
      query: t.q
    }), this.run());
  },
  input: function (t) {
    var i = this;
    this.setData({
      query: t.detail.value
    }), clearTimeout(this.timer), this.timer = setTimeout(function () {
      return i.run();
    }, 180);
  },
  confirm: function () {
    clearTimeout(this.timer), this.run();
  },
  filter: function (t) {
    this.setData({
      mode: t.currentTarget.dataset.mode
    }), this.run();
  },
  run: function () {
    this.limit = 25, this.results = i.match(t, this.data.query, this.data.mode), this.setData({
      searched: !!this.data.query.trim()
    }), this.render();
  },
  render: function () {
    var t = this.results || [];
    this.setData({
      total: t.length,
      visible: t.slice(0, this.limit).map(function (t) {
        return {
          id: t.id,
          stem: t.stem,
          title: e[t.id].title,
          no: e[t.id].no,
          matchCorrect: t.matchCorrect,
          matchDistractor: t.matchDistractor,
          matchStem: t.matchStem
        };
      }),
      more: t.length > this.limit
    });
  },
  onReachBottom: function () {
    this.limit += 25, this.render();
  },
  open: function (t) {
    r.openQuestion(t.currentTarget.dataset.id, this.results.map(function (t) {
      return t.id;
    }), !1, "review");
  },
  practice: function () {
    this.results && this.results.length && r.openQuestion(this.results[0].id, this.results.map(function (t) {
      return t.id;
    }), !1, "practice");
  },
  onUnload: function () {
    clearTimeout(this.timer);
  }
});
