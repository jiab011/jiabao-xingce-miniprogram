Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../../../@swc/runtime/_async_to_generator.js"),
  e = require("../../../@swc/runtime/_object_spread.js"),
  i = require("../../../@swc/runtime/_object_spread_props.js"),
  n = require("../../../@swc/runtime/_ts_generator.js");
Component({
  properties: {
    value: {
      type: Array,
      value: []
    },
    color: {
      type: String,
      value: "#202124"
    },
    tool: {
      type: String,
      value: "pen"
    },
    readonly: {
      type: Boolean,
      value: !1
    },
    visible: {
      type: Boolean,
      value: !0
    }
  },
  observers: {
    value: function (t) {
      this._strokes = JSON.parse(JSON.stringify(t || [])), this.repaint();
    },
    visible: function (t) {
      var e = this;
      if (t) {
        var i = function () {
          return e.measure().then(function () {
            return e.repaint();
          });
        };
        wx.nextTick ? wx.nextTick(i) : i();
      }
    }
  },
  lifetimes: {
    attached: function () {
      this._strokes = JSON.parse(JSON.stringify(this.data.value || []));
    },
    ready: function () {
      var t = this;
      this.measure().then(function () {
        return t.repaint();
      });
    },
    detached: function () {
      this._detached = !0;
    }
  },
  pageLifetimes: {
    resize: function () {
      var t = this;
      this.end().then(function () {
        return t.measure();
      }).then(function () {
        return t.repaint();
      });
    },
    hide: function () {
      this.end();
    }
  },
  methods: {
    measure: function () {
      var t = this;
      return new Promise(function (e) {
        t.createSelectorQuery().select("#noteCanvas").fields({
          node: !0,
          size: !0,
          rect: !0
        }, function (i) {
          if (!i || !i.node || !i.width || !i.height || t._detached) {
            e(!1);
            return;
          }
          t._box = i, t._canvas = i.node, t._ctx = i.node.getContext("2d");
          var n = Math.min(3, (wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()).pixelRatio || 1),
            r = Math.round(i.width * n),
            s = Math.round(i.height * n);
          (i.node.width !== r || i.node.height !== s) && (i.node.width = r, i.node.height = s, t._ctx.scale(n, n)), e(!0);
        }).exec();
      });
    },
    start: function (t) {
      var e = this;
      !this.data.readonly && t.touches && 1 === t.touches.length && (this._events = [t.touches[0]], this._stroke = {
        tool: this.data.tool,
        color: this.data.color,
        width: "eraser" === this.data.tool ? 220 : 38,
        points: []
      }, this._measuring = this.measure().then(function (t) {
        if (!t) {
          e._stroke = null, e.triggerEvent("paderror", {
            message: "手写区域未就绪，请切换到文字后重新打开"
          });
          return;
        }
        e.repaint();
        var i = !0,
          n = !1,
          r = void 0;
        try {
          for (var s, h = (e._events || [])[Symbol.iterator](); !(i = (s = h.next()).done); i = !0) {
            var o = s.value;
            e.append(o);
          }
        } catch (t) {
          n = !0, r = t;
        } finally {
          try {
            i || null == h.return || h.return();
          } finally {
            if (n) throw r;
          }
        }
        e._events = null;
      }));
    },
    move: function (t) {
      if (this._stroke && t.touches && t.touches.length) {
        var e = t.touches[0];
        this._events ? this._events.push(e) : this.append(e);
      }
    },
    append: function (t) {
      if (this._stroke && this._box) {
        var n = this._box,
          r = Number.isFinite(t.clientX) ? t.clientX : t.x,
          s = Number.isFinite(t.clientY) ? t.clientY : t.y,
          h = [Math.round(1e4 * Math.max(0, Math.min(1, (r - n.left) / n.width))), Math.round(1e4 * Math.max(0, Math.min(1, (s - n.top) / n.height)))],
          o = this._stroke.points,
          a = o[o.length - 1];
        !(a && Math.abs(a[0] - h[0]) + Math.abs(a[1] - h[1]) < 9) && (o.length >= 1200 || (o.push(h), this.paint(i._(e._({}, this._stroke), {
          points: a ? [a, h] : [h]
        }))));
      }
    },
    end: function (e) {
      return t._(function () {
        var t, i;
        return n._(this, function (n) {
          switch (n.label) {
            case 0:
              if (e && e.changedTouches && e.changedTouches[0] && this._stroke && (this._events ? this._events.push(e.changedTouches[0]) : this.append(e.changedTouches[0])), !this._measuring) return [3, 2];
              return [4, this._measuring];
            case 1:
              n.sent(), n.label = 2;
            case 2:
              return this._measuring = null, t = this._stroke, this._stroke = null, t && t.points.length && ((i = (this._strokes || []).concat([t])).length > 200 || i.reduce(function (t, e) {
                return t + e.points.length;
              }, 0) > 8e3 ? (this.triggerEvent("paderror", {
                message: "手写内容已较多，请清除不需要的部分"
              }), this.repaint()) : (this._strokes = i, this.triggerEvent("change", {
                strokes: JSON.parse(JSON.stringify(i))
              }))), [2, this.snapshot()];
          }
        });
      }).apply(this);
    },
    finish: function () {
      return this.end();
    },
    snapshot: function () {
      return JSON.parse(JSON.stringify(this._strokes || []));
    },
    clear: function () {
      return t._(function () {
        return n._(this, function (t) {
          switch (t.label) {
            case 0:
              return [4, this.end()];
            case 1:
              return t.sent(), this._strokes = [], this.repaint(), this.triggerEvent("change", {
                strokes: []
              }), [2];
          }
        });
      }).apply(this);
    },
    paint: function (t) {
      var e = this._ctx,
        i = this._box;
      if (e && i && t.points.length) {
        e.strokeStyle = "eraser" === t.tool ? "#ffffff" : t.color, e.fillStyle = e.strokeStyle, e.lineWidth = t.width / 1e4 * i.width, e.lineCap = "round", e.lineJoin = "round";
        var n = t.points;
        if (e.beginPath(), e.moveTo(n[0][0] / 1e4 * i.width, n[0][1] / 1e4 * i.height), 1 === n.length) e.arc(n[0][0] / 1e4 * i.width, n[0][1] / 1e4 * i.height, e.lineWidth / 2, 0, 2 * Math.PI), e.fill();else {
          for (var r = 1; r < n.length; r++) e.lineTo(n[r][0] / 1e4 * i.width, n[r][1] / 1e4 * i.height);
          e.stroke();
        }
      }
    },
    repaint: function () {
      if (this._ctx && this._box) {
        this._ctx.fillStyle = "#fff", this._ctx.fillRect(0, 0, this._box.width, this._box.height);
        var t = !0,
          e = !1,
          i = void 0;
        try {
          for (var n, r = (this._strokes || [])[Symbol.iterator](); !(t = (n = r.next()).done); t = !0) {
            var s = n.value;
            this.paint(s);
          }
        } catch (t) {
          e = !0, i = t;
        } finally {
          try {
            t || null == r.return || r.return();
          } finally {
            if (e) throw i;
          }
        }
      }
    }
  }
});
