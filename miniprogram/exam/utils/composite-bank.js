var r = {
    language: ["logicfill", "verbal"],
    reasoning: ["figure", "analogy", "definition", "deduction"]
  },
  e = {
    logicfill: "逻辑填空",
    verbal: "片段阅读",
    figure: "图形推理",
    analogy: "类比推理",
    definition: "定义判断",
    deduction: "论证与形式逻辑"
  };
module.exports = {
  DEFINITIONS: r,
  NAMES: e,
  compose: function (t, n) {
    var i = [],
      o = {},
      a = [],
      l = [],
      u = [],
      s = {},
      c = !0,
      f = !1,
      d = void 0;
    try {
      for (var y, h = r[t][Symbol.iterator](); !(c = (y = h.next()).done); c = !0) !function () {
        var r = y.value,
          c = n(r);
        c.ids.forEach(function (e, t) {
          void 0 === o[e] && (o[e] = i.length, i.push(e), a.push(c.answers[t]), l.push(c.materials[t]), u.push(r));
        });
        var f = !0,
          d = !1,
          h = void 0;
        try {
          for (var g, v = c.papers[Symbol.iterator](); !(f = (g = v.next()).done); f = !0) !function () {
            var n = g.value,
              i = n.id.slice(r.length + 1),
              a = s[i];
            if (a) {
              if (a.title !== n.title || a.year !== n.year || a.region !== n.region) throw Error("试卷来源不一致");
            } else a = {
              id: t + "_" + i,
              title: n.title,
              year: n.year,
              region: n.region,
              group: n.group,
              items: [],
              nos: [],
              sections: []
            }, s[i] = a;
            var l = 0,
              u = {};
            a.items.forEach(function (r) {
              return u[r] = !0;
            }), n.items.forEach(function (r, e) {
              var t = o[c.ids[r]];
              !u[t] && (u[t] = !0, a.items.push(t), a.nos.push(n.nos ? n.nos[e] : e + 1), l++);
            }), l && a.sections.push({
              id: r,
              name: e[r],
              count: l
            });
          }();
        } catch (r) {
          d = !0, h = r;
        } finally {
          try {
            f || null == v.return || v.return();
          } finally {
            if (d) throw h;
          }
        }
      }();
    } catch (r) {
      f = !0, d = r;
    } finally {
      try {
        c || null == h.return || h.return();
      } finally {
        if (f) throw d;
      }
    }
    var g = Object.keys(s).map(function (r) {
      return s[r];
    }).sort(function (r, e) {
      return e.year - r.year || (r.title < e.title ? -1 : r.title > e.title ? 1 : 0);
    });
    return g.forEach(function (r) {
      return r.count = r.items.length;
    }), {
      ids: i,
      byId: o,
      answers: a,
      materials: l,
      papers: g,
      sourceModules: u
    };
  }
};
