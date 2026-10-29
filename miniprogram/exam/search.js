Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_async_to_generator.js"),
  t = require("../@swc/runtime/_ts_generator.js"),
  r = require("./utils/api.js"),
  a = require("./utils/navigation.js");
Page({
  data: {
    query: "",
    rows: [],
    total: 0,
    loading: !1,
    error: "",
    searched: !1,
    busy: ""
  },
  onLoad: function (e) {
    this.module = r.moduleInfo(e.module), wx.setNavigationBarTitle({
      title: this.module.name + "搜题"
    });
  },
  input: function (e) {
    this.setData({
      query: e.detail.value
    });
  },
  search: function (a) {
    return e._(function () {
      var e, s, n, i;
      return t._(this, function (t) {
        switch (t.label) {
          case 0:
            if (this.data.loading || !(e = this.data.query.trim())) return [2];
            s = a && a.currentTarget && a.currentTarget.dataset.more, this.setData({
              loading: !0,
              error: "",
              searched: !0
            }), t.label = 1;
          case 1:
            return t.trys.push([1, 3, 4, 5]), [4, r.call("search", {
              module: this.module.id,
              query: e,
              offset: s && this.next || 0
            })];
          case 2:
            return n = t.sent(), this.next = n.next, this.setData({
              rows: s ? this.data.rows.concat(n.rows) : n.rows,
              total: n.total,
              hasMore: null !== n.next
            }), [3, 5];
          case 3:
            return i = t.sent(), this.setData({
              error: i.message
            }), [3, 5];
          case 4:
            return this.setData({
              loading: !1
            }), [7];
          case 5:
            return [2];
        }
      });
    }).apply(this);
  },
  open: function (r) {
    return e._(function () {
      var e, s;
      return t._(this, function (t) {
        switch (t.label) {
          case 0:
            if (this.data.busy) return [2];
            e = r.currentTarget.dataset.id, this.setData({
              busy: e,
              error: ""
            }), t.label = 1;
          case 1:
            return t.trys.push([1, 3, 4, 5]), [4, a.start(this.module.id, {
              kind: "review",
              ids: [e]
            }, {
              readOnly: !0
            })];
          case 2:
            return t.sent(), [3, 5];
          case 3:
            return s = t.sent(), this.setData({
              error: s.message
            }), [3, 5];
          case 4:
            return this.setData({
              busy: ""
            }), [7];
          case 5:
            return [2];
        }
      });
    }).apply(this);
  }
});
