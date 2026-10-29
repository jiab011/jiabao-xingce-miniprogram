Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../../@swc/runtime/_async_to_generator.js"),
  r = require("../../@swc/runtime/_object_spread.js"),
  e = require("../../@swc/runtime/_object_spread_props.js"),
  o = require("../../@swc/runtime/_ts_generator.js"),
  i = require("../lib.js"),
  s = require("../../utils/study-cloud.js"),
  a = require("../_shared/utils/idiom-navigation.js");
Page({
  data: {
    word: null,
    filter: "correct",
    cards: [],
    total: 0,
    more: !1,
    correctCount: 0,
    distractorCount: 0,
    unknownCount: 0,
    loading: !1,
    error: !1
  },
  onLoad: function (t) {
    this.word = i.byId[t.id], this.bank = t.bank || "", this.offset = 0, this.word && (this.setData({
      word: {
        id: this.word.id,
        term: this.word.term
      }
    }), wx.setNavigationBarTitle({
      title: this.word.term + " \xb7 背题"
    }), this.load());
  },
  load: function () {
    return t._(function () {
      var t, a, n, d;
      return o._(this, function (o) {
        switch (o.label) {
          case 0:
            if (this.data.loading) return [2];
            t = this.data.filter, a = this._bookToken = (this._bookToken || 0) + 1, this.setData({
              loading: !0,
              error: !1
            }), o.label = 1;
          case 1:
            return o.trys.push([1, 3, 4, 5]), [4, s.call("wordQuestions", {
              wordId: this.word.id,
              filter: t,
              offset: this.offset
            })];
          case 2:
            if (n = o.sent(), this.leaving || t !== this.data.filter || a !== this._bookToken) return [2];
            return d = i.store.read(), this.setData({
              cards: (this.offset ? this.data.cards : []).concat(n.cards.map(function (t) {
                return e._(r._({}, t), {
                  favorite: d.questionFavorites.includes(t.id),
                  options: t.options.map(function (o) {
                    return e._(r._({}, o), {
                      correct: o.label === t.answer
                    });
                  })
                });
              })),
              total: n.total,
              more: this.offset + n.cards.length < n.total,
              correctCount: n.counts.correct,
              distractorCount: n.counts.distractor,
              unknownCount: n.counts.unknown
            }), this.offset += n.cards.length, this.data.total || this.offset || "correct" !== t || !n.counts.distractor || (this.setData({
              filter: "distractor"
            }), this._pendingLoad = !0), [3, 5];
          case 3:
            return o.sent(), this.leaving || this.setData({
              error: !0
            }), [3, 5];
          case 4:
            return !this.leaving && (this.setData({
              loading: !1
            }), this._pendingLoad && (this._pendingLoad = !1, this.load())), [7];
          case 5:
            return [2];
        }
      });
    }).apply(this);
  },
  filter: function (t) {
    this._bookToken = (this._bookToken || 0) + 1, this._pendingLoad = !!this.data.loading, this.offset = 0, this.setData({
      filter: t.currentTarget.dataset.filter,
      cards: [],
      total: 0
    }), this.load(), wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });
  },
  more: function () {
    this.data.more && this.load();
  },
  onReachBottom: function () {
    this.more();
  },
  onUnload: function () {
    this.leaving = !0;
  },
  favorite: function (t) {
    var o = t.currentTarget.dataset.id;
    i.store.toggle("questionFavorites", o);
    var s = i.store.read();
    this.setData({
      cards: this.data.cards.map(function (t) {
        return e._(r._({}, t), {
          favorite: s.questionFavorites.includes(t.id)
        });
      })
    });
  },
  openWord: function (t) {
    a.openWord(t.currentTarget.dataset.id);
  },
  analysis: function (t) {
    i.store.openQuestion(t.currentTarget.dataset.id, this.word.qids, !1, "study", {
      kind: "vocabulary",
      libraryId: this.bank,
      wordId: this.word.id
    });
  },
  practice: function () {
    var t = this.word.qids;
    t.length && i.store.openQuestion(t[0], t, !1, "practice", {
      kind: "vocabulary",
      libraryId: this.bank,
      wordId: this.word.id
    });
  }
});
