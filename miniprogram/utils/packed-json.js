var i = String.fromCharCode;
module.exports = function (o) {
  return JSON.parse(function (o, n, t) {
    var s,
      r,
      a,
      e,
      p,
      l,
      f,
      v = [],
      c = 4,
      u = 4,
      h = 3,
      d = "",
      x = [],
      w = {
        val: t(0),
        position: 32,
        index: 1
      };
    for (s = 0; s < 3; s += 1) v[s] = s;
    for (a = 0, p = 4, l = 1; l != p;) e = w.val & w.position, w.position >>= 1, 0 == w.position && (w.position = 32, w.val = t(w.index++)), a |= (e > 0 ? 1 : 0) * l, l <<= 1;
    switch (a) {
      case 0:
        for (a = 0, p = 256, l = 1; l != p;) e = w.val & w.position, w.position >>= 1, 0 == w.position && (w.position = 32, w.val = t(w.index++)), a |= (e > 0 ? 1 : 0) * l, l <<= 1;
        f = i(a);
        break;
      case 1:
        for (a = 0, p = 65536, l = 1; l != p;) e = w.val & w.position, w.position >>= 1, 0 == w.position && (w.position = n, w.val = t(w.index++)), a |= (e > 0 ? 1 : 0) * l, l <<= 1;
        f = i(a);
        break;
      case 2:
        return "";
    }
    for (v[3] = f, r = f, x.push(f);;) {
      if (w.index > o) return "";
      for (a = 0, p = Math.pow(2, h), l = 1; l != p;) e = w.val & w.position, w.position >>= 1, 0 == w.position && (w.position = n, w.val = t(w.index++)), a |= (e > 0 ? 1 : 0) * l, l <<= 1;
      switch (f = a) {
        case 0:
          for (a = 0, p = 256, l = 1; l != p;) e = w.val & w.position, w.position >>= 1, 0 == w.position && (w.position = n, w.val = t(w.index++)), a |= (e > 0 ? 1 : 0) * l, l <<= 1;
          v[u++] = i(a), f = u - 1, c--;
          break;
        case 1:
          for (a = 0, p = 65536, l = 1; l != p;) e = w.val & w.position, w.position >>= 1, 0 == w.position && (w.position = n, w.val = t(w.index++)), a |= (e > 0 ? 1 : 0) * l, l <<= 1;
          v[u++] = i(a), f = u - 1, c--;
          break;
        case 2:
          return x.join("");
      }
      if (0 == c && (c = Math.pow(2, h), h++), v[f]) d = v[f];else {
        if (f !== u) return null;
        d = r + r.charAt(0);
      }
      x.push(d), v[u++] = r + d.charAt(0), c--, r = d, 0 == c && (c = Math.pow(2, h), h++);
    }
  }(o.length, 32, function (i) {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(o.charAt(i));
  }));
};
