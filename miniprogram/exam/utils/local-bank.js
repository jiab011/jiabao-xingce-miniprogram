Object.defineProperty(exports, "__esModule", {
  value: !0
});
var r = require("../../@swc/runtime/_object_spread.js"),
  e = require("../../@swc/runtime/_object_without_properties.js"),
  t = require("./composite-bank.js"),
  n = require("../data/bank.js"),
  u = require("../catalog.js"),
  o = {};
function i(r) {
  if (o[r]) return o[r];
  if (t.DEFINITIONS[r]) return o[r] = t.compose(r, i);
  if ("logicfill" === r) {
    var e = require("../../data/logic-answer-index.js"),
      u = require("../../data/logic-papers.js"),
      s = Object.keys(e),
      a = {};
    s.forEach(function (r, e) {
      return a[r] = e;
    });
    var l = s.map(function (r) {
        return "ABCDEFGH".split("").reduce(function (t, n, u) {
          return e[r] && e[r].includes(n) ? t | 1 << u : t;
        }, 0);
      }),
      d = s.map(function () {
        return 0;
      }),
      p = u.papers.map(function (r) {
        return {
          id: "logicfill_" + r.id,
          title: r.title,
          year: r.year,
          region: r.region,
          group: r.group,
          count: r.ids.length,
          items: r.ids.map(function (r) {
            return a[r];
          }),
          nos: r.ids.map(function (e) {
            return r.nos[e];
          })
        };
      });
    return o[r] = {
      ids: s,
      byId: a,
      answers: l,
      materials: d,
      papers: p
    };
  }
  var c = n.modules[r];
  if (!c) throw Error("模块不存在");
  for (var f = new Uint8Array(wx.base64ToArrayBuffer(c.q)), m = new Uint8Array(wx.base64ToArrayBuffer(c.a)), g = c.m.split(",").map(Number), h = [], y = 0; y < f.length; y += 12) {
    for (var v = "x", b = y; b < y + 12; b++) v += f[b].toString(16).padStart(2, "0");
    h.push(v);
  }
  var _ = {};
  h.forEach(function (r, e) {
    return _[r] = e;
  });
  var I = c.p.map(function (e) {
    var t = n.sources[e[1]],
      u = e[2].split(".").map(function (r) {
        return parseInt(r, 36);
      }),
      o = e[3] ? e[3].split(".").map(Number) : null;
    return {
      id: r + "_" + e[0],
      title: t[0],
      year: t[1],
      region: t[2],
      group: t[3],
      count: u.length,
      items: u,
      nos: o
    };
  });
  return o[r] = {
    ids: h,
    byId: _,
    answers: m,
    materials: g,
    papers: I
  };
}
module.exports = {
  papers: function (r) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return i(r).papers.filter(function (r) {
      return (!t.group || "all" === t.group || r.group === t.group) && (!t.year || r.year === Number(t.year)) && (!t.region || r.region === t.region) && (!t.query || r.title.includes(t.query));
    }).map(function (r) {
      return r.items, r.nos, e._(r, ["items", "nos"]);
    });
  },
  meta: function (e, t) {
    var u = i(e),
      o = u.byId[t];
    return void 0 === o ? null : r._({
      id: t,
      materialId: n.materials[u.materials[o]] || ""
    }, u.sourceModules ? {
      sourceModule: u.sourceModules[o]
    } : {});
  },
  start: function (e, t) {
    var u = i(e),
      o = u.papers.find(function (r) {
        return r.id === t;
      });
    if (!o) throw Error("未找到这套试卷");
    var s = [],
      a = {},
      l = {},
      d = [],
      p = {},
      c = null;
    return o.items.forEach(function (t, i) {
      var f = u.ids[t],
        m = n.materials[u.materials[t]] || "";
      s.push(f), a[f] = "ABCDEFGH".split("").filter(function (r, e) {
        return u.answers[t] & 1 << e;
      }).join(""), l[f] = r._({
        paperId: o.id,
        title: o.title,
        year: o.year,
        region: o.region,
        group: o.group,
        no: o.nos ? o.nos[i] : i + 1,
        module: e
      }, u.sourceModules ? {
        sourceModule: u.sourceModules[t]
      } : {}), p[f] = r._({
        id: f,
        materialId: m
      }, u.sourceModules ? {
        sourceModule: u.sourceModules[t]
      } : {}), m && d.length && d[d.length - 1].materialId === m && (!u.sourceModules || c === u.sourceModules[t]) ? d[d.length - 1].ids.push(f) : d.push({
        materialId: m,
        ids: [f]
      }), c = u.sourceModules ? u.sourceModules[t] : null;
    }), {
      module: e,
      kind: "paper",
      paperId: t,
      ids: s,
      keys: a,
      meta: p,
      origins: l,
      blocks: d,
      requestedCount: s.length,
      actualCount: s.length
    };
  },
  moduleInfo: function (r) {
    return u.find(function (e) {
      return e.id === r;
    });
  }
};
