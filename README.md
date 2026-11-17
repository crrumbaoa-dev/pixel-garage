# Pixel Garage

A pixel art museum game about luxury and vintage cars.

You make a character, pick a first car, and walk through three halls: the Golden Age (1900 to 1959), the Classic Era (1960 to 1979) and Modern Luxury (1980 to today). Each car has a plaque, real facts and a 2-question quiz. Pass the quiz and the car goes into your garage. At the end of the museum you can take any car you've collected for a test drive on a coast road.

## Cars

17 cars from Rolls-Royce, Porsche, Mercedes-Benz, Cadillac, Jaguar, Ferrari, Aston Martin, Ford, Lamborghini, McLaren, Bentley and Bugatti. The facts are real. The pixel art is my own: every car is drawn in code from its body style (open tourer, finned cruiser, wedge supercar and so on), with no logos or badges.

## How it works

- No libraries and no build step. Plain HTML, CSS and JavaScript.
- The game draws on a 320 x 180 canvas and scales it up by whole numbers only, so every pixel stays sharp.
- Cars and characters are pixel grids made in code. A helper adds the outline and the light and shadow rows.
- All in-game text uses a 5 x 7 pixel font I drew in `js/pixel.js`.
- Sound effects are made with the Web Audio API, so there are no sound files.
- Progress saves in the browser (localStorage).
- Works with a keyboard, a mouse or touch. Respects the "reduce motion" setting.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page |
| `css/style.css` | Panels, buttons and layout |
| `js/pixel.js` | Colors, pixel grids, outlines and the pixel font |
| `js/cars.js` | The cars: facts, quizzes and game stats |
| `js/carart.js` | Draws each car from the side and from above |
| `js/people.js` | The character and its options |
| `js/core.js` | Saving, sounds, pop-up panels |
| `js/gallery.js` | The museum |
| `js/drive.js` | The test drive |
| `js/main.js` | Title screen, character creator, first car, controls, game loop |
| `tests/cars.test.js` | Checks the car data and that every car can be drawn |

## Run it

Open `index.html` in a browser, or use the Live Server extension in VS Code.

Tests: `node tests/cars.test.js`
