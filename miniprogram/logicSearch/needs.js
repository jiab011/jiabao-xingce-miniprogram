Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../@swc/runtime/_object_spread.js"),
  e = require("../@swc/runtime/_object_spread_props.js"),
  i = require("../utils/needs-study.js"),
  r = require("./_shared/utils/idiom-navigation.js");
Page({
  data: {
    rows: [],
    filter: "pending",
    learned: 0,
    total: 0,
    rowSwiping: !1
  },
  onShow: function () {
    this.refresh();
  },
  onUnload: function () {
    clearTimeout(this._removeTimer);
  },
  refresh: function () {
    var r = i.list();
    this._openId = "", this.setData({
      learned: r.filter(function (t) {
        return t.learned;
      }).length,
      total: r.length,
      rows: i.list(this.data.filter).map(function (i) {
        return e._(t._({}, i), {
          offset: 0
        });
      }),
      rowSwiping: !1
    });
  },
  filter: function (t) {
    this.setData({
      filter: t.currentTarget.dataset.filter
    }), this.refresh();
  },
  open: function (t) {
    if (!(Date.now() < (this._ignoreOpenUntil || 0))) {
      if (this._openId) {
        this.positionRow("", 0);
        return;
      }
      r.openWord(t.currentTarget.dataset.id, !1, "needs");
    }
  },
  positionRow: function (i, r) {
    this.setData({
      rows: this.data.rows.map(function (n) {
        return e._(t._({}, n), {
          offset: n.id === i ? r : 0
        });
      })
    }), this._openId = r ? i : "";
  },
  rowStart: function (t) {
    var e = t.touches && t.touches[0],
      i = t.currentTarget.dataset.id;
    if (e) {
      var r = this.data.rows.find(function (t) {
        return t.id === i;
      });
      this._rowTouch = {
        id: i,
        x: e.clientX,
        y: e.clientY,
        base: r.offset || 0,
        active: !1
      };
    }
  },
  rowMove: function (t) {
    var e = this._rowTouch,
      i = t.touches && t.touches[0];
    if (e && i) {
      var r = i.clientX - e.x,
        n = i.clientY - e.y;
      if (!e.active) {
        if (Math.abs(n) > 14 && Math.abs(n) > Math.abs(r)) {
          this._rowTouch = null;
          return;
        }
        if (12 > Math.abs(r) || Math.abs(r) < 1.4 * Math.abs(n)) return;
        e.active = !0, this.setData({
          rowSwiping: !0
        });
      }
      var o = this.deleteWidth();
      this.positionRow(e.id, Math.max(-o - 12, Math.min(0, e.base + r)));
    }
  },
  rowEnd: function () {
    var t = this._rowTouch;
    if (this._rowTouch = null, this.setData({
      rowSwiping: !1
    }), t && t.active) {
      this._ignoreOpenUntil = Date.now() + 400;
      var e = this.data.rows.find(function (e) {
        return e.id === t.id;
      });
      this.positionRow(t.id, e && e.offset < -(.4 * this.deleteWidth()) ? -this.deleteWidth() : 0);
    }
  },
  rowCancel: function () {
    this._rowTouch = null, this.setData({
      rowSwiping: !1
    }), this.positionRow("", 0);
  },
  deleteWidth: function () {
    var t = 375;
    try {
      t = (wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()).windowWidth || 375;
    } catch (t) {}
    return t >= 760 ? 88.75 : t / 750 * 142;
  },
  remove: function (r) {
    var n = this,
      o = r.currentTarget.dataset.id;
    i.remove(o) && (this._ignoreOpenUntil = Date.now() + 400, this.setData({
      rows: this.data.rows.map(function (i) {
        return e._(t._({}, i), {
          removing: i.id === o
        });
      })
    }), clearTimeout(this._removeTimer), this._removeTimer = setTimeout(function () {
      return n.refresh();
    }, 220));
  }
});
