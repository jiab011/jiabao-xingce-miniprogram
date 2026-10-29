Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../../@swc/runtime/_async_to_generator.js"),
  t = require("../../../@swc/runtime/_object_spread.js"),
  r = require("../../../@swc/runtime/_object_spread_props.js"),
  i = require("../../../@swc/runtime/_ts_generator.js"),
  s = require("./idiom-study-page.js"),
  a = require("../../../utils/study-cloud.js"),
  n = require("./idiom-example.js");
module.exports = function (o) {
  var d = s({
      cards: {},
      defaultBank: function (e) {
        return require("../data/study-bank-flags.js")[e.id] ? "real" === e.kind ? "real-high" : e.national ? "national-all" : "idiom-correct" : "all";
      },
      sequence: function (e) {
        return ("needs" === e ? require("../../../utils/needs-study.js").list() : o.list(e)).map(function (e, t) {
          return {
            id: e.id,
            term: e.term,
            position: t + 1
          };
        });
      },
      resolveCard: function (e) {
        var i = o.byId[e];
        return i ? r._(t._({}, i), {
          pinyin: "",
          pos: "",
          tone: "",
          core: i.excerpt || "学习资料正在同步",
          memory: i.excerpt || i.term,
          usageLabels: [],
          contexts: [],
          pairs: [],
          stats: [],
          examples: [],
          correctIds: [],
          distractorIds: [],
          unknownIds: []
        }) : null;
      },
      book: function () {
        wx.navigateTo({
          url: "/logic/book/index?id=" + this.word.id + "&bank=" + encodeURIComponent(this.bank)
        });
      }
    }),
    l = d.onLoad;
  return d.onLoad = function (e) {
    l.call(this, e), this.word && (this.setData({
      tab: "questions",
      detailLoading: !0,
      detailError: !1
    }), this.loadDetail());
  }, d.loadDetail = e._(function () {
    var e, s;
    return i._(this, function (i) {
      switch (i.label) {
        case 0:
          if (!this.word) return [2];
          this.setData({
            detailLoading: !0,
            detailError: !1
          }), i.label = 1;
        case 1:
          return i.trys.push([1, 3, 4, 5]), [4, a.call("wordDetail", {
            wordId: this.word.id
          })];
        case 2:
          if (e = i.sent(), this.leaving) return [2];
          return this.word = r._(t._({}, this.word, e.card), {
            examples: e.card.examples.map(function (e) {
              return r._(t._({}, e), {
                parts: n.parts(e)
              });
            })
          }), this.setData({
            word: this.word,
            shownExamples: this.word.examples.slice(0, this.data.examplesExpanded ? this.word.examples.length : 4),
            realWord: "real" === this.word.kind
          }), this.startStudyClock(), this.refreshUnderstanding(), (s = this.sequence && this.sequence[this.index + 1]) && a.call("wordDetail", {
            wordId: s.id
          }).then(function (e) {
            e.card.examples.length && a.call("source", {
              wordId: s.id,
              index: 0
            }, {
              priority: !1
            }).catch(function () {});
          }).catch(function () {}), this.prepareSourceExamples(this.word.examples.slice(0, 4).map(function (e, t) {
            return t;
          })), [3, 5];
        case 3:
          return i.sent(), this.leaving || this.setData({
            detailError: !0
          }), [3, 5];
        case 4:
          return this.leaving || this.setData({
            detailLoading: !1
          }), [7];
        case 5:
          return [2];
      }
    });
  }), d;
};
