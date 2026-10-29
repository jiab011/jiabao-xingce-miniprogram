Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../@swc/runtime/_async_to_generator.js"),
  e = require("../@swc/runtime/_object_spread.js"),
  s = require("../@swc/runtime/_object_spread_props.js"),
  r = require("../@swc/runtime/_to_consumable_array.js"),
  i = require("../@swc/runtime/_ts_generator.js"),
  a = require("./utils/api.js"),
  n = require("./utils/store.js"),
  o = require("./utils/navigation.js");
Page({
  data: {
    title: "题目收藏",
    kind: "favorites",
    step: "questions",
    books: [],
    papers: [],
    rows: [],
    loading: !1,
    error: "",
    total: 0,
    busy: !1
  },
  onLoad: function (t) {
    this.module = a.moduleInfo(t.module), this.kind = "wrong" === t.kind ? "wrong" : "favorites", this.setData({
      kind: this.kind,
      title: "wrong" === this.kind ? "错题集" : "题目收藏",
      step: "wrong" === this.kind ? "groups" : "questions"
    }), wx.setNavigationBarTitle({
      title: this.module.name + " \xb7 " + this.data.title
    });
  },
  onShow: function () {
    this.refresh();
  },
  refresh: function () {
    var t = this,
      i = n.read(this.module.id),
      a = Object.values(i.wrongs);
    if (this.wrongs = a, "favorites" === this.kind) {
      this.ids = i.favorites.slice(), this.setData({
        total: this.ids.length
      }), this.loadRows();
      return;
    }
    if ("groups" === this.data.step) this.setData({
      books: this.module.groups.map(function (t) {
        return s._(e._({}, t), {
          count: a.filter(function (e) {
            return e.source.group === t.id;
          }).length
        });
      }),
      total: a.length
    });else if ("papers" === this.data.step) {
      var o = {};
      a.filter(function (e) {
        return e.source.group === t.group;
      }).forEach(function (t) {
        var e = t.source.paperId;
        o[e] || (o[e] = {
          id: e,
          title: t.source.title,
          count: 0
        }), o[e].count++;
      }), this.setData({
        papers: Object.values(o)
      });
    } else this.selectedWrongs = a.filter(function (e) {
      return e.source.paperId === t.paperId;
    }), this.ids = r._(new Set(this.selectedWrongs.map(function (t) {
      return t.id;
    }))), this.setData({
      total: this.ids.length
    }), this.loadRows();
  },
  openGroup: function (t) {
    this.group = t.currentTarget.dataset.id, this.setData({
      step: "papers"
    }), this.refresh();
  },
  openPaper: function (t) {
    this.paperId = t.currentTarget.dataset.id, this.setData({
      step: "questions"
    }), this.refresh();
  },
  back: function () {
    this.setData({
      step: "questions" === this.data.step ? "papers" : "groups",
      rows: [],
      error: ""
    }), this.refresh();
  },
  loadRows: function () {
    return t._(function () {
      var t, e, s;
      return i._(this, function (r) {
        switch (r.label) {
          case 0:
            this.setData({
              loading: !0,
              error: ""
            }), r.label = 1;
          case 1:
            if (r.trys.push([1, 5, 6, 7]), !this.ids.length) return [3, 3];
            return [4, a.call("lookup", {
              module: this.module.id,
              ids: this.ids.slice(0, 200)
            })];
          case 2:
            return e = r.sent(), [3, 4];
          case 3:
            e = {
              rows: []
            }, r.label = 4;
          case 4:
            return t = e, this.setData({
              rows: t.rows
            }), [3, 7];
          case 5:
            return s = r.sent(), this.setData({
              error: s.message
            }), [3, 7];
          case 6:
            return this.setData({
              loading: !1
            }), [7];
          case 7:
            return [2];
        }
      });
    }).apply(this);
  },
  open: function (e) {
    return t._(function () {
      var t, s;
      return i._(this, function (r) {
        switch (r.label) {
          case 0:
            if (t = e.currentTarget.dataset.id, "wrong" !== this.kind) return [3, 2];
            return [4, this.start(e)];
          case 1:
            return r.sent(), [2];
          case 2:
            this.setData({
              busy: !0,
              error: ""
            }), r.label = 3;
          case 3:
            return r.trys.push([3, 5, 6, 7]), [4, o.start(this.module.id, {
              kind: "review",
              ids: [t]
            }, {
              readOnly: !0
            })];
          case 4:
            return r.sent(), [3, 7];
          case 5:
            return s = r.sent(), this.setData({
              error: s.message
            }), [3, 7];
          case 6:
            return this.setData({
              busy: !1
            }), [7];
          case 7:
            return [2];
        }
      });
    }).apply(this);
  },
  start: function (e) {
    return t._(function () {
      var t, s, r, a;
      return i._(this, function (i) {
        switch (i.label) {
          case 0:
            if (this.data.busy) return [2];
            this.setData({
              busy: !0,
              error: ""
            }), i.label = 1;
          case 1:
            return i.trys.push([1, 3, 4, 5]), s = (t = e && e.currentTarget && e.currentTarget.dataset.id) ? this.ids.slice(this.ids.indexOf(t), this.ids.indexOf(t) + 200) : this.ids.slice(0, 200), r = {}, "wrong" === this.kind && (this.selectedWrongs || []).forEach(function (t) {
              return r[t.id] = t.source;
            }), [4, o.start(this.module.id, {
              kind: "wrong" === this.kind ? "wrongReview" : "favorites",
              ids: s
            }, {
              origins: r
            })];
          case 2:
            return i.sent(), [3, 5];
          case 3:
            return a = i.sent(), this.setData({
              error: a.message
            }), [3, 5];
          case 4:
            return this.setData({
              busy: !1
            }), [7];
          case 5:
            return [2];
        }
      });
    }).apply(this);
  }
});
