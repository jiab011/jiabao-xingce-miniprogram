var t = require("../../utils/question-annotations.js");
function e(t, e, i) {
  t.globalCompositeOperation = "eraser" === e.tool ? "destination-out" : "source-over", t.strokeStyle = e.color, t.globalAlpha = 1, t.lineWidth = e.width * i / 1e4, t.lineCap = "round", t.lineJoin = "round", t.beginPath(), e.points.forEach(function (e, n) {
    return n ? t.lineTo(e[0] * i / 1e4, e[1] * i / 1e4) : t.moveTo(e[0] * i / 1e4, e[1] * i / 1e4);
  }), 1 === e.points.length && t.lineTo(e.points[0][0] * i / 1e4 + .5, e.points[0][1] * i / 1e4 + .5), t.stroke();
}
function i(t) {
  var e = t.touches && t.touches[0];
  return e ? {
    clientX: e.clientX,
    clientY: e.clientY,
    x: e.x,
    y: e.y
  } : null;
}
Component({
  data: {
    hasMarks: !1
  },
  properties: {
    resource: {
      type: String,
      value: ""
    },
    font: {
      type: Number,
      value: 32
    },
    enabled: {
      type: Boolean,
      value: !1
    },
    color: {
      type: String,
      value: "#202124"
    },
    tool: {
      type: String,
      value: "pen"
    }
  },
  observers: {
    "resource,font": function () {
      this.attachResource();
    },
    enabled: function () {
      var t = this;
      this.end(), this._ctx = null, this.afterRender(function () {
        return t.refresh();
      });
    }
  },
  lifetimes: {
    ready: function () {
      this.attachResource();
    },
    detached: function () {
      this.end(), this._detached = !0, this._pendingStart = null, this._subscription && this._subscription.unsubscribe();
    }
  },
  methods: {
    afterRender: function (t) {
      wx.nextTick ? wx.nextTick(t) : t();
    },
    attachResource: function () {
      var e = this;
      this.end(), this._pendingStart = null, this._subscription && this._subscription.unsubscribe(), this.data.resource && (this._subscription = t.subscribe(this.data.resource, function () {
        return e.redraw();
      }), this._entry = this._subscription.entry, this.presence(), this.afterRender(function () {
        return e.refresh();
      }));
    },
    presence: function () {
      var e = this,
        i = !!(this._entry && t.visible(this._entry, String(this.data.font), "workspace").length);
      return !!this.data.hasMarks !== i && (this.setData ? this.setData({
        hasMarks: i
      }) : this.data.hasMarks = i, this.afterRender(function () {
        return e.refresh();
      })), i || this.data.enabled;
    },
    configure: function (t) {
      if (!t || !t.node || !t.width || !t.height) return !1;
      var e = t.node,
        i = Math.min(2, 4096 / t.height),
        n = Math.round(t.width * i),
        r = Math.round(t.height * i);
      return this._canvas === e && e.width === n && e.height === r && this._ctx || (e.width = n, e.height = r, this._ctx = e.getContext("2d"), this._ctx.scale(i, i)), this._canvas = e, this._box = t, this._boxScrollTop = this._scrollTop || 0, !0;
    },
    refresh: function () {
      var t = this;
      !this._detached && (this.data.enabled || this.data.hasMarks) && wx.createSelectorQuery().in(this).select(".ink-layer-canvas").fields({
        node: !0,
        size: !0,
        rect: !0
      }, function (e) {
        t.configure(e) && t.redraw();
      }).exec();
    },
    setScrollTop: function (t) {
      this._scrollTop = Number(t) || 0;
    },
    redraw: function () {
      var i = this;
      if (this.presence() && this._ctx && this._box) {
        var n = this._ctx;
        n.globalCompositeOperation = "source-over", n.clearRect(0, 0, this._box.width, this._box.height), t.visible(this._entry, String(this.data.font), "workspace").forEach(function (t) {
          return e(n, t, i._box.width);
        }), this._stroke && e(n, this._stroke, this._box.width);
      }
    },
    queueDraw: function () {
      var t = this;
      this._drawQueued || (this._canvas && this._canvas.requestAnimationFrame ? (this._drawQueued = !0, this._canvas.requestAnimationFrame(function () {
        t._drawQueued = !1, t._detached || t.redraw();
      })) : this.redraw());
    },
    pointTouch: function (t) {
      var e = this._box;
      if (!t || !e) return null;
      var i = e.top - ((this._scrollTop || 0) - (this._boxScrollTop || 0)),
        n = Number.isFinite(t.clientX) ? t.clientX - e.left : t.x,
        r = Number.isFinite(t.clientY) ? t.clientY - i : t.y;
      return Number.isFinite(n) && Number.isFinite(r) ? [Math.round(1e4 * Math.max(0, Math.min(1, n / e.width))), Math.round(1e4 * Math.max(0, r / e.width))] : null;
    },
    point: function (t) {
      return this.pointTouch(i(t));
    },
    start: function (t) {
      var e = this;
      if (this.data.enabled && this._entry) {
        var n = i(t);
        if (n) {
          this.end();
          var r = {
            entry: this._entry,
            font: this.data.font,
            color: this.data.color,
            tool: this.data.tool,
            samples: [n],
            ended: !1
          };
          this._pendingStart = r, wx.createSelectorQuery().in(this).select(".ink-layer-canvas").fields({
            node: !0,
            size: !0,
            rect: !0
          }, function (t) {
            if (!e._detached && e._pendingStart === r && e._entry === r.entry && (e._pendingStart = null, e.configure(t))) {
              var i = t.width,
                n = r.samples.map(function (t) {
                  return e.pointTouch(t);
                }).filter(Boolean);
              n.length && (e._stroke = {
                font: String(r.font),
                surface: "workspace",
                tool: r.tool,
                color: r.color,
                width: Math.round(("eraser" === r.tool ? Math.min(36, .065 * i) : Math.min(3.2, .007 * i)) * 1e4 / i),
                points: n
              }, e.queueDraw(), r.ended && e.end());
            }
          }).exec();
        }
      }
    },
    move: function (t) {
      if (this._pendingStart) {
        var e = i(t);
        e && this._pendingStart.samples.length < 64 && this._pendingStart.samples.push(e);
        return;
      }
      if (this._stroke) {
        var n = this.point(t);
        if (n) {
          var r = this._stroke.points,
            s = r[r.length - 1];
          Math.abs(n[0] - s[0]) + Math.abs(n[1] - s[1]) < 6 || (r.push(n), r.length > 1e3 && (this._stroke.points = r.filter(function (t, e) {
            return e % 2 == 0 || e === r.length - 1;
          })), this.queueDraw());
        }
      }
    },
    end: function () {
      if (this._pendingStart && (this._pendingStart.ended = !0), this._stroke && this._entry) {
        var e = this._stroke;
        this._stroke = null, t.append(this._entry, [e]), t.flush(this._entry), this.redraw();
      }
    },
    clear: function () {
      this.end(), this._pendingStart = null, this._entry && (t.append(this._entry, [{
        font: String(this.data.font),
        surface: "workspace",
        tool: "clear"
      }]), t.flush(this._entry), this.redraw());
    }
  }
});
