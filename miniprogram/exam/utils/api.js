Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("../../@swc/runtime/_async_to_generator.js"),
  t = require("../../@swc/runtime/_object_spread.js"),
  n = require("../../@swc/runtime/_object_spread_props.js"),
  r = require("../../@swc/runtime/_object_without_properties.js"),
  u = require("../../@swc/runtime/_to_consumable_array.js"),
  s = require("../../@swc/runtime/_type_of.js"),
  a = require("../../@swc/runtime/_ts_generator.js"),
  i = require("../../@swc/runtime/_ts_values.js"),
  o = require("./cloud.js"),
  c = require("../catalog.js"),
  l = require("./local-bank.js"),
  f = require("../data/first-screens.js"),
  p = new Map(),
  d = new Map(),
  h = {},
  m = {},
  _ = {},
  y = {},
  v = new Map(),
  b = function () {
    return wx.env.USER_DATA_PATH;
  },
  w = function () {
    return b() + "/exam-assets-v1";
  },
  g = function () {
    return b() + "/exam-questions-9ac27c0b26d1-style1";
  },
  q = 0,
  I = 0,
  P = [],
  x = 0;
function M(e, t) {
  return new Promise(function (n, r) {
    P.push({
      fn: e,
      priority: t || {
        foreground: !0
      },
      resolve: n,
      reject: r
    }), j();
  });
}
function j() {
  for (; q < 3 && P.length;) {
    var e = function () {
      var e = P.findIndex(function (e) {
        return e.priority.foreground;
      });
      if (e < 0) {
        if (I >= 1) return {
          v: void 0
        };
        e = 0;
      }
      var t = P.splice(e, 1)[0],
        n = !t.priority.foreground;
      q++, n && I++, Promise.resolve().then(t.fn).then(t.resolve, t.reject).finally(function () {
        q--, n && I--, j();
      });
    }();
    if ("object" === s._(e)) return e.v;
  }
}
function k(e) {
  return c.find(function (t) {
    return t.id === e;
  });
}
function S(e, t, n, r) {
  for (e.delete(t), e.set(t, n); e.size > r;) e.delete(e.keys().next().value);
  return n;
}
function z() {
  return (z = e._(function (e, t) {
    return a._(this, function (n) {
      return "papers" === e ? [2, {
        ok: !0,
        papers: l.papers(t.module, t),
        module: k(t.module)
      }] : "start" === e && "paper" === t.kind ? [2, {
        ok: !0,
        run: l.start(t.module, t.paperId)
      }] : [2, o.call(e, t)];
    });
  })).apply(this, arguments);
}
function A() {
  try {
    return wx.getFileSystemManager();
  } catch (e) {
    return null;
  }
}
function E(e) {
  try {
    A().mkdirSync(e, !0);
  } catch (e) {}
}
function F(e) {
  if (v.has(e.assetId)) return v.get(e.assetId);
  try {
    var t = w() + "/" + e.assetId + "." + (e.extension || "png"),
      n = A().statSync(t);
    if (n && (!e.bytes || n.size === e.bytes)) return S(v, e.assetId, t, 512);
  } catch (e) {}
  return "";
}
function T(e, t, n) {
  return D.apply(this, arguments);
}
function D() {
  return (D = e._(function (e, t, n) {
    var r, u;
    return a._(this, function (s) {
      switch (s.label) {
        case 0:
          return s.trys.push([0, 2,, 3]), E(r = w()), u = r + "/" + e + "." + t, [4, new Promise(function (e, t) {
            return A().writeFile({
              filePath: u,
              data: n,
              encoding: "base64",
              success: e,
              fail: t
            });
          })];
        case 1:
          return s.sent(), [2, S(v, e, u, 512)];
        case 2:
          return s.sent(), [2, "data:image/" + ("jpg" === t ? "jpeg" : t) + ";base64," + n];
        case 3:
          return [2];
      }
    });
  })).apply(this, arguments);
}
function N(e, t, n) {
  return _[e] = t, y[e] = n, t.then(function () {
    _[e] === t && (delete _[e], delete y[e]);
  }, function () {
    _[e] === t && (delete _[e], delete y[e]);
  }), t;
}
function O() {
  return (O = e._(function (t, n, r) {
    var u, s, i;
    return a._(this, function (c) {
      return (u = t.assetId, s = F(t)) ? [2, s] : _[u] ? (r && r.foreground && y[u] && (y[u].foreground = !0, j()), [2, _[u]]) : f.assets[u] ? (i = f.assets[u], [2, N(u, T(u, i.extension, i.data), r)]) : [2, N(u, e._(function () {
        var e, s, i, c, l, f, p, d;
        return a._(this, function (a) {
          switch (a.label) {
            case 0:
              if (e = Number(t.bytes) || 0, s = t.extension || "png", !(e > 3e5)) return [3, 2];
              for (f = 0, c = function (t) {
                l.push(M(function () {
                  return o.call("asset", {
                    module: n,
                    id: u,
                    offset: t,
                    length: Math.min(3e5, e - t)
                  });
                }, r));
              }, l = []; f < e; f += 3e5) c(f);
              return [4, Promise.all(l)];
            case 1:
              return i = (p = a.sent()).map(function (e) {
                return e.data;
              }).join(""), s = p[0].extension, [3, 4];
            case 2:
              return [4, M(function () {
                return o.call("assets", {
                  module: n,
                  ids: [u]
                });
              }, r)];
            case 3:
              i = (d = a.sent()).rows[0].data, s = d.rows[0].extension, a.label = 4;
            case 4:
              return [2, T(u, s, i)];
          }
        });
      })(), r)];
    });
  })).apply(this, arguments);
}
function J(e, t, n) {
  return L.apply(this, arguments);
}
function L() {
  return (L = e._(function (t, n, r) {
    var u, s, i, c, l, p, d, h, m, y, v, b, w, g, q, I, P, x;
    return a._(this, function (j) {
      switch (j.label) {
        case 0:
          var k;
          u = new Map(), t.filter(function (e) {
            return "image" === e.type;
          }).forEach(function (e) {
            return u.set(e.assetId, e);
          }), s = Array.from(u.values()).filter(function (e) {
            return !F(e) && !_[e.assetId] && !f.assets[e.assetId] && e.bytes <= 3e5;
          }), i = [], c = [], l = 0, p = !0, d = !1, h = void 0;
          try {
            for (m = s[Symbol.iterator](); !(p = (y = m.next()).done); p = !0) v = y.value, c.length && (c.length >= 12 || l + v.bytes > 3e5) && (i.push(c), c = [], l = 0), c.push(v), l += v.bytes;
          } catch (e) {
            d = !0, h = e;
          } finally {
            try {
              p || null == m.return || m.return();
            } finally {
              if (d) throw h;
            }
          }
          c.length && i.push(c), b = !0, w = !1, g = void 0;
          try {
            for (q = function () {
              var t,
                u = P.value,
                s = M(function () {
                  return o.call("assets", {
                    module: n,
                    ids: u.map(function (e) {
                      return e.assetId;
                    })
                  });
                }, r).then((t = e._(function (t) {
                  var n;
                  return a._(this, function (r) {
                    switch (r.label) {
                      case 0:
                        var u;
                        return n = {}, [4, Promise.all(t.rows.map((u = e._(function (e) {
                          var t;
                          return a._(this, function (r) {
                            switch (r.label) {
                              case 0:
                                return t = e.id, [4, T(e.id, e.extension, e.data)];
                              case 1:
                                return n[t] = r.sent(), [2];
                            }
                          });
                        }), function (e) {
                          return u.apply(this, arguments);
                        })))];
                      case 1:
                        return r.sent(), [2, n];
                    }
                  });
                }), function (e) {
                  return t.apply(this, arguments);
                }));
              u.forEach(function (e) {
                return N(e.assetId, s.then(function (t) {
                  if (!t[e.assetId]) throw Error("图片未读取完整");
                  return t[e.assetId];
                }), r);
              });
            }, I = i[Symbol.iterator](); !(b = (P = I.next()).done); b = !0) q();
          } catch (e) {
            w = !0, g = e;
          } finally {
            try {
              b || null == I.return || I.return();
            } finally {
              if (w) throw g;
            }
          }
          return x = Map.bind, [4, Promise.all(Array.from(u.values()).map((k = e._(function (e) {
            var t;
            return a._(this, function (u) {
              switch (u.label) {
                case 0:
                  return t = [e.assetId], [4, function (e, t, n) {
                    return O.apply(this, arguments);
                  }(e, n, r)];
                case 1:
                  return [2, t.concat([u.sent()])];
              }
            });
          }), function (e) {
            return k.apply(this, arguments);
          })))];
        case 1:
          return [2, new (x.apply(Map, [void 0, j.sent()]))()];
      }
    });
  })).apply(this, arguments);
}
function H(e, r) {
  return (e || []).map(function (e) {
    return "image" === e.type ? n._(t._({}, e), {
      src: r.get(e.assetId)
    }) : t._({}, e);
  });
}
function R(e, t) {
  return U.apply(this, arguments);
}
function U() {
  return (U = e._(function (e, t) {
    var n;
    return a._(this, function (r) {
      switch (r.label) {
        case 0:
          return n = [e], [4, J(e || [], t, {
            foreground: !0
          })];
        case 1:
          return [2, H.apply(void 0, n.concat([r.sent()]))];
      }
    });
  })).apply(this, arguments);
}
function $() {
  return ($ = e._(function (e, t) {
    var n, r, u;
    return a._(this, function (s) {
      switch (s.label) {
        case 0:
          if (r = (n = l.meta(e, t)) && n.sourceModule || e, f.questions[t] && f.questions[t].question.module === r) return [2, f.questions[t]];
          s.label = 1;
        case 1:
          return s.trys.push([1, 3,, 4]), [4, new Promise(function (e, n) {
            return A().readFile({
              filePath: g() + "/" + t + ".json",
              encoding: "utf8",
              success: e,
              fail: n
            });
          })];
        case 2:
          return [2, (u = JSON.parse(s.sent().data)).question && u.question.id === t && u.question.module === r && (!u.question.materialId || u.material && u.material.id === u.question.materialId) ? u : null];
        case 3:
          return s.sent(), [2, null];
        case 4:
          return [2];
      }
    });
  })).apply(this, arguments);
}
function B(s, i) {
  var c = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
    f = s + ":" + i;
  if (p.has(f)) return Promise.resolve(p.get(f));
  if (h[f]) return !c.background && m[f] && (m[f].foreground = !0, j()), h[f];
  var _ = {
    foreground: !c.background
  };
  m[f] = _;
  var y = e._(function () {
    var e, c, h, m, y, v, b;
    return a._(this, function (a) {
      switch (a.label) {
        case 0:
          return [4, function (e, t) {
            return $.apply(this, arguments);
          }(s, i)];
        case 1:
          if (e = a.sent()) return [3, 3];
          return c = l.meta(s, i), [4, M(function () {
            return o.call("question", {
              module: s,
              id: i,
              includeMaterial: !(c && d.has(c.materialId))
            });
          }, _)];
        case 2:
          !(e = a.sent()).material && e.question.materialId && d.has(e.question.materialId) && (h = d.get(e.question.materialId), e = n._(t._({}, e), {
            material: n._(t._({}, h), {
              content: h.content.map(function (e) {
                return e.src, r._(e, ["src"]);
              })
            })
          })), function (e, t) {
            try {
              E(g()), A().writeFile({
                filePath: g() + "/" + e + ".json",
                data: JSON.stringify(t),
                encoding: "utf8",
                success: function () {},
                fail: function () {}
              });
            } catch (e) {}
          }(i, e), a.label = 3;
        case 3:
          return m = t._({}, e.question), k(s).composite ? (y = l.meta(s, i), m.sectionLabel = k(y.sourceModule).name) : delete m.sectionLabel, v = m.materialId, [4, J(u._(m.stem).concat(u._(m.options.flatMap(function (e) {
            return e.content;
          })), u._(e.material && !d.has(v) ? e.material.content : [])), s, _)];
        case 4:
          return b = a.sent(), m.stem = H(m.stem, b), m.options = m.options.map(function (e) {
            return n._(t._({}, e), {
              content: H(e.content, b)
            });
          }), e.material && !d.has(v) && S(d, v, n._(t._({}, e.material), {
            content: H(e.material.content, b)
          }), 24), m.material = v ? d.get(v) : null, [2, S(p, f, m, 24)];
      }
    });
  })();
  return h[f] = y, y.then(function () {
    delete h[f], delete m[f];
  }, function () {
    delete h[f], delete m[f];
  }), y;
}
function C() {
  return (C = e._(function (e, t) {
    return a._(this, function (n) {
      return [2, R(t.analysis, e)];
    });
  })).apply(this, arguments);
}
function G(e, t) {
  return t ? B(e, t, {
    background: !0
  }).catch(function () {
    return null;
  }) : Promise.resolve(null);
}
function K(e, t) {
  try {
    return G(e, l.start(e, t).ids[0]);
  } catch (e) {
    return Promise.resolve(null);
  }
}
function Q(e, t, n, r) {
  return V.apply(this, arguments);
}
function V() {
  return (V = e._(function (e, t, n, r) {
    var s, o, c, l, f, d, h, m, _, y, b, w, g, q, I, P, x, M, j, k;
    return a._(this, function (S) {
      switch (S.label) {
        case 0:
          if (!(s = A())) return [2];
          S.label = 1;
        case 1:
          return S.trys.push([1, 15,, 16]), [4, new Promise(function (t, n) {
            return s.readdir({
              dirPath: e,
              success: function (e) {
                return t(e.files);
              },
              fail: n
            });
          })];
        case 2:
          o = S.sent(), c = [], l = 0, S.label = 3;
        case 3:
          if (!(l < o.length)) return [3, 6];
          return [4, Promise.all(o.slice(l, l + 8).filter(function (e) {
            return /^(a[a-f0-9]{24}\.[a-z]+|(?:x[a-f0-9]{24}|[0-9]{2,12})\.json)$/.test(e);
          }).map(function (t) {
            return new Promise(function (n) {
              return s.stat({
                path: e + "/" + t,
                success: function (e) {
                  c.push({
                    name: t,
                    size: e.stats.size,
                    time: e.stats.lastModifiedTime || 0
                  }), n();
                },
                fail: n
              });
            });
          }))];
        case 4:
          S.sent(), S.label = 5;
        case 5:
          return l += 8, [3, 3];
        case 6:
          if (f = c.reduce(function (e, t) {
            return e + t.size;
          }, 0), d = c.length, f <= t && d <= r) return [2];
          c.sort(function (e, t) {
            return e.time - t.time;
          }), h = new Set(), m = !0, _ = !1, y = void 0;
          try {
            for (b = p.values()[Symbol.iterator](); !(m = (w = b.next()).done); m = !0) g = w.value, u._(g.stem).concat(u._(g.options.flatMap(function (e) {
              return e.content;
            })), u._(g.material ? g.material.content : [])).forEach(function (e) {
              e.src && h.add(e.src);
            });
          } catch (e) {
            _ = !0, y = e;
          } finally {
            try {
              m || null == b.return || b.return();
            } finally {
              if (_) throw y;
            }
          }
          q = !0, I = !1, P = void 0, S.label = 7;
        case 7:
          S.trys.push([7, 12, 13, 14]), x = function () {
            var t, u;
            return a._(this, function (a) {
              switch (a.label) {
                case 0:
                  if (t = j.value, f <= n && d <= r) return [2, "break"];
                  if (u = e + "/" + t.name, h.has(u)) return [2, "continue"];
                  return [4, new Promise(function (e) {
                    return s.unlink({
                      filePath: u,
                      success: e,
                      fail: e
                    });
                  })];
                case 1:
                  return a.sent(), v.delete(t.name.split(".")[0]), f -= t.size, d--, [2];
              }
            });
          }, M = c[Symbol.iterator](), S.label = 8;
        case 8:
          if (q = (j = M.next()).done) return [3, 11];
          return [5, i._(x())];
        case 9:
          if ("break" === S.sent()) return [3, 11];
          S.label = 10;
        case 10:
          return q = !0, [3, 8];
        case 11:
          return [3, 14];
        case 12:
          return k = S.sent(), I = !0, P = k, [3, 14];
        case 13:
          try {
            q || null == M.return || M.return();
          } finally {
            if (I) throw P;
          }
          return [7];
        case 14:
          return [3, 16];
        case 15:
          return S.sent(), [3, 16];
        case 16:
          return [2];
      }
    });
  })).apply(this, arguments);
}
module.exports = {
  catalog: c,
  moduleInfo: k,
  call: function (e, t) {
    return z.apply(this, arguments);
  },
  question: B,
  analysis: function (e, t) {
    return C.apply(this, arguments);
  },
  prefetch: G,
  prefetchPaper: K,
  warm: function (e) {
    try {
      var t = l.papers(e, {
        group: "national"
      }).sort(function (e, t) {
        return t.year - e.year;
      })[0];
      t && K(e, t.id);
    } catch (e) {}
  },
  hydrate: R,
  cleanAssets: function () {
    Date.now() - x < 3e5 || (x = Date.now(), setTimeout(function () {
      Q(w(), 33554432, 25165824, 1500), Q(g(), 5242880, 4194304, 192);
    }, 2e3));
  }
};
