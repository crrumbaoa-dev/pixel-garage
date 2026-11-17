// Run with:  node tests/cars.test.js
const assert = require("assert");
const { ERAS, CARS, STARTERS } = require("../js/cars.js");
const ART = require("../js/carart.js");
const PX = require("../js/pixel.js");

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log("  ok  " + name); }
  catch (e) { console.log("  FAIL " + name + "\n       " + e.message); process.exitCode = 1; }
}

test("every car has the facts the game needs", () => {
  CARS.forEach((c) => {
    ["id", "name", "maker", "year", "country", "era", "style", "color", "tagline"].forEach((k) => assert.ok(c[k], c.id + " missing " + k));
    assert.ok(c.facts.length >= 2, c.id + " needs at least 2 facts");
    assert.ok(ERAS.some((e) => e.id === c.era), c.id + " era");
  });
});

test("every car has an engine label and a valid sound type", () => {
  const types = ["early", "flat4", "flat6", "inline6", "v6", "v8", "v10", "v12", "w16", "electric"];
  CARS.forEach((car) => {
    assert.ok(car.engine, car.id + " missing engine label");
    assert.ok(car.sound && types.includes(car.sound.type), car.id + " has invalid sound type");
  });
});

test("car ids are unique", () => {
  assert.strictEqual(new Set(CARS.map((c) => c.id)).size, CARS.length);
});

test("there are 48 cars", () => {
  assert.strictEqual(CARS.length, 48);
});

test("era mix is about 30/20/50", () => {
  const share = (era) => CARS.filter((car) => car.era === era).length / CARS.length * 100;
  assert.ok(share("golden") >= 25 && share("golden") <= 35, "golden share is " + share("golden") + "%");
  assert.ok(share("classic") >= 15 && share("classic") <= 25, "classic share is " + share("classic") + "%");
  assert.ok(share("modern") >= 45 && share("modern") <= 55, "modern share is " + share("modern") + "%");
});

test("every maker and name uses characters in the pixel font", () => {
  const invalid = [];
  CARS.forEach((car) => [car.maker, car.name].forEach((text) => {
    PX.cleanText(text).split("").forEach((character) => {
      if (!PX.FONT[character.toUpperCase()]) invalid.push(car.id + ": " + JSON.stringify(character));
    });
  }));
  if (invalid.length) console.error("Unsupported car name characters: " + invalid.join(", "));
  assert.deepStrictEqual(invalid, []);
});

test("pixel text normalization handles punctuation and accents", () => {
  assert.strictEqual(PX.cleanText("4½ “Élan”—‘D’ · ü"), "4 1/2 \"Elan\"-'D' - u");
  assert.ok(PX.FONT['"']);
  assert.strictEqual(PX.cleanText("4 ½"), "4 1/2");
});

test("every plaque name fits", () => {
  CARS.forEach((car) => {
    const plaque = PX.cleanText(car.plaque || car.name);
    const plaqueWidth = PX.textWidth(plaque);
    const largestLine = Math.max(plaqueWidth, PX.textWidth(car.maker));
    assert.ok(plaque.split("").every((character) => PX.FONT[character.toUpperCase()]), car.id + " has an unsupported plaque character");
    assert.ok(plaqueWidth <= 108, car.id + " plaque is " + plaqueWidth + " pixels wide");
    if (PX.textWidth(car.name) > 108) assert.ok(car.plaque, car.id + " needs a short plaque name");
    assert.ok(largestLine + 16 <= 124, car.id + " plaque backing could overlap the next car");
  });
});

test("cars are in year order inside each era", () => {
  ERAS.forEach((era) => {
    const cars = CARS.filter((car) => car.era === era.id);
    for (let i = 1; i < cars.length; i++) {
      assert.ok(cars[i - 1].year <= cars[i].year, cars[i].id + " is out of year order");
    }
  });
});

test("eras match the car's year", () => {
  CARS.forEach((c) => {
    const want = c.year < 1960 ? "golden" : c.year < 1980 ? "classic" : "modern";
    assert.strictEqual(c.era, want, c.id);
  });
});

test("every quiz has 2 questions with a valid answer", () => {
  CARS.forEach((c) => {
    assert.strictEqual(c.quiz.length, 2, c.id);
    c.quiz.forEach((q) => assert.ok(q.answer >= 0 && q.answer < q.options.length, c.id + ": " + q.q));
  });
});

test("game stats are between 1 and 5", () => {
  CARS.forEach((c) => ["speed", "handling"].forEach((k) => assert.ok(c.stats[k] >= 1 && c.stats[k] <= 5, c.id + " " + k)));
});

test("starter cars exist", () => {
  STARTERS.forEach((id) => assert.ok(CARS.some((c) => c.id === id), id));
});

test("every car style can be drawn (side and top views)", () => {
  CARS.forEach((c) => {
    const side = ART.sidePixels(c);
    const top = ART.topPixels(c);
    assert.strictEqual(side.length, ART.SIDE_H, c.id);
    assert.ok(side.some((row) => row.some((px) => px)), c.id + " side is empty");
    assert.ok(top.some((row) => row.some((px) => px)), c.id + " top is empty");
  });
});

console.log(`\n${passed} passed`);
