var i = require("../lib.js"),
  t = require("../../data/logic-question-meta.js");
Page({
  data: {
    word: null,
    favorite: !1,
    learned: !1,
    related: [],
    sourceTitle: "",
    bankTitle: "",
    bankPosition: 0,
    bankTotal: 0,
    hasBankPrevious: !1,
    hasBankNext: !1
  },
  onLoad: function (n) {
    var e = this;
    if (this.word = i.byId[n.id], !this.word) {
      wx.navigateBack();
      return;
    }
    this.bank = n.bank || "", this.bankWords = this.bank ? i.list(this.bank) : [], this.bankIndex = this.bankWords.findIndex(function (i) {
      return i.id === e.word.id;
    }), this.bankIndex >= 0 && (i.store.setCursor(this.bank, this.word.id), this.setData({
      bankTitle: (i.libraries.find(function (i) {
        return i.id === e.bank;
      }) || {}).name || "",
      bankPosition: this.bankIndex + 1,
      bankTotal: this.bankWords.length,
      hasBankPrevious: this.bankIndex > 0,
      hasBankNext: this.bankIndex < this.bankWords.length - 1
    })), this.setData({
      word: this.word,
      sourceTitle: this.word.excerptQid ? t[this.word.excerptQid].title : ""
    }), wx.setNavigationBarTitle({
      title: this.word.term
    });
  },
  onShow: function () {
    if (this.word) {
      var n = i.store.read();
      this.setData({
        favorite: n.wordFavorites.includes(this.word.id),
        learned: n.learnedIds.includes(this.word.id),
        related: this.word.qids.slice(0, 4).map(function (i) {
          return {
            id: i,
            title: t[i].title,
            preview: t[i].preview,
            no: t[i].no
          };
        })
      });
    }
  },
  previousWord: function () {
    this.moveWord(-1);
  },
  nextWord: function () {
    this.moveWord(1);
  },
  moveWord: function (t) {
    var n = this.bankWords[this.bankIndex + t];
    n && i.openWord(n.id, this.bank, !0);
  },
  wordList: function () {
    wx.navigateTo({
      url: "/logic/words/index?bank=" + encodeURIComponent(this.bank)
    });
  },
  favorite: function () {
    i.store.toggle("wordFavorites", this.word.id), this.onShow();
  },
  learn: function () {
    i.store.toggle("learnedIds", this.word.id), this.onShow();
  },
  question: function (t) {
    i.store.openQuestion(t.currentTarget.dataset.id, this.word.qids, !1, "review", {
      kind: "vocabulary",
      libraryId: this.bank,
      wordId: this.word.id
    });
  },
  allQuestions: function () {
    wx.navigateTo({
      url: "/logic/questions/index?word=" + this.word.id
    });
  }
});
