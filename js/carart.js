/* Original pixel car art.
   Every car is drawn from a body STYLE (vintage tourer, finned cruiser, wedge supercar...)
   plus its color and wheel type. No logos or badges are drawn.
   sidePixels(car)  -> side view, facing right (74 x 30 with a 1px border for the outline)
   topPixels(car)   -> top-down view, facing up (20 x 38) for the driving game */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./pixel.js"));
  else root.CARART = factory(root.PX);
})(typeof self !== "undefined" ? self : this, function (PX) {
  "use strict";

  var SIDE_W = 74, SIDE_H = 30, TOP_W = 20, TOP_H = 38;
  var INK = "#16111f", WELL = "#1b1722", TIRE = "#26222d", TIRE_HI = "#3d3848";
  var PAINT = {
    horizon: 0.45, skyNear: 0.15, skyTop: 0.25, horizonBand: 0.30,
    groundMin: 0.10, groundMax: 0.35, lightGroundBoost: 0.15,
    topHighlight: 0.55, fenderHighlight: 0.20, wheelEdge: 0.40,
    endShading: [0.10, 0.18, 0.25], topRoof: 0.22, topLeft: 0.30,
    topRight: 0.30, topEnd: [0.10, 0.18, 0.25]
  };

  // Shapes are drawn on a 72 x 28 area. y = 27 is the ground.
  // body / glass: polygons. doors: x of door seams. wheels: x of wheel centers. r: wheel size.
  var SHAPES = {
    vintage: {
      body: [[4, 9], [35, 9], [38, 12], [60, 12], [60, 7], [66, 7], [66, 19], [4, 19]],
      glass: [[36, 1], [39, 1], [39, 10], [36, 10]],
      doors: [22, 33], wheels: [15, 54], r: 6, light: 11, trim: "#d8b45a", open: true
    },
    bubble: {
      body: [[6, 20], [5, 16], [7, 13], [18, 11], [23, 5], [31, 3], [42, 3], [48, 7], [53, 11], [63, 12], [67, 14], [68, 17], [68, 20]],
      glass: [[24, 6], [31, 4], [41, 4], [46, 8], [49, 11], [22, 11]],
      pillars: [36], doors: [26, 42], wheels: [17, 57], r: 5, light: 14, trim: "#e3e6ec"
    },
    gt: {
      body: [[4, 20], [4, 15], [7, 13], [20, 12], [27, 6], [34, 4], [45, 4], [50, 10], [54, 12], [66, 13], [69, 15], [69, 20]],
      glass: [[28, 6], [34, 5], [44, 5], [48, 11], [25, 11]],
      pillars: [38], doors: [30, 47], wheels: [16, 58], r: 5, light: 15, trim: "#e3e6ec"
    },
    fins: {
      body: [[2, 20], [2, 9], [5, 8], [8, 12], [27, 12], [31, 7], [47, 7], [51, 12], [68, 13], [70, 15], [70, 20]],
      glass: [[31, 8], [47, 8], [50, 12], [28, 12]],
      pillars: [40], doors: [32, 49], wheels: [16, 57], r: 5, light: 15, trim: "#e3e6ec"
    },
    longhood: {
      body: [[4, 20], [4, 15], [7, 13], [13, 11], [18, 7], [25, 6], [30, 8], [34, 11], [58, 12], [66, 14], [69, 17], [69, 20]],
      glass: [[19, 8], [25, 7], [29, 9], [32, 11], [16, 11]],
      doors: [18, 33], wheels: [15, 58], r: 5, light: 15, trim: "#e3e6ec"
    },
    fastback: {
      body: [[4, 20], [4, 16], [6, 13], [12, 10], [20, 6], [30, 5], [38, 7], [44, 11], [62, 13], [67, 15], [68, 20]],
      glass: [[17, 9], [21, 7], [30, 6], [36, 8], [40, 11], [14, 11]],
      pillars: [31], doors: [24, 40], wheels: [16, 57], r: 5, light: 15, trim: "#25222d"
    },
    racer: {
      body: [[3, 20], [3, 14], [10, 12], [24, 11], [30, 7], [42, 7], [48, 11], [64, 13], [69, 16], [69, 20]],
      glass: [[31, 8], [41, 8], [45, 11], [28, 11]],
      doors: [29, 45], wheels: [15, 57], r: 5, light: 15, trim: "#25222d", intake: [14, 24]
    },
    wedge: {
      body: [[3, 20], [3, 12], [14, 10], [27, 9], [34, 5], [44, 5], [67, 15], [70, 17], [70, 20]],
      glass: [[35, 6], [43, 6], [51, 10], [31, 10]],
      doors: [32, 50], wheels: [14, 58], r: 5, light: 16, trim: "#25222d", intake: [18, 27]
    },
    hyper: {
      body: [[3, 20], [3, 13], [10, 11], [24, 10], [32, 6], [44, 6], [54, 11], [66, 14], [70, 17], [70, 20]],
      glass: [[33, 7], [43, 7], [50, 11], [28, 11]],
      doors: [29, 49], wheels: [15, 58], r: 5, light: 16, trim: "#25222d", intake: [17, 25]
    },
    sedan: {
      body: [[2, 20], [2, 12], [6, 11], [16, 11], [20, 4], [48, 4], [52, 10], [68, 11], [70, 13], [70, 20]],
      glass: [[21, 5], [47, 5], [50, 10], [18, 10]],
      pillars: [34], doors: [19, 34, 50], wheels: [13, 59], r: 5, light: 13, trim: "#e3e6ec", grille: true
    },
    suv: {
      body: [[4, 21], [4, 4], [46, 4], [48, 10], [68, 11], [68, 21]],
      glass: [[6, 5], [45, 5], [46, 10], [6, 10]],
      pillars: [18, 32], doors: [6, 18, 32, 47], wheels: [15, 56], r: 6, light: 13, trim: "#25222d", spare: true
    }
  };

  function inPoly(pts, x, y) {
    var c = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function mask(w, h) { var m = []; for (var y = 0; y < h; y++) m.push(new Array(w).fill(false)); return m; }
  function fillPoly(m, pts) {
    for (var y = 0; y < m.length; y++) for (var x = 0; x < m[0].length; x++) if (inPoly(pts, x + 0.5, y + 0.5)) m[y][x] = true;
  }
  function at(m, x, y) { return y >= 0 && y < m.length && x >= 0 && x < m[0].length && m[y][x]; }
  // Removes lonely corner pixels and fills small notches so curves look clean.
  function tidy(m) {
    var out = m.map(function (r) { return r.slice(); });
    for (var y = 0; y < m.length; y++) for (var x = 0; x < m[0].length; x++) {
      var n = (at(m, x - 1, y) ? 1 : 0) + (at(m, x + 1, y) ? 1 : 0) + (at(m, x, y - 1) ? 1 : 0) + (at(m, x, y + 1) ? 1 : 0);
      if (m[y][x] && n <= 1) out[y][x] = false;
      if (!m[y][x] && n >= 3) out[y][x] = true;
    }
    return out;
  }

  function wheelColor(type, dx, dy, d, r, phase) {
    if (d > r - 1.4) return dy < -r + 2 || d > r - 0.7 ? TIRE_HI : TIRE;
    var a = Math.atan2(dy, dx) + phase;
    var inner = r - 1.4;
    if (type === "spoke") {
      if (d > inner - 1) return "#d4d8e0";
      if (dy < -1 && d > inner - 2) return "#777c88";
      if (d < 0.8) return "#f4f4f7";
      var f = ((a / (Math.PI / 4)) % 1 + 1) % 1;
      return f < 0.32 || f > 0.68 ? "#c3c8d2" : "#3b3946";
    }
    if (type === "whitewall" && d > inner - 1) return dy < -1 && d > inner - 2 ? "#c3bfae" : "#f3efe4";
    if (type === "alloy" || type === "chrome") {
      var bright = type === "chrome";
      if (d > inner - 0.9) return bright ? "#eef1f6" : "#a8afbb";
      if (dy < -1 && d > inner - 2) return bright ? "#777d8a" : "#646b79";
      if (d < 0.9) return bright ? "#ffffff" : "#e5e8ee";
      var n = bright ? 10 : 5, g = ((a / (2 * Math.PI / n)) % 1 + 1) % 1;
      return g < 0.42 ? (bright ? "#d6dbe3" : "#cfd5de") : (bright ? "#5d6270" : "#2c2a35");
    }
    // hubcap
    if (dy < -1 && d > inner - 2) return "#777d8a";
    if (d < 0.9) return "#7d8390";
    var notch = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (notch < 0.6 && d < inner - 0.5) return "#8f95a2";
    return dy < 0 ? "#eceef2" : "#c3c8d1";
  }

  // phase: 0..2, turns the wheels a little (for driving animation)
  function sidePixels(car, phase) {
    var S = SHAPES[car.style] || SHAPES.gt;
    var W = 72, H = 28, color = car.color, accent = car.accent || PX.darken(color, 0.4);
    var body = mask(W, H), glass = mask(W, H);
    fillPoly(body, S.body);
    fillPoly(glass, S.glass);
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) if (glass[y][x]) body[y][x] = true;
    body = tidy(body);
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (!body[y][x]) glass[y][x] = false;

    var r = S.r, cy = 27 - r, wheelsAt = S.wheels;
    function nearWheel(x, y, extra) {
      for (var i = 0; i < wheelsAt.length; i++) if (Math.hypot(x - wheelsAt[i], y - cy) <= r + extra) return true;
      return false;
    }

    var g = PX.grid(W, H);
    var gx0 = 99, gx1 = -1, gy0 = H, gy1 = -1;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (glass[y][x]) {
      gx0 = Math.min(gx0, x); gx1 = Math.max(gx1, x); gy0 = Math.min(gy0, y); gy1 = Math.max(gy1, y);
    }

    function paintColorAt(px, py) {
      return car.twoTone && px > 38 + (py - 10) && py > 12 ? accent : color;
    }
    var paintTop = new Array(W).fill(H), paintBottom = new Array(W).fill(-1);
    for (x = 0; x < W; x++) for (y = 0; y < H; y++) {
      if (body[y][x] && !glass[y][x] && !nearWheel(x, y, 1.2)) {
        paintTop[x] = Math.min(paintTop[x], y);
        paintBottom[x] = Math.max(paintBottom[x], y);
      }
    }

    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (!body[y][x] || glass[y][x]) continue;
      var c = paintColorAt(x, y);
      var top = paintTop[x], bottom = paintBottom[x];
      if (bottom >= top) {
        var horizon = top + Math.round((bottom - top) * PAINT.horizon);
        if (y === horizon) c = PX.darken(c, PAINT.horizonBand);
        else if (y === horizon - 1) {
          c = (x + y) % 2 ? PX.lighten(c, PAINT.skyNear) : PX.darken(c, PAINT.groundMin);
        } else if (y < horizon) {
          var skyProgress = (horizon - y) / Math.max(1, horizon - top);
          c = PX.lighten(c, PAINT.skyNear + (PAINT.skyTop - PAINT.skyNear) * skyProgress);
        } else {
          var groundProgress = (y - horizon) / Math.max(1, bottom - horizon);
          var rgb = PX.rgb(c);
          var lightPaint = (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722) / 255 > 0.72;
          var groundShade = PAINT.groundMin + (PAINT.groundMax - PAINT.groundMin) * groundProgress;
          if (lightPaint) groundShade += PAINT.lightGroundBoost * groundProgress;
          c = PX.darken(c, Math.min(0.5, groundShade));
        }
      }
      g[y][x] = c;
    }
    for (x = 0; x < W; x++) if (paintTop[x] < H && body[paintTop[x]][x] && !glass[paintTop[x]][x]) {
      g[paintTop[x]][x] = PX.lighten(paintColorAt(x, paintTop[x]), PAINT.topHighlight);
    }
    var bodyLeft = 99, bodyRight = -1;
    for (x = 0; x < W; x++) if (paintBottom[x] >= paintTop[x]) { bodyLeft = Math.min(bodyLeft, x); bodyRight = Math.max(bodyRight, x); }
    [bodyLeft + 7, bodyLeft + 9, Math.floor((bodyLeft + bodyRight) / 2) - 1, Math.floor((bodyLeft + bodyRight) / 2) + 1].forEach(function (glintX) {
      if (glintX < 0 || glintX >= W || paintTop[glintX] >= H) return;
      var glintY = paintTop[glintX];
      if (body[glintY][glintX] && !glass[glintY][glintX]) g[glintY][glintX] = "#fff8e6";
    });
    wheelsAt.forEach(function (wx) {
      for (var angle = Math.PI + 0.16; angle < Math.PI * 2 - 0.16; angle += 0.22) {
        var fx = Math.round(wx + Math.cos(angle) * (r + 2.5));
        var fy = Math.round(cy + Math.sin(angle) * (r + 2.5));
        if (body[fy] && body[fy][fx] && !glass[fy][fx]) g[fy][fx] = PX.lighten(paintColorAt(fx, fy), PAINT.fenderHighlight);
      }
      for (var edgeY = Math.max(0, cy - r - 2); edgeY <= Math.min(H - 1, cy + r + 2); edgeY++) {
        for (var edgeX = Math.max(0, wx - r - 2); edgeX <= Math.min(W - 1, wx + r + 2); edgeX++) {
          var edgeDistance = Math.hypot(edgeX - wx, edgeY - cy);
          if (body[edgeY][edgeX] && !glass[edgeY][edgeX] && edgeDistance > r + 0.4 && edgeDistance <= r + 1.2) {
            g[edgeY][edgeX] = PX.darken(paintColorAt(edgeX, edgeY), PAINT.wheelEdge);
          }
        }
      }
    });
    for (var end = 0; end < PAINT.endShading.length; end++) {
      for (y = 0; y < H; y++) {
        if (body[y][end] && !glass[y][end]) g[y][end] = PX.darken(g[y][end], PAINT.endShading[end]);
        var frontX = W - 1 - end;
        if (body[y][frontX] && !glass[y][frontX]) g[y][frontX] = PX.darken(g[y][frontX], PAINT.endShading[end]);
      }
    }
    // side stripe / chrome spear
    function hline(x0, x1, yy, fn) {
      for (var xx = x0; xx <= x1; xx++) if (body[yy] && body[yy][xx] && !glass[yy][xx] && g[yy][xx]) g[yy][xx] = fn(g[yy][xx]);
    }
    if (car.style === "fins") hline(8, 64, 15, function () { return "#eef0f4"; });
    if (car.stripe) { hline(0, W - 1, 14, function () { return accent; }); hline(0, W - 1, 15, function () { return PX.darken(accent, 0.15); }); }
    if (car.race) { // a plain racing roundel on the door
      var rx = Math.round((S.doors[0] + S.doors[1]) / 2), ry = 15;
      for (y = ry - 2; y <= ry + 2; y++) for (x = rx - 2; x <= rx + 2; x++) {
        if (Math.hypot(x - rx, y - ry) <= 2.3 && body[y][x] && !glass[y][x]) g[y][x] = "#f7f3ea";
      }
      g[ry][rx] = "#2a2530"; g[ry - 1][rx] = "#2a2530"; g[ry + 1][rx] = "#2a2530";
    }

    var glassInterior = mask(W, H);
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (!glass[y][x]) continue;
      var edge = !at(glass, x - 1, y) || !at(glass, x + 1, y) || !at(glass, x, y - 1) || !at(glass, x, y + 1);
      if (edge || (S.pillars && S.pillars.indexOf(x) >= 0)) { g[y][x] = (S.pillars && S.pillars.indexOf(x) >= 0 && !edge) ? PX.darken(color, 0.25) : S.trim; continue; }
      glassInterior[y][x] = true;
      var glassProgress = (y - gy0) / Math.max(1, gy1 - gy0);
      g[y][x] = PX.mix("#a8c8d5", "#354b5b", glassProgress);
    }
    if (!S.open && gx1 - gx0 >= 5 && gy1 - gy0 >= 4) {
      var headrestX = Math.floor((gx0 + gx1) / 2) - 2, headrestY = gy0 + 2;
      [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1]].forEach(function (p) {
        if (glassInterior[headrestY + p[1]] && glassInterior[headrestY + p[1]][headrestX + p[0]]) {
          g[headrestY + p[1]][headrestX + p[0]] = "#26313c";
        }
      });
    }
    for (y = gy0; y <= gy1; y++) {
      var reflectionX = gx0 + 2 + Math.floor((y - gy0) * 0.55);
      for (var reflectionWidth = 0; reflectionWidth < 2; reflectionWidth++) {
        if (glassInterior[y] && glassInterior[y][reflectionX + reflectionWidth]) g[y][reflectionX + reflectionWidth] = "#e7f2f4";
      }
    }

    // door seams and handle
    if (S.doors) S.doors.forEach(function (dx, i) {
      for (var yy = (gy1 >= 0 ? gy1 + 2 : 11); yy < H; yy++) {
        if (!body[yy][dx] || glass[yy][dx] || !at(body, dx, yy + 2) || nearWheel(dx, yy, 2)) continue;
        g[yy][dx] = PX.darken(g[yy][dx], 0.28);
      }
      if (i === 1 || (S.doors.length > 2 && i === S.doors.length - 1)) {
        var hy = (gy1 >= 0 ? gy1 + 3 : 13);
        if (body[hy] && body[hy][dx - 3] && g[hy][dx - 3]) { g[hy][dx - 3] = "#eef0f4"; g[hy][dx - 2] = "#b9bec8"; }
      }
    });

    // air intakes
    if (S.intake) for (y = 13; y <= 17; y += 2) for (x = S.intake[0]; x <= S.intake[1]; x++) {
      if (body[y][x] && !glass[y][x] && !nearWheel(x, y, 2)) g[y][x] = "#221d2b";
    }

    // style extras
    if (car.style === "vintage") {
      for (y = 4; y <= 8; y++) for (x = 7; x <= 14; x++) g[y][x] = y === 4 ? PX.lighten(accent, 0.3) : (x === 7 ? PX.darken(accent, 0.3) : accent); // seat back
      for (y = 7; y <= 18; y++) for (x = 61; x <= 65; x++) g[y][x] = (x % 2 === 0) ? "#ecd27a" : "#9c7a2c";     // brass radiator
      for (x = 61; x <= 65; x++) { g[7][x] = "#f6e3a0"; g[18][x] = "#8a6a24"; }
      for (x = 20; x <= 48; x++) { g[19][x] = PX.darken(accent, 0.2); g[20][x] = PX.darken(accent, 0.45); } // running board
    }
    if (S.grille) for (y = 12; y <= 18; y++) for (x = 67; x <= 69; x++) if (body[y][x]) g[y][x] = (y % 2) ? "#f3f5f9" : "#8d93a0";
    if (car.wing) {
      for (x = 1; x <= 13; x++) { g[4][x] = PX.lighten(accent, 0.25); g[5][x] = accent; }
      for (y = 6; y <= 9; y++) { g[y][4] = accent; g[y][10] = accent; }
    }

    // wheel wells, wheels, fenders
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (body[y][x] && nearWheel(x, y, 1.2) && !nearWheel(x, y, 0.4)) {
        var wheelDistance = Math.min.apply(null, wheelsAt.map(function (wx) { return Math.hypot(x - wx, y - cy); }));
        g[y][x] = wheelDistance > r + 0.9 ? PX.darken(paintColorAt(x, y), PAINT.wheelEdge) : WELL;
      }
    }
    var ph = (phase || 0) * (Math.PI / 12);
    wheelsAt.forEach(function (wx) {
      for (var yy = cy - r - 1; yy <= cy + r + 1; yy++) for (var xx = wx - r - 1; xx <= wx + r + 1; xx++) {
        var dx = xx - wx, dy = yy - cy, d = Math.hypot(dx, dy);
        if (d > r + 0.4 || yy < 0 || yy >= H) continue;
        g[yy][xx] = wheelColor(car.wheels, dx, dy, d, r, ph);
      }
      if (car.style === "vintage") { // separate curved fenders
        for (var a = Math.PI * 1.02; a <= Math.PI * 1.98; a += 0.04) {
          var fx = Math.round(wx + Math.cos(a) * (r + 2)), fy = Math.round(cy + Math.sin(a) * (r + 2));
          if (fy >= 0) { g[fy][fx] = PX.darken(accent, 0.1); if (fy - 1 >= 0) g[fy - 1][fx] = PX.lighten(accent, 0.2); }
        }
      }
    });
    if (S.spare) for (y = 8; y <= 18; y++) for (x = 0; x <= 4; x++) {
      var sd = Math.hypot(x - 4, y - 13);
      if (sd <= 5.4 && !body[y][x]) g[y][x] = sd > 3.8 ? TIRE : (sd > 2.6 ? PX.darken(color, 0.1) : PX.lighten(color, 0.2));
    }

    // lights and bumpers
    var ly = S.light, fx = -1, bx = 99;
    for (x = 0; x < W; x++) if (body[ly][x]) { fx = Math.max(fx, x); bx = Math.min(bx, x); }
    if (car.style === "vintage") {
      g[10][67] = "#f6e3a0"; g[10][68] = "#f6e3a0"; g[11][67] = "#fffbe6"; g[11][68] = "#d8b45a"; g[12][67] = "#9c7a2c"; g[12][68] = "#9c7a2c";
    } else {
      g[ly][fx] = "#fffbe6"; g[ly + 1][fx] = "#ffd75e"; g[ly][fx - 1] = PX.lighten(g[ly][fx - 1] || color, 0.5);
      if (car.style === "fins") { g[10][2] = "#ff5468"; g[12][2] = "#ff5468"; g[11][2] = "#7d1a2c"; }
      else { g[ly][bx] = "#ff5468"; g[ly + 1][bx] = "#c42640"; }
    }
    var chromeBump = ["vintage", "bubble", "gt", "fins", "longhood", "sedan"].indexOf(car.style) >= 0;
    if (chromeBump) {
      var by = 19;
      for (x = 0; x < 5; x++) {
        if (body[by][fx - x]) { g[by][fx - x] = "#eef1f6"; if (g[by - 1][fx - x] && !glass[by - 1][fx - x]) g[by - 1][fx - x] = "#b8bec9"; }
        if (body[by][bx + x]) { g[by][bx + x] = "#eef1f6"; if (g[by - 1][bx + x] && !glass[by - 1][bx + x]) g[by - 1][bx + x] = "#b8bec9"; }
      }
    }

    // Put the body on the padded grid and use paint-colored outlines above the wheels.
    var out = PX.grid(SIDE_W, SIDE_H);
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) out[y + 1][x + 1] = g[y][x];
    var outlined = out.map(function (row) { return row.slice(); });
    for (var oy = 0; oy < SIDE_H; oy++) for (var ox = 0; ox < SIDE_W; ox++) {
      if (out[oy][ox]) continue;
      var neighbors = [[ox - 1, oy], [ox + 1, oy], [ox, oy - 1], [ox, oy + 1]];
      var edgeColor = null, darkBottom = oy >= H - 1;
      neighbors.forEach(function (point) {
        var nx = point[0], ny = point[1];
        if (nx < 0 || nx >= SIDE_W || ny < 0 || ny >= SIDE_H || !out[ny][nx]) return;
        if (!edgeColor) edgeColor = out[ny][nx];
        if (ny >= H - 2) darkBottom = true;
        var bodyX = nx - 1, bodyY = ny - 1;
        if (body[bodyY] && body[bodyY][bodyX] && !glass[bodyY][bodyX] && bodyY >= paintBottom[bodyX]) darkBottom = true;
      });
      if (!edgeColor) continue;
      var localX = ox - 1, localY = oy - 1;
      var aroundWheel = wheelsAt.some(function (wx) { return Math.hypot(localX - wx, localY - cy) <= r + 1.6; });
      outlined[oy][ox] = darkBottom || aroundWheel ? INK : PX.darken(edgeColor, 0.6);
    }
    return outlined;
  }

  // ---------- top-down view ----------
  var TOP = {
    vintage: { wind: [12, 12], roof: null, rear: null, open: [14, 25], narrow: 2 },
    bubble: { wind: [11, 13], roof: [14, 19], rear: [20, 23], slats: [27, 31] },
    gt: { wind: [14, 16], roof: [17, 22], rear: [23, 25] },
    fins: { wind: [12, 14], roof: [15, 22], rear: [23, 25], fins: true },
    longhood: { wind: [15, 17], roof: [18, 22], rear: [23, 25] },
    fastback: { wind: [11, 13], roof: [14, 19], rear: [20, 24], slats: [27, 31] },
    racer: { wind: [12, 15], roof: [16, 19], rear: null, slats: [22, 31], taper: true },
    wedge: { wind: [12, 15], roof: [16, 19], rear: null, slats: [22, 31], taper: true },
    hyper: { wind: [12, 15], roof: [16, 19], rear: null, slats: [22, 31], taper: true },
    sedan: { wind: [10, 12], roof: [13, 23], rear: [24, 26] },
    suv: { wind: [9, 10], roof: [11, 31], rear: null, square: true }
  };

  function topPixels(car) {
    var T = TOP[car.style] || TOP.gt, color = car.color, accent = car.accent || PX.darken(color, 0.4);
    var W = 18, H = 36, g = PX.grid(W, H);
    function inset(y) {
      var i = 0;
      if (T.square) i = (y === 1 || y === 34) ? 1 : 0;
      else {
        var ends = [3, 1, 1];
        if (y - 1 < 3) i = ends[y - 1];
        if (34 - y < 3) i = ends[34 - y];
        if (T.taper && y < 8) i = Math.max(i, [3, 2, 2, 1, 1, 1, 1][y - 1]);
      }
      return i + (T.narrow && !(y >= 5 && y <= 10) && !(y >= 25 && y <= 30) ? T.narrow : 0);
    }
    function inR(y, r) { return r && y >= r[0] && y <= r[1]; }
    for (var y = 1; y <= 34; y++) {
      var i = inset(y), x0 = 1 + i, x1 = 16 - i;
      for (var x = x0; x <= x1; x++) {
        var c = color;
        if (x === x0) c = PX.lighten(c, PAINT.topLeft); else if (x === x0 + 1) c = PX.lighten(c, 0.14);
        if (x === x1) c = PX.darken(c, PAINT.topRight); else if (x === x1 - 1) c = PX.darken(c, 0.12);
        var endDistance = Math.min(y - 1, 34 - y);
        if (endDistance >= 0 && endDistance < PAINT.topEnd.length) c = PX.darken(c, PAINT.topEnd[endDistance]);
        var cabin = x >= x0 + 2 && x <= x1 - 2;
        if (cabin && (inR(y, T.wind) || inR(y, T.rear))) c = (x === x0 + 2 || y === (inR(y, T.wind) ? T.wind[0] : T.rear[1])) ? "#c7e8f5" : "#6fa6c8";
        else if (cabin && inR(y, T.roof)) c = PX.lighten(color, x <= 8 ? PAINT.topRoof : 0.08);
        else if (cabin && inR(y, T.open)) c = (y === 18 || y === 19) ? accent : PX.darken(accent, 0.25);
        else if (cabin && inR(y, T.slats) && y % 2 === 0) c = "#221d2b";
        if (car.stripe && (x === 7 || x === 10) && !(cabin && (inR(y, T.wind) || inR(y, T.rear)))) c = accent;
        g[y][x] = c;
      }
      // lights
      if (y === 1 || y === 2) { g[y][x0 + (y === 1 ? 1 : 0)] = "#fffbe6"; g[y][x1 - (y === 1 ? 1 : 0)] = "#fffbe6"; }
      if (y === 34) { g[y][x0 + 1] = "#ff5468"; g[y][x1 - 1] = "#ff5468"; }
    }
    if (T.fins) for (y = 30; y <= 35; y++) { g[y][1] = PX.lighten(color, 0.3); g[y][16] = PX.darken(color, 0.25); }
    if (car.wing) for (x = 0; x <= 17; x++) { g[33][x] = PX.lighten(accent, 0.2); g[34][x] = accent; }
    if (T.square && car.style === "suv") for (y = 34; y <= 35; y++) for (x = 6; x <= 11; x++) g[y][x] = y === 35 ? TIRE : TIRE_HI;
    // wheels poke out the sides
    [[6, 10], [25, 29]].forEach(function (w) {
      for (var yy = w[0]; yy <= w[1]; yy++) {
        var shade = yy === w[0] ? TIRE_HI : TIRE;
        g[yy][0] = g[yy][0] || shade; g[yy][17] = g[yy][17] || shade;
        if (T.narrow) { g[yy][1] = g[yy][1] || shade; g[yy][16] = g[yy][16] || shade; }
      }
    });
    var out = PX.grid(TOP_W, TOP_H);
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) out[y + 1][x + 1] = g[y][x];
    return PX.outline(out, INK);
  }

  return { SIDE_W: SIDE_W, SIDE_H: SIDE_H, TOP_W: TOP_W, TOP_H: TOP_H, STYLES: Object.keys(SHAPES), sidePixels: sidePixels, topPixels: topPixels };
});
