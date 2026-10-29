Object.defineProperty(exports, "__esModule", {
  value: !0
});
var n = require("../../../@swc/runtime/_object_spread.js"),
  t = require("../../../@swc/runtime/_object_spread_props.js"),
  i = require("./question-annotations.js"),
  e = require("../../../utils/logic-store.js"),
  o = ["#202124", "#f25561"];
function r(n, t, i) {
  n.globalCompositeOperation = "eraser" === t.tool ? "destination-out" : "source-over", n.strokeStyle = t.color, n.lineWidth = (t.width || 70) * i / 1e4, n.globalAlpha = "eraser" === t.tool ? 1 : "#f4be38" === t.color ? .32 : .95, n.lineCap = "round", n.lineJoin = "round";
}
function s(n, t, i) {
  var e = n._inkWorkspaceBox;
  if ("workspace" === t.surface) return [i[0] * e.width / 1e4, i[1] * e.width / 1e4];
  var o = n._inkGeometry[t.surface];
  return [o.left - e.left + i[0] * o.width / 1e4, o.top - e.top + i[1] * o.height / 1e4];
}
function a(n, t) {
  if (t.points && t.points.length && n._inkCtx && ("workspace" === t.surface || n._inkGeometry[t.surface])) {
    var i = n._inkCtx,
      e = "workspace" === t.surface ? n._inkWorkspaceBox : n._inkGeometry[t.surface];
    r(i, t, e.width), i.beginPath();
    var o = s(n, t, t.points[0]);
    i.moveTo(o[0], o[1]), t.points.forEach(function (e) {
      var o = s(n, t, e);
      i.lineTo(o[0], o[1]);
    }), 1 === t.points.length && i.lineTo(o[0] + .5, o[1] + .5), i.stroke();
  }
}
function h(n, t) {
  var i = t.touches && t.touches[0] || t.changedTouches && t.changedTouches[0],
    e = n._inkWorkspaceBox;
  if (!i || !e) return null;
  var o = Number.isFinite(i.x) ? i.x : i.clientX - e.left,
    r = Number.isFinite(i.y) ? i.y : i.clientY - e.top + (n._scrollTop || 0) - (n._inkScrollTop || 0);
  return [Math.round(1e4 * Math.max(0, Math.min(1, o / e.width))), Math.round(1e4 * Math.max(0, Math.min(100, r / e.width)))];
}
module.exports = {
  syncInkOwner: function () {
    this.question && this._inkEntry && this._inkEntry.owner !== i.owner() && this.loadInk();
  },
  loadInk: function () {
    var n = this;
    this.inkEnd(), this._annotationUnsubscribe && this._annotationUnsubscribe(), this._inkCurrent = null, this._inkEntry = null, this._inkCtx = null, this._inkWorkspaceBox = null, this._inkGeometry = {}, this._inkGeneration = (this._inkGeneration || 0) + 1;
    var t = this.question.id,
      r = i.owner(),
      s = i.subscribe(t, function () {
        !n._leaving && n._inkEntry && n._inkEntry.qid === t && n._inkEntry.owner === r && (n.updateInkCount(), n.redrawInk());
      });
    this._inkEntry = s.entry, this._annotationUnsubscribe = s.unsubscribe;
    var a = e.session();
    this.setData({
      inkMode: !!a.inkContinue,
      inkTool: "pen",
      penColor: o.includes(a.inkColor) ? a.inkColor : o.includes(this.data.penColor) ? this.data.penColor : "#202124"
    }), this.updateInkCount(), this.scheduleInk();
  },
  updateInkCount: function () {
    var n = this;
    this._inkEntry && this.setData({
      inkCount: ["question", "analysis", "workspace"].reduce(function (t, e) {
        return t + i.visible(n._inkEntry, String(n.data.fontSize), e).length;
      }, 0)
    });
  },
  scheduleInk: function () {
    var n = this;
    clearTimeout(this._inkTimer), this._inkTimer = setTimeout(function () {
      return n.prepareInk();
    }, 60);
  },
  prepareInk: function () {
    var n = this;
    if (!this._leaving && this.question && wx.createSelectorQuery) {
      var t = this._inkGeneration,
        i = wx.createSelectorQuery().in(this);
      i.select("#quiz-ink-workspace").fields({
        node: !0,
        size: !0,
        rect: !0
      }, function (i) {
        if (!n._leaving && t === n._inkGeneration && i && i.node && i.width && i.height) try {
          var e = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync(),
            o = Math.min(e.pixelRatio || 2, 2, 4096 / i.height),
            r = i.node;
          r.width = Math.max(1, Math.round(i.width * o)), r.height = Math.max(1, Math.round(i.height * o)), n._inkCtx = r.getContext("2d"), n._inkCtx.scale(o, o), n._inkWorkspaceBox = i, n._inkBox = i, n._inkScrollTop = n._scrollTop || 0;
        } catch (n) {
          console.error("quiz-ink-init-failed", n.message || "画布未就绪");
        }
      }), ["question", "analysis"].forEach(function (e) {
        return i.select("question" === e ? ".quiz-surface" : ".quiz-analysis-content").boundingClientRect(function (i) {
          t === n._inkGeneration && (i ? n._inkGeometry[e] = i : delete n._inkGeometry[e]);
        });
      }), i.select(".quiz-workspace").boundingClientRect(function (t) {
        n._readerContentBox = t;
      }), i.select(".quiz-reader").boundingClientRect(function (i) {
        if (i && i.height && !n._leaving && t === n._inkGeneration) {
          var e = n._viewport || {
              width: 375
            },
            o = e.width >= 760 ? 14 : e.width / 750 * 8,
            r = Math.max(0, i.height - o),
            s = n._readerContentBox || n._inkWorkspaceBox,
            a = Math.abs(n.data.workspaceHeight - r) > 1;
          n.setData({
            readerHeight: i.height,
            workspaceHeight: r,
            readerCanScroll: !!(s && s.height > r + 2)
          }), a && n.scheduleInk();
        }
      }), i.exec(function () {
        return n.redrawInk();
      });
    }
  },
  redrawInk: function () {
    var e = this;
    if (this._inkEntry && this._inkCtx && this._inkWorkspaceBox) {
      var o = this._inkCtx,
        r = this._inkWorkspaceBox;
      o.globalCompositeOperation = "source-over", o.clearRect(0, 0, r.width, r.height), ["question", "analysis", "workspace"].forEach(function (o) {
        return i.visible(e._inkEntry, String(e.data.fontSize), o).forEach(function (i) {
          return a(e, t._(n._({}, i), {
            surface: o
          }));
        });
      }), this._inkCurrent && a(this, this._inkCurrent), o.globalCompositeOperation = "source-over", o.globalAlpha = 1;
    }
  },
  toggleInk: function () {
    this.inkEnd();
    var i = !this.data.inkMode;
    this.setData({
      inkMode: i,
      fontPanel: !1
    });
    var o = e.session();
    e.saveSession(t._(n._({}, o), {
      inkContinue: i,
      inkColor: this.data.penColor
    })), this.scheduleInk();
  },
  inkColor: function (i) {
    var r = i.currentTarget.dataset.color;
    if (o.includes(r)) {
      this.inkEnd(), this.setData({
        penColor: r,
        inkTool: "pen",
        inkMode: !0
      });
      var s = e.session();
      e.saveSession(t._(n._({}, s), {
        inkColor: r,
        inkContinue: !0
      }));
    }
  },
  selectEraser: function () {
    this.inkEnd(), this.setData({
      inkTool: "eraser" === this.data.inkTool ? "pen" : "eraser",
      inkMode: !0
    });
  },
  inkStart: function (n) {
    if (this.data.inkMode && this._inkEntry && this._inkCtx && n.touches && 1 === n.touches.length) {
      var t = h(this, n);
      t && (this._inkCurrent = {
        font: String(this.data.fontSize),
        surface: "workspace",
        tool: "eraser" === this.data.inkTool ? "eraser" : "pen",
        color: this.data.penColor,
        width: Math.round("eraser" === this.data.inkTool ? 1e4 * Math.min(36, .065 * this._inkWorkspaceBox.width) / this._inkWorkspaceBox.width : 1e4 * Math.min(3.2, .007 * this._inkWorkspaceBox.width) / this._inkWorkspaceBox.width),
        points: [t]
      });
    }
  },
  inkMove: function (n) {
    var t = this._inkCurrent;
    if (t && n.touches && 1 === n.touches.length) {
      var i = h(this, n);
      if (i) {
        var e = t.points,
          o = e[e.length - 1];
        if (!(Math.abs(i[0] - o[0]) + Math.abs(i[1] - o[1]) < 5)) {
          e.push(i), e.length > 1e3 && (t.points = e.filter(function (n, t) {
            return t % 2 == 0 || t === e.length - 1;
          }));
          var a = s(this, t, o),
            u = s(this, t, i),
            k = this._inkCtx;
          r(k, t, this._inkWorkspaceBox.width), k.beginPath(), k.moveTo(a[0], a[1]), k.lineTo(u[0], u[1]), k.stroke();
        }
      }
    }
  },
  inkEnd: function () {
    if (this._inkCurrent && this._inkEntry) {
      var n = this._inkCurrent;
      try {
        this._inkCurrent = null, i.append(this._inkEntry, [n]), this.updateInkCount(), this.redrawInk(), i.flush(this._inkEntry);
      } catch (t) {
        this._inkCurrent = n, wx.showToast({
          title: "标记尚未保存，请检查存储空间",
          icon: "none"
        });
      }
    }
  },
  clearInk: function () {
    if (this.inkEnd(), this._inkEntry) {
      var n = this._inkEntry,
        t = String(this.data.fontSize);
      try {
        i.append(n, ["question", "analysis", "workspace"].map(function (n) {
          return {
            font: t,
            surface: n,
            tool: "clear"
          };
        })), i.flush(n), this.updateInkCount(), this.redrawInk();
      } catch (n) {
        wx.showToast({
          title: "清屏尚未保存，请稍后重试",
          icon: "none"
        });
      }
    }
  },
  inkAnswer: function (i) {
    if (!this.data.revealed && !this.data.resultOpen) {
      this.inkEnd();
      var o = i.currentTarget.dataset.label;
      this._allowInkAnswer = !0;
      try {
        this.choose(i);
      } finally {
        this._allowInkAnswer = !1;
      }
      if (!this.data.resultOpen && this.data.selected === o) {
        var r = e.session();
        if (e.saveSession(t._(n._({}, r), {
          inkContinue: !0,
          inkColor: this.data.penColor
        }))) {
          var s = this.ids[this.index + 1];
          s ? this.navigateQuestion(s, !0) : wx.showToast({
            title: "已是最后一题",
            icon: "none"
          });
        }
      }
    }
  },
  retryInkSync: function () {
    var n = this;
    this._inkEntry && i.pull(this._inkEntry).then(function () {
      return i.flush(n._inkEntry);
    });
  },
  flushInk: function () {
    this.inkEnd(), this._inkEntry && i.flush(this._inkEntry);
  },
  destroyInk: function () {
    this.flushInk(), clearTimeout(this._inkTimer), this._annotationUnsubscribe && this._annotationUnsubscribe(), this._inkCtx = null, this._inkWorkspaceBox = null;
  }
};
