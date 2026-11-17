/* Pixel helpers: colors, pixel grids, outlines, and a 5x7 bitmap font. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PX = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------- colors ----------
  function rgb(c) {
    c = c.replace("#", "");
    if (c.length === 3) c = c.split("").map(function (x) { return x + x; }).join("");
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  }
  function hex(r, g, b) {
    return "#" + [r, g, b].map(function (v) {
      v = Math.max(0, Math.min(255, Math.round(v)));
      return (v < 16 ? "0" : "") + v.toString(16);
    }).join("");
  }
  function mix(a, b, t) {
    var A = rgb(a), B = rgb(b);
    return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }
  // Light is warm, shadow is cool. This keeps shading from looking muddy.
  function lighten(c, t) { return mix(c, "#fff8ee", t); }
  function darken(c, t) { return mix(c, "#1a1030", t); }

  // ---------- grids ----------
  function grid(w, h) {
    var g = [];
    for (var y = 0; y < h; y++) { g.push(new Array(w).fill(null)); }
    return g;
  }
  function inside(g, x, y) { return y >= 0 && y < g.length && x >= 0 && x < g[0].length; }
  function get(g, x, y) { return inside(g, x, y) ? g[y][x] : null; }
  function set(g, x, y, c) { if (inside(g, x, y)) g[y][x] = c; }

  // Draws a dark line around everything that is filled in.
  function outline(g, color) {
    color = color || "#16111f";
    var h = g.length, w = g[0].length, out = g.map(function (r) { return r.slice(); });
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (g[y][x]) continue;
      if (get(g, x - 1, y) || get(g, x + 1, y) || get(g, x, y - 1) || get(g, x, y + 1)) out[y][x] = color;
    }
    return out;
  }

  function flipX(g) { return g.map(function (r) { return r.slice().reverse(); }); }

  // Turns a grid into a canvas you can draw (browser only).
  function toCanvas(g, scale) {
    scale = scale || 1;
    var c = document.createElement("canvas");
    c.width = g[0].length * scale; c.height = g.length * scale;
    var ctx = c.getContext("2d");
    for (var y = 0; y < g.length; y++) for (var x = 0; x < g[0].length; x++) {
      if (!g[y][x]) continue;
      ctx.fillStyle = g[y][x];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
    return c;
  }

  // ---------- 5x7 font ----------
  var GLYPHS = {
    A: "01110 10001 10001 11111 10001 10001 10001", B: "11110 10001 10001 11110 10001 10001 11110",
    C: "01110 10001 10000 10000 10000 10001 01110", D: "11110 10001 10001 10001 10001 10001 11110",
    E: "11111 10000 10000 11110 10000 10000 11111", F: "11111 10000 10000 11110 10000 10000 10000",
    G: "01110 10001 10000 10111 10001 10001 01111", H: "10001 10001 10001 11111 10001 10001 10001",
    I: "01110 00100 00100 00100 00100 00100 01110", J: "00111 00010 00010 00010 00010 10010 01100",
    K: "10001 10010 10100 11000 10100 10010 10001", L: "10000 10000 10000 10000 10000 10000 11111",
    M: "10001 11011 10101 10101 10001 10001 10001", N: "10001 10001 11001 10101 10011 10001 10001",
    O: "01110 10001 10001 10001 10001 10001 01110", P: "11110 10001 10001 11110 10000 10000 10000",
    Q: "01110 10001 10001 10001 10101 10010 01101", R: "11110 10001 10001 11110 10100 10010 10001",
    S: "01111 10000 10000 01110 00001 00001 11110", T: "11111 00100 00100 00100 00100 00100 00100",
    U: "10001 10001 10001 10001 10001 10001 01110", V: "10001 10001 10001 10001 10001 01010 00100",
    W: "10001 10001 10001 10101 10101 10101 01010", X: "10001 10001 01010 00100 01010 10001 10001",
    Y: "10001 10001 01010 00100 00100 00100 00100", Z: "11111 00001 00010 00100 01000 10000 11111",
    0: "01110 10001 10011 10101 11001 10001 01110", 1: "00100 01100 00100 00100 00100 00100 01110",
    2: "01110 10001 00001 00010 00100 01000 11111", 3: "11111 00010 00100 00010 00001 10001 01110",
    4: "00010 00110 01010 10010 11111 00010 00010", 5: "11111 10000 11110 00001 00001 10001 01110",
    6: "00110 01000 10000 11110 10001 10001 01110", 7: "11111 00001 00010 00100 01000 01000 01000",
    8: "01110 10001 10001 01110 10001 10001 01110", 9: "01110 10001 10001 01111 00001 00010 01100",
    ".": "00000 00000 00000 00000 00000 01100 01100", ",": "00000 00000 00000 00000 01100 00100 01000",
    "!": "00100 00100 00100 00100 00100 00000 00100", "?": "01110 10001 00001 00010 00100 00000 00100",
    ":": "00000 01100 01100 00000 01100 01100 00000", "-": "00000 00000 00000 11111 00000 00000 00000",
    "'": "00100 00100 01000 00000 00000 00000 00000", "/": "00001 00010 00010 00100 01000 01000 10000",
    "$": "00100 01111 10100 01110 00101 11110 00100", "(": "00010 00100 01000 01000 01000 00100 00010",
    ")": "01000 00100 00010 00010 00010 00100 01000", "+": "00000 00100 00100 11111 00100 00100 00000",
    "%": "11000 11001 00010 00100 01000 10011 00011", "&": "01100 10010 10100 01000 10101 10010 01101",
    "#": "01010 01010 11111 01010 11111 01010 01010", "*": "00000 00100 10101 01110 10101 00100 00000",
    "<": "00010 00100 01000 10000 01000 00100 00010", ">": "01000 00100 00010 00001 00010 00100 01000",
    "\"": "01010 01010 00000 00000 00000 00000 00000",
    " ": "00000 00000 00000 00000 00000 00000 00000"
  };
  var FONT = {};
  Object.keys(GLYPHS).forEach(function (k) { FONT[k] = GLYPHS[k].split(" "); });

  function cleanText(text) {
    text = String(text)
      .replace(/[“”]/g, "\"")
      .replace(/[‘’]/g, "'")
      .replace(/½/g, function (match, offset, source) {
        return offset > 0 && /\s/.test(source.charAt(offset - 1)) ? "1/2" : " 1/2";
      })
      .replace(/[–—·]/g, "-");
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function glyph(ch) {
    ch = cleanText(ch).toUpperCase();
    return FONT[ch] || FONT["?"];
  }
  function textWidth(text, scale) {
    scale = scale || 1;
    text = cleanText(text);
    return text.length ? (text.length * 6 - 1) * scale : 0;
  }
  // opts: scale, align ("left" | "center" | "right"), shadow (color), rowColor(row 0..6) -> color
  function drawText(ctx, text, x, y, color, opts) {
    opts = opts || {};
    var s = opts.scale || 1;
    text = cleanText(text);
    if (opts.align === "center") x -= Math.floor(textWidth(text, s) / 2);
    else if (opts.align === "right") x -= textWidth(text, s);
    x = Math.round(x); y = Math.round(y);
    if (opts.shadow) drawText(ctx, text, x, y + s, opts.shadow, { scale: s });
    for (var i = 0; i < text.length; i++) {
      var g = glyph(text[i]);
      for (var r = 0; r < 7; r++) {
        ctx.fillStyle = opts.rowColor ? opts.rowColor(r) : color;
        for (var c = 0; c < 5; c++) if (g[r][c] === "1") ctx.fillRect(x + (i * 6 + c) * s, y + r * s, s, s);
      }
    }
  }

  return {
    rgb: rgb, hex: hex, mix: mix, lighten: lighten, darken: darken,
    grid: grid, get: get, set: set, outline: outline, flipX: flipX, toCanvas: toCanvas,
    FONT: FONT, glyph: glyph, cleanText: cleanText, textWidth: textWidth, drawText: drawText
  };
});
