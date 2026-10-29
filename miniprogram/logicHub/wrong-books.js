Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../@swc/runtime/_to_consumable_array.js"),
  e = require("./_shared/utils/wrong-books.js"),
  i = require("../data/logic-question-meta.js");
Page({
  data: {
    stage: "books",
    title: "错题集",
    groups: [],
    papers: [],
    questions: [],
    total: 0,
    totalPapers: 0,
    legacyCount: 0,
    hasMore: !1,
    query: "",
    years: ["全部年份"],
    yearIndex: 0,
    emptyText: "",
    initError: !1
  },
  onLoad: function (t) {
    this.group = e.groups.find(function (e) {
      return e.id === t.group;
    }), this.paperId = t.paper || "", this.limit = 25, this.setData({
      stage: this.group ? "vocabulary" === this.group.id || this.paperId ? "questions" : "papers" : "books"
    });
  },
  onShow: function () {
    this.refresh();
  },
  refresh: function () {
    try {
      if (!this.group) {
        var r = e.summary();
        this.setData({
          groups: r,
          total: r.reduce(function (t, e) {
            return t + e.count;
          }, 0),
          title: "错题集",
          initError: !1
        }), wx.setNavigationBarTitle({
          title: "错题集"
        });
        return;
      }
      if ("papers" === this.data.stage) {
        var a = e.papers(this.group.id),
          s = ["全部年份"];
        a.forEach(function (t) {
          var e = String(t.year);
          0 > s.indexOf(e) && s.push(e);
        }), s.splice.apply(s, [1, s.length - 1].concat(t._(s.slice(1).sort(function (t, e) {
          return Number(e) - Number(t);
        }))));
        var o = this.data.years[this.data.yearIndex],
          n = Math.max(0, s.indexOf(o)),
          u = this.data.query.trim(),
          p = a.filter(function (t) {
            return (!n || String(t.year) === s[n]) && (!u || t.title.includes(u) || String(t.year).includes(u));
          });
        this.setData({
          title: this.group.name,
          papers: p,
          total: a.reduce(function (t, e) {
            return t + e.count;
          }, 0),
          totalPapers: a.length,
          years: s,
          yearIndex: n,
          emptyText: a.length ? "没有符合筛选条件的错题试卷" : "还没有这类错题，练习时答错会自动加入",
          initError: !1
        });
      } else {
        var h = e.list(this.group.id, this.paperId),
          l = this.paperId && e.paper(this.paperId);
        this.rows = h, this.setData({
          title: l ? l.title : this.group.name,
          total: h.length,
          legacyCount: h.filter(function (t) {
            return t.legacy;
          }).length,
          questions: h.slice(0, this.limit).map(function (t) {
            return {
              id: t.qid,
              title: t.title || i[t.qid].title,
              no: t.no || i[t.qid].no,
              preview: i[t.qid].preview,
              legacy: t.legacy
            };
          }),
          hasMore: h.length > this.limit,
          emptyText: "这本错题已清空，答错的题会保留到你主动移出",
          initError: !1
        });
      }
      wx.setNavigationBarTitle({
        title: "papers" === this.data.stage ? this.group.name : this.paperId ? "本卷错题" : this.group.name
      });
    } catch (t) {
      console.error("wrong-books-initialize-failed", t.message || "读取失败"), this.setData({
        initError: !0
      });
    }
  },
  openBook: function (t) {
    wx.navigateTo({
      url: "/logicHub/wrong-books?group=" + t.currentTarget.dataset.id
    });
  },
  openPaper: function (t) {
    wx.navigateTo({
      url: "/logicHub/wrong-books?group=" + this.group.id + "&paper=" + t.currentTarget.dataset.id
    });
  },
  open: function (t) {
    e.openQuestion(t.currentTarget.dataset.id, this.group.id, this.paperId, !1);
  },
  practice: function () {
    this.rows && this.rows.length && e.openQuestion(this.rows[0].qid, this.group.id, this.paperId, !0);
  },
  input: function (t) {
    this.setData({
      query: t.detail.value
    }), this.refresh();
  },
  year: function (t) {
    this.setData({
      yearIndex: Number(t.detail.value)
    }), this.refresh();
  },
  onReachBottom: function () {
    "questions" === this.data.stage && (this.limit += 25, this.refresh());
  },
  goPractice: function () {
    wx.navigateTo({
      url: "/logicHub/practice"
    });
  }
});
