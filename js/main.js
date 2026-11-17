/* Title screen, character creator, first car, controls and the game loop. */
(function () {
  "use strict";

  var PALETTE = {
    deepPurple: "#342047", duskPurple: "#673064", magenta: "#8d3e77", coral: "#e96e72", sunsetGold: "#ffc978",
    sunsetOrange: "#f5a46f", sunBright: "#fff1b8", nightSea: "#1e4e74",
    deepSea: "#245b8a", horizonSea: "#246f95", midSea: "#23799a", shallowWater: "#55c8c0", sand: "#fff1d2",
    sandGrain: "#eadbbd", sandGlint: "#fff8e6", nightSand: "#b8aa96", islandGreen: "#315a46", farIsland: "#223f47",
    palmTrunk: "#70442e", palmBarkHighlight: "#a8764b", palmLeaf: "#24543d", palmLeafLight: "#75a85c",
    bangkaHull: "#342b32", bamboo: "#d9b778", firefly: "#d8ec70", star: "#fff4fb",
    reflectionGold: "#ffd78b", reflectionPale: "#e4d693", nightTint: "rgba(25,24,51,0.28)"
  };
  var canvas = document.getElementById("game"), ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // ---------- title ----------
  var T = { carIdx: 0, carX: -80, stars: [] };
  for (var i = 0; i < 45; i++) T.stars.push({ x: Math.floor(Math.random() * 320), y: Math.floor(Math.random() * 70), p: Math.random() * 6 });

  function drawTitlePalm(c, x, direction) {
    for (var y = 0; y < 47; y++) {
      var bend = Math.round(direction * (y * 0.18 + Math.sin(y / 13) * 2));
      c.fillStyle = PALETTE.palmTrunk;
      c.fillRect(x + bend, 112 + y, 3, 1);
      if (y % 5 === 0) {
        c.fillStyle = PALETTE.palmBarkHighlight;
        c.fillRect(x + bend + 1, 112 + y, 1, 1);
      }
    }
    var crownX = x + Math.round(direction * 10), crownY = 111;
    [[-20, -8, -1], [-17, -13, -1], [-12, -16, -1], [-6, -18, -1],
      [4, -18, 1], [10, -15, 1], [16, -11, 1], [20, -6, 1],
      [-17, -3, -1], [17, -2, 1]].forEach(function (frond) {
      var length = 13 + Math.abs(frond[0]) / 2;
      for (var n = 0; n < length; n++) {
        var droop = Math.max(0, n - length * 0.52) * 0.55;
        var fx = crownX + frond[0] + frond[2] * n * 0.72;
        var fy = crownY + frond[1] + Math.round(droop + n * n / (length * 7));
        c.fillStyle = n % 4 === 0 ? PALETTE.palmLeafLight : PALETTE.palmLeaf;
        c.fillRect(Math.round(fx), fy, 2, 1);
      }
    });
  }

  function drawBangka(c, x, y) {
    x = Math.round(x); y = Math.round(y);
    c.fillStyle = PALETTE.bangkaHull; c.fillRect(x - 9, y, 18, 2);
    c.fillRect(x - 6, y - 2, 12, 2);
    c.fillStyle = PALETTE.bamboo;
    c.fillRect(x - 14, y - 2, 5, 1); c.fillRect(x + 9, y - 2, 5, 1);
    c.fillRect(x - 13, y - 3, 1, 3); c.fillRect(x + 12, y - 3, 1, 3);
    c.fillRect(x - 5, y - 4, 10, 1);
    c.fillStyle = PALETTE.sand; c.fillRect(x - 2, y - 3, 4, 1);
  }

  function titleMenu() {
    var has = !!(G.save.player && G.save.garage.length);
    var ui = G.stageUI(
      '<div class="menu">' +
      (has ? '<button class="btn primary" id="t-continue">Continue</button><button class="btn" id="t-new">New game</button>'
           : '<button class="btn primary" id="t-new">Start</button>') +
      '<button class="btn" id="t-how">How to play</button></div>');
    var c = ui.querySelector("#t-continue");
    if (c) c.addEventListener("click", function () { G.go("gallery"); });
    ui.querySelector("#t-new").addEventListener("click", function () {
      if (has && !confirmNew()) return;
      G.go("creator");
    });
    ui.querySelector("#t-how").addEventListener("click", howTo);
    (c || ui.querySelector("#t-new")).focus();
  }
  function confirmNew() {
    // a soft check without browser pop-ups
    var b = document.getElementById("t-new");
    if (b.dataset.sure) { G.resetSave(); G.clearPersonCache(); return true; }
    b.dataset.sure = "1"; b.textContent = "Erase my save and start over?";
    return false;
  }
  function howTo() {
    G.openPanel(
      '<p class="kicker">How to play</p><h2>Welcome to Pixel Garage</h2>' +
      "<p>Pixel Garage is a museum where the most beautiful cars are displayed. You can walk through it and collect them in your garage.</p>" +
      '<ol class="steps"><li>Make your character and pick your first car.</li>' +
      "<li>Walk through three halls: the Golden Age, the Classic Era and Modern Luxury.</li>" +
      "<li>Stop at any car and press <kbd>E</kbd> to read about it.</li>" +
      "<li>Press <kbd>▶ Hear the engine</kbd> on a car card or when choosing your first car.</li>" +
      "<li>Answer its 2-question quiz to add it to your garage.</li>" +
      "<li>At the end of the museum, take your cars for a test drive on the coast road.</li></ol>" +
      '<h3>Controls</h3><ul class="keys-list"><li><kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> walk and change lanes</li><li><kbd>Shift</kbd> run</li>' +
      "<li><kbd>E</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd> look at a car</li><li><kbd>C</kbd> collection book</li>" +
      "<li><kbd>Esc</kbd> menu, <kbd>P</kbd> pause while driving</li></ul>" +
      "<p>On a phone or tablet, use the buttons under the game.</p>" +
      '<div class="row"><button class="btn primary" data-close>Got it</button></div>', { label: "How to play" });
  }

  G.scenes.title = {
    enter: function () { titleMenu(); G.say("Pixel Garage. A luxury and vintage car museum you can play."); },
    update: function (dt) {
      T.carX += dt * 55;
      if (T.carX > G.W + 40) { T.carX = -90; T.carIdx = (T.carIdx + 1) % G.CARS.length; }
    },
    draw: function (c) {
      var night = G.t % 60 > 38, motionT = G.reduceMotion ? 0 : G.t;
      G.bands(c, 0, 112, [PALETTE.deepPurple, PALETTE.duskPurple, PALETTE.magenta, PALETTE.coral, PALETTE.sunsetOrange, PALETTE.sunsetGold]);
      T.stars.forEach(function (s) { if ((G.reduceMotion || Math.floor(G.t * 2 + s.p) % 6) && s.y < 60) { c.fillStyle = PALETTE.star; c.fillRect(s.x, s.y, 1, 1); } });
      var sx = 238, sy = 105, y, x;
      if (!night) {
        for (y = -24; y <= 0; y++) {
          if (y > -12 && (y % 4 === 0 || y % 4 === -1) && y > -11) continue;
          var sunWidth = Math.round(Math.sqrt(24 * 24 - y * y));
          c.fillStyle = y < -14 ? PALETTE.sunBright : PALETTE.sunsetGold;
          c.fillRect(sx - sunWidth, sy + y, sunWidth * 2, 1);
        }
      }
      c.fillStyle = PALETTE.farIsland;
      for (x = 0; x < G.W; x++) {
        var farHeight = Math.round(4 + Math.sin(x / 21) * 4 + Math.sin(x / 8) * 2);
        c.fillRect(x, 112 - farHeight, 1, farHeight);
      }
      c.fillStyle = PALETTE.islandGreen;
      for (x = 0; x < G.W; x++) {
        var islandHeight = Math.round(7 + Math.sin(x / 29) * 6 + Math.sin(x / 12) * 2);
        c.fillRect(x, 112 - islandHeight, 1, islandHeight);
      }
      G.bands(c, 112, 140, [night ? PALETTE.nightSea : PALETTE.deepSea, PALETTE.horizonSea, PALETTE.midSea, PALETTE.shallowWater]);
      for (y = 114; y < 138; y += 3) {
        var reflectionWidth = Math.round(19 - (y - 114) / 2);
        var shimmer = Math.floor(motionT * 3);
        c.fillStyle = y < 127 ? PALETTE.reflectionGold : PALETTE.reflectionPale;
        for (var ray = 0; ray < reflectionWidth * 2 - 7; ray += 8) {
          var rayLength = Math.min(5, reflectionWidth * 2 - 7 - ray);
          c.fillRect(sx - reflectionWidth + ((y + shimmer) % 7) + ray, y, rayLength, 1);
        }
      }
      drawBangka(c, 92 + (G.reduceMotion ? 0 : Math.round(Math.sin(G.t * 0.7) * 2)), 126);
      if (night) {
        c.fillStyle = PALETTE.nightTint;
        c.fillRect(0, 0, G.W, 140);
      }
      c.fillStyle = night ? PALETTE.nightSand : PALETTE.sand;
      c.fillRect(0, 140, G.W, 40);
      for (x = 5; x < G.W; x += 17) {
        c.fillStyle = x % 2 ? PALETTE.sandGrain : PALETTE.sandGlint;
        c.fillRect(x, 165 + (x % 3), 2, 1);
      }
      // road
      c.fillStyle = "#24202e"; c.fillRect(0, 140, G.W, 22);
      c.fillStyle = "#cfc8da"; c.fillRect(0, 140, G.W, 1);
      var roadOffset = G.reduceMotion ? 0 : Math.floor(G.t * 40) % 24;
      for (x = -roadOffset; x < G.W; x += 24) { c.fillStyle = "#f2c94c"; c.fillRect(x, 151, 12, 1); }
      drawTitlePalm(c, 18, 1);
      drawTitlePalm(c, 296, -1);
      if (night) [[31, 108], [39, 121], [282, 109], [290, 123], [308, 115], [13, 124]].forEach(function (point, index) {
        if (G.reduceMotion || Math.floor(G.t * 2 + index) % 3) {
          c.fillStyle = PALETTE.firefly;
          c.fillRect(point[0], point[1], 1, 1);
        }
      });
      // a car drives by
      var car = G.CARS[T.carIdx], spr = G.side(car, Math.floor(G.t * 10) % 3);
      c.drawImage(spr, Math.round(T.carX), 152 - spr.height + 2);
      PX.drawText(c, car.year + " " + car.maker.toUpperCase() + " " + car.name.toUpperCase(), G.W / 2, 167, "#9d8fb5", { align: "center" });
      // title
      PX.drawText(c, "PIXEL GARAGE", G.W / 2, 18, "#000", { scale: 2, align: "center", shadow: "#2a1636",
        rowColor: function (r) { return ["#fff4fa", "#ffe0ee", "#ffc2dc", "#ff9cc8", "#f07aaf", "#d65b95", "#b8457e"][r]; } });
      PX.drawText(c, "A LUXURY & VINTAGE CAR MUSEUM", G.W / 2, 46, "#ffe6f2", { align: "center", shadow: "#2a1636" });
    }
  };

  // ---------- character creator ----------
  var C = { p: null, spin: 0 };
  var FIELDS = [["skin", "Skin tone"], ["hair", "Hair"], ["hairColor", "Hair color"], ["top", "Outfit"], ["bottom", "Bottoms"]];

  function creatorDock() {
    var d = G.dock(
      '<p class="kicker">Step 1 of 2</p><h2 id="cr-title">Make your character</h2>' +
      '<div class="pickers" role="group" aria-labelledby="cr-title">' + FIELDS.map(function (f) {
        return '<div class="picker"><span class="pk-label" id="lbl-' + f[0] + '">' + f[1] + "</span>" +
          '<button class="arrow" data-f="' + f[0] + '" data-d="-1" aria-label="Previous ' + f[1].toLowerCase() + '">◀</button>' +
          '<span class="pk-value" id="val-' + f[0] + '" aria-live="polite"></span>' +
          '<button class="arrow" data-f="' + f[0] + '" data-d="1" aria-label="Next ' + f[1].toLowerCase() + '">▶</button></div>';
      }).join("") + "</div>" +
      '<label class="name-field">Your name <span class="opt">(optional)</span><input id="cr-name" maxlength="12" autocomplete="off" spellcheck="false" value="' + G.esc(C.p.name || "") + '"></label>' +
      '<div class="row"><button class="btn small" id="cr-random">Surprise me</button><button class="btn primary" id="cr-next">Next: pick a car</button></div>' +
      '<div class="row"><button class="btn small ghost" id="cr-back">Back to title</button></div>');
    function refresh() {
      FIELDS.forEach(function (f) { d.querySelector("#val-" + f[0]).textContent = PEOPLE.NAMES[f[0]][C.p[f[0]]]; });
      G.save.player = C.p; G.clearPersonCache();
    }
    d.querySelectorAll(".arrow").forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.dataset.f, n = PEOPLE.OPTIONS[f].length;
        C.p[f] = (C.p[f] + Number(b.dataset.d) + n) % n; C.spin = 0.25; G.play("select"); refresh();
      });
    });
    d.querySelector("#cr-name").addEventListener("input", function (e) { C.p.name = e.target.value.replace(/[^A-Za-z0-9 .'-]/g, "").slice(0, 12); });
    d.querySelector("#cr-random").addEventListener("click", function () {
      FIELDS.forEach(function (f) { C.p[f[0]] = Math.floor(Math.random() * PEOPLE.OPTIONS[f[0]].length); });
      C.spin = 0.25; G.play("select"); refresh();
    });
    d.querySelector("#cr-next").addEventListener("click", function () { G.save.player = C.p; G.saveNow(); G.go("starter"); });
    d.querySelector("#cr-back").addEventListener("click", function () { G.go("title"); });
    refresh();
    d.querySelector(".arrow").focus();
  }

  G.scenes.creator = {
    enter: function () { C.p = Object.assign({}, PEOPLE.DEFAULT, G.save.player || {}); creatorDock(); G.say("Make your character."); },
    exit: function () { G.dock(null); },
    update: function (dt) { C.spin = Math.max(0, C.spin - dt); },
    draw: function (c) {
      // dressing room: curtains, mirror lights, a round rug
      c.fillStyle = "#3a2140"; c.fillRect(0, 0, G.W, G.H);
      for (var x = 0; x < G.W; x += 12) {
        c.fillStyle = "#9b3f6e"; c.fillRect(x, 0, 8, 128);
        c.fillStyle = "#b8548a"; c.fillRect(x + 2, 0, 3, 128);
        c.fillStyle = "#7a2f58"; c.fillRect(x + 8, 0, 4, 128);
      }
      c.fillStyle = "#f5c76a"; c.fillRect(0, 0, G.W, 4); c.fillStyle = "#8a5a2a"; c.fillRect(0, 4, G.W, 1);
      for (x = 8; x < G.W; x += 26) { var on = Math.floor(G.t * 2 + x) % 5; c.fillStyle = on ? "#fff3c4" : "#e3c58a"; c.fillRect(x, 8, 4, 4); }
      c.fillStyle = "#2a1a30"; c.fillRect(0, 128, G.W, 52);
      for (x = 0; x < G.W; x += 16) { c.fillStyle = "#33213a"; c.fillRect(x, 128 + (x / 16 % 2) * 6, 16, 6); }
      // rug + spotlight
      for (var y = -10; y <= 10; y++) {
        var w = Math.round(64 * Math.sqrt(1 - (y * y) / 100));
        c.fillStyle = Math.abs(y) > 8 ? "#d77aa8" : (Math.abs(y) > 6 ? "#ffe0ee" : "#f0a0c6");
        c.fillRect(160 - w, 150 + y, w * 2, 1);
      }
      c.fillStyle = "rgba(255,240,250,0.10)";
      c.beginPath(); c.moveTo(150, 0); c.lineTo(170, 0); c.lineTo(226, 150); c.lineTo(94, 150); c.fill();
      // big character (4x zoom)
      var bob = (C.spin > 0 || G.reduceMotion) ? 0 : (Math.floor(G.t * 2) % 2), blink = (G.t % 3.2) < 0.12;
      var spr = G.person(0, blink);
      c.drawImage(spr, 160 - spr.width * 2, 152 - spr.height * 4 + bob * 0 - (C.spin > 0 ? 4 : 0), spr.width * 4, spr.height * 4);
      var name = (C.p && C.p.name) ? C.p.name.toUpperCase() : "";
      if (name) PX.drawText(c, name, 160, 168, "#ffe6f2", { align: "center", shadow: "#1d1424" });
      // sparkles when you change something
      if (C.spin > 0) { c.fillStyle = "#ffffff"; [[110, 60], [208, 80], [120, 120], [200, 40]].forEach(function (p) { c.fillRect(p[0], p[1] - 2, 1, 5); c.fillRect(p[0] - 2, p[1], 5, 1); }); }
    }
  };

  // ---------- first car ----------
  var ST = { i: 0, slide: 0 };
  function starterDock() {
    var d = G.dock(
      '<p class="kicker">Step 2 of 2</p><h2>Choose your first car</h2><p>It goes straight into your garage. The rest you collect in the museum.</p>' +
      '<div class="starter-pick"><button class="arrow" id="st-prev" aria-label="Previous car">◀</button>' +
      '<div class="starter-info" aria-live="polite"></div><button class="arrow" id="st-next" aria-label="Next car">▶</button></div>' +
      '<div class="row"><button class="btn small" id="st-hear-engine">▶ Hear the engine</button></div>' +
      '<div class="row"><button class="btn primary" id="st-take">Take the keys</button></div>' +
      '<div class="row"><button class="btn small ghost" id="st-back">Back</button></div>');
    function show() {
      var car = G.car(PC_CARS.STARTERS[ST.i]);
      d.querySelector(".starter-info").innerHTML = '<p class="kicker">' + car.year + " · " + G.esc(car.country) + '</p><h3>' + G.esc(car.maker + " " + car.name) +
        "</h3><p>" + G.esc(car.tagline) + "</p><p>Engine: " + G.esc(car.engine) + "</p><p class=\"fine\">" + G.esc(car.facts[0]) + "</p>";
      d.querySelector("#st-hear-engine").onclick = function () { ENGINE.rev(car); };
    }
    function step(n) { ST.i = (ST.i + n + PC_CARS.STARTERS.length) % PC_CARS.STARTERS.length; ST.slide = n * 1; G.play("select"); show(); }
    d.querySelector("#st-prev").addEventListener("click", function () { step(-1); });
    d.querySelector("#st-next").addEventListener("click", function () { step(1); });
    d.querySelector("#st-back").addEventListener("click", function () { G.go("creator"); });
    d.querySelector("#st-take").addEventListener("click", function () {
      var id = PC_CARS.STARTERS[ST.i], car = G.car(id);
      if (!G.owned(id)) G.save.garage.push(id);
      G.save.current = id; G.saveNow(); G.play("collect");
      G.go("gallery");
      G.toast("The " + car.maker + " " + car.name + " is in your garage! Walk through the museum and pass quizzes to collect more cars.", 5000);
    });
    show(); d.querySelector("#st-next").focus();
  }
  G.scenes.starter = {
    enter: function () { starterDock(); G.say("Choose your first car."); },
    exit: function () { G.dock(null); },
    key: function (k) { if (k === "ArrowLeft") document.getElementById("st-prev").click(); if (k === "ArrowRight") document.getElementById("st-next").click(); },
    update: function (dt) { ST.slide *= Math.pow(0.0005, dt); if (Math.abs(ST.slide) < 0.01) ST.slide = 0; },
    draw: function (c) {
      G.bands(c, 0, 120, ["#1c1730", "#2a2244", "#3b2f5c"]);
      for (var x = 0; x < G.W; x += 40) { c.fillStyle = "#30284c"; c.fillRect(x + 18, 0, 4, 120); }
      c.fillStyle = "#151121"; c.fillRect(0, 120, G.W, 60);
      // turntable
      for (var y = -12; y <= 12; y++) {
        var w = Math.round(110 * Math.sqrt(1 - (y * y) / 144));
        c.fillStyle = Math.abs(y) > 10 ? "#ff8fc0" : (y < 0 ? "#3e3557" : "#2c2541");
        c.fillRect(160 - w, 132 + y, w * 2, 1);
      }
      c.fillStyle = "rgba(255,236,246,0.08)"; c.beginPath(); c.moveTo(140, 0); c.lineTo(180, 0); c.lineTo(270, 130); c.lineTo(50, 130); c.fill();
      PX.drawText(c, "CHOOSE YOUR FIRST CAR", 160, 12, "#ffe6f2", { align: "center", shadow: "#1d1424" });
      var car = G.car(PC_CARS.STARTERS[ST.i]), spr = G.side(car);
      var sx = Math.round(160 - spr.width + ST.slide * 60);
      c.drawImage(spr, sx, 134 - spr.height * 2, spr.width * 2, spr.height * 2);
      PX.drawText(c, car.maker.toUpperCase() + " " + car.name.toUpperCase(), 160, 156, "#ffffff", { align: "center" });
      PX.drawText(c, String(car.year), 160, 166, "#ff8fc0", { align: "center" });
      // dots
      PC_CARS.STARTERS.forEach(function (_, i) { c.fillStyle = i === ST.i ? "#ff8fc0" : "#4a3d5e"; c.fillRect(150 + i * 8, 26, 4, 4); });
    }
  };

  // ---------- menu (Esc in the museum) ----------
  G.menuPanel = function () {
    var p = G.openPanel(
      '<p class="kicker">Menu</p><h2>Paused</h2><div class="col">' +
      '<button class="btn primary" data-close autofocus>Back to the museum</button>' +
      '<button class="btn" id="m-book">Collection book</button>' +
      '<button class="btn" id="m-drive">Test drive</button>' +
      '<button class="btn" id="m-char">Change my character</button>' +
      '<button class="btn" id="m-how">How to play</button>' +
      '<button class="btn" id="m-title">Title screen</button></div>', { label: "Menu" });
    p.querySelector("#m-book").addEventListener("click", function () { G.collectionPanel(); });
    p.querySelector("#m-drive").addEventListener("click", function () { G.drivePicker(); });
    p.querySelector("#m-char").addEventListener("click", function () { G.closePanel(); G.scenes.creator.fromMenu = true; G.go("creatorEdit"); });
    p.querySelector("#m-how").addEventListener("click", howTo);
    p.querySelector("#m-title").addEventListener("click", function () { G.closePanel(); G.go("title"); });
  };
  // editing your character later goes back to the museum instead of picking a new car
  G.scenes.creatorEdit = Object.assign({}, G.scenes.creator, {
    enter: function () {
      G.scenes.creator.enter();
      var next = document.getElementById("cr-next"), back = document.getElementById("cr-back");
      next.textContent = "Done";
      next.replaceWith(next.cloneNode(true)); back.replaceWith(back.cloneNode(true));
      document.getElementById("cr-next").addEventListener("click", function () { G.saveNow(); G.go("gallery", "stay"); });
      document.getElementById("cr-back").addEventListener("click", function () { G.save.player = G.load().player; G.clearPersonCache(); G.go("gallery", "stay"); });
    }
  });

  // ---------- controls ----------
  var ACTION = { KeyE: 1, Enter: 1, Space: 1 };
  window.addEventListener("keydown", function (e) {
    if (G.overlayOpen) return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    var onButton = tag === "BUTTON" && e.target.id !== "game";
    var code = e.code;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].indexOf(code) >= 0 && !onButton) e.preventDefault();
    if (onButton && (code === "Enter" || code === "Space")) return; // let buttons work normally
    if (!e.repeat) {
      if (ACTION[code] && G.scene.key) G.scene.key("Action");
      else if (code === "Escape" && G.sceneName === "gallery") G.menuPanel();
      else if (G.scene.key) G.scene.key(code);
    }
    G.keys[code] = true;
  });
  window.addEventListener("keyup", function (e) { G.keys[e.code] = false; });
  window.addEventListener("blur", function () { ENGINE.stop(); G.keys = {}; if (G.sceneName === "drive") G.scenes.drive.pause(); });

  // on-screen buttons (hold to walk)
  document.querySelectorAll("[data-pad]").forEach(function (b) {
    var k = b.dataset.pad;
    function down(e) {
      e.preventDefault();
      if (G.overlayOpen) return;
      if (k === "Action") { if (G.scene.key) G.scene.key("Action"); return; }
      G.keys[k] = true;
      if (G.scene.key) G.scene.key(k);
    }
    function up() { G.keys[k] = false; }
    b.addEventListener("pointerdown", down);
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { b.addEventListener(ev, up); });
    b.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") down(e); });
    b.addEventListener("keyup", up);
  });
  document.getElementById("btn-book").addEventListener("click", function () { if (G.sceneName === "gallery") G.collectionPanel(); });
  document.getElementById("btn-menu").addEventListener("click", function () {
    if (G.sceneName === "gallery") G.menuPanel(); else if (G.sceneName === "drive") G.scenes.drive.pause();
  });
  var soundBtn = document.getElementById("btn-sound");
  function soundLabel() { soundBtn.setAttribute("aria-pressed", String(G.save.sound)); soundBtn.querySelector("span").textContent = G.save.sound ? "Sound on" : "Sound off"; }
  soundBtn.addEventListener("click", function () {
    G.save.sound = !G.save.sound;
    if (!G.save.sound) ENGINE.stop();
    G.saveNow(); soundLabel(); G.play("select");
  });
  soundLabel();

  // ---------- size: always a whole-number zoom so pixels stay sharp ----------
  G.resize = function () {
    var dock = document.body.classList.contains("has-dock");
    var wide = window.innerWidth >= 980;
    var availW = window.innerWidth - 24 - (dock && wide ? 360 : 0);
    var used = document.querySelector(".topbar").offsetHeight + document.querySelector(".pad").offsetHeight + 40;
    var availH = window.innerHeight - used;
    var s = Math.max(1, Math.floor(Math.min(availW / G.W, availH / G.H)));
    if (window.innerWidth < 340) s = 1;
    G.scale = s;
    canvas.style.width = G.W * s + "px"; canvas.style.height = G.H * s + "px";
    document.documentElement.style.setProperty("--s", s);
  };
  window.addEventListener("resize", G.resize);

  // ---------- loop ----------
  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    G.t += dt;
    if (G.scene) {
      if (!(G.overlayOpen && G.sceneName === "drive")) G.scene.update(dt);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      G.scene.draw(ctx);
    }
    requestAnimationFrame(frame);
  }

  G.resize();
  G.go("title");
  requestAnimationFrame(frame);
})();
