Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_async_to_generator.js"),
  t = require("../@swc/runtime/_ts_generator.js"),
  a = require("./utils/api.js"),
  s = require("./utils/store.js"),
  r = require("./utils/navigation.js");
Page({
  data: {
    module: null,
    years: [],
    scopes: ["全部地区", "国考", "河北省考", "其他省市"],
    scopeIds: ["all", "national", "hebei", "other"],
    yearIndex: 0,
    scopeIndex: 0,
    count: "20",
    busy: !1,
    error: "",
    resume: null
  },
  onLoad: function (e) {
    this.module = a.moduleInfo(e.module), this.setData({
      module: this.module,
      years: ["全部年份"].concat(this.module.years.map(String))
    }), wx.setNavigationBarTitle({
      title: this.module.name + "刷题"
    });
  },
  onShow: function () {
    if (this.module) {
      var e = s.read(this.module.id),
        t = e.activeRun && s.getRun(e.activeRun);
      this.setData({
        resume: t && "random" === t.kind && !t.readOnly ? {
          id: t.id,
          submitted: !!t.submittedAt
        } : null
      });
    }
  },
  search: function () {
    wx.navigateTo({
      url: "/exam/search?module=" + this.module.id
    });
  },
  open: function (e) {
    Number(e.currentTarget.dataset.count) && wx.navigateTo({
      url: "/exam/papers?module=" + this.module.id + "&group=" + e.currentTarget.dataset.id
    });
  },
  year: function (e) {
    this.setData({
      yearIndex: Number(e.detail.value)
    });
  },
  scope: function (e) {
    this.setData({
      scopeIndex: Number(e.detail.value)
    });
  },
  count: function (e) {
    this.setData({
      count: e.detail.value
    });
  },
  quickCount: function (e) {
    this.setData({
      count: String(e.currentTarget.dataset.count)
    });
  },
  start: function () {
    return e._(function () {
      var e, a, s;
      return t._(this, function (t) {
        switch (t.label) {
          case 0:
            if (this.data.busy) return [2];
            if (!Number.isInteger(e = Number(this.data.count)) || e < 1 || e > 200) return wx.showToast({
              title: "请输入1至200的题数",
              icon: "none"
            }), [2];
            this.setData({
              busy: !0,
              error: ""
            }), t.label = 1;
          case 1:
            return t.trys.push([1, 3, 4, 5]), [4, r.start(this.module.id, {
              kind: "random",
              count: e,
              year: this.data.yearIndex ? this.data.years[this.data.yearIndex] : "",
              scope: this.data.scopeIds[this.data.scopeIndex]
            })];
          case 2:
            return (a = t.sent()).actualCount !== e && wx.showToast({
              title: "保留完整材料，共抽取" + a.actualCount + "题",
              icon: "none"
            }), [3, 5];
          case 3:
            return s = t.sent(), this.setData({
              error: s.message
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
  },
  resume: function () {
    var e = this.data.resume;
    e && wx.navigateTo({
      url: "/exam/reader?module=" + this.module.id + "&run=" + e.id + (e.submitted ? "&result=1" : "")
    });
  }
});
