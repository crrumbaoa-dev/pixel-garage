/* The museum: walk through three halls, look at each car, and pass its quiz to collect it. */
(function () {
  "use strict";

  var PALETTE = {
    sand: "#e9d8ae", sandLight: "#f5e8c8", shallowWater: "#62cdbf", deepSea: "#247b98",
    islandGreen: "#3d7650", bamboo: "#c8a66d", bambooLight: "#e0c58e", nipaRoof: "#9b7948",
    coralStone: "#c4b99e", coralMortar: "#887f6e", capiz: "#fff8e6", rattan: "#9b7952",
    wood: "#9b6d48", woodLight: "#c59764", woodSeam: "#674832", abaca: "#c9a36c",
    banigPink: "#dc7799", banigTeal: "#4b9d91", banigYellow: "#e5bf61", banigPurple: "#80628e",
    sunsetPink: "#e7869a", sunsetOrange: "#f4b17b", glassFrame: "#333642",
    nipaDoor: "#39a9a0", palmLeaf: "#39784e", palmTrunk: "#855536", shell: "#fff5db",
    lobbyWall: "#dfcda8", plasterPattern: "#d6c39c", lobbyWains: "#876b4d", plasterInk: "#3a3027",
    lobbySignEdge: "#b9a47b",
    stoneWains: "#88765c", stoneTrim: "#d6bd82", stoneInk: "#3d3428",
    bambooPattern: "#9d8154", bambooWains: "#55412f", bambooTrim: "#d3b77b", bambooInk: "#3b3024",
    modernWall: "#372f40", modernWains: "#352d31", neonPink: "#ff8fc0", neonGlow: "rgba(255,143,192,0.25)",
    modernFloorA: "#614531", modernFloorB: "#503927", modernInk: "#ffe6f2",
    garageWall: "#d9d0b8", garagePattern: "#8e918e", garageInk: "#2a3633",
    goldenSkyA: "#f3d9a1", goldenSkyB: "#f7e9bc", classicSkyA: "#8dd8d0", classicSkyB: "#b8e4d1",
    lobbySkyA: "#e6c997", lobbySkyB: "#f4dbab", goldenSeaA: "#397e91", goldenSeaB: "#3da8a8",
    goldenSeaC: "#87c9b4", classicSeaA: "#287b98", classicSeaB: "#32a6b0", classicSeaC: "#6dcbb7",
    modernSeaA: "#5d6f91", modernSeaB: "#3f8e9b", modernSeaC: "#6eb4ab",
    lobbySeaA: "#387d91", lobbySeaB: "#49a8a5", lobbySeaC: "#80cbb2",
    bambooFrameShadow: "#66523c", bambooDivider: "#876b48", rattanShadow: "#795e40",
    capizGlow: "rgba(255,248,230,0.42)", modernGlassTint: "rgba(231,134,154,0.12)",
    classicWeaveLight: "#af9566", classicWeaveDark: "#8a7049", classicVerticalLight: "#d5b77b",
    classicBeam: "#493a2e", classicThatchShadow: "#765d3d", palmShadow: "rgba(43,38,33,0.035)",
    plaqueInk: "#2a2131", abacaPost: "#765238", roofMetal: "#74797b",
    roofMetalLight: "#c2c2b5", roofMetalMid: "#9da3a0", doorRidge: "#25857f",
    doorHighlight: "rgba(220,255,234,0.18)", lobbyGreeting: "#a0789e", shellShelf: "#9b6d48",
    welcomeInk: "#3a2440", neonOff: "#6b3a55", darkBacking: "#302a2b",
    lobbyPalmLight: "#6a9c5e", potShadow: "#744b37", potClay: "#b36f4a",
    potLight: "#d08c5f", potRim: "#804c35", doorFrame: "#254d4d",
    garageDoorRidge: "#25857f", garageDoorTrim: "#dbbf7c"
  };
  var THEMES = {
    lobby: { wall: PALETTE.lobbyWall, pattern: PALETTE.plasterPattern, wains: PALETTE.lobbyWains, trim: PALETTE.bambooLight, floorA: PALETTE.woodLight, floorB: PALETTE.wood, ink: PALETTE.plasterInk },
    golden: { wall: PALETTE.coralStone, pattern: PALETTE.coralMortar, wains: PALETTE.stoneWains, trim: PALETTE.stoneTrim, floorA: PALETTE.woodLight, floorB: PALETTE.wood, ink: PALETTE.stoneInk },
    classic: { wall: PALETTE.bamboo, pattern: PALETTE.bambooPattern, wains: PALETTE.bambooWains, trim: PALETTE.bambooTrim, floorA: PALETTE.woodLight, floorB: PALETTE.wood, ink: PALETTE.bambooInk },
    modern: { wall: PALETTE.modernWall, pattern: PALETTE.glassFrame, wains: PALETTE.modernWains, trim: PALETTE.neonPink, floorA: PALETTE.modernFloorA, floorB: PALETTE.modernFloorB, ink: PALETTE.modernInk },
    garage: { wall: PALETTE.garageWall, pattern: PALETTE.garagePattern, wains: PALETTE.nipaDoor, trim: PALETTE.bambooLight, floorA: PALETTE.woodLight, floorB: PALETTE.wood, ink: PALETTE.garageInk }
  };
  var FLOOR = 130, FEET = 162;

  // ---------- build the museum layout ----------
  var sections = [], spots = [], worldW = 0;
  (function layout() {
    var x = 0;
    sections.push({ theme: "lobby", x0: 0, x1: 230, title: "Lobby" });
    x = 230;
    G.ERAS.forEach(function (era) {
      var start = x;
      spots.push({ kind: "sign", era: era, x: x + 60 });
      x += 130;
      G.CARS.filter(function (c) { return c.era === era.id; }).forEach(function (car) {
        spots.push({ kind: "car", car: car, x: x + 62, shine: Math.random() * 5 });
        x += 124;
      });
      x += 10;
      sections.push({ theme: era.id, x0: start, x1: x, title: era.title });
    });
    sections.push({ theme: "garage", x0: x, x1: x + 240, title: "Garage" });
    spots.push({ kind: "garage", x: x + 130 });
    worldW = x + 240;
  })();

  var S = { x: 120, cam: 0, dir: 1, walkT: 0, frame: 0, blinkT: 2, near: null, confetti: [] };

  function sectionAt(x) { return sections.find(function (s) { return x >= s.x0 && x < s.x1; }) || sections[0]; }

  // ---------- panels ----------
  function carPanel(car) {
    var owned = G.owned(car.id), era = G.eraOf(car);
    var html =
      '<p class="kicker">' + G.esc(era.title) + " · " + G.esc(car.country) + "</p>" +
      '<h2 id="card-title">' + G.esc(G.fullName(car)) + "</h2>" +
      '<p class="tagline">' + G.esc(car.tagline) + "</p>" +
      '<div class="car-stage"><canvas class="big-car" aria-hidden="true"></canvas></div>' +
      '<div class="row"><button class="btn small" id="hear-engine">▶ Hear the engine</button><span>Engine: ' + G.esc(car.engine) + "</span></div>" +
      '<dl class="meta"><div><dt>Maker</dt><dd>' + G.esc(car.maker) + "</dd></div><div><dt>Year</dt><dd>" + car.year +
      "</dd></div><div><dt>Style</dt><dd>" + G.esc(G.STYLE_NAMES[car.style]) + "</dd></div></dl>" +
      '<h3>Did you know?</h3><ul class="facts">' + car.facts.map(function (f) { return "<li>" + G.esc(f) + "</li>"; }).join("") + "</ul>" +
      '<div class="row">' +
      (owned ? '<p class="owned">★ In your garage</p>' : '<button class="btn primary" id="quiz-go" autofocus>Take the quiz to collect it</button>') +
      '<button class="btn" data-close>Back to the hall</button></div>';
    var p = G.openPanel(html, { label: G.fullName(car), wide: true });
    G.paintInto(p.querySelector(".big-car"), G.side(car), 4);
    p.querySelector("#hear-engine").addEventListener("click", function () { ENGINE.rev(car); });
    var go = p.querySelector("#quiz-go");
    if (go) go.addEventListener("click", function () { quizPanel(car, 0); });
    G.play("open");
  }

  function quizPanel(car, qi) {
    var q = car.quiz[qi];
    var html =
      '<p class="kicker">Quiz · question ' + (qi + 1) + " of " + car.quiz.length + "</p>" +
      '<h2 id="quiz-q">' + G.esc(q.q) + "</h2>" +
      '<div class="answers" role="group" aria-labelledby="quiz-q">' +
      q.options.map(function (o, i) { return '<button class="btn answer" data-i="' + i + '">' + G.esc(o) + "</button>"; }).join("") +
      '</div><p class="feedback" aria-live="polite"></p>' +
      '<div class="row"><button class="btn small" id="quiz-facts">Read the facts again</button></div>';
    var p = G.openPanel(html, { label: "Quiz about the " + car.name });
    var fb = p.querySelector(".feedback");
    p.querySelector("#quiz-facts").addEventListener("click", function () { carPanel(car); });
    p.querySelectorAll(".answer").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.dataset.i);
        if (i === q.answer) {
          b.classList.add("right"); G.play("right");
          fb.textContent = "Correct!";
          p.querySelectorAll(".answer").forEach(function (x) { x.disabled = true; });
          setTimeout(function () { if (qi + 1 < car.quiz.length) quizPanel(car, qi + 1); else collected(car); }, 700);
        } else {
          b.classList.add("wrong"); b.disabled = true; G.play("wrong");
          fb.textContent = "Not quite. Try another answer, or read the facts again.";
        }
      });
    });
  }

  function collected(car) {
    G.save.garage.push(car.id); G.save.coins += 10; G.saveNow();
    G.play("collect");
    setTimeout(function () { ENGINE.rev(car); }, 600);
    var html =
      '<p class="kicker">New car collected</p>' +
      '<h2>' + G.esc(G.fullName(car)) + "</h2>" +
      '<div class="car-stage glow"><canvas class="big-car" aria-hidden="true"></canvas></div>' +
      "<p>It's in your garage now, and you earned 10 coins. You can take it for a test drive at the end of the museum.</p>" +
      '<p class="count">' + G.save.garage.length + " of " + G.CARS.length + " cars collected</p>" +
      '<div class="row"><button class="btn primary" data-close autofocus>Keep exploring</button></div>';
    var p = G.openPanel(html, { label: "Car collected", onClose: function () { burst(); } });
    G.paintInto(p.querySelector(".big-car"), G.side(car), 4);
    if (G.save.garage.length === G.CARS.length) setTimeout(function () { G.toast("You collected every car in the museum. Garage master!", 5000); }, 400);
  }

  function burst() {
    if (G.reduceMotion) return;
    var cols = ["#ff8fc0", "#ffd25e", "#8fd3ff", "#ffffff", "#b9f0c9"];
    for (var i = 0; i < 70; i++) S.confetti.push({
      x: S.x - S.cam + (Math.random() - 0.5) * 60, y: 60 + Math.random() * 30,
      vx: (Math.random() - 0.5) * 90, vy: -40 - Math.random() * 80, c: cols[i % cols.length], life: 1.6 + Math.random()
    });
  }

  G.collectionPanel = function (filter) {
    filter = filter || "all";
    var list = G.CARS.filter(function (c) { return filter === "all" || c.era === filter; });
    var tabs = [{ id: "all", title: "All" }].concat(G.ERAS).map(function (e) {
      return '<button class="chip' + (e.id === filter ? " on" : "") + '" data-f="' + e.id + '" aria-pressed="' + (e.id === filter) + '">' + G.esc(e.title) + "</button>";
    }).join("");
    var html =
      '<p class="kicker">Collection book</p><h2>' + G.save.garage.length + " of " + G.CARS.length + " cars collected</h2>" +
      '<div class="chips" role="group" aria-label="Filter by era">' + tabs + "</div>" +
      '<ul class="book">' + list.map(function (c) {
        var own = G.owned(c.id);
        return '<li><button class="book-card' + (own ? " own" : "") + '" data-id="' + c.id + '">' +
          '<canvas aria-hidden="true" data-thumb="' + c.id + '"></canvas>' +
          '<span class="bk-name">' + G.esc(c.maker + " " + c.name) + '</span><span class="bk-sub">' +
          (own ? "★ " + c.year : "Find it in the " + G.esc(G.eraOf(c).title) + " hall") + "</span></button></li>";
      }).join("") + "</ul>" +
      '<div class="row"><button class="btn" data-close>Close</button></div>';
    var p = G.openPanel(html, { label: "Collection book", wide: true });
    p.querySelectorAll("[data-thumb]").forEach(function (cv) {
      var car = G.car(cv.dataset.thumb);
      G.paintInto(cv, G.owned(car.id) ? G.side(car) : G.silhouette(car), 2);
    });
    p.querySelectorAll(".chip").forEach(function (b) { b.addEventListener("click", function () { G.collectionPanel(b.dataset.f); }); });
    p.querySelectorAll(".book-card").forEach(function (b) {
      b.addEventListener("click", function () {
        var car = G.car(b.dataset.id);
        if (G.owned(car.id)) carPanel(car);
        else { G.closePanel(); G.scenes.gallery.walkTo(car.id); }
      });
    });
    G.play("open");
  };

  // ---------- interaction ----------
  function interact() {
    var n = S.near;
    if (!n) return;
    if (n.kind === "car") carPanel(n.car);
    else if (n.kind === "garage") G.drivePicker();
    else if (n.kind === "sign") G.toast(n.era.title + " (" + n.era.years + "): " + G.CARS.filter(function (c) { return c.era === n.era.id; }).length + " cars in this hall.");
  }

  // ---------- drawing ----------
  function drawSeaWindow(ctx, worldX, cam, theme) {
    var modern = theme === "modern", x = Math.round(worldX - cam);
    var width = modern ? 148 : 116, top = 23, bottom = 106;
    var viewShift = Math.round(cam * 0.7);
    var parallax = G.reduceMotion ? 0 : Math.floor(G.t * 3);
    var sky = theme === "golden" ? [PALETTE.goldenSkyA, PALETTE.goldenSkyB] :
      theme === "classic" ? [PALETTE.classicSkyA, PALETTE.classicSkyB] :
      modern ? [PALETTE.sunsetPink, PALETTE.sunsetOrange] :
      [PALETTE.lobbySkyA, PALETTE.lobbySkyB];
    ctx.fillStyle = PALETTE.bamboo;
    ctx.fillRect(x, top, width, bottom - top);
    ctx.fillStyle = PALETTE.bambooLight;
    ctx.fillRect(x + 2, top + 2, width - 4, bottom - top - 4);
    ctx.fillStyle = modern ? PALETTE.glassFrame : PALETTE.bambooFrameShadow;
    ctx.fillRect(x + 4, top + 4, width - 8, bottom - top - 8);
    var innerX = x + 6, innerY = top + 6, innerW = width - 12, horizon = top + 37;
    G.bands(ctx, innerY, horizon, sky, innerX, innerW);
    G.bands(ctx, horizon, bottom - 6,
      theme === "golden" ? [PALETTE.goldenSeaA, PALETTE.goldenSeaB, PALETTE.goldenSeaC] :
      theme === "classic" ? [PALETTE.classicSeaA, PALETTE.classicSeaB, PALETTE.classicSeaC] :
      modern ? [PALETTE.modernSeaA, PALETTE.modernSeaB, PALETTE.modernSeaC] :
      [PALETTE.lobbySeaA, PALETTE.lobbySeaB, PALETTE.lobbySeaC], innerX, innerW);

    ctx.fillStyle = PALETTE.islandGreen;
    for (var ix = innerX; ix < innerX + innerW; ix++) {
      var islandHeight = 5 + Math.round(Math.sin((ix + viewShift + parallax) / 17) * 3 + Math.sin((ix + viewShift) / 8) * 2);
      ctx.fillRect(ix, horizon - islandHeight, 1, islandHeight);
    }

    if (!modern) {
      ctx.fillStyle = PALETTE.bambooLight;
      ctx.fillRect(x + 2, top + 2, width - 4, 2);
      ctx.fillRect(x + 2, bottom - 4, width - 4, 2);
      ctx.fillRect(x + 2, top + 2, 2, bottom - top - 4);
      ctx.fillRect(x + width - 4, top + 2, 2, bottom - top - 4);
      for (var joint = x + 10; joint < x + width - 5; joint += 14) {
        ctx.fillStyle = PALETTE.bamboo;
        ctx.fillRect(joint, top + 2, 1, 4);
        ctx.fillRect(joint, bottom - 7, 1, 4);
      }
      ctx.fillStyle = PALETTE.bambooDivider;
      ctx.fillRect(x + 2, top + 42, width - 4, 2);
      ctx.fillRect(x + Math.floor(width / 2), top + 2, 2, bottom - top - 4);
      if (theme === "golden") {
        ctx.fillStyle = PALETTE.capizGlow;
        for (var py = top + 9; py < bottom - 9; py += 8) {
          for (var px = x + 8 + ((py / 8) % 2) * 4; px < x + width - 8; px += 8) {
            ctx.fillRect(px, py, 3, 3);
          }
        }
      }
    } else {
      ctx.fillStyle = PALETTE.glassFrame;
      ctx.fillRect(x + 2, top + 2, width - 4, 2);
      ctx.fillRect(x + 2, bottom - 4, width - 4, 2);
      ctx.fillRect(x + 2, top + 2, 2, bottom - top - 4);
      ctx.fillRect(x + width - 4, top + 2, 2, bottom - top - 4);
      for (var frameX = x + 26; frameX < x + width - 4; frameX += 36) ctx.fillRect(frameX, top + 3, 2, bottom - top - 6);
    }

    var boatRange = innerW + 28;
    var boatT = ((worldX + cam * 0.7 + parallax + (G.reduceMotion ? 0 : Math.floor(G.t * 5))) % boatRange + boatRange) % boatRange;
    var boatX = Math.round(innerX + boatT - 14), boatY = horizon + 16 + (G.reduceMotion ? 0 : Math.floor(Math.sin(G.t) * 1));
    ctx.fillStyle = PALETTE.bamboo;
    ctx.fillRect(boatX - 10, boatY, 20, 1);
    ctx.fillRect(boatX - 14, boatY - 2, 5, 1);
    ctx.fillRect(boatX + 9, boatY - 2, 5, 1);
    ctx.fillStyle = PALETTE.glassFrame;
    ctx.fillRect(boatX - 7, boatY - 2, 14, 2);
    ctx.fillStyle = PALETTE.bambooLight;
    ctx.fillRect(boatX - 3, boatY - 4, 6, 2);

    var sparkleT = G.reduceMotion ? 0 : Math.floor(G.t * 2);
    for (var sparkle = 0; sparkle < 3; sparkle++) {
      var sparkX = innerX + ((sparkle * 37 + innerX + viewShift + sparkleT * 2) % innerW + innerW) % innerW;
      var sparkY = horizon + 8 + (sparkle * 11) % 24;
      ctx.fillStyle = PALETTE.capiz;
      ctx.fillRect(Math.round(sparkX), sparkY, 1, 1);
    }
    if (theme === "classic") {
      ctx.fillStyle = PALETTE.nipaRoof;
      for (var fringe = x; fringe < x + width; fringe += 5) ctx.fillRect(fringe, top - 2, 4, 2);
    }
  }

  function drawSection(ctx, sec, cam) {
    var T = THEMES[sec.theme];
    var x0 = Math.max(sec.x0 - cam, 0), x1 = Math.min(sec.x1 - cam, G.W);
    if (x1 <= x0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, x1 - x0, G.H); ctx.clip();
    var ox = sec.x0 - cam, x;
    // woven ceiling
    ctx.fillStyle = PALETTE.rattan; ctx.fillRect(x0, 0, x1 - x0, 12);
    for (var ceilingX = Math.floor((x0 - ox) / 6) * 6; ceilingX < x1 - ox; ceilingX += 6) {
      ctx.fillStyle = ceilingX % 12 ? PALETTE.bambooLight : PALETTE.rattanShadow;
      ctx.fillRect(ox + ceilingX, 1, 1, 10);
      ctx.fillStyle = ceilingX % 12 ? PALETTE.rattanShadow : PALETTE.bambooLight;
      ctx.fillRect(ox + ceilingX, 5, 5, 1);
    }
    ctx.fillStyle = T.wall; ctx.fillRect(x0, 12, x1 - x0, 100);
    if (sec.theme === "golden") {
      for (var stoneY = 18, stoneRow = 0; stoneY < 112; stoneY += 14, stoneRow++) {
        ctx.fillStyle = PALETTE.coralMortar;
        ctx.fillRect(x0, stoneY, x1 - x0, 1);
        for (var stoneX = Math.floor((x0 - ox - stoneRow * 13) / 34) * 34 + stoneRow * 13; stoneX < x1 - ox; stoneX += 34) {
          ctx.fillRect(ox + stoneX, stoneY - 13, 1, 14);
        }
      }
    } else if (sec.theme === "classic") {
      for (var weaveY = 17; weaveY < 112; weaveY += 6) {
        ctx.fillStyle = weaveY % 12 ? PALETTE.classicWeaveLight : PALETTE.classicWeaveDark;
        ctx.fillRect(x0, weaveY, x1 - x0, 2);
      }
      for (var weaveX = Math.floor((x0 - ox) / 7) * 7; weaveX < x1 - ox; weaveX += 7) {
        ctx.fillStyle = weaveX % 14 ? PALETTE.classicWeaveDark : PALETTE.classicVerticalLight;
        ctx.fillRect(ox + weaveX, 17, 2, 94);
      }
      ctx.fillStyle = PALETTE.classicBeam;
      ctx.fillRect(x0, 15, x1 - x0, 3);
      for (var beamX = Math.floor((x0 - ox) / 54) * 54; beamX < x1 - ox; beamX += 54) {
        ctx.fillRect(ox + beamX, 12, 3, 100);
      }
      ctx.fillStyle = PALETTE.nipaRoof;
      for (var thatchX = Math.floor((x0 - ox) / 5) * 5; thatchX < x1 - ox; thatchX += 5) {
        ctx.fillRect(ox + thatchX, 12, 4, 4);
        ctx.fillStyle = PALETTE.classicThatchShadow; ctx.fillRect(ox + thatchX + 2, 15, 2, 3);
        ctx.fillStyle = PALETTE.nipaRoof;
      }
    } else if (sec.theme === "modern") {
      for (var panelX = Math.floor((x0 - ox) / 32) * 32; panelX < x1 - ox; panelX += 32) {
        ctx.fillStyle = PALETTE.modernGlassTint; ctx.fillRect(ox + panelX, 13, 28, 98);
        ctx.fillStyle = PALETTE.glassFrame; ctx.fillRect(ox + panelX + 28, 12, 2, 100);
      }
    } else {
      ctx.fillStyle = T.pattern;
      for (var plasterX = Math.floor((x0 - ox) / 24) * 24; plasterX < x1 - ox; plasterX += 24) {
        ctx.fillRect(ox + plasterX, 12, 1, 100);
      }
    }
    if (sec.theme === "lobby" || sec.theme === "golden" || sec.theme === "classic" || sec.theme === "modern") {
      var windowStep = sec.theme === "modern" ? 170 : 158;
      for (var windowX = Math.floor(sec.x0 / windowStep) * windowStep; windowX < sec.x1; windowX += windowStep) {
        drawSeaWindow(ctx, windowX, cam, sec.theme);
      }
      if (sec.theme !== "garage") {
        ctx.fillStyle = PALETTE.palmShadow;
        var sway = G.reduceMotion ? 0 : Math.round(Math.sin(G.t * 0.22) * 4);
        for (var shadeX = x0 + ((sway % 18 + 18) % 18); shadeX < x1; shadeX += 46) {
          ctx.fillRect(shadeX, 80, 14, 1); ctx.fillRect(shadeX + 7, 76, 1, 9);
          ctx.fillRect(shadeX + 3, 75, 1, 2); ctx.fillRect(shadeX + 12, 74, 1, 2);
        }
      }
      spots.forEach(function (spot) {
        if (spot.kind !== "car" || spot.x < sec.x0 || spot.x >= sec.x1) return;
        var plaqueWidth = Math.max(PX.textWidth(spot.car.maker), PX.textWidth(spot.car.plaque || spot.car.name)) + 16;
        ctx.fillStyle = T.wall;
        ctx.fillRect(Math.round(spot.x - cam - plaqueWidth / 2), 39, plaqueWidth, 39);
      });
    }
    if (sec.theme === "modern") { // pink neon line
      ctx.fillStyle = PALETTE.neonGlow; ctx.fillRect(x0, 31, x1 - x0, 5);
      ctx.fillStyle = PALETTE.neonPink; ctx.fillRect(x0, 33, x1 - x0, 1);
    }
    // crown molding
    ctx.fillStyle = T.trim; ctx.fillRect(x0, 12, x1 - x0, 2);
    ctx.fillStyle = PX.darken(T.trim, 0.35); ctx.fillRect(x0, 14, x1 - x0, 1);
    // wainscot panels
    ctx.fillStyle = T.wains; ctx.fillRect(x0, 112, x1 - x0, 14);
    ctx.fillStyle = PX.lighten(T.wains, 0.18); ctx.fillRect(x0, 112, x1 - x0, 1);
    for (x = Math.floor((x0 - ox) / 20) * 20; x < x1 - ox; x += 20) {
      ctx.fillStyle = PX.darken(T.wains, 0.25); ctx.fillRect(ox + x + 2, 115, 16, 1); ctx.fillRect(ox + x + 2, 115, 1, 8);
      ctx.fillStyle = PX.lighten(T.wains, 0.12); ctx.fillRect(ox + x + 2, 123, 16, 1); ctx.fillRect(ox + x + 17, 115, 1, 9);
    }
    ctx.fillStyle = PX.darken(T.wains, 0.4); ctx.fillRect(x0, 126, x1 - x0, 4);
    // polished plank floor
    for (var y = FLOOR; y < G.H; y += 10) {
      ctx.fillStyle = y % 20 ? T.floorA : T.floorB;
      ctx.fillRect(x0, y, x1 - x0, 10);
      ctx.fillStyle = PALETTE.woodSeam;
      ctx.fillRect(x0, y, x1 - x0, 1);
      for (var plankX = Math.floor((x0 - ox - ((y / 10) % 2) * 18) / 38) * 38 + ((y / 10) % 2) * 18; plankX < x1 - ox; plankX += 38) {
        ctx.fillRect(ox + plankX, y + 1, 1, 9);
      }
    }
    ctx.restore();
  }

  function drawLamp(ctx, sx, T) {
    ctx.fillStyle = "#2a2234"; ctx.fillRect(sx - 1, 12, 2, 4);
    ctx.fillStyle = T.trim; ctx.fillRect(sx - 5, 16, 10, 2);
    ctx.fillStyle = PALETTE.capiz;
    for (var lx = -3; lx <= 2; lx += 3) for (var ly = 0; ly < 2; ly++) {
      ctx.fillRect(sx + lx, 18 + ly, 2, 2);
    }
    ctx.fillStyle = "rgba(255,244,214,0.35)"; ctx.fillRect(sx - 4, 18, 8, 1);
    // light cone, two layers
    ctx.fillStyle = "rgba(255,244,214,0.07)";
    ctx.beginPath(); ctx.moveTo(sx - 4, 19); ctx.lineTo(sx + 4, 19); ctx.lineTo(sx + 48, FLOOR + 4); ctx.lineTo(sx - 48, FLOOR + 4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sx - 3, 19); ctx.lineTo(sx + 3, 19); ctx.lineTo(sx + 30, FLOOR + 4); ctx.lineTo(sx - 30, FLOOR + 4); ctx.fill();
  }

  function drawPlaque(ctx, sx, car, T) {
    var plaque = car.plaque || car.name;
    var w = Math.max(PX.textWidth(car.maker), PX.textWidth(plaque)) + 12, h = 33, x = Math.round(sx - w / 2), y = 42;
    ctx.fillStyle = PX.darken(T.trim, 0.4); ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = T.trim; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = PX.lighten(T.trim, 0.4); ctx.fillRect(x, y, w, 1);
    ctx.fillStyle = "#2a2131"; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    PX.drawText(ctx, car.maker, sx, y + 5, "#d9cfe6", { align: "center" });
    PX.drawText(ctx, plaque, sx, y + 14, "#ffffff", { align: "center" });
    PX.drawText(ctx, String(car.year), sx, y + 23, T.trim, { align: "center" });
    if (G.owned(car.id)) G.star(ctx, x + w - 4, y - 3, "#ffd25e");
  }

  var shineCanvas = null;
  function drawCar(ctx, spot, sx, T) {
    var car = spot.car, spr = G.side(car), x = Math.round(sx - spr.width / 2), y = FLOOR - 4 - spr.height + 1;
    // plinth
    ctx.fillStyle = "#1e1a28"; ctx.fillRect(sx - 44, FLOOR - 4, 88, 8);
    ctx.fillStyle = "#3a3348"; ctx.fillRect(sx - 44, FLOOR - 4, 88, 2);
    ctx.fillStyle = T.trim; ctx.fillRect(sx - 44, FLOOR - 2, 88, 1);
    // reflection on the floor
    ctx.save(); ctx.globalAlpha = 0.16; ctx.beginPath(); ctx.rect(x, FLOOR + 4, spr.width, 18); ctx.clip();
    ctx.translate(0, (FLOOR + 4) * 2 + 0); ctx.scale(1, -1); ctx.drawImage(spr, x, y + 4); ctx.restore();
    // shadow + car
    
    // a slow shine that sweeps over the paint
    var t = (G.t + spot.shine) % 5;
    if (t < 0.8 && !G.reduceMotion) {
      if (!shineCanvas) { shineCanvas = document.createElement("canvas"); }
      shineCanvas.width = spr.width; shineCanvas.height = spr.height;
      var c = shineCanvas.getContext("2d"); c.drawImage(spr, 0, 0);
      c.globalCompositeOperation = "source-atop"; c.fillStyle = "rgba(255,255,255,0.45)";
      var bx = Math.round(-20 + (t / 0.8) * (spr.width + 40));
      c.beginPath(); c.moveTo(bx, 0); c.lineTo(bx + 5, 0); c.lineTo(bx - 7, spr.height); c.lineTo(bx - 12, spr.height); c.fill();
      ctx.drawImage(shineCanvas, x, y);
    } else ctx.drawImage(spr, x, y);
    // rope posts and rope in front
    [-48, 48].forEach(function (dx) {
        ctx.fillStyle = "#765238"; ctx.fillRect(sx + dx - 1, 134, 3, 16);
        ctx.fillStyle = PALETTE.bambooLight; ctx.fillRect(sx + dx - 1, 134, 1, 16); ctx.fillRect(sx + dx - 2, 132, 5, 3); ctx.fillRect(sx + dx - 2, 149, 5, 2);
    });
      ctx.fillStyle = PALETTE.abaca;
    for (var rx = -46; rx <= 46; rx++) { var sag = Math.round(5 * (1 - Math.pow(rx / 46, 2))); ctx.fillRect(sx + rx, 135 + sag, 1, 2); }
  }

  function drawSign(ctx, spot, sx, T) {
    var era = spot.era, words = era.title.toUpperCase().split(" ");
    var w = 92, x = Math.round(sx - w / 2), y = 26, h = 70;
    ctx.fillStyle = "#2a2234"; ctx.fillRect(sx - 30, 12, 1, 14); ctx.fillRect(sx + 30, 12, 1, 14);
    ctx.fillStyle = PX.darken(T.trim, 0.45); ctx.fillRect(x - 1, y - 1, w + 2, h + 1);
    ctx.fillStyle = PALETTE.bamboo; ctx.fillRect(x, y, w, h);
    [PALETTE.banigPink, PALETTE.banigTeal, PALETTE.banigYellow, PALETTE.banigPurple].forEach(function (color, stripe) {
      ctx.fillStyle = color; ctx.fillRect(x + 2, y + 2 + stripe * 3, w - 4, 2);
      ctx.fillRect(x + 2, y + h - 10 + stripe * 2, w - 4, 1);
    });
    ctx.fillStyle = PALETTE.darkBacking; ctx.fillRect(x + 7, y + 10, w - 14, h - 19);
    ctx.fillStyle = PALETTE.bambooLight; ctx.fillRect(x + 3, y + 7, w - 6, 1);
    // notched banner bottom
    for (var i = 0; i < 8; i++) { ctx.fillStyle = PALETTE.bamboo; ctx.fillRect(x + i, y + h + i - 8, w - i * 2, 1); }
    words.forEach(function (wd, j) { PX.drawText(ctx, wd, sx, y + 12 + j * 11, "#ffffff", { align: "center", scale: 1, shadow: "#1a1022" }); });
    PX.drawText(ctx, era.years.replace(" to ", "-").replace("today", "NOW"), sx, y + 40, T.trim, { align: "center" });
  }

  function drawLobby(ctx, cam) {
    var sx = 115 - cam;
    ctx.fillStyle = PALETTE.lobbySignEdge; ctx.fillRect(sx - 56, 23, 112, 76);
    ctx.fillStyle = PALETTE.lobbyWall; ctx.fillRect(sx - 54, 25, 108, 72);
    ctx.fillStyle = PALETTE.plasterPattern; ctx.fillRect(sx - 54, 25, 108, 1);
    PX.drawText(ctx, "PIXEL", sx, 30, "#000", { scale: 2, align: "center", rowColor: metal, shadow: "#6d4a6b" });
    PX.drawText(ctx, "GARAGE", sx, 48, "#000", { scale: 2, align: "center", rowColor: metal, shadow: "#6d4a6b" });
    var name = (G.save.player && G.save.player.name) ? "WELCOME, " + G.save.player.name.toUpperCase() : "WELCOME!";
    PX.drawText(ctx, name, sx, 72, "#6d4a6b", { align: "center" });
    ctx.fillStyle = PALETTE.lobbySignEdge; ctx.fillRect(sx - 78, 82, 156, 16);
    ctx.fillStyle = PALETTE.lobbyWall; ctx.fillRect(sx - 77, 83, 154, 14);
    PX.drawText(ctx, "WALK RIGHT TO EXPLORE >", sx, 86, "#a0789e", { align: "center" });
    // a potted coconut palm by the door
    var px = 26 - cam;
    for (var trunkY = 75; trunkY < 111; trunkY++) {
      var trunkBend = Math.round((trunkY - 75) * 0.08);
      ctx.fillStyle = PALETTE.palmTrunk; ctx.fillRect(px + trunkBend, trunkY, 2, 1);
    }
    [[-16, 75, -1], [-13, 70, -1], [-9, 66, -1], [-3, 63, -1],
      [4, 63, 1], [10, 66, 1], [15, 70, 1], [18, 76, 1]].forEach(function (frond) {
      for (var leaf = 0; leaf < 12; leaf++) {
        ctx.fillStyle = leaf % 3 ? PALETTE.palmLeaf : PALETTE.lobbyPalmLight;
        ctx.fillRect(px + frond[0] + frond[2] * leaf, frond[1] + Math.floor(leaf * leaf / 28), 2, 1);
      }
    });
    ctx.fillStyle = PALETTE.potShadow; ctx.fillRect(px - 8, 110, 20, 17);
    ctx.fillStyle = PALETTE.potClay; ctx.fillRect(px - 7, 111, 18, 15); ctx.fillStyle = PALETTE.potLight; ctx.fillRect(px - 7, 111, 18, 3);
    ctx.fillStyle = PALETTE.potRim; ctx.fillRect(px + 7, 114, 3, 12);
    ctx.fillStyle = PALETTE.wood; ctx.fillRect(54 - cam, 101, 34, 2);
    ctx.fillStyle = PALETTE.shell;
    [[59, 98], [66, 96], [74, 99], [82, 97]].forEach(function (shell) {
      ctx.fillRect(shell[0] - cam, shell[1], 3, 2); ctx.fillRect(shell[0] + 1 - cam, shell[1] - 1, 1, 1);
    });
  }
  function metal(r) { return ["#fff0f7", "#ffd6e9", "#ffb0d2", "#ff8fc0", "#e9629f", "#c9497f", "#a8386a"][r]; }

  function drawGarage(ctx, spot, sx) {
    var x = sx - 60, y = 38;
    ctx.fillStyle = "#2a2638"; ctx.fillRect(x - 3, y - 3, 126, 91);
    ctx.fillStyle = PALETTE.roofMetal; ctx.fillRect(x - 2, y - 7, 124, 6);
    for (var corrugation = 0; corrugation < 124; corrugation += 5) {
      ctx.fillStyle = corrugation % 10 ? PALETTE.roofMetalMid : PALETTE.roofMetalLight;
      ctx.fillRect(x + corrugation, y - 7, 2, 5);
    }
    ctx.fillStyle = PALETTE.doorFrame; ctx.fillRect(x, y, 120, 88);
    ctx.fillStyle = PALETTE.nipaDoor; ctx.fillRect(x + 3, y + 3, 114, 82);
    for (var i = 8; i < 84; i += 8) {
      ctx.fillStyle = PALETTE.garageDoorRidge; ctx.fillRect(x + 3, y + i, 114, 1);
      ctx.fillStyle = PALETTE.doorHighlight; ctx.fillRect(x + 4, y + i + 1, 112, 1);
    }
    ctx.fillStyle = PALETTE.garageDoorTrim; ctx.fillRect(x - 2, y + 86, 124, 2);
    ctx.fillStyle = "#ffd25e"; for (i = 0; i < 120; i += 8) { ctx.fillRect(x + i, y + 84, 4, 2); }
    // neon sign
    var on = G.reduceMotion || Math.floor(G.t * 2) % 7 !== 0;
    ctx.fillStyle = "#1e1a2a"; ctx.fillRect(sx - 44, 18, 88, 15);
    PX.drawText(ctx, "TEST DRIVE", sx, 22, on ? "#ff8fc0" : "#6b3a55", { align: "center", shadow: on ? "#7a2d55" : null });
  }

  function drawPlayer(ctx, sx) {
    var spr = G.person(S.frame, S.blinkT < 0.12);
    var x = Math.round(sx - spr.width / 2), y = FEET - spr.height + 1;
    ctx.fillStyle = "rgba(20,10,30,0.3)"; ctx.fillRect(x + 3, FEET, spr.width - 6, 2); ctx.fillRect(x + 5, FEET + 2, spr.width - 10, 1);
    if (S.dir < 0) { ctx.save(); ctx.translate(x + spr.width, y); ctx.scale(-1, 1); ctx.drawImage(spr, 0, 0); ctx.restore(); }
    else ctx.drawImage(spr, x, y);
    if (S.near && !G.overlayOpen) { // prompt bubble
      var label = S.near.kind === "garage" ? "DRIVE" : S.near.kind === "sign" ? "READ" : "LOOK";
      var w = PX.textWidth(label) + 18, bx = Math.round(sx - w / 2), by = y - 16 - (Math.floor(G.t * 3) % 2 && !G.reduceMotion ? 1 : 0);
      ctx.fillStyle = "#1d1424"; ctx.fillRect(bx - 1, by - 1, w + 2, 13);
      ctx.fillStyle = "#fff8fb"; ctx.fillRect(bx, by, w, 11);
      ctx.fillStyle = "#c9497f"; ctx.fillRect(bx + 1, by + 1, 9, 9);
      ctx.fillStyle = "#ff8fc0"; ctx.fillRect(bx + 1, by + 1, 9, 8);
      PX.drawText(ctx, "E", bx + 3, by + 1, "#ffffff");
      PX.drawText(ctx, label, bx + 13, by + 2, "#3a2440");
      ctx.fillStyle = "#1d1424"; ctx.fillRect(Math.round(sx) - 1, by + 12, 3, 1); ctx.fillRect(Math.round(sx), by + 13, 1, 1);
    }
  }

  function drawHUD(ctx) {
    ctx.fillStyle = "#1a1424"; ctx.fillRect(0, 0, G.W, 12);
    for (var x = (-Math.round(S.cam) % 32 + 32) % 32; x < G.W; x += 32) { ctx.fillStyle = "#241c30"; ctx.fillRect(x, 0, 4, 12); }
    var sec = sectionAt(S.x);
    PX.drawText(ctx, sec.title, 4, 3, "#ffe6f2");
    G.coinIcon(ctx, G.W - 92, 2, 0);
    PX.drawText(ctx, String(G.save.coins), G.W - 85, 3, "#ffd25e");
    G.star(ctx, G.W - 46, 3, "#ffd25e");
    PX.drawText(ctx, G.save.garage.length + "/" + G.CARS.length, G.W - 39, 3, "#ffffff");
  }

  G.scenes.gallery = {
    enter: function (arg) {
      if (arg === "garage") S.x = spots[spots.length - 1].x - 70;
      else if (arg !== "stay") S.x = 120;
      S.cam = G.clamp(S.x - G.W / 2, 0, worldW - G.W);
      document.getElementById("game").focus();
    },
    walkTo: function (id) {
      var s = spots.find(function (p) { return p.car && p.car.id === id; });
      if (s) { S.x = s.x; S.cam = G.clamp(S.x - G.W / 2, 0, worldW - G.W); G.toast("Here's the " + s.car.maker + " " + s.car.name + ". Press E to look."); }
    },
    key: function (k) {
      if (k === "Action") interact();
      else if (k === "KeyC") G.collectionPanel();
    },
    update: function (dt) {
      var move = (G.keys.ArrowRight || G.keys.KeyD ? 1 : 0) - (G.keys.ArrowLeft || G.keys.KeyA ? 1 : 0);
      if (move) {
        S.dir = move; S.x = G.clamp(S.x + move * (G.keys.ShiftLeft || G.keys.ShiftRight ? 150 : 80) * dt, 12, worldW - 12);
        S.walkT += dt; S.frame = [1, 0, 2, 0][Math.floor(S.walkT * 8) % 4];
      } else { S.frame = 0; S.walkT = 0; }
      S.blinkT -= dt; if (S.blinkT < 0) S.blinkT = 2.5 + Math.random() * 2;
      var target = G.clamp(S.x - G.W / 2, 0, worldW - G.W);
      S.cam += (target - S.cam) * Math.min(1, dt * 6);
      var best = null, bd = 30;
      spots.forEach(function (p) { var d = Math.abs(p.x - S.x) - (p.kind === "garage" ? 36 : 0); if (d < bd) { bd = d; best = p; } });
      if (best !== S.near) {
        S.near = best;
        if (best && best.kind === "car") G.say("You're at the " + G.fullName(best.car) + (G.owned(best.car.id) ? ", already in your garage" : "") + ". Press E to look.");
        else if (best && best.kind === "garage") G.say("Garage. Press E to take a car for a test drive.");
        else if (best && best.kind === "sign") G.say(best.era.title + " hall. Press E to read the sign.");
      }
      S.confetti = S.confetti.filter(function (c) { c.life -= dt; c.vy += 140 * dt; c.x += c.vx * dt; c.y += c.vy * dt; return c.life > 0 && c.y < G.H; });
    },
    draw: function (ctx) {
      var cam = Math.round(S.cam);
      sections.forEach(function (s) { drawSection(ctx, s, cam); });
      drawLobby(ctx, cam);
      spots.forEach(function (p) {
        var sx = p.x - cam;
        if (sx < -90 || sx > G.W + 90) return;
        var T = THEMES[sectionAt(p.x).theme];
        if (p.kind === "car") { drawLamp(ctx, sx, T); drawPlaque(ctx, sx, p.car, T); drawCar(ctx, p, sx, T); }
        else if (p.kind === "sign") drawSign(ctx, p, sx, T);
        else drawGarage(ctx, p, sx);
      });
      drawPlayer(ctx, S.x - cam);
      S.confetti.forEach(function (c) { ctx.fillStyle = c.c; ctx.fillRect(Math.round(c.x), Math.round(c.y), 2, 2); });
      drawHUD(ctx);
    }
  };
})();
