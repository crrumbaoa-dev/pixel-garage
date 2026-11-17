/* Test drive: a top-down coastal road. Switch lanes, dodge traffic, grab coins and fact cards.
   Speed and handling here are game stats, just for fun, not real car numbers. */
(function () {
  "use strict";

  var ROAD_X = 118, LANE_W = 28, LANES = 3, PLAYER_Y = 128;
  var PALETTE = {
    grass: "#5fae63", grassLight: "#79bd68", grassDark: "#3e854f", redDirt: "#9b513b", dirtSpeckle: "#bd7451",
    sand: "#fff2d6", sandShade: "#e7d2a4", shallowWater: "#8be0cf",
    brightWater: "#38bdc0", deepSea: "#247b9e", reef: "#287c78", reefLight: "#348e85",
    palmTrunk: "#8b5a35", palmHighlight: "#b47b49", palmLeaf: "#287c4d",
    leafLight: "#56ab62", bananaLeaf: "#68a943", bananaLight: "#a9d05d",
    nipaRoof: "#9b7144", nipaHighlight: "#c1975f", nipaShadow: "#594331", nipaWall: "#d4b68b",
    coralStone: "#c5b99c", coralLight: "#e0d1ad", coralMortar: "#897e6d",
    churchRoof: "#514b48", churchShadow: "#353b3b", bellStone: "#dfd3b9",
    poolDeep: "#41b8d0", poolLight: "#86e5e2", foam: "#fffdf1",
    flowerPink: "#f278ac", flowerRed: "#e8544f",
    bangkaHull: "#3f3533", bamboo: "#d8b576", bambooLight: "#e6ce91",
    waterSparkle: "#d4fff0", roomGreen: "#356c48", baleteRoot: "#264f3d"
  };
  var TRAFFIC = [
    { style: "sedan", color: "#8aa3c8" }, { style: "gt", color: "#c9c2b0" }, { style: "suv", color: "#5e6b5a" },
    { style: "bubble", color: "#d98c6a" }, { style: "fastback", color: "#7d6aa8" }, { style: "sedan", color: "#e8e4dc" },
    { style: "gt", color: "#4d7f8c" }, { style: "suv", color: "#a34a4a" }
  ];
  var TRAFFIC_V = 0.4; // one shared traffic speed so cars never catch up and stack in a lane
  var MIN_SPEED = 50;
  var D = null;
  var LANDMARK_TYPES = ["balete", "church", "waterfall", "bangka"];
  function maxSpeed() { return 150 + D.car.stats.speed * 12; }

  function laneX(i) { return ROAD_X + LANE_W * i + LANE_W / 2; }

  G.drivePicker = function () {
    var cars = G.save.garage.map(G.car).filter(Boolean);
    if (!cars.length) { G.toast("Collect a car first!"); return; }
    var cur = G.save.current && G.owned(G.save.current) ? G.save.current : cars[0].id;
    var html =
      '<p class="kicker">Garage</p><h2>Pick a car to test drive</h2>' +
      '<div class="garage" role="radiogroup" aria-label="Your cars">' + cars.map(function (c) {
        return '<button class="garage-car" role="radio" aria-checked="' + (c.id === cur) + '" data-id="' + c.id + '">' +
          '<canvas aria-hidden="true" data-thumb="' + c.id + '"></canvas><span class="bk-name">' + G.esc(c.maker + " " + c.name) + "</span>" +
          '<span class="stats"><span>Speed ' + bar(c.stats.speed) + '</span><span>Handling ' + bar(c.stats.handling) + "</span></span></button>";
      }).join("") + "</div>" +
      '<p class="fine">Speed and handling are game stats, just for fun.</p>' +
      '<div class="row"><button class="btn primary" id="drive-go">Start driving</button><button class="btn" data-close>Not now</button></div>' +
      '<p class="fine">Controls: ← → or A D to change lanes, ↑ ↓ or W S for speed. P to pause.</p>';
    var p = G.openPanel(html, { label: "Pick a car to drive", wide: true });
    p.querySelectorAll("[data-thumb]").forEach(function (cv) { G.paintInto(cv, G.side(G.car(cv.dataset.thumb)), 2); });
    p.querySelectorAll(".garage-car").forEach(function (b) {
      b.addEventListener("click", function () {
        cur = b.dataset.id;
        p.querySelectorAll(".garage-car").forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); });
        G.play("select");
      });
    });
    p.querySelector("#drive-go").addEventListener("click", function () {
      G.save.current = cur; G.saveNow(); G.closePanel(); G.go("drive", cur);
    });
    G.play("open");
  };
  function bar(n) { return '<span class="bar" aria-label="' + n + ' out of 5">' + "■".repeat(n) + '<span class="off">' + "■".repeat(5 - n) + "</span></span>"; }

  function spawnRow() {
    // keep a clear path: the open lane moves at most one lane between rows
    var free = D.free == null ? Math.floor(Math.random() * LANES) : G.clamp(D.free + Math.floor(Math.random() * 3) - 1, 0, LANES - 1);
    D.free = free;
    for (var i = 0; i < LANES; i++) {
      if (i === free) continue;
      var roll = Math.random();
      if (roll < 0.45) D.things.push({ kind: "car", lane: i, y: -40, look: TRAFFIC[Math.floor(Math.random() * TRAFFIC.length)], v: TRAFFIC_V });
    }
    // coins in the free lane
    if (Math.random() < 0.8) for (var k = 0; k < 4; k++) D.things.push({ kind: "coin", lane: free, y: -20 - k * 16 });
    if (D.nextFact <= 0) { D.things.push({ kind: "fact", lane: free, y: -90 }); D.nextFact = 10 + Math.random() * 6; }
  }

  function showFact() {
    var car = D.car, i = (G.save.factAt[car.id] || 0) % car.facts.length;
    G.save.factAt[car.id] = i + 1; G.saveNow();
    G.toast(car.maker + " " + car.name + ": " + car.facts[i], 5200);
    G.play("fact");
  }

  function end() {
    ENGINE.stop();
    D.over = true;
    var meters = Math.floor(D.dist / 4);
    var newBest = meters > G.save.best;
    if (newBest) G.save.best = meters;
    G.save.coins += D.coins; G.saveNow();
    var html =
      '<p class="kicker">Test drive over</p><h2>' + G.esc(D.car.maker + " " + D.car.name) + "</h2>" +
      '<dl class="meta"><div><dt>Distance</dt><dd>' + meters.toLocaleString() + " m</dd></div><div><dt>Coins</dt><dd>" + D.coins +
      "</dd></div><div><dt>Best</dt><dd>" + G.save.best.toLocaleString() + " m</dd></div></dl>" +
      (newBest ? '<p class="owned">New best distance!</p>' : "") +
      '<div class="row"><button class="btn primary" id="again" autofocus>Drive again</button><button class="btn" id="back">Back to the museum</button></div>';
    var p = G.openPanel(html, { label: "Test drive results", onClose: function () { if (G.sceneName === "drive" && D.over) G.go("gallery", "garage"); } });
    p.querySelector("#again").addEventListener("click", function () { var id = D.car.id; D.over = false; G.closePanel(); G.go("drive", id); });
    p.querySelector("#back").addEventListener("click", function () { G.closePanel(); });
  }

  function pause() {
    if (!D || D.over || G.overlayOpen) return;
    ENGINE.stop();
    var html = '<p class="kicker">Paused</p><h2>Taking a breather</h2>' +
      '<div class="row"><button class="btn primary" data-close autofocus>Keep driving</button><button class="btn" id="quit">Back to the museum</button></div>';
    var p = G.openPanel(html, {
      label: "Paused",
      onClose: function () {
        if (G.sceneName === "drive" && D && !D.over && D.engineStarted) {
          ENGINE.start(D.car);
          ENGINE.setSpeed(driveSpeed());
        }
      }
    });
    p.querySelector("#quit").addEventListener("click", function () { D.over = true; G.closePanel(); G.go("gallery", "garage"); });
  }
  function driveSpeed() {
    if (!D) return 0;
    return G.clamp(D.speed / maxSpeed(), 0, 1);
  }

  // ---------- drawing ----------
  // palm tree seen from above: 8 fronds fanning out from the trunk, each with a dark edge
  var DIRS = [[1, 0, 7], [-1, 0, 7], [0, 1, 6], [0, -1, 6], [1, 1, 5], [-1, -1, 5], [1, -1, 5], [-1, 1, 5]];
  function palm(ctx, x, y) {
    DIRS.forEach(function (d) {
      for (var i = 1; i <= d[2]; i++) {
        var droop = (d[1] === 0 && i > 4) ? 1 : 0;
        var fx = x + d[0] * i, fy = y + d[1] * i + droop;
        ctx.fillStyle = PALETTE.grassDark; ctx.fillRect(fx, fy + 1, 2, 1);
        ctx.fillStyle = i > d[2] - 2 ? PALETTE.leafLight : PALETTE.palmLeaf;
        ctx.fillRect(fx, fy, 2, 1);
      }
    });
    ctx.fillStyle = PALETTE.palmTrunk; ctx.fillRect(x - 1, y - 1, 3, 3);
    ctx.fillStyle = PALETTE.palmHighlight; ctx.fillRect(x - 1, y - 1, 1, 1);
  }
  function bush(ctx, x, y, c) {
    ctx.fillStyle = PALETTE.grassDark; ctx.fillRect(x - 3, y - 1, 7, 4); ctx.fillRect(x - 2, y - 2, 5, 6);
    ctx.fillStyle = PALETTE.leafLight; ctx.fillRect(x - 2, y - 1, 3, 2); ctx.fillStyle = PALETTE.grassLight; ctx.fillRect(x - 1, y - 1, 1, 1);
    if (c) { ctx.fillStyle = c; ctx.fillRect(x + 1, y, 2, 2); ctx.fillRect(x - 2, y + 2, 2, 2); }
  }

  function bananaPlant(ctx, x, y) {
    ctx.fillStyle = PALETTE.palmTrunk; ctx.fillRect(x - 1, y - 1, 3, 3);
    [[-7, -4, -1], [-6, -7, -1], [-2, -8, -1], [2, -8, 1], [6, -6, 1], [7, -3, 1]].forEach(function (leaf) {
      ctx.fillStyle = PALETTE.grassDark;
      ctx.fillRect(x + leaf[0], y + leaf[1] + 1, 7, 2);
      ctx.fillStyle = PALETTE.bananaLeaf;
      ctx.fillRect(x + leaf[0], y + leaf[1], 7, 2);
      ctx.fillStyle = PALETTE.bananaLight;
      ctx.fillRect(x + leaf[0] + (leaf[2] < 0 ? 1 : 4), y + leaf[1], 2, 1);
    });
  }

  function nipaHut(ctx, x, y) {
    ctx.fillStyle = PALETTE.nipaShadow; ctx.fillRect(x - 8, y - 1, 17, 8);
    ctx.fillStyle = PALETTE.nipaRoof;
    ctx.fillRect(x - 9, y - 5, 19, 5); ctx.fillRect(x - 7, y - 7, 15, 2);
    ctx.fillStyle = PALETTE.nipaHighlight;
    ctx.fillRect(x - 6, y - 6, 5, 2); ctx.fillRect(x + 2, y - 6, 5, 2);
    ctx.fillStyle = PALETTE.nipaShadow; ctx.fillRect(x, y - 7, 2, 13);
    ctx.fillStyle = PALETTE.nipaWall; ctx.fillRect(x - 5, y + 1, 3, 5); ctx.fillRect(x + 3, y + 1, 3, 5);
  }

  function baleteTree(ctx, x, y) {
    ctx.fillStyle = PALETTE.grassDark;
    [[-10, -5, 8], [-7, -10, 10], [0, -11, 10], [7, -8, 9], [9, -2, 7],
      [3, 2, 10], [-7, 1, 10], [-12, -1, 7], [-3, -6, 12]].forEach(function (leaf) {
      ctx.fillRect(x + leaf[0], y + leaf[1], leaf[2], 7);
    });
    ctx.fillStyle = PALETTE.baleteRoot;
    [[-13, -4], [-12, 4], [-9, 9], [-3, 11], [4, 10],
      [10, 7], [13, 1], [10, -8], [4, -12], [-4, -12]].forEach(function (root) {
      ctx.fillRect(x + root[0], y + root[1], 1, 2);
    });
    ctx.fillStyle = PALETTE.palmTrunk; ctx.fillRect(x - 2, y - 2, 4, 5);
  }

  function oldChurch(ctx, x, y) {
    ctx.fillStyle = PALETTE.coralMortar; ctx.fillRect(x - 14, y - 7, 29, 18);
    ctx.fillStyle = PALETTE.coralStone; ctx.fillRect(x - 12, y - 6, 25, 16);
    ctx.fillStyle = PALETTE.churchRoof; ctx.fillRect(x - 14, y - 8, 29, 4);
    ctx.fillRect(x - 7, y - 12, 12, 6);
    ctx.fillStyle = PALETTE.bellStone; ctx.fillRect(x - 4, y - 14, 7, 7);
    ctx.fillStyle = PALETTE.churchShadow; ctx.fillRect(x - 2, y - 11, 3, 4);
    ctx.fillStyle = PALETTE.coralMortar; ctx.fillRect(x - 3, y + 3, 6, 7);
  }

  function waterfall(ctx, x, y) {
    ctx.fillStyle = PALETTE.grassDark;
    ctx.fillRect(x - 19, y - 10, 38, 21);
    ctx.fillRect(x - 22, y - 5, 5, 13); ctx.fillRect(x + 17, y - 3, 5, 13);
    ctx.fillStyle = PALETTE.poolDeep; ctx.fillRect(x - 15, y - 7, 30, 7);
    ctx.fillStyle = PALETTE.poolLight; ctx.fillRect(x - 13, y - 6, 26, 3);
    ctx.fillStyle = PALETTE.poolDeep; ctx.fillRect(x - 11, y, 22, 6);
    ctx.fillStyle = PALETTE.poolLight; ctx.fillRect(x - 8, y + 1, 16, 2);
    ctx.fillStyle = PALETTE.foam;
    ctx.fillRect(x - 15, y - 1, 4, 1); ctx.fillRect(x + 11, y - 1, 4, 1);
    ctx.fillRect(x - 8, y + 4, 3, 1); ctx.fillRect(x + 5, y + 3, 4, 1);
  }

  function driveBangka(ctx, x, y) {
    ctx.fillStyle = PALETTE.bamboo;
    ctx.fillRect(x - 12, y - 4, 6, 1); ctx.fillRect(x + 6, y - 4, 6, 1);
    ctx.fillRect(x - 11, y - 6, 1, 3); ctx.fillRect(x + 10, y - 6, 1, 3);
    ctx.fillStyle = PALETTE.bangkaHull; ctx.fillRect(x - 8, y - 4, 16, 3);
    ctx.fillRect(x - 5, y - 6, 10, 2);
    ctx.fillStyle = PALETTE.bambooLight; ctx.fillRect(x - 3, y - 8, 6, 2);
  }

  function addLandmarks() {
    while (D.nextLandmark <= D.scroll + 260) {
      var kind = LANDMARK_TYPES[Math.floor(Math.random() * LANDMARK_TYPES.length)];
      D.landmarks.push({
        kind: kind, worldY: D.nextLandmark,
        x: kind === "bangka" ? 226 + Math.floor(Math.random() * 82) : 18 + Math.floor(Math.random() * 84)
      });
      D.nextLandmark += 420 + Math.random() * 460;
    }
    D.landmarks = D.landmarks.filter(function (landmark) {
      return D.scroll - landmark.worldY < G.H + 40;
    });
  }

  function drawLandmarks(ctx) {
    D.landmarks.forEach(function (landmark) {
      var y = Math.round(D.scroll - landmark.worldY);
      if (y < -40 || y > G.H + 30) return;
      if (landmark.kind === "balete") baleteTree(ctx, landmark.x, y);
      else if (landmark.kind === "church") oldChurch(ctx, landmark.x, y);
      else if (landmark.kind === "waterfall") waterfall(ctx, landmark.x, y);
      else driveBangka(ctx, landmark.x, y);
    });
  }

  function drawWorld(ctx) {
    var off = D.scroll;
    // roadside land
    ctx.fillStyle = PALETTE.grass; ctx.fillRect(0, 0, ROAD_X - 6, G.H);
    for (var y = -16; y < G.H + 16; y += 16) {
      var yy = Math.round(y + (off % 16));
      for (var x = 4; x < ROAD_X - 10; x += 14) {
        ctx.fillStyle = PALETTE.grassLight; ctx.fillRect(x + ((y / 16) % 2 ? 6 : 0), yy, 3, 1);
      }
    }
    for (var i = -1; i < 4; i++) {
      var py = Math.round((off % 70) + i * 70);
      palm(ctx, 26 + (i % 2) * 40, py); palm(ctx, 96, py + 30);
      bananaPlant(ctx, 78, py + 15);
      bush(ctx, 52, py + 22, PALETTE.flowerPink);
      bush(ctx, 12, py + 44, PALETTE.flowerRed);
      bush(ctx, 76, py + 50, null);
      if (i % 3 === 1) nipaHut(ctx, 57, py + 35);
    }
    // narrow red-earth shoulder
    ctx.fillStyle = PALETTE.redDirt; ctx.fillRect(ROAD_X - 6, 0, 4, G.H);
    ctx.fillStyle = PALETTE.dirtSpeckle;
    for (y = -9; y < G.H + 9; y += 13) ctx.fillRect(ROAD_X - 5, Math.round(y + off % 13), 2, 2);
    // road
    ctx.fillStyle = "#3b3746"; ctx.fillRect(ROAD_X - 2, 0, LANE_W * LANES + 4, G.H);
    ctx.fillStyle = "#423e4e"; for (y = -8; y < G.H; y += 8) ctx.fillRect(ROAD_X + 6, Math.round(y + off % 8), 1, 1);
    for (i = 1; i < LANES; i++) for (y = -20; y < G.H; y += 20) {
      ctx.fillStyle = "#f2efe6"; ctx.fillRect(ROAD_X + LANE_W * i - 1, Math.round(y + off % 20), 2, 10);
    }
    ctx.fillStyle = "#f2efe6"; ctx.fillRect(ROAD_X - 2, 0, 1, G.H); ctx.fillRect(ROAD_X + LANE_W * LANES + 1, 0, 1, G.H);
    // white beach and clear island water
    var sx = ROAD_X + LANE_W * LANES + 2;
    ctx.fillStyle = PALETTE.sand; ctx.fillRect(sx, 0, 27, G.H);
    ctx.fillStyle = PALETTE.sandShade;
    for (y = -10; y < G.H + 10; y += 10) ctx.fillRect(sx + 6 + ((y / 10) % 2) * 9, Math.round(y + off % 10), 2, 1);
    var seaX = sx + 27;
    ctx.fillStyle = PALETTE.shallowWater; ctx.fillRect(seaX, 0, 13, G.H);
    ctx.fillStyle = PALETTE.brightWater; ctx.fillRect(seaX + 13, 0, 29, G.H);
    ctx.fillStyle = PALETTE.deepSea; ctx.fillRect(seaX + 42, 0, G.W, G.H);
    for (y = -8; y < G.H + 8; y += 12) {
      ctx.fillStyle = PALETTE.shallowWater;
      ctx.fillRect(seaX + 12, Math.round(y + off % 12), 1, 6);
      ctx.fillStyle = PALETTE.deepSea;
      ctx.fillRect(seaX + 41, Math.round(y + off % 12) + 1, 1, 5);
    }
    // shallow reef patches
    for (i = -1; i < 5; i++) {
      var reefY = Math.round((off % 54) + i * 54);
      var reefX = seaX + 20 + (i % 2) * 14;
      ctx.fillStyle = PALETTE.reef;
      ctx.fillRect(reefX, reefY, 8, 3); ctx.fillRect(reefX + 2, reefY - 1, 7, 5);
      ctx.fillStyle = PALETTE.reefLight; ctx.fillRect(reefX + 1, reefY, 5, 2);
    }
    // shoreline foam and waves
    for (y = -12; y < G.H + 12; y += 12) {
      var wy = Math.round(y + (off * 0.5) % 12), wob = G.reduceMotion ? 0 : Math.round(Math.sin(G.t * 2 + y) * 2);
      ctx.fillStyle = PALETTE.foam; ctx.fillRect(seaX + wob, wy, 3, 1);
      ctx.fillStyle = PALETTE.waterSparkle;
      ctx.fillRect(seaX + 25 - wob, wy + 5, 4, 1);
      ctx.fillRect(seaX + 65 + wob, wy + 2, 5, 1);
    }
    ctx.fillStyle = PALETTE.foam; ctx.fillRect(seaX, 0, 1, G.H);
    drawLandmarks(ctx);
  }

  function drawThing(ctx, t) {
    var x = Math.round(laneX(t.lane)), y = Math.round(t.y);
    if (t.kind === "car") {
      var spr = G.top(t.look);
      ctx.save(); ctx.translate(x, y); ctx.scale(1, -1); // traffic faces down
      ctx.drawImage(G.shadow(spr), -spr.width / 2 + 2, -spr.height / 2 - 2);
      ctx.drawImage(spr, -spr.width / 2, -spr.height / 2); ctx.restore();
    } else if (t.kind === "coin") {
      G.coinIcon(ctx, x - 2, y - 3, [0, 0, 1, 2, 1, 0][Math.floor(G.t * 9 + t.y / 16) % 6]);
    } else if (t.kind === "fact") {
      var b = G.reduceMotion ? 0 : Math.round(Math.sin(G.t * 5) * 1);
      ctx.fillStyle = "#1d1424";
      for (var r = -6; r <= 6; r++) { var w = 6 - Math.abs(r); ctx.fillRect(x - w - 1, y + r + b, w * 2 + 3, 1); }
      for (r = -5; r <= 5; r++) { w = 5 - Math.abs(r); ctx.fillStyle = r < 0 ? "#ffb6d5" : "#ff7eb6"; ctx.fillRect(x - w, y + r + b, w * 2 + 1, 1); }
      PX.drawText(ctx, "?", x - 2, y - 3 + b, "#ffffff");
    }
  }

  function drawHUD(ctx) {
    ctx.fillStyle = "rgba(26,20,36,0.85)"; ctx.fillRect(0, 0, ROAD_X - 8, 26);
    for (var i = 0; i < 3; i++) G.heart(ctx, 4 + i * 9, 4, i < D.hearts);
    G.coinIcon(ctx, 4, 15, 0); PX.drawText(ctx, String(D.coins), 12, 15, "#ffd25e");
    PX.drawText(ctx, Math.floor(D.dist / 4) + " M", ROAD_X - 12, 15, "#ffffff", { align: "right" });
    PX.drawText(ctx, Math.round(D.speed) + " KPH", 4, 28, "#ffffff", { shadow: "#1d1424" });
    PX.drawText(ctx, "BEST " + G.save.best, ROAD_X - 12, 4, "#d9cfe6", { align: "right" });
    if (D.countdown > 0) {
      var n = Math.ceil(D.countdown), label = D.countdown > 0.25 ? String(n) : "GO!";
      PX.drawText(ctx, label, ROAD_X + LANE_W * 1.5, 60, "#ffffff", { scale: 4, align: "center", shadow: "#1d1424" });
    }
  }

  G.scenes.drive = {
    enter: function (id) {
      var car = G.car(id) || G.car(G.save.garage[0]);
      D = {
        car: car, lane: 1, x: laneX(1), scroll: 0, dist: 0, coins: 0, hearts: 3, hurt: 0, shake: 0,
        speed: 70 + car.stats.speed * 8, things: [], landmarks: [], nextLandmark: 180 + Math.random() * 220,
        rowT: 60, nextFact: 4, countdown: 2.2, over: false, engineStarted: false
      };
      G.toast("Test driving the " + car.maker + " " + car.name + ". Grab the pink ? cards to learn facts!");
      document.getElementById("game").focus();
    },
    exit: function () { ENGINE.stop(); if (D) D.over = true; },
    key: function (k) {
      if (!D || D.over) return;
      if (k === "ArrowLeft" || k === "KeyA") { if (D.lane > 0) { D.lane--; G.play("select"); } }
      else if (k === "ArrowRight" || k === "KeyD") { if (D.lane < LANES - 1) { D.lane++; G.play("select"); } }
      else if (k === "KeyP" || k === "Escape") pause();
    },
    tapLane: function (dir) { this.key(dir < 0 ? "ArrowLeft" : "ArrowRight"); },
    pause: pause,
    paused: function () { return G.overlayOpen; },
    update: function (dt) {
      if (!D || D.over || G.overlayOpen) return;
      var tx = laneX(D.lane), turn = 60 + D.car.stats.handling * 30;
      D.x += G.clamp(tx - D.x, -turn * dt, turn * dt);
      if (D.countdown > 0) {
        D.countdown -= dt; D.scroll += 20 * dt;
        addLandmarks();
        if (D.countdown <= 0 && !D.engineStarted) { D.engineStarted = true; ENGINE.start(D.car); }
        return;
      }
      var up = G.keys.ArrowUp || G.keys.KeyW, down = G.keys.ArrowDown || G.keys.KeyS;
      if (up) D.speed += 60 * dt; else if (down) D.speed -= 80 * dt;
      D.speed = G.clamp(D.speed, MIN_SPEED, maxSpeed());
      ENGINE.setSpeed(driveSpeed());
      var v = D.speed;
      D.scroll += v * dt; D.dist += v * dt;
      addLandmarks();
      D.rowT -= v * dt; D.nextFact -= dt;
      if (D.rowT <= 0) { spawnRow(); D.rowT = Math.max(180, 300 - D.dist / 80); }
      D.hurt = Math.max(0, D.hurt - dt); D.shake = Math.max(0, D.shake - dt);
      var px = D.x, py = PLAYER_Y + 18;
      D.things = D.things.filter(function (t) {
        t.y += v * dt * (t.kind === "car" ? t.v : 1);
        var dx = Math.abs(laneX(t.lane) - px), dy = Math.abs(t.y - py);
        if (t.kind === "car" && dx < 15 && dy < 32 && D.hurt <= 0) {
          D.hearts--; D.hurt = 1.4; D.shake = 0.3; G.play("crash");
          if (D.hearts <= 0) { ENGINE.stop(); setTimeout(end, 500); D.over = true; }
          return false;
        }
        if (t.kind === "coin" && dx < 12 && dy < 18) { D.coins++; G.play("coin"); return false; }
        if (t.kind === "fact" && dx < 14 && dy < 22) { D.coins += 5; showFact(); return false; }
        return t.y < G.H + 50;
      });
    },
    draw: function (ctx) {
      if (!D) return;
      ctx.save();
      if (D.shake > 0 && !G.reduceMotion) ctx.translate(Math.round((Math.random() - 0.5) * 4), 0);
      drawWorld(ctx);
      D.things.forEach(function (t) { drawThing(ctx, t); });
      var spr = G.top(D.car), tilt = Math.round(G.clamp(laneX(D.lane) - D.x, -1, 1));
      if (!(D.hurt > 0 && Math.floor(G.t * 12) % 2)) {
        var x = Math.round(D.x - spr.width / 2) + tilt, y = PLAYER_Y;
        ctx.drawImage(G.shadow(spr), x + 2, y + 2);
        ctx.drawImage(spr, x, y);
        if (!G.reduceMotion && D.countdown <= 0) { ctx.fillStyle = "rgba(220,220,230,0.5)"; ctx.fillRect(x + 6, y + spr.height + (Math.floor(G.t * 20) % 3), 2, 1); }
      }
      ctx.restore();
      drawHUD(ctx);
    }
  };
})();
