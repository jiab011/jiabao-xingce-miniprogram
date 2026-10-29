Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../../@swc/runtime/_object_spread.js"),
  r = require("../../../@swc/runtime/_object_spread_props.js"),
  n = require("../../../utils/logic-store.js"),
  t = require("../../../data/logic-papers.js"),
  i = require("../../../data/logic-question-meta.js"),
  o = [{
    id: "national",
    name: "国考错题本",
    description: "国家公务员考试 \xb7 按试卷整理"
  }, {
    id: "hebei",
    name: "河北错题本",
    description: "河北省公务员考试 \xb7 按试卷整理"
  }, {
    id: "other",
    name: "其他省市错题本",
    description: "其他省市及选调类考试 \xb7 按试卷整理"
  }, {
    id: "vocabulary",
    name: "成语积累错题本",
    description: "热门词库学习与练习中的错题"
  }];
function u() {
  var e = n.read();
  return Object.keys(e.wrongRecords).map(function (r) {
    return e.wrongRecords[r];
  }).filter(function (e) {
    return i[e.qid];
  });
}
function a(e, r) {
  return u().filter(function (n) {
    return n.group === e && (!r || n.paperId === r);
  }).sort(function (e, n) {
    return r ? Number(e.no) - Number(n.no) : (n.at || 0) - (e.at || 0);
  });
}
module.exports = {
  groups: o,
  summary: function () {
    var n = u();
    return o.map(function (t) {
      var i = n.filter(function (e) {
          return e.group === t.id;
        }),
        o = [];
      return i.forEach(function (e) {
        e.paperId && 0 > o.indexOf(e.paperId) && o.push(e.paperId);
      }), r._(e._({}, t), {
        count: i.length,
        papers: o.length
      });
    });
  },
  papers: function (e) {
    var r = a(e),
      n = Object.create(null);
    return r.forEach(function (e) {
      n[e.paperId] || (n[e.paperId] = {
        id: e.paperId,
        title: e.title,
        year: e.year,
        region: e.region,
        count: 0
      }), n[e.paperId].count++;
    }), Object.keys(n).map(function (e) {
      return n[e];
    }).sort(function (e, r) {
      return r.year - e.year || e.title.localeCompare(r.title);
    });
  },
  list: a,
  openQuestion: function (e, r, t, i) {
    var o = a(r, t),
      u = o.map(function (e) {
        return e.qid;
      });
    if (!(0 > u.indexOf(e))) {
      var p = {},
        c = {};
      o.forEach(function (e) {
        p[e.qid] = e, "paper" === e.kind && (c[e.qid] = {
          title: e.title,
          no: e.no
        });
      }), n.openQuestion(e, u, !1, i ? "practice" : "review", {
        kind: "wrongReview",
        wrongSources: p,
        sourceOverrides: c
      });
    }
  },
  paper: function (e) {
    return t.papers.find(function (r) {
      return r.id === e;
    });
  }
};
