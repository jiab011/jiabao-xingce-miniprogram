var i = require("../lib.js"),
  t = require("../../data/logic-question-meta.js"),
  e = require("../data/question-ids.js");
Page({
  data: {
    title: "真题列表",
    visible: [],
    total: 0,
    hasMore: !1,
    mode: ""
  },
  onLoad: function (i) {
    if (this.mode = i.mode || "all", "wrong" === this.mode) {
      wx.redirectTo({
        url: "/logicHub/wrong-books"
      });
      return;
    }
    this.word = i.word, this.pair = i.pair, this.type = i.type, this.limit = 30, this.setData({
      mode: this.mode
    });
  },
  onShow: function () {
    "wrong" !== this.mode && this.refresh();
  },
  refresh: function () {
    var s = this,
      r = i.store.read(),
      o = e,
      h = "逻辑填空真题";
    if ("favorites" === this.mode && (o = r.questionFavorites, h = "题目收藏"), "wrong" === this.mode && (o = r.wrongIds, h = "错题集"), this.word && i.byId[this.word] && (o = i.byId[this.word].qids, h = i.byId[this.word].term + " \xb7 关联真题"), this.pair) {
      var a = i.pairs(this.type).find(function (i) {
        return i.id === s.pair;
      });
      a && (o = Array.from(new Set(a.left.qids.concat(a.right.qids))), h = "辨析关联真题");
    }
    this.ids = o.filter(function (i) {
      return t[i];
    }), this.setData({
      title: h,
      total: this.ids.length,
      visible: this.ids.slice(0, this.limit).map(function (i) {
        return {
          id: i,
          title: t[i].title,
          no: t[i].no,
          preview: t[i].preview
        };
      }),
      hasMore: this.ids.length > this.limit
    }), wx.setNavigationBarTitle({
      title: h
    });
  },
  onReachBottom: function () {
    this.limit += 30, this.refresh();
  },
  open: function (t) {
    i.store.openQuestion(t.currentTarget.dataset.id, this.ids, !1, "review", this.word || this.pair ? {
      kind: "vocabulary",
      wordId: this.word || ""
    } : {});
  },
  all: function () {
    this.mode = "all", this.word = "", this.pair = "", this.limit = 30, this.setData({
      mode: "all"
    }), this.refresh();
  }
});
