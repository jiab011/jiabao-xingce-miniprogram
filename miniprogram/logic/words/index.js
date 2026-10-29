var t = require("../lib.js");
Page({
  data: {
    query: "",
    focus: !1,
    title: "词语学习",
    description: "",
    total: 0,
    visible: [],
    hasMore: !1,
    learned: 0
  },
  onLoad: function (i) {
    var e = this;
    this.mode = i.mode || "", this.bank = i.bank || "all", this.limit = 60;
    var r = t.libraries.find(function (t) {
      return t.id === e.bank;
    });
    this.setData({
      title: "favorites" === this.mode ? "词语收藏" : "search" === this.mode ? "搜索词语" : r.name,
      description: this.mode ? "" : r.description,
      focus: "search" === this.mode
    }), wx.setNavigationBarTitle({
      title: this.data.title
    });
  },
  onShow: function () {
    this.refresh();
  },
  onInput: function (t) {
    this.limit = 60, this.setData({
      query: t.detail.value
    }), this.refresh();
  },
  refresh: function () {
    var i = t.store.read(),
      e = new Set(i.wordFavorites),
      r = new Set(i.learnedIds),
      n = "favorites" === this.mode ? t.words.filter(function (t) {
        return e.has(t.id);
      }) : t.list(this.bank),
      s = this.data.query.trim();
    s && (n = n.filter(function (t) {
      return t.term.includes(s);
    })), this.items = n, this.setData({
      total: n.length,
      learned: n.filter(function (t) {
        return r.has(t.id);
      }).length,
      visible: n.slice(0, this.limit).map(function (t) {
        return {
          id: t.id,
          term: t.term,
          count: t.count,
          correct: t.correct,
          learned: r.has(t.id)
        };
      }),
      hasMore: n.length > this.limit
    });
  },
  onReachBottom: function () {
    this.limit += 60, this.refresh();
  },
  open: function (i) {
    t.openWord(i.currentTarget.dataset.id, this.mode ? "" : this.bank);
  },
  goAll: function () {
    wx.redirectTo({
      url: "/logic/words/index?bank=all"
    });
  }
});
