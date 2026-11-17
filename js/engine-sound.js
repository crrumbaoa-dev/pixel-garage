/* Small Web Audio engine imitations built from oscillators and generated noise. */
(function () {
  "use strict";

  var TYPES = {
    early: {
      cylinders: 6, idle: 520, max: 2800, wave: "sawtooth", filter: 720,
      resonance: [105, 3.2, 220, 2.4], pipeDelay: 0.006, feedback: 0.12,
      room: 0.07, idleWobble: 0.14, wobbleRate: 1.05, burble: 0, crackle: 0,
      starter: 0.2, volume: 0.06
    },
    flat4: {
      cylinders: 4, idle: 850, max: 6800, wave: "sawtooth", filter: 1700,
      resonance: [115, 2.4, 250, 1.8], pipeDelay: 0.005, feedback: 0.1,
      room: 0.08, idleWobble: 0.07, wobbleRate: 1.35, burble: 0, crackle: 0.045,
      starter: 0.16, volume: 0.06
    },
    flat6: {
      cylinders: 6, idle: 850, max: 7200, wave: "sawtooth", filter: 1900,
      resonance: [105, 2.8, 225, 1.7], pipeDelay: 0.005, feedback: 0.11,
      room: 0.08, idleWobble: 0.05, wobbleRate: 1.3, burble: 0, crackle: 0.055,
      starter: 0.16, volume: 0.06
    },
    inline6: {
      cylinders: 6, idle: 780, max: 6500, wave: "sawtooth", filter: 1550,
      resonance: [100, 2.5, 210, 1.8], pipeDelay: 0.006, feedback: 0.1,
      room: 0.08, idleWobble: 0.06, wobbleRate: 1.1, burble: 0, crackle: 0,
      starter: 0.16, volume: 0.06
    },
    v6: {
      cylinders: 6, idle: 850, max: 7400, wave: "sawtooth", filter: 2050,
      resonance: [115, 2.3, 245, 1.7], pipeDelay: 0.005, feedback: 0.1,
      room: 0.08, idleWobble: 0.06, wobbleRate: 1.2, burble: 0, crackle: 0.045,
      starter: 0.16, volume: 0.06
    },
    v8: {
      cylinders: 8, idle: 680, max: 6400, wave: "sawtooth", filter: 1850,
      resonance: [95, 3.4, 205, 2.5], pipeDelay: 0.006, feedback: 0.14,
      room: 0.09, idleWobble: 0.09, wobbleRate: 1.05, burble: 0.075, crackle: 0.065,
      starter: 0.18, volume: 0.06
    },
    v10: {
      cylinders: 10, idle: 950, max: 8500, wave: "sawtooth", filter: 2900,
      resonance: [125, 1.6, 290, 1.2], pipeDelay: 0.004, feedback: 0.08,
      room: 0.07, idleWobble: 0.025, wobbleRate: 1.35, burble: 0, crackle: 0.035,
      starter: 0.15, volume: 0.06
    },
    v12: {
      cylinders: 12, idle: 900, max: 8200, wave: "sawtooth", filter: 2800,
      resonance: [120, 1.5, 280, 1.1], pipeDelay: 0.004, feedback: 0.08,
      room: 0.07, idleWobble: 0.02, wobbleRate: 1.4, burble: 0, crackle: 0.03,
      starter: 0.15, volume: 0.06
    },
    w16: {
      cylinders: 16, idle: 850, max: 6800, wave: "sawtooth", filter: 3000,
      resonance: [125, 1.4, 300, 1], pipeDelay: 0.004, feedback: 0.07,
      room: 0.07, idleWobble: 0.018, wobbleRate: 1.4, burble: 0, crackle: 0.025,
      starter: 0.14, volume: 0.06
    },
    electric: {
      partials: [1, 2.03, 3.92], idle: 0, max: 0, filter: 4200,
      resonance: [180, 0.35, 520, 0.25], pipeDelay: 0.004, feedback: 0.06,
      room: 0.045, idleWobble: 0, wobbleRate: 1, burble: 0, crackle: 0,
      starter: 0, volume: 0.06, roadNoise: 0.012, highTone: 0.012
    }
  };
  var active = null;
  var SPORTY_MAKERS = ["Aston Martin", "Bugatti", "Ferrari", "Ford", "Lamborghini", "McLaren", "Porsche"];

  function makeNoise(ctx, seconds) {
    var length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    var buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function makeRoomImpulse(ctx) {
    var length = Math.floor(ctx.sampleRate * 0.14);
    var impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (var channel = 0; channel < 2; channel++) {
      var data = impulse.getChannelData(channel);
      for (var i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.8) * 0.35;
      }
    }
    return impulse;
  }

  function firingHz(spec, rpm) { return rpm / 60 * spec.cylinders / 2; }

  function setTarget(param, value, time, smooth) {
    param.setTargetAtTime(Math.max(0.0001, value), time, smooth || 0.06);
  }

  function addNode(voice, node) {
    voice.nodes.push(node);
    return node;
  }

  function trackSource(voice, source, nodes) {
    var entry = { source: source, stopped: false };
    voice.sources.push(entry);
    source.onended = function () {
      var index = voice.sources.indexOf(entry);
      if (index !== -1) voice.sources.splice(index, 1);
      nodes.forEach(function (node) { node.disconnect(); });
    };
    source.start();
    return entry;
  }

  function makeVoice(car) {
    if (!G.save.sound) return null;
    var ctx = G.audio();
    if (!ctx || !car || !car.sound) return null;

    var sound = car.sound, type = sound.type, electric = type === "electric", spec = TYPES[type];
    if (!spec) return null;

    var now = ctx.currentTime, quiet = sound.quiet ? 0.5 : 1;
    var engineInput = ctx.createGain();
    var voice = {
      ctx: ctx, car: car, sound: sound, spec: spec, electric: electric,
      nodes: [engineInput], sources: [], oscillators: [], tones: [],
      timer: null, stopped: false, finishing: false,
      rpm: electric ? 0 : spec.idle, speed: 0, gear: 0, lastCrackleAt: -Infinity,
      engineReadyAt: now, volume: spec.volume * quiet, engineInput: engineInput
    };
    voice.output = addNode(voice, ctx.createGain());
    voice.output.gain.setValueAtTime(voice.volume, now);

    voice.engineGate = addNode(voice, ctx.createGain());
    voice.engineGate.gain.setValueAtTime(0, now);
    voice.inputGain = engineInput;
    voice.inputGain.gain.value = 0.78;
    voice.filter = addNode(voice, ctx.createBiquadFilter());
    voice.filter.type = "lowpass";
    voice.filter.frequency.value = spec.filter * (sound.quiet ? 0.72 : 1);

    voice.resonances = [
      addNode(voice, ctx.createBiquadFilter()),
      addNode(voice, ctx.createBiquadFilter())
    ];
    voice.resonances[0].type = "peaking";
    voice.resonances[0].frequency.value = spec.resonance[0];
    voice.resonances[0].Q.value = 1.2;
    voice.resonances[0].gain.value = spec.resonance[1];
    voice.resonances[1].type = "peaking";
    voice.resonances[1].frequency.value = spec.resonance[2];
    voice.resonances[1].Q.value = 1.1;
    voice.resonances[1].gain.value = spec.resonance[3];

    voice.pan = addNode(voice, ctx.createStereoPanner());
    voice.dry = addNode(voice, ctx.createGain());
    voice.dry.gain.value = 0.82;
    voice.compressor = addNode(voice, ctx.createDynamicsCompressor());
    voice.compressor.threshold.value = -32;
    voice.compressor.knee.value = 18;
    voice.compressor.ratio.value = 4;
    voice.compressor.attack.value = 0.004;
    voice.compressor.release.value = 0.16;
    voice.filter.connect(voice.resonances[0]);
    voice.resonances[0].connect(voice.resonances[1]);
    voice.resonances[1].connect(voice.pan);
    voice.pan.connect(voice.dry);
    voice.dry.connect(voice.output);
    voice.output.connect(voice.compressor);
    voice.compressor.connect(ctx.destination);

    voice.pipeDelay = addNode(voice, ctx.createDelay(0.02));
    voice.pipeDelay.delayTime.value = spec.pipeDelay;
    voice.feedback = addNode(voice, ctx.createGain());
    voice.feedback.gain.value = spec.feedback;
    voice.echo = addNode(voice, ctx.createGain());
    voice.echo.gain.value = 0.19;
    voice.pan.connect(voice.pipeDelay);
    voice.pipeDelay.connect(voice.feedback);
    voice.feedback.connect(voice.pipeDelay);
    voice.pipeDelay.connect(voice.echo);
    voice.echo.connect(voice.output);

    voice.convolver = addNode(voice, ctx.createConvolver());
    voice.convolver.buffer = makeRoomImpulse(ctx);
    voice.room = addNode(voice, ctx.createGain());
    voice.room.gain.value = spec.room;
    voice.pan.connect(voice.convolver);
    voice.convolver.connect(voice.room);
    voice.room.connect(voice.output);

    voice.engineInput.connect(voice.engineGate);
    voice.engineGate.connect(voice.filter);
    var count = electric ? spec.partials.length : 3;
    for (var i = 0; i < count; i++) {
      var oscillator = addNode(voice, ctx.createOscillator());
      var toneGain = addNode(voice, ctx.createGain());
      var tonePan = addNode(voice, ctx.createStereoPanner());
      oscillator.type = electric ? "sine" : spec.wave;
      toneGain.gain.value = electric ? [0.19, 0.055, 0.018][i] : [0.18, 0.045, 0.035][i];
      tonePan.pan.value = [-0.2, 0.2, 0][i % 3];
      oscillator.connect(toneGain);
      toneGain.connect(tonePan);
      tonePan.connect(voice.engineInput);
      voice.oscillators.push(oscillator);
      voice.tones.push(toneGain);
      trackSource(voice, oscillator, [oscillator, toneGain, tonePan]);
    }

    voice.idleLfo = null;
    if (!electric && spec.idleWobble > 0) {
      var idleLfo = addNode(voice, ctx.createOscillator());
      var idleDepth = addNode(voice, ctx.createGain());
      idleLfo.frequency.value = spec.wobbleRate;
      idleDepth.gain.value = spec.idleWobble;
      idleLfo.connect(idleDepth);
      idleDepth.connect(voice.engineInput.gain);
      trackSource(voice, idleLfo, [idleLfo, idleDepth]);
      voice.idleLfo = idleLfo;
    }

    if (!electric && spec.burble > 0) {
      var burbleLfo = addNode(voice, ctx.createOscillator());
      var burbleDepth = addNode(voice, ctx.createGain());
      burbleLfo.frequency.value = firingHz(spec, spec.idle) / 4;
      burbleDepth.gain.value = spec.burble;
      burbleLfo.connect(burbleDepth);
      burbleDepth.connect(voice.engineInput.gain);
      trackSource(voice, burbleLfo, [burbleLfo, burbleDepth]);
      voice.burbleLfo = burbleLfo;
    }

    if (electric) {
      var road = addNode(voice, ctx.createBufferSource());
      var roadFilter = addNode(voice, ctx.createBiquadFilter());
      var roadGain = addNode(voice, ctx.createGain());
      var roadPan = addNode(voice, ctx.createStereoPanner());
      road.buffer = makeNoise(ctx, 1);
      road.loop = true;
      roadFilter.type = "lowpass";
      roadFilter.frequency.value = 520;
      roadGain.gain.value = 0;
      roadPan.pan.value = 0.14;
      road.connect(roadFilter);
      roadFilter.connect(roadGain);
      roadGain.connect(roadPan);
      roadPan.connect(voice.engineInput);
      trackSource(voice, road, [road, roadFilter, roadGain, roadPan]);
      voice.roadGain = roadGain;

      var highTone = addNode(voice, ctx.createOscillator());
      var highGain = addNode(voice, ctx.createGain());
      highTone.type = "sine";
      highGain.gain.value = spec.highTone;
      highTone.connect(highGain);
      highGain.connect(voice.engineInput);
      trackSource(voice, highTone, [highTone, highGain]);
      voice.highTone = highTone;
    }

    if (!electric && sound.supercharger) {
      var whine = addNode(voice, ctx.createOscillator());
      var whineGain = addNode(voice, ctx.createGain());
      whine.type = "sine";
      whineGain.gain.value = 0.018;
      whine.connect(whineGain);
      whineGain.connect(voice.engineInput);
      trackSource(voice, whine, [whine, whineGain]);
      voice.supercharger = whine;
    }

    if (!electric && sound.turbo) {
      var turbo = addNode(voice, ctx.createBufferSource());
      var turboFilter = addNode(voice, ctx.createBiquadFilter());
      var turboGain = addNode(voice, ctx.createGain());
      var turboPan = addNode(voice, ctx.createStereoPanner());
      turbo.buffer = makeNoise(ctx, 1);
      turbo.loop = true;
      turboFilter.type = "bandpass";
      turboFilter.frequency.value = 850;
      turboFilter.Q.value = 0.8;
      turboGain.gain.value = 0.018;
      turboPan.pan.value = -0.14;
      turbo.connect(turboFilter);
      turboFilter.connect(turboGain);
      turboGain.connect(turboPan);
      turboPan.connect(voice.engineInput);
      trackSource(voice, turbo, [turbo, turboFilter, turboGain, turboPan]);
      voice.turboFilter = turboFilter;
    }

    update(voice, voice.rpm, now, 0.02);
    return voice;
  }

  function update(voice, rpm, time, smooth) {
    var spec = voice.spec, speed = voice.speed;
    if (voice.electric) {
      var pitch = 92 + speed * 780;
      voice.oscillators.forEach(function (oscillator, index) {
        setTarget(oscillator.frequency, pitch * spec.partials[index], time, smooth);
      });
      setTarget(voice.filter.frequency, spec.filter, time, smooth);
      setTarget(voice.roadGain.gain, spec.roadNoise * speed, time, smooth);
      setTarget(voice.highTone.frequency, pitch * 4.1, time, smooth);
      return;
    }

    voice.rpm = rpm;
    var hz = firingHz(spec, rpm);
    voice.oscillators.forEach(function (oscillator, index) {
      var ratio = index === 1 ? 2 : (index === 2 ? 0.5 : 1);
      var detune = voice.sound.type === "v8" && index === 1 ? 1.008 : 1;
      setTarget(oscillator.frequency, hz * ratio * detune, time, smooth);
    });
    setTarget(voice.filter.frequency, spec.filter * (voice.sound.quiet ? 0.72 : 1), time, smooth);
    if (voice.supercharger) setTarget(voice.supercharger.frequency, hz * 6, time, smooth);
    if (voice.burbleLfo) setTarget(voice.burbleLfo.frequency, hz / 4, time, smooth);
    if (voice.turboFilter) {
      var range = (rpm - spec.idle) / (spec.max - spec.idle);
      setTarget(voice.turboFilter.frequency, 850 + Math.max(0, Math.min(1, range)) * 2200, time, smooth);
    }
  }

  function startStarter(voice, now) {
    if (voice.electric || voice.spec.starter <= 0) {
      voice.engineReadyAt = now + 0.08;
      voice.engineGate.gain.setValueAtTime(0, now);
      voice.engineGate.gain.linearRampToValueAtTime(0.88, voice.engineReadyAt);
      return;
    }

    var ctx = voice.ctx;
    var starterGate = addNode(voice, ctx.createGain());
    var starterInput = addNode(voice, ctx.createGain());
    var gateLfo = addNode(voice, ctx.createOscillator());
    var gateDepth = addNode(voice, ctx.createGain());
    starterGate.gain.setValueAtTime(0, now);
    starterGate.gain.linearRampToValueAtTime(voice.spec.starter, now + 0.04);
    starterGate.gain.setValueAtTime(voice.spec.starter, now + 0.31);
    starterGate.gain.linearRampToValueAtTime(0, now + 0.5);
    starterInput.gain.value = 0.72;
    gateLfo.frequency.value = 10.5;
    gateDepth.gain.value = 0.2;
    gateLfo.connect(gateDepth);
    gateDepth.connect(starterInput.gain);
    var starterNoise = addNode(voice, ctx.createBufferSource());
    var starterBand = addNode(voice, ctx.createBiquadFilter());
    starterBand.type = "bandpass";
    starterBand.frequency.value = 680;
    starterBand.Q.value = 0.9;
    starterNoise.buffer = makeNoise(ctx, 0.5);
    starterNoise.connect(starterBand);
    starterBand.connect(starterInput);
    var starterOsc = addNode(voice, ctx.createOscillator());
    var starterOscGain = addNode(voice, ctx.createGain());
    starterOsc.type = "sawtooth";
    starterOsc.frequency.setValueAtTime(78, now);
    starterOsc.frequency.linearRampToValueAtTime(60, now + 0.5);
    starterOscGain.gain.value = 0.15;
    starterOsc.connect(starterOscGain);
    starterOscGain.connect(starterInput);
    starterInput.connect(starterGate);
    starterGate.connect(voice.filter);
    trackSource(voice, gateLfo, [gateLfo, gateDepth]);
    trackSource(voice, starterNoise, [starterNoise, starterBand]);
    trackSource(voice, starterOsc, [starterOsc, starterOscGain]);
    starterNoise.stop(now + 0.5);
    starterOsc.stop(now + 0.5);
    voice.engineReadyAt = now + 0.5;
    voice.engineGate.gain.setValueAtTime(0, now);
    voice.engineGate.gain.setValueAtTime(0, voice.engineReadyAt - 0.06);
    voice.engineGate.gain.linearRampToValueAtTime(0.88, voice.engineReadyAt + 0.04);
  }

  function isSporty(car) {
    if (!car || car.year < 1960 || car.maker === "Rolls-Royce") return false;
    if (car.sound && typeof car.sound.sporty === "boolean") return car.sound.sporty;
    return SPORTY_MAKERS.indexOf(car.maker) !== -1;
  }

  function transient(voice, time, duration, level, frequency) {
    if (!voice || voice.stopped) return;
    var ctx = voice.ctx;
    var source = ctx.createBufferSource();
    var band = ctx.createBiquadFilter();
    var gain = ctx.createGain();
    var pan = ctx.createStereoPanner();
    source.buffer = makeNoise(ctx, duration);
    band.type = "bandpass";
    band.frequency.value = frequency || 1700;
    band.Q.value = 0.75;
    pan.pan.value = Math.random() * 0.45 - 0.225;
    gain.gain.setValueAtTime(level, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(band);
    band.connect(gain);
    gain.connect(pan);
    pan.connect(voice.filter);
    [source, band, gain, pan].forEach(function (node) { addNode(voice, node); });
    var entry = { source: source, stopped: false };
    voice.sources.push(entry);
    source.onended = function () {
      var index = voice.sources.indexOf(entry);
      if (index !== -1) voice.sources.splice(index, 1);
      [source, band, gain, pan].forEach(function (node) { node.disconnect(); });
    };
    source.start(time);
    source.stop(time + duration);
  }

  function burst(voice, time, amount) {
    if (!voice || voice.stopped) return;
    transient(voice, time, 0.045, amount || 0.04, 2300);
  }

  function crackle(voice, time, drop) {
    if (!isSporty(voice.car) || voice.spec.crackle <= 0 || time - voice.lastCrackleAt < 0.12) return;
    voice.lastCrackleAt = time;
    var pops = Math.min(4, Math.max(1, Math.floor(drop / 260)));
    for (var i = 0; i < pops; i++) {
      var at = time + i * (0.045 + Math.random() * 0.025);
      transient(voice, at, 0.028 + Math.random() * 0.022, voice.spec.crackle, 1250 + Math.random() * 1800);
    }
  }

  function dispose(voice) {
    if (voice.stopped) return;
    voice.stopped = true;
    if (voice.timer) clearTimeout(voice.timer);
    voice.sources.slice().forEach(function (entry) {
      if (!entry.stopped) {
        entry.stopped = true;
        entry.source.stop();
      }
    });
    voice.nodes.forEach(function (node) { node.disconnect(); });
    voice.sources = [];
  }

  function stop() {
    if (!active) return;
    var voice = active, now = voice.ctx.currentTime;
    active = null;
    voice.finishing = true;
    var gain = voice.output.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0.0001, now + 0.1);
    voice.timer = setTimeout(function () { dispose(voice); }, 320);
  }

  function begin(car) {
    stop();
    active = makeVoice(car);
    if (active) startStarter(active, active.ctx.currentTime);
    return active;
  }

  function rpmForSpeed(voice, speed) {
    var position = speed * 4, gear = Math.min(3, Math.floor(position));
    var fraction = Math.min(1, position - gear);
    voice.gear = gear;
    return voice.spec.idle + (voice.spec.max - voice.spec.idle) * fraction;
  }

  function renderRev(voice, startTime) {
    if (!voice || voice.stopped) return;
    var now = startTime === undefined ? voice.ctx.currentTime : startTime;
    var spec = voice.spec;
    if (voice.electric) {
      update(voice, 0, now, 0.02);
      voice.oscillators.forEach(function (oscillator, index) {
        var partial = spec.partials[index];
        oscillator.frequency.setValueAtTime(92 * partial, now);
        oscillator.frequency.linearRampToValueAtTime(920 * partial, now + 0.7);
        oscillator.frequency.linearRampToValueAtTime(92 * partial, now + 1.4);
      });
      voice.roadGain.gain.setValueAtTime(0, now);
      voice.roadGain.gain.linearRampToValueAtTime(spec.roadNoise * 0.5, now + 0.7);
      voice.roadGain.gain.linearRampToValueAtTime(0, now + 1.4);
    } else {
      var idleHz = firingHz(spec, spec.idle), maxHz = firingHz(spec, spec.max);
      voice.oscillators.forEach(function (oscillator, index) {
        var ratio = index === 1 ? 2 : (index === 2 ? 0.5 : 1);
        oscillator.frequency.setValueAtTime(idleHz * ratio, now);
        oscillator.frequency.linearRampToValueAtTime(maxHz * ratio, now + 0.72);
        oscillator.frequency.linearRampToValueAtTime(idleHz * ratio, now + 1.42);
      });
      voice.filter.frequency.setValueAtTime(spec.filter * 0.65, now);
      voice.filter.frequency.linearRampToValueAtTime(spec.filter, now + 0.72);
      voice.filter.frequency.linearRampToValueAtTime(spec.filter * 0.65, now + 1.42);
      if (voice.supercharger) {
        voice.supercharger.frequency.setValueAtTime(idleHz * 6, now);
        voice.supercharger.frequency.linearRampToValueAtTime(maxHz * 6, now + 0.72);
        voice.supercharger.frequency.linearRampToValueAtTime(idleHz * 6, now + 1.42);
      }
      if (voice.turboFilter) {
        voice.turboFilter.frequency.setValueAtTime(850, now);
        voice.turboFilter.frequency.linearRampToValueAtTime(3050, now + 0.72);
        voice.turboFilter.frequency.linearRampToValueAtTime(850, now + 1.42);
        burst(voice, now + 1.4);
      }
    }
    voice.output.gain.setValueAtTime(voice.volume, now);
    voice.output.gain.setValueAtTime(voice.volume, now + 2.05);
    voice.output.gain.linearRampToValueAtTime(0.0001, now + 2.45);
    voice.finishing = true;
    voice.timer = setTimeout(function () {
      if (active === voice) active = null;
      dispose(voice);
    }, Math.max(0, (now + 2.75 - voice.ctx.currentTime) * 1000));
  }

  window.ENGINE = {
    TYPES: TYPES,
    rev: function (car) {
      var voice = begin(car);
      if (voice) renderRev(voice, voice.engineReadyAt);
    },
    start: function (car) {
      var voice = begin(car);
      if (!voice) return;
      voice.speed = 0;
      if (!voice.electric) update(voice, voice.spec.idle, voice.engineReadyAt, 0.02);
      else update(voice, 0, voice.ctx.currentTime, 0.02);
    },
    setSpeed: function (speed) {
      var voice = active;
      if (!voice || !G.save.sound || voice.stopped || voice.finishing) return;
      speed = Math.max(0, Math.min(1, Number(speed) || 0));
      var now = Math.max(voice.ctx.currentTime, voice.engineReadyAt);
      var previous = voice.rpm, rpm = 0;
      voice.speed = speed;
      if (!voice.electric) {
        rpm = rpmForSpeed(voice, speed);
        if (voice.sound.turbo && previous && rpm < previous * 0.82) burst(voice, now, 0.04);
        if (previous - rpm > 180) crackle(voice, now, previous - rpm);
        update(voice, rpm, now, 0.05);
      } else update(voice, 0, now, 0.05);
    },
    stop: stop,
    _renderRev: renderRev
  };
})();
