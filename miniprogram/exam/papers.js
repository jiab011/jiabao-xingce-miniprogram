Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../@swc/runtime/_async_to_generator.js"),
  t = require("../@swc/runtime/_object_spread.js"),
  r = require("../@swc/runtime/_object_spread_props.js"),
  a = require("../@swc/runtime/_ts_generator.js"),
  i = require("./utils/api.js"),
  s = require("./utils/store.js"),
  n = require("./utils/navigation.js");
Page({
  data: {
    title: "试卷列表",
    rows: [],
    loading: !0,
    error: "",
    query: "",
    years: [],
    regions: [],
    yearIndex: 0,
    regionIndex: 0,
    showRegions: !1,
    busy: ""
  },
  onLoad: function (e) {
    var t = this;
    this.module = i.moduleInfo(e.module), this.group = e.group || "national";
    var r = this.module.groups.find(function (e) {
      return e.id === t.group;
    });
    this.setData({
      title: r.name,
      years: ["全部年份"].concat(this.module.years.map(String)),
      regions: ["全部地区"].concat(this.module.regions),
      showRegions: "other" === this.group
    }), wx.setNavigationBarTitle({
      title: r.name + " \xb7 " + this.module.name
    }), this.load();
  },
  onShow: function () {
    this.all && this.filter();
  },
  load: function () {
    return e._(function () {
      var e, t;
      return a._(this, function (r) {
        switch (r.label) {
          case 0:
            this.setData({
              loading: !0,
              error: ""
            }), r.label = 1;
          case 1:
            return r.trys.push([1, 3, 4, 5]), [4, i.call("papers", {
              module: this.module.id,
              group: this.group
            })];
          case 2:
            return e = r.sent(), this.all = e.papers, this.filter(), [3, 5];
          case 3:
            return t = r.sent(), this.setData({
              error: t.message
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
  input: function (e) {
    this.setData({
      query: e.detail.value
    }), this.filter();
  },
  year: function (e) {
    this.setData({
      yearIndex: Number(e.detail.value)
    }), this.filter();
  },
  region: function (e) {
    this.setData({
      regionIndex: Number(e.detail.value)
    }), this.filter();
  },
  filter: function () {
    var e = this;
    if (this.all) {
      var a = s.read(this.module.id),
        n = this.data.query.trim(),
        u = new Set(s.records(this.module.id).map(function (e) {
          return e.paperId;
        })),
        o = this.all.filter(function (t) {
          return (!n || t.title.includes(n)) && (!e.data.yearIndex || String(t.year) === e.data.years[e.data.yearIndex]) && (!e.data.regionIndex || t.region === e.data.regions[e.data.regionIndex]);
        }).map(function (e) {
          var i = a.papers[e.id] || {},
            n = i.activeRun && s.getRun(i.activeRun),
            o = n && !n.submittedAt ? Object.keys(n.choices).length : null;
          return r._(t._({}, e), {
            status: null !== o ? "进行中 " + o + "/" + e.count : i.completed ? "完成 " + i.completed + " 次" : "未开始",
            hasReport: u.has(e.id)
          });
        });
      this.setData({
        rows: o
      });
      var l = o.slice(0, 3),
        d = l.map(function (e) {
          return e.id;
        }).join(",");
      d !== this._warmSignature && (this._warmSignature = d, l.forEach(function (t) {
        return i.prefetchPaper(e.module.id, t.id);
      }));
    }
  },
  prepare: function (e) {
    i.prefetchPaper(this.module.id, e.currentTarget.dataset.id);
  },
  open: function (t) {
    return e._(function () {
      var e, r;
      return a._(this, function (a) {
        switch (a.label) {
          case 0:
            if (this.data.busy) return [2];
            e = t.currentTarget.dataset.id, this.setData({
              busy: e,
              error: ""
            }), a.label = 1;
          case 1:
            return a.trys.push([1, 3, 4, 5]), [4, n.start(this.module.id, {
              kind: "paper",
              paperId: e
            })];
          case 2:
            return a.sent(), [3, 5];
          case 3:
            return r = a.sent(), this.setData({
              error: r.message
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
  },
  records: function (e) {
    wx.navigateTo({
      url: "/exam/records?module=" + this.module.id + "&paper=" + e.currentTarget.dataset.id
    });
  }
});
