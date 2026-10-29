var t = require("./idiom-navigation.js"),
  i = require("../../../utils/logic-store.js");
module.exports = function (e) {
  return {
    data: {
      word: null,
      letters: [],
      tab: "questions",
      favorite: !1,
      learned: !1,
      position: 1,
      total: t.index.length,
      hasPrevious: !1,
      hasNext: !1,
      listOpen: !1,
      listQuery: "",
      listWords: [],
      note: "",
      noteState: "",
      noteEditing: !1
    },
    onLoad: function (n) {
      var s = this;
      if (this.word = e.cards[n.id] || e.resolveCard && e.resolveCard(n.id), !this.word) {
        wx.showToast({
          title: "未找到这个成语",
          icon: "none"
        });
        return;
      }
      this.bank = n.bank || (e.defaultBank ? e.defaultBank(this.word) : "idiom-high"), this.sequence = e.sequence ? e.sequence(this.bank) : t.sequence(this.bank), this.index = this.sequence.findIndex(function (t) {
        return t.id === s.word.id;
      }), this.noteDirty = !1, this.setData({
        word: this.word,
        letters: this.word.term.split(""),
        position: this.index + 1,
        total: this.sequence.length,
        realWord: "real" === this.word.kind,
        hasPrevious: this.index > 0,
        hasNext: this.index < this.sequence.length - 1
      }), i.setCursor(this.bank, this.word.id), wx.setNavigationBarTitle({
        title: {
          "idiom-high": "公考高频成语",
          "idiom-correct": "公考正选成语",
          "national-high": "国考高频成语",
          "national-all": "国考历年全部成语",
          "real-high": "公考高频实词",
          "real-correct": "高频正选实词",
          needs: "需要学习"
        }[this.bank] || "词语学习"
      });
    },
    onShow: function () {
      if (this.word) {
        var t = i.read(),
          e = t.notes[this.word.id],
          n = {
            favorite: t.wordFavorites.includes(this.word.id),
            learned: t.learnedIds.includes(this.word.id)
          };
        this.noteDirty || (n.note = e ? e.text : "", n.noteState = e ? "已保存到本机" : "笔记保存在本机"), this.setData(n);
      }
    },
    onHide: function () {
      this.flushNote();
    },
    onUnload: function () {
      this.flushNote();
    },
    switchTab: function (t) {
      this.setData({
        tab: t.currentTarget.dataset.tab
      });
    },
    favorite: function () {
      i.toggle("wordFavorites", this.word.id), this.onShow();
    },
    learn: function () {
      !this.data.learned && i.setLearned(this.word.id, !0) && this.onShow();
    },
    previous: function () {
      this.move(-1);
    },
    next: function () {
      this.move(1);
    },
    move: function (i) {
      var e = this.sequence[this.index + i];
      e && (this.flushNote(), t.openWord(e.id, !0, this.bank));
    },
    openList: function () {
      this.setData({
        listOpen: !0,
        listQuery: ""
      }), this.refreshList("");
    },
    closeList: function () {
      this.setData({
        listOpen: !1
      });
    },
    noop: function () {},
    filterList: function (t) {
      this.setData({
        listQuery: t.detail.value
      }), this.refreshList(t.detail.value);
    },
    refreshList: function (t) {
      var e = this,
        n = i.read().learnedIds;
      this.setData({
        listWords: this.sequence.filter(function (i) {
          return !t || i.term.includes(t.trim());
        }).map(function (t) {
          return {
            id: t.id,
            term: t.term,
            position: t.position,
            current: t.id === e.word.id,
            learned: n.includes(t.id)
          };
        })
      });
    },
    jump: function (i) {
      var e = i.currentTarget.dataset.id;
      this.flushNote(), this.closeList(), e !== this.word.id && t.openWord(e, !0, this.bank);
    },
    openOther: function (i) {
      t.openWord(i.currentTarget.dataset.id);
    },
    source: function (t) {
      var i = this.word.examples[Number(t.currentTarget.dataset.index)];
      i && wx.showModal({
        title: i.site + " \xb7 " + i.date,
        content: i.title + "\n" + (i.origin ? "来源：" + i.origin + "\n" : "") + "\n" + i.text + "\n\n" + (i.excerpt ? "例句为原文节选。" : "例句保留原文。") + "点击下方按钮复制文章链接。",
        confirmText: "复制链接",
        cancelText: "关闭",
        success: function (t) {
          t.confirm && wx.setClipboardData({
            data: i.url
          });
        }
      });
    },
    book: function () {
      if (e.book) {
        e.book.call(this);
        return;
      }
      wx.navigateTo({
        url: t.byId[this.word.id].route.replace("/study", "/book") + "?id=" + this.word.id + "&bank=" + encodeURIComponent(this.bank)
      });
    },
    practice: function () {
      i.openQuestion(this.word.qids[0], this.word.qids, !1, "practice", {
        kind: "vocabulary",
        libraryId: this.bank,
        wordId: this.word.id
      });
    },
    noteInput: function (t) {
      this.noteDirty = !0, this.setData({
        note: t.detail.value,
        noteState: "待保存"
      });
    },
    flushNote: function () {
      if (this.word && this.noteDirty) {
        var t = i.saveNote(this.word.id, this.data.note);
        return t && (this.noteDirty = !1, this.setData({
          noteState: this.data.note.trim() ? "已保存到本机" : "空笔记已清除"
        })), t;
      }
    },
    saveNote: function () {
      !1 !== this.flushNote() && wx.showToast({
        title: "笔记已保存",
        icon: "success"
      });
    },
    startNote: function () {
      this.setData({
        noteEditing: !0
      });
    }
  };
};
