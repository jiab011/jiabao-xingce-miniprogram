Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../../@swc/runtime/_async_to_generator.js"),
  t = require("../../../@swc/runtime/_object_spread.js"),
  s = require("../../../@swc/runtime/_ts_generator.js"),
  r = require("../../../utils/logic-store.js"),
  i = require("../../../utils/study-cloud.js"),
  a = require("./source-provider.js");
module.exports = {
  source: function (t) {
    return e._(function () {
      var e, r, i, n;
      return s._(this, function (s) {
        switch (s.label) {
          case 0:
            if (e = Number(t.currentTarget.dataset.index), !(r = this.word.examples[e])) return [2];
            i = (this.sourceRequest || 0) + 1, this.sourceRequest = i, this.sourceIndex = e, this.setData({
              sourcePreparingIndex: e,
              sourceError: !1
            }), s.label = 1;
          case 1:
            return s.trys.push([1, 3, 4, 5]), [4, a.get(this.word.id, e, !0)];
          case 2:
            if (n = s.sent(), this.leaving || i !== this.sourceRequest) return [2];
            return this.setData({
              sourceOpen: !0,
              sourceTitle: n.title,
              sourceMeta: n.site + " \xb7 " + n.date,
              sourceParts: n.parts,
              sourceLoading: !1,
              sourceError: !1,
              sourceHint: ""
            }), [3, 5];
          case 3:
            return s.sent(), this.leaving || i !== this.sourceRequest || this.setData({
              sourceOpen: !0,
              sourceTitle: r.title || "原文出处",
              sourceMeta: r.site + " \xb7 " + r.date,
              sourceParts: [],
              sourceLoading: !1,
              sourceError: !0,
              sourceHint: "出处暂未打开，点击重试"
            }), [3, 5];
          case 4:
            return this.leaving || i !== this.sourceRequest || this.setData({
              sourcePreparingIndex: -1
            }), [7];
          case 5:
            return [2];
        }
      });
    }).apply(this);
  },
  prepareSourceExamples: function (e) {
    a.prefetch(this.word.id, e);
  },
  retrySource: function () {
    this.data.sourceError && this.source({
      currentTarget: {
        dataset: {
          index: this.sourceIndex
        }
      }
    });
  },
  closeSource: function () {
    this.sourceRequest = (this.sourceRequest || 0) + 1, this.setData({
      sourceOpen: !1,
      sourceLoading: !1
    });
  },
  baseUsage: function () {
    return {
      contexts: this.word.contexts.slice(),
      signal: this.word.memory,
      signalGuide: "把词放回原句，核对它描述的对象、程度和前后逻辑。",
      trap: this.word.trap || (this.word.pairs.length ? this.word.pairs[0].tip : "先判断词义和语境是否对应，再辨别感情色彩。")
    };
  },
  refreshUsage: function () {
    var e = this.baseUsage(),
      t = r.read(),
      s = t.activeStudyAccount && !i.signedIn() ? null : t.usageOverrides[this.word.id],
      a = s ? s.fields : {};
    Object.keys(a || {}).forEach(function (t) {
      if (/^context[0-9]$/.test(t)) {
        var s = Number(t.slice(7));
        s < e.contexts.length && (e.contexts[s] = a[t]);
      } else ["signal", "signalGuide", "trap"].includes(t) && (e[t] = a[t]);
    }), this.setData({
      usage: e,
      usageEdited: Object.keys(a || {}).length > 0
    });
  },
  editUsage: function (e) {
    if (i.ready() && !i.signedIn()) {
      this.goAccount();
      return;
    }
    var t = e.currentTarget.dataset.field;
    this.editingField = t;
    var s = /^context/.test(t) ? this.data.usage.contexts[Number(t.slice(7))] : this.data.usage[t];
    this.setData({
      editorOpen: !0,
      editorTitle: /^context/.test(t) ? "修改我的搭配方向" : "trap" === t ? "修改我的易错点" : "修改我的选词信号",
      editorValue: s || ""
    });
  },
  usageInput: function (e) {
    this.setData({
      editorValue: e.detail.value
    });
  },
  closeEditor: function () {
    this.setData({
      editorOpen: !1
    });
  },
  saveUsage: function () {
    var e = this.data.editorValue.trim();
    if (!e) {
      wx.showToast({
        title: "写一点自己的总结再保存",
        icon: "none"
      });
      return;
    }
    var s = r.read().usageOverrides[this.word.id],
      i = t._({}, s ? s.fields : {});
    i[this.editingField] = e, r.setUsage(this.word.id, i) && (this.refreshUsage(), this.closeEditor(), this.syncUsage(i));
  },
  restoreUsageField: function () {
    var e = r.read().usageOverrides[this.word.id],
      s = t._({}, e ? e.fields : {});
    delete s[this.editingField], r.setUsage(this.word.id, s) && (this.refreshUsage(), this.closeEditor(), this.syncUsage(s));
  },
  loadUsage: function () {
    return e._(function () {
      var e, t, a, n;
      return s._(this, function (s) {
        switch (s.label) {
          case 0:
            e = r.read().usageOverrides[this.word.id], t = i.profile().uid, s.label = 1;
          case 1:
            return s.trys.push([1, 3,, 4]), [4, i.call("readUsage", {
              wordId: this.word.id
            })];
          case 2:
            if (a = s.sent(), n = r.read().usageOverrides[this.word.id], this.leaving || t !== i.profile().uid || JSON.stringify(n) !== JSON.stringify(e)) return [2];
            return a.updatedAt && (!n || a.updatedAt > n.updatedAt) ? (r.setUsage(this.word.id, a.fields, a.updatedAt), this.refreshUsage()) : n && JSON.stringify(n.fields) !== JSON.stringify(a.fields) && this.syncUsage(n.fields), [3, 4];
          case 3:
            return s.sent(), [3, 4];
          case 4:
            return [2];
        }
      });
    }).apply(this);
  },
  syncUsage: function (t) {
    return e._(function () {
      var e, a, n;
      return s._(this, function (s) {
        switch (s.label) {
          case 0:
            if (!i.ready() || !i.signedIn()) return [2];
            e = i.profile().uid, s.label = 1;
          case 1:
            return s.trys.push([1, 3,, 4]), [4, i.call("saveUsage", {
              wordId: this.word.id,
              fields: t
            })];
          case 2:
            return a = s.sent(), n = r.read().usageOverrides[this.word.id], e === i.profile().uid && n && JSON.stringify(n.fields) === JSON.stringify(t) && r.setUsage(this.word.id, t, a.updatedAt), [3, 4];
          case 3:
            return s.sent(), this.leaving || wx.showToast({
              title: "修改已存本机，暂未同步",
              icon: "none"
            }), [3, 4];
          case 4:
            return [2];
        }
      });
    }).apply(this);
  }
};
