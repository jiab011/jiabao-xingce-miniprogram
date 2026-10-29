Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../../../@swc/runtime/_async_to_generator.js"),
  r = require("../../../@swc/runtime/_object_spread.js"),
  e = require("../../../@swc/runtime/_object_spread_props.js"),
  o = require("../../../@swc/runtime/_ts_generator.js"),
  i = require("./idiom-navigation.js"),
  s = require("../../../utils/logic-store.js"),
  n = require("../../../utils/study-cloud.js");
module.exports = function (a) {
  return {
    data: {
      bookLoading: !1,
      bookError: !1,
      word: null,
      filter: "correct",
      cards: [],
      total: 0,
      visible: 6,
      more: !1,
      correctCount: 0,
      distractorCount: 0,
      unknownCount: 0
    },
    onLoad: function (t) {
      this._bookCache = {}, this._bookRequests = {}, this.bank = t.bank || "idiom-high", this.word = a.cards[t.id], this.word && (this.setData({
        word: {
          id: this.word.id,
          term: this.word.term
        },
        correctCount: this.word.correctIds.length,
        distractorCount: this.word.distractorIds.length,
        unknownCount: this.word.unknownIds.length,
        filter: this.word.correctIds.length ? "correct" : this.word.distractorIds.length ? "distractor" : "unknown"
      }), wx.setNavigationBarTitle({
        title: this.word.term + " \xb7 背题"
      }), this.refresh());
    },
    onShow: function () {
      this.word && this.refresh();
    },
    filter: function (t) {
      this.setData({
        filter: t.currentTarget.dataset.filter,
        visible: 6
      }), this.refresh(), wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });
    },
    ids: function () {
      return this.word["correct" === this.data.filter ? "correctIds" : "distractor" === this.data.filter ? "distractorIds" : "unknownIds"];
    },
    refresh: function () {
      var t = this,
        o = this.ids(),
        i = s.read();
      this.setData({
        total: o.length,
        more: o.length > this.data.visible,
        cards: o.slice(0, this.data.visible).map(function (o) {
          var s = (a.questions || {})[o] || t._bookCache[o];
          return s ? e._(r._({}, s), {
            favorite: i.questionFavorites.includes(o),
            options: s.options.map(function (t) {
              return e._(r._({}, t), {
                correct: t.label === s.answer
              });
            })
          }) : null;
        }).filter(Boolean)
      });
      var n = o.slice(0, this.data.visible).findIndex(function (r) {
        return !(a.questions || {})[r] && !t._bookCache[r];
      });
      n >= 0 && this.loadBookCards(6 * Math.floor(n / 6));
    },
    loadBookCards: function (r) {
      return t._(function () {
        var t, e, i, s, a;
        return o._(this, function (o) {
          switch (o.label) {
            case 0:
              if (t = this, i = (e = this.data.filter) + ":" + r, this._bookRequests[i] || this._bookLeaving) return [2];
              this._bookRequests[i] = !0, this.setData({
                bookLoading: !0,
                bookError: !1
              }), s = !1, o.label = 1;
            case 1:
              return o.trys.push([1, 3, 4, 5]), [4, n.call("wordQuestions", {
                wordId: this.word.id,
                filter: e,
                offset: r
              })];
            case 2:
              if (a = o.sent(), this._bookLeaving) return [2];
              return a.cards.forEach(function (r) {
                return t._bookCache[r.id] = r;
              }), (s = a.cards.length > 0) || this.setData({
                bookError: !0
              }), [3, 5];
            case 3:
              return o.sent(), this._bookLeaving || this.setData({
                bookError: !0
              }), [3, 5];
            case 4:
              return delete this._bookRequests[i], !this._bookLeaving && (this.setData({
                bookLoading: Object.keys(this._bookRequests).length > 0
              }), s && this.refresh()), [7];
            case 5:
              return [2];
          }
        });
      }).apply(this);
    },
    retryBook: function () {
      this.setData({
        bookError: !1
      }), this.refresh();
    },
    onUnload: function () {
      this._bookLeaving = !0;
    },
    onReachBottom: function () {
      this.more();
    },
    more: function () {
      this.setData({
        visible: this.data.visible + 6
      }), this.refresh();
    },
    favorite: function (t) {
      s.toggle("questionFavorites", t.currentTarget.dataset.id), this.refresh();
    },
    openWord: function (t) {
      var r = t.currentTarget.dataset.id;
      r && i.openWord(r);
    },
    practice: function () {
      var t = this.ids();
      t.length && s.openQuestion(t[0], t, !1, "practice", {
        kind: "vocabulary",
        libraryId: this.bank,
        wordId: this.word.id
      });
    },
    analysis: function (t) {
      s.openQuestion(t.currentTarget.dataset.id, this.ids(), !1, "study", {
        kind: "vocabulary",
        libraryId: this.bank,
        wordId: this.word.id
      });
    }
  };
};
