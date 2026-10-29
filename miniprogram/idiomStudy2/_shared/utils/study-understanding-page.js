Object.defineProperty(exports, "__esModule", {
  value: !0
});
var t = require("../../../@swc/runtime/_async_to_generator.js"),
  n = require("../../../@swc/runtime/_object_spread.js"),
  e = require("../../../@swc/runtime/_object_spread_props.js"),
  s = require("../../../@swc/runtime/_ts_generator.js"),
  i = require("../../../utils/study-cloud.js"),
  r = require("../../../utils/logic-store.js");
module.exports = {
  refreshUnderstanding: function () {
    var t = i.signedIn() ? r.read().understandings[this.word.id] : null;
    this.setData({
      simpleUnderstanding: t && t.text || this.word.memory,
      understandingMine: !!t,
      understandingStatus: t ? t.status : "",
      otherUnderstandings: (this.understandingRows || []).filter(function (t) {
        return !t.mine;
      }).map(function (t) {
        return e._(n._({}, t), {
          timeText: i.timeText(t.updatedAt),
          name: t.author.nickname,
          avatar: t.author.avatarUrl || "",
          initial: Array.from(t.author.nickname || "同学")[0]
        });
      })
    });
  },
  loadUnderstandings: function () {
    return t._(function () {
      var t, n, e, a;
      return s._(this, function (s) {
        switch (s.label) {
          case 0:
            if (!i.ready()) return [2];
            t = i.profile().uid, s.label = 1;
          case 1:
            return s.trys.push([1, 3,, 4]), [4, i.call("understandings", {
              wordId: this.word.id
            })];
          case 2:
            if (n = s.sent(), this.leaving || t !== i.profile().uid) return [2];
            return this.understandingRows = n.rows, e = n.rows.find(function (t) {
              return t.mine;
            }), a = r.read().understandings[this.word.id], e && (!a || e.updatedAt >= a.updatedAt) && r.saveUnderstanding(this.word.id, {
              text: e.text,
              status: e.status,
              updatedAt: e.updatedAt
            }), this.refreshUnderstanding(), [3, 4];
          case 3:
            return s.sent(), [3, 4];
          case 4:
            return [2];
        }
      });
    }).apply(this);
  },
  tapUnderstanding: function () {
    var t = Date.now();
    this.lastUnderstandingTap && t - this.lastUnderstandingTap < 340 ? (this.lastUnderstandingTap = 0, this.editUnderstanding()) : this.lastUnderstandingTap = t;
  },
  editUnderstanding: function () {
    if (!i.signedIn() || !i.profile().profileSynced) {
      this.goAccount();
      return;
    }
    this.setData({
      understandingOpen: !0,
      understandingValue: this.data.simpleUnderstanding,
      understandingSaving: !1
    });
  },
  understandingInput: function (t) {
    this.setData({
      understandingValue: t.detail.value
    });
  },
  closeUnderstanding: function () {
    this.data.understandingSaving || this.setData({
      understandingOpen: !1
    });
  },
  saveUnderstanding: function () {
    return t._(function () {
      var t, n, e;
      return s._(this, function (s) {
        switch (s.label) {
          case 0:
            if (this.data.understandingSaving) return [2];
            if (!(t = this.data.understandingValue.trim())) return wx.showToast({
              title: "先写下你的理解",
              icon: "none"
            }), [2];
            n = i.profile().uid, this.setData({
              understandingSaving: !0
            }), s.label = 1;
          case 1:
            return s.trys.push([1, 5, 6, 7]), [4, i.call("saveUnderstanding", {
              wordId: this.word.id,
              text: t
            })];
          case 2:
            if (e = s.sent(), n !== i.profile().uid) return [2];
            if (r.saveUnderstanding(this.word.id, {
              text: t,
              status: e.status,
              updatedAt: e.updatedAt
            }), this.leaving) return [3, 4];
            return this.setData({
              understandingOpen: !1
            }), this.refreshUnderstanding(), [4, this.loadUnderstandings()];
          case 3:
            s.sent(), wx.showToast({
              title: "published" === e.status ? "理解已公开分享" : "理解已保存，等待检查",
              icon: "none"
            }), s.label = 4;
          case 4:
            return [3, 7];
          case 5:
            return s.sent(), this.leaving || wx.showToast({
              title: "暂未分享成功，请稍后重试",
              icon: "none"
            }), [3, 7];
          case 6:
            return this.leaving || this.setData({
              understandingSaving: !1
            }), [7];
          case 7:
            return [2];
        }
      });
    }).apply(this);
  }
};
