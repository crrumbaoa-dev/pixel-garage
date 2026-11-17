/* Shared game stuff: save file, sprite cache, sound, keyboard, and the pop-up panels. */
(function () {
  "use strict";

  var SAVE_KEY = "pixel-concours-save-v1";
  var G = window.G = {
    W: 320, H: 180, scale: 3, t: 0,
    scenes: {}, scene: null, sceneName: "",
    keys: {}, overlayOpen: false,
    reduceMotion: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  // ---------- save ----------
  function blankSave() { return { player: null, garage: [], current: null, coins: 0, best: 0, sound: true, factAt: {} }; }
  var carIds = Object.create(null);
  PC_CARS.CARS.forEach(function (car) { carIds[car.id] = true; });
  G.load = function () {
    try {
      var s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s && typeof s === "object") {
        s = Object.assign(blankSave(), s);
        s.garage = Array.isArray(s.garage) ? s.garage.filter(function (id) { return carIds[id]; }) : [];
        if (s.current && !carIds[s.current]) s.current = null;
        return s;
      }
    } catch (e) { /* private window or blocked storage: play without saving */ }
    return blankSave();
  };
  G.saveNow = function () {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.save)); } catch (e) { /* ignore */ }
  };
  G.resetSave = function () { G.save = blankSave(); G.saveNow(); };
  G.save = G.load();

  // ---------- cars ----------
  G.CARS = PC_CARS.CARS;
  G.ERAS = PC_CARS.ERAS;
  G.car = function (id) { return G.CARS.find(function (c) { return c.id === id; }); };
  G.owned = function (id) { return G.save.garage.indexOf(id) >= 0; };
  G.STYLE_NAMES = {
    vintage: "Early open tourer", bubble: "Rounded sports coupe", gt: "Grand tourer coupe", fins: "Finned cruiser",
    longhood: "Long-hood sports car", fastback: "Fastback sports car", racer: "Mid-engine racer", wedge: "Wedge supercar",
    hyper: "Hypercar", sedan: "Limousine", suv: "Off-roader"
  };
  G.eraOf = function (car) { return G.ERAS.find(function (e) { return e.id === car.era; }); };

  // ---------- sprites (made once, then reused) ----------
  var cache = {};
  function cached(key, make) { return cache[key] || (cache[key] = make()); }
  G.side = function (car, phase) { return cached("s" + car.id + (phase || 0), function () { return PX.toCanvas(CARART.sidePixels(car, phase || 0)); }); };
  G.top = function (car) { return cached("t" + (car.id || car.style + car.color), function () { return PX.toCanvas(CARART.topPixels(car)); }); };
  G.silhouette = function (car) {
    return cached("x" + car.id, function () {
      var g = CARART.sidePixels(car).map(function (r) { return r.map(function (c) { return c ? (c === "#16111f" ? "#16111f" : "#3b3152") : null; }); });
      return PX.toCanvas(g);
    });
  };
  G.person = function (frame, blink) {
    var p = G.save.player || PEOPLE.DEFAULT;
    var key = "p" + [p.skin, p.hair, p.hairColor, p.top, p.bottom, frame || 0, blink ? 1 : 0].join("-");
    return cached(key, function () { return PX.toCanvas(PEOPLE.pixels(p, frame || 0, blink)); });
  };
  // a soft pixel shadow in the shape of a sprite
  var shadows = new Map();
  G.shadow = function (spr) {
    if (shadows.has(spr)) return shadows.get(spr);
    var c = document.createElement("canvas"); c.width = spr.width; c.height = spr.height;
    var x = c.getContext("2d"); x.drawImage(spr, 0, 0);
    x.globalCompositeOperation = "source-in"; x.fillStyle = "rgba(12,6,24,0.32)"; x.fillRect(0, 0, c.width, c.height);
    shadows.set(spr, c); return c;
  };
  G.clearPersonCache = function () { Object.keys(cache).forEach(function (k) { if (k[0] === "p") delete cache[k]; }); };
  // draws a sprite into a canvas element at a whole-number size (for the pop-up panels)
  G.paintInto = function (canvasEl, sprite, scale) {
    canvasEl.width = sprite.width * scale; canvasEl.height = sprite.height * scale;
    var c = canvasEl.getContext("2d");
    c.imageSmoothingEnabled = false;
    c.drawImage(sprite, 0, 0, canvasEl.width, canvasEl.height);
  };

  // ---------- sound (tiny synth, no files) ----------
  var audio = null;
  function ac() {
    if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audio = false; } }
    if (audio && audio.state === "suspended") audio.resume();
    return audio;
  }
  G.audio = ac;
  function tone(freq, start, dur, type, vol, slideTo) {
    var a = ac(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + start;
    o.type = type || "square"; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol || 0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol) {
    var a = ac(); if (!a) return;
    var b = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    var s = a.createBufferSource(), g = a.createGain(); g.gain.value = vol || 0.08;
    s.buffer = b; s.connect(g); g.connect(a.destination); s.start();
  }
  var SOUNDS = {
    select: function () { tone(660, 0, 0.06, "square", 0.03); },
    open: function () { tone(440, 0, 0.12, "triangle", 0.06, 880); },
    coin: function () { tone(988, 0, 0.06, "square", 0.035); tone(1319, 0.06, 0.12, "square", 0.035); },
    right: function () { [523, 659, 784].forEach(function (f, i) { tone(f, i * 0.08, 0.14, "triangle", 0.06); }); },
    wrong: function () { tone(260, 0, 0.25, "sawtooth", 0.035, 140); },
    collect: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * 0.09, 0.22, "triangle", 0.06); }); },
    fact: function () { tone(784, 0, 0.08, "triangle", 0.05); tone(1175, 0.08, 0.16, "triangle", 0.05); },
    crash: function () { noise(0.35, 0.12); tone(140, 0, 0.3, "sawtooth", 0.05, 60); }
  };
  G.play = function (name) { if (G.save.sound && SOUNDS[name]) SOUNDS[name](); };

  // ---------- screen reader messages ----------
  G.say = function (text) {
    var el = document.getElementById("live");
    if (!el || el.dataset.last === text) return;
    el.dataset.last = text; el.textContent = text;
  };

  // ---------- toast ----------
  var toastTimer = 0;
  G.toast = function (text, ms) {
    var el = document.getElementById("toast");
    el.textContent = text; el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, ms || 3200);
    G.say(text);
  };

  // ---------- pop-up panel ----------
  var lastFocus = null, onCloseFn = null;
  G.openPanel = function (html, opts) {
    opts = opts || {};
    var wrap = document.getElementById("overlay"), panel = document.getElementById("panel");
    if (!G.overlayOpen) lastFocus = document.activeElement;
    panel.className = "panel" + (opts.wide ? " wide" : "");
    panel.innerHTML = html;
    panel.setAttribute("aria-label", opts.label || "Game panel");
    wrap.hidden = false;
    G.overlayOpen = true;
    G.keys = {};
    onCloseFn = opts.onClose || null;
    panel.scrollTop = 0;
    var first = panel.querySelector("[autofocus]") || panel.querySelector("button, [href], input, select");
    (first || panel).focus();
    panel.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", G.closePanel); });
    return panel;
  };
  G.closePanel = function () {
    var wrap = document.getElementById("overlay");
    if (!G.overlayOpen) return;
    wrap.hidden = true; G.overlayOpen = false;
    var fn = onCloseFn; onCloseFn = null;
    if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus(); else document.getElementById("game").focus();
    if (fn) fn();
  };
  document.addEventListener("keydown", function (e) {
    if (!G.overlayOpen) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); G.closePanel(); return; }
    if (e.key === "Tab") { // keep focus inside the panel
      var items = Array.prototype.slice.call(document.querySelectorAll("#panel button:not([disabled]), #panel input, #panel [href]"));
      if (!items.length) return;
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });

  // ---------- the side dock (character creator, starter car) ----------
  G.dock = function (html) {
    var d = document.getElementById("dock");
    if (html == null) { d.hidden = true; d.innerHTML = ""; document.body.classList.remove("has-dock"); G.resize(); return null; }
    d.innerHTML = html; d.hidden = false; document.body.classList.add("has-dock"); G.resize();
    return d;
  };
  // buttons that sit on top of the game screen (title menu)
  G.stageUI = function (html) {
    var u = document.getElementById("stage-ui");
    if (html == null) { u.hidden = true; u.innerHTML = ""; return null; }
    u.innerHTML = html; u.hidden = false; return u;
  };

  // ---------- scenes ----------
  G.go = function (name, arg) {
    if (G.scene && G.scene.exit) G.scene.exit();
    G.stageUI(null);
    G.sceneName = name; G.scene = G.scenes[name];
    document.body.dataset.scene = name;
    if (G.scene.enter) G.scene.enter(arg);
  };

  // ---------- helpers ----------
  G.esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  G.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  G.fullName = function (car) { return car.year + " " + car.maker + " " + car.name; };
  // dithered sky / gradient bands, drawn as crisp pixel rows
  G.bands = function (ctx, y0, y1, colors, x0, w) {
    x0 = x0 || 0; w = w || G.W;
    var h = y1 - y0, n = colors.length - 1;
    for (var y = 0; y < h; y++) {
      var f = (y / h) * n, i = Math.floor(f), t = f - i;
      ctx.fillStyle = colors[Math.min(i, n)];
      ctx.fillRect(x0, y0 + y, w, 1);
      if (t > 0.5 && i < n) { // checker dither into the next color
        ctx.fillStyle = colors[i + 1];
        for (var x = (y % 2); x < w; x += 2) ctx.fillRect(x0 + x, y0 + y, 1, 1);
      }
    }
  };
  G.star = function (ctx, x, y, color) { // 5x5 star
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y, 1, 1); ctx.fillRect(x, y + 1, 5, 1); ctx.fillRect(x + 1, y + 2, 3, 1);
    ctx.fillRect(x + 1, y + 3, 1, 1); ctx.fillRect(x + 3, y + 3, 1, 1); ctx.fillRect(x, y + 4, 1, 1); ctx.fillRect(x + 4, y + 4, 1, 1);
  };
  G.coinIcon = function (ctx, x, y, frame) {
    var w = [5, 3, 1, 3][frame || 0], ox = Math.floor((5 - w) / 2);
    ctx.fillStyle = "#8a5a12"; ctx.fillRect(x + ox, y + 1, w, 5); ctx.fillRect(x + ox + (w > 1 ? 1 : 0), y, Math.max(1, w - 2), 7);
    ctx.fillStyle = "#ffd25e"; ctx.fillRect(x + ox + (w > 1 ? 1 : 0), y + 1, Math.max(1, w - 2), 5);
    if (w === 5) { ctx.fillStyle = "#fff3c0"; ctx.fillRect(x + 1, y + 2, 1, 2); }
  };
  G.heart = function (ctx, x, y, full) {
    var rows = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];
    rows.forEach(function (r, j) { for (var i = 0; i < 7; i++) if (r[i] === "1") {
      ctx.fillStyle = full ? (j === 1 && i === 1 ? "#ffd1e3" : "#ff5b8a") : "#4a3d5e"; ctx.fillRect(x + i, y + j, 1, 1);
    } });
  };
})();
