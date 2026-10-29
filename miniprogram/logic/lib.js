var r = require("./data/words.js"),
  i = require("./data/libraries.js"),
  n = require("../utils/logic-store.js"),
  t = {},
  o = {};
r.forEach(function (r) {
  t[r.id] = r, o[r.term] = r;
});
var e = {
    "idiom-high": function (r) {
      return "idiom" === r.kind && r.count >= 5;
    },
    "idiom-correct": function (r) {
      return "idiom" === r.kind && r.correct >= 1;
    },
    "real-high": function (r) {
      return "real" === r.kind && r.count >= 5;
    },
    "real-correct": function (r) {
      return "real" === r.kind && r.count >= 5 && r.correct >= 1;
    },
    "national-high": function (r) {
      return "idiom" === r.kind && r.national >= 5;
    },
    "national-all": function (r) {
      return "idiom" === r.kind && r.national >= 1;
    },
    "all-idioms": function (r) {
      return "idiom" === r.kind;
    },
    "all-real": function (r) {
      return "real" === r.kind;
    },
    all: function () {
      return !0;
    }
  },
  u = [["权利", "权力", "留意搭配：享有权利、行使权力。"], ["必需", "必须", "“必需”侧重不可缺少；“必须”侧重一定要做。"], ["反映", "反应", "留意搭配：反映情况、作出反应。"], ["启用", "起用", "留意搭配：启用设备、起用人才。"], ["沟通", "勾通", "“沟通”多为中性；“勾通”含暗中串通之意。"], ["考察", "考查", "“考察”侧重观察了解；“考查”侧重检查评定。"], ["制定", "制订", "“制定”侧重确定并作出；“制订”侧重拟订过程。"]],
  a = [["相辅相成", "相得益彰", "前者侧重相互配合；后者侧重配合后效果更好。"], ["一蹴而就", "一劳永逸", "前者侧重迅速完成；后者侧重一次解决、长期省心。"], ["层出不穷", "屡见不鲜", "前者侧重不断出现；后者侧重经常见到。"], ["南辕北辙", "背道而驰", "前者常强调行动与目标相反；后者常强调方向、做法相反。"], ["目不暇接", "应接不暇", "前者侧重看不过来；后者还可侧重事情多、应付不过来。"], ["循序渐进", "按部就班", "前者侧重逐步深入；后者侧重依照规定步骤。"], ["耸人听闻", "骇人听闻", "前者常含夸大、使人震惊之意；后者侧重事情本身令人震惊。"]];
module.exports = {
  words: r,
  libraries: i,
  byId: t,
  byTerm: o,
  list: function (i) {
    return r.filter(e[i] || e.all);
  },
  openWord: function (r, i, n) {
    require("./_shared/utils/idiom-navigation.js").openWord(r, n, i);
  },
  pairs: function (r) {
    return ("sound" === r ? u : a).filter(function (r) {
      return o[r[0]] && o[r[1]];
    }).map(function (i, n) {
      return {
        id: r + "-" + n,
        left: o[i[0]],
        right: o[i[1]],
        note: i[2]
      };
    });
  },
  store: n
};
