function k() {
  this.a = this.c = null;
  this.b = {j:0, m:1, h:2};
  this.g = {l:0, o:1, i:2};
}
k.prototype.load = function(b, a) {
  this.c = a ? l(this, b, a) : b;
  this.a = {};
  for (var d in this.c.modules) {
    Object.prototype.hasOwnProperty.call(this.c.modules, d) && (this.a[d] = this.c.modules[d].load, this.a[d].f = this.b.j);
  }
  n(this);
};
k.prototype.getcfg = function() {
  return this.c;
};
function n(b) {
  var a = !0, d;
  for (d in b.a) {
    if (b.a[d].f === b.b.j) {
      var a = !1, e = b.a[d].after, f = !0;
      if (e) {
        for (var c = 0, g = e.length;c < g;c++) {
          if (b.a[e[c]].f !== b.b.h) {
            f = !1;
            console.log('load script:"%s" need load after:"%s"', d, e[c]);
            break;
          }
        }
      }
      if (f && b.a[d].f !== b.b.m) {
        b.a[d].f = b.b.m;
        console.log("load script started %s", d);
        var f = b, h = d, m = f.a[h].version, g = f.a[h].url, c = f.a[h].cache;
        (e = localStorage.getItem(h)) && c !== f.g.l ? (e = JSON.parse(e), e.version !== m ? (localStorage.removeItem(h), p(f, g, h, c, m)) : (q(e.content, g), f.a[h].f = f.b.h, console.log("injectScript script ready %s", h), n(f))) : p(f, g, h, c, m);
      }
    }
    b.a[d].f === b.b.h || (a = !1);
  }
  if (a && (console.log("all script loaded"), b.c.onLoad)) {
    b.c.onLoad();
  }
}
function r(b, a) {
  b.a[a].f = b.b.h;
  console.log("cacheScript script ready %s", a);
  n(b);
}
function t(b, a, d, e, f) {
  if (f !== b.g.l) {
    var c = new XMLHttpRequest;
    u(c, "readystatechange", function() {
      4 === c.readyState && (200 === c.status ? (localStorage.setItem(a, JSON.stringify({content:c.responseText, version:d})), f === b.g.i && q(c.responseText, e), r(b, a)) : console.warn("error loading %s", e));
    });
    c.open("GET", e, !0);
    c.send();
  } else {
    r(b, a);
  }
}
function p(b, a, d, e, f) {
  var c = null, g = a.substring(a.length - 3);
  ".js" === g ? c = document.createElement("script") : "css" === g && (c = document.createElement("link"));
  c.readyState ? u(c, "readystatechange", function() {
    if ("loaded" === c.readyState || "complete" === c.readyState) {
      c.onreadystatechange = null, t(b, d, f, a, e);
    }
  }) : u(c, "load", function() {
    t(b, d, f, a, e);
  });
  e !== b.g.i ? (".js" === g ? c.setAttribute("src", a) : "css" === g && (c.setAttribute("href", a), c.setAttribute("rel", "stylesheet"), c.setAttribute("type", "text/css"), c.setAttribute("media", "screen, projection")), document.getElementsByTagName("head")[0].appendChild(c)) : t(b, d, f, a, e);
}
function q(b, a) {
  a = a.substring(a.length - 3);
  ".js" === a ? (a = document.createElement("script"), a.type = "text/javascript", a.text = b, document.getElementsByTagName("head")[0].appendChild(a)) : "css" === a && (a = document.createElement("style"), a.type = "text/css", a.rel = "stylesheet", a.media = "screen, projection", a.styleSheet ? a.styleSheet.cssText = b : a.appendChild(document.createTextNode(b)), document.getElementsByTagName("head")[0].appendChild(a));
}
function u(b, a, d) {
  b.addEventListener ? b.addEventListener(a, d, !1) : b.attachEvent ? b.attachEvent("on" + a, d) : b["on" + a] = d;
}
function l(b, a, d) {
  var e = {}, f;
  for (f in a) {
    a.hasOwnProperty(f) && (e[f] = a[f]);
  }
  for (var c in d) {
    d.hasOwnProperty(c) && (e.hasOwnProperty(c) ? "object" === typeof e[c] && e[c].constructor === Object && "object" === typeof d[c] && d[c].constructor === Object && (e[c] = l(b, e[c], d[c])) : e[c] = d[c]);
  }
  return e;
}
"loader" in window ? document.write("error create loader") : (window.loader = new k, window.loader.getcfg());

