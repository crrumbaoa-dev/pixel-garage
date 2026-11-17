/* The player character: a small front-facing pixel person you can customize.
   Letters in the maps: s skin, S skin shadow, e eye, w eye shine, c cheek, m mouth,
   t top, T top shadow, p bottoms, P bottoms shadow, b shoes, h hair, H hair shadow. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./pixel.js"));
  else root.PEOPLE = factory(root.PX);
})(typeof self !== "undefined" ? self : this, function (PX) {
  "use strict";

  var W = 18, H = 26; // 16 x 24 person + 1px border for the outline

  var BASE = [
    "................",
    "................",
    "....ssssssss....",
    "...ssssssssss...",
    "..ssssssssssss..",
    "..ssssssssssss..",
    "..ssssssssssss..",
    "..sssewssewsss..",
    "..ssseesseesss..",
    "..sscsssssscss..",
    "...ssssmmssss...",
    ".....ssssss.....",
    "...tttssssttt...",
    "..tttttSSttttt..",
    "..tTttttttttTt..",
    "..tTttttttttTt..",
    "..sTttttttttTs..",
    "...TTTTTTTTTT...",
    "...pppppppppp...",
    "...ppppPPpppp...",
    "....ppp..ppp....",
    "....ppp..ppp....",
    "...bbbb..bbbb...",
    "...bbbb..bbbb..."
  ];
  // skirt version of the bottom half
  var SKIRT = {
    18: "...tttttttttt...",
    19: "..tttttTTttttt..",
    20: "....sss..sss....",
    21: "....sss..sss...."
  };

  var HAIR = {
    short: { front: [
      "................",
      ".....hhhhhh.....",
      "...hhhhhhhhhh...",
      "..hhhhhhhhhhhh..",
      "..hhhhhhh..hhh..",
      "..hh........hh..",
      "..h..........h.."
    ] },
    bob: { front: [
      "................",
      ".....hhhhhh.....",
      "...hhhhhhhhhh...",
      "..hhhhhhhhhhhh..",
      ".hhhhhhhh..hhhh.",
      ".hhh........hhh.",
      ".hh..........hh.",
      ".hh..........hh.",
      ".hh..........hh.",
      ".hh..........hh.",
      ".HH..........HH."
    ] },
    long: { front: [
      "................",
      ".....hhhhhh.....",
      "...hhhhhhhhhh...",
      "..hhhhhhhhhhhh..",
      ".hhhhhhh..hhhhh.",
      ".hhh........hhh.",
      ".hh..........hh.",
      ".hh..........hh."
    ], back: { from: 8, to: 17, left: 1, right: 14 } },
    bun: { front: [
      "......hhhh......",
      ".....hHHHHh.....",
      "...hhhhhhhhhh...",
      "..hhhhhhhhhhhh..",
      "..hhhhhhh..hhh..",
      "..hh........hh..",
      "..h..........h.."
    ] },
    curly: { front: [
      "....hhhhhhhh....",
      "..hhhhhhhhhhhh..",
      ".hhhhhhhhhhhhhh.",
      ".hhhhhhhhhhhhhh.",
      ".hhhhh.hhh.hhhh.",
      ".hhh........hhh.",
      ".hh..........hh.",
      ".hh..........hh.",
      ".h............h."
    ], curls: true },
    cap: { front: [
      "................",
      "....aaaaaaaa....",
      "...aaaaaaaaaa...",
      "..aaaaaaaaaaaa..",
      "..AAAAAAAAAAAA..",
      "..hh........hh..",
      "..h..........h.."
    ] }
  };

  var OPTIONS = {
    skin: ["#ffe1cc", "#f3c49d", "#d9a077", "#a9724c", "#6f4631"],
    hair: Object.keys(HAIR),
    hairColor: ["#2b1d1a", "#5b3826", "#a3672f", "#ecc77a", "#f07aaa", "#cfcfe0"],
    top: ["#f07aaa", "#4a63d8", "#2f9e6e", "#f2c230", "#2a2638", "#f4f1ea"],
    bottom: ["pants", "skirt"]
  };
  var NAMES = {
    skin: ["Light", "Light medium", "Medium", "Medium deep", "Deep"],
    hair: ["Short", "Bob", "Long", "Bun", "Curly", "Driving cap"],
    hairColor: ["Black", "Brown", "Auburn", "Blonde", "Pink", "Silver"],
    top: ["Pink", "Blue", "Green", "Yellow", "Black", "Cream"],
    bottom: ["Pants", "Skirt"]
  };
  var DEFAULT = { name: "", skin: 1, hair: 1, hairColor: 1, top: 0, bottom: 0 };

  // frame: 0 standing, 1 left step, 2 right step. blink: eyes closed
  function pixels(p, frame, blink) {
    p = Object.assign({}, DEFAULT, p || {});
    var skin = OPTIONS.skin[p.skin] || OPTIONS.skin[1];
    var hairC = OPTIONS.hairColor[p.hairColor] || OPTIONS.hairColor[0];
    var top = OPTIONS.top[p.top] || OPTIONS.top[0];
    var pants = top === "#2a2638" ? "#4b4560" : "#2b2d42";
    var hair = HAIR[OPTIONS.hair[p.hair]] || HAIR.short;
    var cols = {
      s: skin, S: PX.darken(skin, 0.18), e: "#2a1d2e", w: "#ffffff", c: PX.mix(skin, "#ff7a9c", 0.45), m: "#b3475f",
      t: top, T: PX.darken(top, 0.2), p: pants, P: PX.darken(pants, 0.3), b: "#3a2a2a",
      h: hairC, H: PX.darken(hairC, 0.25), a: "#e85a6f", A: PX.darken("#e85a6f", 0.3)
    };
    var rows = BASE.slice();
    if (OPTIONS.bottom[p.bottom] === "skirt") Object.keys(SKIRT).forEach(function (k) { rows[k] = SKIRT[k]; });
    if (blink) { rows[7] = rows[7].replace(/[ew]/g, "s"); }

    var g = PX.grid(W, H);
    function put(x, y, ch) { if (ch !== "." && cols[ch]) g[y + 1][x + 1] = cols[ch]; }
    // hair behind the body
    if (hair.back) for (var y = hair.back.from; y <= hair.back.to; y++) for (var x = hair.back.left; x <= hair.back.right; x++) {
      put(x, y, (y === hair.back.to || x === hair.back.left || x === hair.back.right) ? "H" : "h");
    }
    rows.forEach(function (r, yy) { for (var xx = 0; xx < 16; xx++) put(xx, yy, r[xx]); });
    hair.front.forEach(function (r, yy) {
      for (var xx = 0; xx < 16; xx++) {
        var ch = r[xx];
        if (ch === "h" && (hair.curls ? (xx + yy) % 3 === 0 : (yy === 3 && xx % 4 === 1))) ch = "H";
        put(xx, yy, ch);
      }
    });

    // walking: lift one leg and bob
    if (frame) {
      var side = frame === 1 ? [1, 8] : [9, 16];
      for (y = 21; y <= 24; y++) for (x = side[0]; x <= side[1]; x++) g[y - 1][x] = g[y][x];
      for (x = side[0]; x <= side[1]; x++) g[24][x] = null;
    }
    return PX.outline(g, "#1d1424");
  }

  return { W: W, H: H, OPTIONS: OPTIONS, NAMES: NAMES, DEFAULT: DEFAULT, pixels: pixels };
});
