Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../../@swc/runtime/_object_spread.js"),
  s = require("../../../@swc/runtime/_object_spread_props.js"),
  t = require("./source-provider.js"),
  r = require("./idiom-study-base.js"),
  a = require("./study-usage-page.js"),
  i = require("./study-notes-page.js"),
  o = require("./study-understanding-page.js"),
  n = require("../../../utils/study-cloud.js"),
  d = require("./idiom-example.js");
module.exports = function (l) {
  var u = {};
  Object.keys(l.cards).forEach(function (t) {
    var r = l.cards[t];
    u[t] = s._(e._({}, r), {
      examples: r.examples.map(function (t) {
        return s._(e._({}, t), {
          text: d.quote(t),
          parts: d.parts(t)
        });
      })
    });
  });
  var c = r(s._(e._({}, l), {
      cards: u
    })),
    p = c.onLoad,
    h = c.onShow,
    m = c.switchTab,
    f = c.onUnload;
  return Object.assign(c, a, i, o), c.data = s._(e._({}, c.data), {
    usage: null,
    usageEdited: !1,
    editorOpen: !1,
    editorTitle: "",
    editorValue: "",
    sourceOpen: !1,
    sourceTitle: "",
    sourceMeta: "",
    sourceParts: [],
    posts: [],
    notesLoading: !1,
    notesMore: !1,
    noteSaving: !1,
    cloudReady: n.ready(),
    shareNotes: n.signedIn() && !1 !== n.profile().shareNotes,
    profileOpen: !1,
    profileNickname: "",
    profileAvatar: "",
    profileSaving: !1
  }), c.onLoad = function (e) {
    var s = this;
    this.remotePosts = [], this.understandingRows = [], p.call(this, e), this.word && (this.setData({
      examplesExpanded: !1,
      shownExamples: this.word.examples.slice(0, 4),
      simpleUnderstanding: this.word.memory,
      sourcePreparingIndex: -1
    }), this.refreshPosts(), this.refreshUnderstanding(), this.sourcePrefetchTimer = setTimeout(function () {
      s.prepareSourceExamples(s.word.examples.slice(0, 4).map(function (e, s) {
        return s;
      }));
      var e = s.sequence && s.sequence[s.index + 1],
        t = e && l.cards[e.id];
      t && t.examples.length && n.call("source", {
        wordId: e.id,
        index: 0
      }, {
        priority: !1
      }).catch(function () {});
    }, 250), n.ready() && this.loadUnderstandings());
  }, c.onShow = function () {
    h.call(this), this.word && (this.setData({
      shareNotes: n.signedIn() && !1 !== n.profile().shareNotes
    }), this.refreshPosts(), this.refreshUnderstanding(), "notes" === this.data.tab && this.loadPosts());
  }, c.toggleExamples = function () {
    var e = !this.data.examplesExpanded;
    this.setData({
      examplesExpanded: e,
      shownExamples: this.word.examples.slice(0, e ? this.word.examples.length : 4)
    }), e && this.prepareSourceExamples(this.word.examples.slice(4).map(function (e, s) {
      return s + 4;
    }));
  }, c.switchTab = function (e) {
    m.call(this, e), "notes" === this.data.tab && this.loadPosts();
  }, c.onUnload = function () {
    this.leaving = !0, clearTimeout(this.sourcePrefetchTimer), this.word && t.cancel(this.word.id), f.call(this);
  }, require("./word-study-clock-page.js")(c);
};
