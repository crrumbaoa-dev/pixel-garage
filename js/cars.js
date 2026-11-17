/* The collection: real cars, real facts.
   The pixel art for each car is an original design based on its body style (see carart.js),
   not a copy of the real car's design, and there are no logos.
   style: which original body shape to draw   color: main paint color   wheels: wheel style
   stats: game stats for the driving mini-game (just for fun, not real performance numbers) */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PC_CARS = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var ERAS = [
    { id: "golden", title: "Golden Age", years: "1900 to 1959" },
    { id: "classic", title: "Classic Era", years: "1960 to 1979" },
    { id: "modern", title: "Modern Luxury", years: "1980 to today" }
  ];

  var CARS = [
    {
      id: "silver-ghost", name: "Silver Ghost", maker: "Rolls-Royce", year: 1907, country: "United Kingdom", era: "golden",
      engine: "Inline-6", sound: { type: "early", quiet: true },
      style: "vintage", color: "#c9ced6", accent: "#5b6470", wheels: "spoke",
      tagline: "The car that made Rolls-Royce famous.",
      facts: [
        "Rolls-Royce was founded in 1906 by Charles Rolls and Henry Royce.",
        "The name came from one car painted silver with silver-plated parts, which looked almost ghostly and quiet.",
        "In 1907 it finished a famous reliability trial of about 15,000 miles, a huge distance for cars back then."
      ],
      quiz: [
        { q: "Which company made the Silver Ghost?", options: ["Bentley", "Rolls-Royce", "Cadillac"], answer: 1 },
        { q: "Why was it called the Silver Ghost?", options: ["It was painted silver and ran very quietly", "It was invisible at night", "It was made of real silver"], answer: 0 }
      ],
      stats: { speed: 1, handling: 2 }
    },
    {
      id: "bugatti-type-35", name: "Type 35", maker: "Bugatti", year: 1924, country: "France", era: "golden",
      engine: "Straight-8", sound: { type: "early" },
      style: "vintage", color: "#315b76", accent: "#c9c4ad", wheels: "spoke",
      tagline: "A racing car with over 1,000 wins.",
      facts: [
        "The Type 35 was one of the most successful racing cars ever, with over 1,000 race wins.",
        "Ettore Bugatti founded Bugatti in Molsheim in 1909."
      ],
      quiz: [
        { q: "Who founded Bugatti?", options: ["Jean Bugatti", "Ettore Bugatti", "Pierre Veyron"], answer: 1 },
        { q: "Where was Bugatti founded?", options: ["Molsheim", "Paris", "London"], answer: 0 }
      ],
      stats: { speed: 2, handling: 2 }
    },
    {
      id: "duesenberg-model-j", name: "Model J", maker: "Duesenberg", year: 1928, country: "United States", era: "golden",
      engine: "Straight-8", sound: { type: "early" },
      style: "vintage", color: "#6d3432", accent: "#d0b77f", wheels: "spoke",
      tagline: "A grand debut in New York.",
      facts: [
        "The Model J debuted at the New York Auto Salon in 1928.",
        "The saying \"it's a doozy\" is often linked to Duesenberg, though its origin is debated."
      ],
      quiz: [
        { q: "Where did the Model J debut?", options: ["The Paris Motor Show", "The London Motor Show", "The New York Auto Salon"], answer: 2 },
        { q: "What is often linked to Duesenberg?", options: ["\"It's a doozy\"", "\"The cat's pajamas\"", "\"The real McCoy\""], answer: 0 }
      ],
      stats: { speed: 2, handling: 2 }
    },
    {
      id: "bentley-4-5-litre-blower", name: "4½ Litre \"Blower\"", plaque: "4 1/2 LITRE", maker: "Bentley", year: 1929, country: "United Kingdom", era: "golden",
      engine: "Supercharged inline-4", sound: { type: "early", supercharger: true },
      style: "vintage", color: "#354a39", accent: "#c4b38a", wheels: "spoke",
      tagline: "A nickname from its supercharger.",
      facts: [
        "The 4½ Litre got the nickname \"Blower\" from its supercharger.",
        "Bentley won the 24 Hours of Le Mans five times between 1924 and 1930."
      ],
      quiz: [
        { q: "What gave the 4½ Litre its \"Blower\" nickname?", options: ["Its supercharger", "Its body shape", "Its racing number"], answer: 0 },
        { q: "How many times did Bentley win Le Mans between 1924 and 1930?", options: ["Three", "Five", "Eight"], answer: 1 }
      ],
      stats: { speed: 2, handling: 2 }
    },
    {
      id: "mercedes-benz-540k", name: "540K", maker: "Mercedes-Benz", year: 1936, country: "Germany", era: "golden",
      engine: "Supercharged straight-8", sound: { type: "early", supercharger: true },
      style: "longhood", color: "#31515a", accent: "#b9ad91", wheels: "spoke",
      tagline: "A supercharger in its name.",
      facts: [
        "The K in 540K stands for Kompressor, German for supercharger.",
        "The 540 refers to its 5.4-liter engine."
      ],
      quiz: [
        { q: "What does the K in 540K stand for?", options: ["Kompressor", "Komfort", "Kilometer"], answer: 0 },
        { q: "What does 540 refer to?", options: ["Its year", "Its 5.4-liter engine", "Its top speed"], answer: 1 }
      ],
      stats: { speed: 2, handling: 2 }
    },
    {
      id: "bugatti-type-57sc-atlantic", name: "Type 57SC Atlantic", maker: "Bugatti", year: 1936, country: "France", era: "golden",
      engine: "Supercharged straight-8", sound: { type: "early", supercharger: true },
      style: "bubble", color: "#293e52", accent: "#b7a58d", wheels: "spoke",
      tagline: "Four built, with a riveted seam.",
      facts: [
        "Only four Type 57SC Atlantics were built.",
        "Jean Bugatti designed it; a riveted seam runs down its body."
      ],
      quiz: [
        { q: "How many Type 57SC Atlantics were built?", options: ["Four", "Forty", "Four hundred"], answer: 0 },
        { q: "Who designed the Type 57SC Atlantic?", options: ["Ettore Bugatti", "Jean Bugatti", "Ferruccio Lamborghini"], answer: 1 }
      ],
      stats: { speed: 2, handling: 2 }
    },
    {
      id: "cord-810", name: "810", maker: "Cord", year: 1936, country: "United States", era: "golden",
      engine: "V8", sound: { type: "early" },
      style: "longhood", color: "#9b4937", accent: "#e1c49b", wheels: "hubcap",
      tagline: "Hidden headlights, cranked open.",
      facts: [
        "The Cord 810 was the first American production car with hidden headlights, cranked open by hand.",
        "It was front-wheel drive, which was rare at the time."
      ],
      quiz: [
        { q: "How were the Cord 810's hidden headlights opened?", options: ["By hand with a crank", "With a remote", "They opened automatically"], answer: 0 },
        { q: "Which wheels did the Cord 810 drive?", options: ["The rear wheels", "All four wheels", "The front wheels"], answer: 2 }
      ],
      stats: { speed: 2, handling: 2 }
    },
    {
      id: "alfa-romeo-8c-2900b", name: "8C 2900B", maker: "Alfa Romeo", year: 1938, country: "Italy", era: "golden",
      engine: "Supercharged straight-8", sound: { type: "early", supercharger: true },
      style: "longhood", color: "#456044", accent: "#d1b695", wheels: "spoke",
      tagline: "An eight-cylinder Italian winner.",
      facts: [
        "8C means 8 cylinders.",
        "The 8C 2900 won Italy's Mille Miglia road race in 1936, 1937 and 1938."
      ],
      quiz: [
        { q: "What does 8C mean?", options: ["Eight cylinders", "Eight carburetors", "Eight colors"], answer: 0 },
        { q: "Which road race did the 8C 2900 win three times?", options: ["Targa Florio", "Mille Miglia", "Le Mans"], answer: 1 }
      ],
      stats: { speed: 2, handling: 2 }
    },
    {
      id: "porsche-356", name: "356", maker: "Porsche", year: 1948, country: "Austria and Germany", era: "golden",
      engine: "Flat-4", sound: { type: "flat4" },
      style: "bubble", color: "#e7dfc8", accent: "#8a7f66", wheels: "hubcap",
      tagline: "The very first production Porsche.",
      facts: [
        "The 356 was Porsche's first production car. The first ones were built in Gmünd, Austria, in 1948.",
        "It was developed by Ferry Porsche, the son of Ferdinand Porsche.",
        "Its engine sits in the back, a layout Porsche became famous for."
      ],
      quiz: [
        { q: "What makes the 356 special for Porsche?", options: ["It was their first production car", "It was their first SUV", "It was electric"], answer: 0 },
        { q: "Where were the first 356s built?", options: ["Paris, France", "Gmünd, Austria", "Detroit, USA"], answer: 1 }
      ],
      stats: { speed: 2, handling: 3 }
    },
    {
      id: "jaguar-xk120", name: "XK120", maker: "Jaguar", year: 1948, country: "United Kingdom", era: "golden",
      engine: "Inline-6", sound: { type: "inline6" },
      style: "longhood", color: "#315c48", accent: "#c6bb9f", wheels: "spoke",
      tagline: "Named for its top speed.",
      facts: [
        "The XK120's name refers to its top speed of about 120 mph.",
        "It was revealed at the 1948 London Motor Show."
      ],
      quiz: [
        { q: "What does 120 in XK120 refer to?", options: ["Its year", "Its top speed in mph", "Its engine size"], answer: 1 },
        { q: "Where was the XK120 revealed?", options: ["London Motor Show", "New York Auto Salon", "Paris Motor Show"], answer: 0 }
      ],
      stats: { speed: 2, handling: 2 }
    },
    {
      id: "chevrolet-corvette-1953", name: "Corvette", maker: "Chevrolet", year: 1953, country: "United States", era: "golden",
      engine: "Inline-6", sound: { type: "inline6" },
      style: "longhood", color: "#f4f2e8", accent: "#b6a782", wheels: "hubcap",
      tagline: "Every 1953 car wore Polo White.",
      facts: [
        "The Corvette's body was made of fiberglass instead of steel.",
        "Every Corvette built in 1953 was painted Polo White."
      ],
      quiz: [
        { q: "What was the 1953 Corvette's body made from?", options: ["Fiberglass", "Steel", "Aluminum"], answer: 0 },
        { q: "What color were all 1953 Corvettes painted?", options: ["Polo White", "Black", "Red"], answer: 0 }
      ],
      stats: { speed: 2, handling: 2 }
    },
    {
      id: "300sl", name: "300 SL Gullwing", maker: "Mercedes-Benz", year: 1954, country: "Germany", era: "golden",
      engine: "Inline-6", sound: { type: "inline6" },
      style: "gt", color: "#b8bcc4", accent: "#e64b4b", wheels: "hubcap", long: false,
      tagline: "Doors that open like wings.",
      facts: [
        "Its doors open upward, like a seagull's wings, because the frame had tall sides where normal doors would go.",
        "It was one of the first production cars with fuel injection.",
        "It made its debut in New York in 1954."
      ],
      quiz: [
        { q: "Why is it nicknamed the Gullwing?", options: ["It has a bird on the hood", "Its doors open upward like wings", "It was built near the sea"], answer: 1 },
        { q: "Which technology was it one of the first production cars to use?", options: ["Fuel injection", "GPS", "Electric motors"], answer: 0 }
      ],
      stats: { speed: 3, handling: 3 }
    },
    {
      id: "ford-thunderbird-1955", name: "Thunderbird", maker: "Ford", year: 1955, country: "United States", era: "golden",
      engine: "V8", sound: { type: "v8" },
      style: "fins", color: "#3d6480", accent: "#e3d7bd", wheels: "whitewall",
      tagline: "Ford's two-seat personal luxury car.",
      facts: [
        "Ford called the Thunderbird a \"personal luxury car,\" not a sports car.",
        "It was a two-seater made to compete with the Corvette."
      ],
      quiz: [
        { q: "What did Ford call the Thunderbird?", options: ["A sports car", "A personal luxury car", "A family sedan"], answer: 1 },
        { q: "How many seats did the Thunderbird have?", options: ["Two", "Four", "Six"], answer: 0 }
      ],
      stats: { speed: 2, handling: 2 }
    },
    {
      id: "eldorado-59", name: "Eldorado", maker: "Cadillac", year: 1959, country: "United States", era: "golden",
      engine: "V8", sound: { type: "v8" },
      style: "fins", color: "#f2a7c3", accent: "#ffffff", wheels: "whitewall",
      tagline: "Tail fins at their tallest.",
      facts: [
        "The 1959 Cadillacs are famous for having some of the tallest tail fins ever put on a car.",
        "Each fin has twin bullet-shaped taillights.",
        "Tail fins were inspired by jet planes and rockets, which were exciting new technology in the 1950s."
      ],
      quiz: [
        { q: "What is the 1959 Eldorado most famous for?", options: ["Its huge tail fins", "Its tiny size", "Its gullwing doors"], answer: 0 },
        { q: "What inspired 1950s tail fins?", options: ["Fish", "Jet planes and rockets", "Sailboats"], answer: 1 }
      ],
      stats: { speed: 2, handling: 1 }
    },
    {
      id: "e-type", name: "E-Type", maker: "Jaguar", year: 1961, country: "United Kingdom", era: "classic",
      engine: "Inline-6", sound: { type: "inline6" },
      style: "longhood", color: "#2f6b4f", accent: "#d9c79c", wheels: "spoke",
      tagline: "A long, low British icon.",
      facts: [
        "The E-Type was revealed at the Geneva Motor Show in 1961.",
        "Enzo Ferrari is often quoted as calling it the most beautiful car ever made.",
        "Its very long hood covers a straight-six engine."
      ],
      quiz: [
        { q: "Where was the E-Type revealed?", options: ["Geneva Motor Show", "Tokyo Motor Show", "New York Auto Show"], answer: 0 },
        { q: "Which car founder is often quoted praising the E-Type's looks?", options: ["Henry Ford", "Enzo Ferrari", "Charles Rolls"], answer: 1 }
      ],
      stats: { speed: 3, handling: 3 }
    },
    {
      id: "250-gto", name: "250 GTO", maker: "Ferrari", year: 1962, country: "Italy", era: "classic",
      engine: "V12", sound: { type: "v12" },
      style: "longhood", color: "#d02b2b", accent: "#f2e6c9", wheels: "spoke", race: true,
      tagline: "One of the most valuable cars in the world.",
      facts: [
        "Only 36 were built, and they were made for racing.",
        "GTO stands for Gran Turismo Omologato, Italian for a grand touring car approved for racing.",
        "One sold for over $48 million at an auction in 2018."
      ],
      quiz: [
        { q: "About how many 250 GTOs were built?", options: ["36", "3,600", "36,000"], answer: 0 },
        { q: "What does the O in GTO stand for?", options: ["Original", "Omologato (approved for racing)", "Orange"], answer: 1 }
      ],
      stats: { speed: 4, handling: 4 }
    },
    {
      id: "db5", name: "DB5", maker: "Aston Martin", year: 1963, country: "United Kingdom", era: "classic",
      engine: "Inline-6", sound: { type: "inline6" },
      style: "gt", color: "#a7adb5", accent: "#3d4652", wheels: "spoke", long: true,
      tagline: "The spy movie star.",
      facts: [
        "It became famous as James Bond's car in the 1964 film Goldfinger.",
        "DB stands for David Brown, who owned Aston Martin at the time.",
        "It's a grand tourer: a fast, comfortable car for long trips."
      ],
      quiz: [
        { q: "Which movie made the DB5 famous?", options: ["Goldfinger", "Cars", "Back to the Future"], answer: 0 },
        { q: "What does DB stand for?", options: ["Double Boost", "David Brown", "Driving Beauty"], answer: 1 }
      ],
      stats: { speed: 3, handling: 3 }
    },
    {
      id: "mercedes-benz-sl-pagoda", name: "SL \"Pagoda\"", maker: "Mercedes-Benz", year: 1963, country: "Germany", era: "classic",
      engine: "Inline-6", sound: { type: "inline6" },
      style: "gt", color: "#d5d0c1", accent: "#727b7d", wheels: "hubcap",
      tagline: "A roof shaped like a pagoda.",
      facts: [
        "The SL's roof dips in the middle, like a pagoda temple roof.",
        "It started out as the 230 SL in 1963."
      ],
      quiz: [
        { q: "What inspired the SL's \"Pagoda\" nickname?", options: ["Its roof shape", "Its engine sound", "Its wheel design"], answer: 0 },
        { q: "What was its first version called?", options: ["250 SL", "230 SL", "300 SL"], answer: 1 }
      ],
      stats: { speed: 3, handling: 3 }
    },
    {
      id: "gt40", name: "GT40", maker: "Ford", year: 1964, country: "United States", era: "classic",
      engine: "V8", sound: { type: "v8" },
      style: "racer", color: "#2b4a8c", accent: "#f4f1e8", wheels: "alloy", stripe: true,
      tagline: "Built to win Le Mans.",
      facts: [
        "Ford built the GT40 to beat Ferrari at the 24 Hours of Le Mans race in France.",
        "It won Le Mans four years in a row, from 1966 to 1969.",
        "The 40 in its name comes from its height: about 40 inches tall."
      ],
      quiz: [
        { q: "What does the 40 in GT40 refer to?", options: ["Its top speed", "Its height in inches", "The number built"], answer: 1 },
        { q: "How many Le Mans wins in a row did the GT40 get?", options: ["Two", "Four", "Ten"], answer: 1 }
      ],
      stats: { speed: 4, handling: 4 }
    },
    {
      id: "911", name: "911", maker: "Porsche", year: 1964, country: "Germany", era: "classic",
      engine: "Flat-6", sound: { type: "flat6" },
      style: "fastback", color: "#f2c230", accent: "#3a3a3a", wheels: "alloy",
      tagline: "Still made after 60 years.",
      facts: [
        "It was first shown in 1963 as the 901, but it was renamed 911 because Peugeot used three-digit names with a 0 in the middle.",
        "Like the 356 before it, it keeps its engine in the back.",
        "It's one of the longest-running sports car names in history."
      ],
      quiz: [
        { q: "What was the 911 first called?", options: ["The 901", "The 356", "The 999"], answer: 0 },
        { q: "Where is the 911's engine?", options: ["In the front", "In the back", "Under the seats"], answer: 1 }
      ],
      stats: { speed: 4, handling: 4 }
    },
    {
      id: "miura", name: "Miura", maker: "Lamborghini", year: 1966, country: "Italy", era: "classic",
      engine: "V12", sound: { type: "v12" },
      style: "racer", color: "#ff8c1a", accent: "#2b2b2b", wheels: "alloy", curvy: true,
      tagline: "Often called the first supercar.",
      facts: [
        "It put a big V12 engine behind the driver, which inspired the supercars that came after it.",
        "It's named after Eduardo Miura, a famous breeder of fighting bulls.",
        "Lamborghini's logo and many car names are linked to bulls."
      ],
      quiz: [
        { q: "Where is the Miura's engine?", options: ["Behind the driver", "In the trunk", "Under the hood in front"], answer: 0 },
        { q: "Who was the Miura named after?", options: ["A race driver", "A breeder of fighting bulls", "A city in Italy"], answer: 1 }
      ],
      stats: { speed: 4, handling: 3 }
    },
    {
      id: "toyota-2000gt", name: "2000GT", maker: "Toyota", year: 1967, country: "Japan", era: "classic",
      engine: "Inline-6", sound: { type: "inline6" },
      style: "longhood", color: "#f4f2e8", accent: "#9c8c72", wheels: "spoke",
      tagline: "A rare Toyota with a film cameo.",
      facts: [
        "A convertible version appeared in the 1967 James Bond film You Only Live Twice.",
        "Only about 351 Toyota 2000GTs were built."
      ],
      quiz: [
        { q: "In which film did a 2000GT convertible appear?", options: ["Goldfinger", "You Only Live Twice", "Thunderball"], answer: 1 },
        { q: "About how many 2000GTs were built?", options: ["35", "351", "3,510"], answer: 1 }
      ],
      stats: { speed: 3, handling: 3 }
    },
    {
      id: "countach", name: "Countach", maker: "Lamborghini", year: 1974, country: "Italy", era: "classic",
      engine: "V12", sound: { type: "v12" },
      style: "wedge", color: "#f4f1e8", accent: "#c23b3b", wheels: "alloy",
      tagline: "The poster car.",
      facts: [
        "Its doors swing upward, a style called scissor doors.",
        "It was designed by Marcello Gandini at the design studio Bertone.",
        "Its sharp wedge shape made it one of the most famous bedroom-poster cars of the 1980s."
      ],
      quiz: [
        { q: "What are the Countach's doors called?", options: ["Scissor doors", "Sliding doors", "Barn doors"], answer: 0 },
        { q: "Who designed the Countach?", options: ["Marcello Gandini", "Enzo Ferrari", "Henry Royce"], answer: 0 }
      ],
      stats: { speed: 5, handling: 3 }
    },
    {
      id: "g-class", name: "G-Class", maker: "Mercedes-Benz", year: 1979, country: "Germany and Austria", era: "classic",
      engine: "Inline-6", sound: { type: "inline6" },
      style: "suv", color: "#2c2f36", accent: "#9aa2ad", wheels: "alloy",
      tagline: "A military truck turned luxury icon.",
      facts: [
        "It started out as an off-road military vehicle.",
        "G stands for Geländewagen, German for off-road vehicle.",
        "It's built in Graz, Austria, and its boxy shape has barely changed in decades."
      ],
      quiz: [
        { q: "What was the G-Class first designed as?", options: ["A race car", "An off-road military vehicle", "A taxi"], answer: 1 },
        { q: "What does the G stand for?", options: ["Grand", "Geländewagen (off-road vehicle)", "Gold"], answer: 1 }
      ],
      stats: { speed: 2, handling: 2 }
    },
    {
      id: "porsche-959", name: "959", maker: "Porsche", year: 1986, country: "Germany", era: "modern",
      engine: "Twin-turbo flat-6", sound: { type: "flat6", turbo: true },
      style: "fastback", color: "#b8b8b0", accent: "#34383c", wheels: "alloy",
      tagline: "Advanced all-wheel drive, rally-proven.",
      facts: [
        "The Porsche 959 had computer-controlled all-wheel drive, advanced for its time.",
        "A 959 won the Paris-Dakar Rally in 1986."
      ],
      quiz: [
        { q: "What kind of drive system did the 959 have?", options: ["Computer-controlled all-wheel drive", "Front-wheel drive", "Rear-wheel drive only"], answer: 0 },
        { q: "Which rally did a 959 win in 1986?", options: ["Mille Miglia", "Paris-Dakar Rally", "World Rally Championship"], answer: 1 }
      ],
      stats: { speed: 4, handling: 4 }
    },
    {
      id: "f40", name: "F40", maker: "Ferrari", year: 1987, country: "Italy", era: "modern",
      engine: "Twin-turbo V8", sound: { type: "v8", turbo: true },
      style: "wedge", color: "#d61f26", accent: "#1d1d1d", wheels: "alloy", wing: true,
      tagline: "Enzo Ferrari's last approval.",
      facts: [
        "It was built to celebrate Ferrari's 40th anniversary.",
        "It was the last new Ferrari approved by founder Enzo Ferrari before he died in 1988.",
        "It has a big rear wing to press it onto the road at high speed."
      ],
      quiz: [
        { q: "What did the F40 celebrate?", options: ["Ferrari's 40th anniversary", "The year 1940", "40 race wins"], answer: 0 },
        { q: "Why does it have a big rear wing?", options: ["To look like a plane", "To press it onto the road at speed", "To hold luggage"], answer: 1 }
      ],
      stats: { speed: 5, handling: 4 }
    },
    {
      id: "lamborghini-diablo", name: "Diablo", maker: "Lamborghini", year: 1990, country: "Italy", era: "modern",
      engine: "V12", sound: { type: "v12" },
      style: "wedge", color: "#526b54", accent: "#343532", wheels: "alloy",
      tagline: "A bull-named Countach successor.",
      facts: [
        "Diablo means \"devil\" in Spanish, and like many Lamborghinis it's named after a famous fighting bull.",
        "The Diablo replaced the Countach."
      ],
      quiz: [
        { q: "What does Diablo mean in Spanish?", options: ["Devil", "Bull", "Racer"], answer: 0 },
        { q: "Which Lamborghini did the Diablo replace?", options: ["Miura", "Countach", "Aventador"], answer: 1 }
      ],
      stats: { speed: 5, handling: 4 }
    },
    {
      id: "mclaren-f1", name: "F1", maker: "McLaren", year: 1992, country: "United Kingdom", era: "modern",
      engine: "V12", sound: { type: "v12" },
      style: "hyper", color: "#e8762c", accent: "#2a2a2a", wheels: "alloy",
      tagline: "The driver sits in the middle.",
      facts: [
        "The driver sits in the center, with a passenger seat on each side.",
        "It was designed by Gordon Murray.",
        "Its engine bay is lined with real gold foil, which reflects heat.",
        "In 1998 it set a speed record for production cars."
      ],
      quiz: [
        { q: "Where does the driver sit in a McLaren F1?", options: ["On the left", "In the middle", "In the back"], answer: 1 },
        { q: "What lines the engine bay?", options: ["Gold foil", "Leather", "Wood"], answer: 0 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "pagani-zonda", name: "Zonda", maker: "Pagani", year: 1999, country: "Italy", era: "modern",
      engine: "V12", sound: { type: "v12" },
      style: "hyper", color: "#59726b", accent: "#cfc2a5", wheels: "alloy",
      tagline: "Named for an Argentine wind.",
      facts: [
        "It's named after the Zonda, a wind in Argentina, where founder Horacio Pagani is from.",
        "Its V12 engine was made by Mercedes-AMG."
      ],
      quiz: [
        { q: "What is the Zonda named after?", options: ["A mountain in Italy", "A wind in Argentina", "A city in Germany"], answer: 1 },
        { q: "Who made the Zonda's V12 engine?", options: ["Mercedes-AMG", "Ferrari", "Pagani"], answer: 0 }
      ],
      stats: { speed: 5, handling: 4 }
    },
    {
      id: "ferrari-enzo", name: "Enzo", maker: "Ferrari", year: 2002, country: "Italy", era: "modern",
      engine: "V12", sound: { type: "v12" },
      style: "hyper", color: "#76544b", accent: "#d5c9ad", wheels: "alloy", wing: true,
      tagline: "Named after Ferrari's founder.",
      facts: [
        "The Ferrari Enzo is named after the company's founder, Enzo Ferrari.",
        "About 400 were built."
      ],
      quiz: [
        { q: "Who was the Ferrari Enzo named after?", options: ["Enzo Ferrari", "Alfredo Ferrari", "Ferruccio Lamborghini"], answer: 0 },
        { q: "About how many Enzos were built?", options: ["40", "400", "4,000"], answer: 1 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "continental-gt", name: "Continental GT", maker: "Bentley", year: 2003, country: "United Kingdom", era: "modern",
      engine: "Twin-turbo W12", sound: { type: "v12", turbo: true },
      style: "gt", color: "#1f3b5a", accent: "#c9b98f", wheels: "chrome", long: true,
      tagline: "Comfort at high speed.",
      facts: [
        "Bentley was founded in 1919 by W. O. Bentley.",
        "The Continental GT was the first new Bentley made after Volkswagen bought the company in 1998.",
        "GT means grand tourer: a car for driving long distances in comfort."
      ],
      quiz: [
        { q: "What does GT mean?", options: ["Grand tourer", "Great truck", "Go turbo"], answer: 0 },
        { q: "When was Bentley founded?", options: ["1919", "1969", "1999"], answer: 0 }
      ],
      stats: { speed: 4, handling: 3 }
    },
    {
      id: "phantom", name: "Phantom", maker: "Rolls-Royce", year: 2003, country: "United Kingdom", era: "modern",
      engine: "V12", sound: { type: "v12", quiet: true },
      style: "sedan", color: "#3b1f3a", accent: "#e2e2e8", wheels: "chrome",
      tagline: "Stars on the ceiling.",
      facts: [
        "The Phantom name first appeared on a Rolls-Royce in 1925.",
        "Its rear doors open backward, a style called coach doors.",
        "You can order a Starlight Headliner: tiny lights in the ceiling that look like a night sky."
      ],
      quiz: [
        { q: "What are the Phantom's rear doors called?", options: ["Coach doors", "Wing doors", "Pocket doors"], answer: 0 },
        { q: "What is the Starlight Headliner?", options: ["A special headlight", "Tiny lights in the ceiling like stars", "A radio station"], answer: 1 }
      ],
      stats: { speed: 3, handling: 2 }
    },
    {
      id: "porsche-carrera-gt", name: "Carrera GT", maker: "Porsche", year: 2004, country: "Germany", era: "modern",
      engine: "V10", sound: { type: "v10" },
      style: "racer", color: "#8a9b91", accent: "#3e4543", wheels: "alloy",
      tagline: "A carbon-fiber chassis and racing V10.",
      facts: [
        "The Carrera GT's V10 engine was first developed for racing.",
        "Its chassis is made of carbon fiber."
      ],
      quiz: [
        { q: "What was the Carrera GT's V10 first developed for?", options: ["Racing", "Tractors", "A family sedan"], answer: 0 },
        { q: "What is its chassis made of?", options: ["Steel", "Carbon fiber", "Fiberglass"], answer: 1 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "bugatti-veyron", name: "Veyron", maker: "Bugatti", year: 2005, country: "France", era: "modern",
      engine: "Quad-turbo W16", sound: { type: "w16", turbo: true },
      style: "hyper", color: "#354c61", accent: "#d5c6a6", wheels: "alloy", twoTone: true,
      tagline: "The first production car over 1,000 hp.",
      facts: [
        "The Veyron was the first production car with more than 1,000 horsepower.",
        "It's named after Pierre Veyron, who won Le Mans for Bugatti in 1939."
      ],
      quiz: [
        { q: "What production-car milestone did the Veyron reach?", options: ["More than 1,000 horsepower", "More than 100 cylinders", "More than 1,000 seats"], answer: 0 },
        { q: "Who was the Veyron named after?", options: ["Ettore Bugatti", "Pierre Veyron", "Jean Bugatti"], answer: 1 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "mercedes-benz-sls-amg", name: "SLS AMG", maker: "Mercedes-Benz", year: 2010, country: "Germany", era: "modern",
      engine: "V8", sound: { type: "v8" },
      style: "gt", color: "#7a7c7b", accent: "#cbc2ac", wheels: "alloy",
      tagline: "AMG's first fully developed car.",
      facts: [
        "The SLS AMG's gullwing doors pay tribute to the 300 SL from 1954.",
        "It was the first car developed entirely by AMG."
      ],
      quiz: [
        { q: "Which earlier car inspired the SLS AMG's gullwing doors?", options: ["300 SL", "SL Pagoda", "540K"], answer: 0 },
        { q: "Who developed the SLS AMG entirely?", options: ["Bentley", "AMG", "Lexus"], answer: 1 }
      ],
      stats: { speed: 5, handling: 4 }
    },
    {
      id: "lexus-lfa", name: "LFA", maker: "Lexus", year: 2010, country: "Japan", era: "modern",
      engine: "V10", sound: { type: "v10" },
      style: "gt", color: "#657d88", accent: "#d0c6b0", wheels: "alloy",
      tagline: "A rare carbon-fiber Lexus.",
      facts: [
        "Only 500 Lexus LFAs were built.",
        "Its body is made of carbon fiber, and Lexus is Toyota's luxury brand."
      ],
      quiz: [
        { q: "How many Lexus LFAs were built?", options: ["50", "500", "5,000"], answer: 1 },
        { q: "What is the LFA's body made of?", options: ["Carbon fiber", "Steel", "Fiberglass"], answer: 0 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "lamborghini-aventador", name: "Aventador", maker: "Lamborghini", year: 2011, country: "Italy", era: "modern",
      engine: "V12", sound: { type: "v12" },
      style: "wedge", color: "#82624c", accent: "#373937", wheels: "alloy",
      tagline: "A bull-named car with scissor doors.",
      facts: [
        "The Aventador is named after a famous fighting bull.",
        "Its doors swing upward in the scissor-door style, like the Countach."
      ],
      quiz: [
        { q: "What is the Aventador named after?", options: ["A famous fighting bull", "A racing driver", "A mountain"], answer: 0 },
        { q: "How do the Aventador's doors open?", options: ["Slide backward", "Swing upward like scissor doors", "Open like coach doors"], answer: 1 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "laferrari", name: "LaFerrari", maker: "Ferrari", year: 2013, country: "Italy", era: "modern",
      engine: "Hybrid V12", sound: { type: "v12" },
      style: "hyper", color: "#7d3036", accent: "#d1b594", wheels: "alloy",
      tagline: "Its name means “The Ferrari.”",
      facts: [
        "Its name means \"The Ferrari\" in Italian.",
        "It combines a V12 engine with an electric motor, and about 500 coupes were built."
      ],
      quiz: [
        { q: "What does LaFerrari mean?", options: ["The Ferrari", "Fast Ferrari", "Ferrari 500"], answer: 0 },
        { q: "What does its hybrid powertrain combine?", options: ["A V8 and two turbos", "A V12 and an electric motor", "Two electric motors"], answer: 1 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "mclaren-p1", name: "P1", maker: "McLaren", year: 2013, country: "United Kingdom", era: "modern",
      engine: "Hybrid twin-turbo V8", sound: { type: "v8", turbo: true, flatPlane: true },
      style: "hyper", color: "#596d60", accent: "#d2c8a9", wheels: "alloy",
      tagline: "A limited hybrid supercar.",
      facts: [
        "Only 375 were built.",
        "It's a hybrid: a twin-turbo V8 plus an electric motor."
      ],
      quiz: [
        { q: "How many McLaren P1s were built?", options: ["918", "375", "500"], answer: 1 },
        { q: "What does its hybrid powertrain pair?", options: ["A twin-turbo V8 and an electric motor", "A V12 and a battery only", "Two V8 engines"], answer: 0 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "porsche-918-spyder", name: "918 Spyder", maker: "Porsche", year: 2013, country: "Germany", era: "modern",
      engine: "Hybrid V8", sound: { type: "v8", flatPlane: true },
      style: "racer", color: "#7b8574", accent: "#d6c6a9", wheels: "alloy",
      tagline: "An exactly 918-unit plug-in hybrid.",
      facts: [
        "Porsche built exactly 918 of them.",
        "It's a plug-in hybrid that pairs a V8 with electric motors."
      ],
      quiz: [
        { q: "How many 918 Spyders did Porsche build?", options: ["375", "500", "918"], answer: 2 },
        { q: "What engine does the plug-in hybrid pair with electric motors?", options: ["A V8", "A V12", "A V10"], answer: 0 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "chiron", name: "Chiron", maker: "Bugatti", year: 2016, country: "France", era: "modern",
      engine: "Quad-turbo W16", sound: { type: "w16", turbo: true },
      style: "hyper", color: "#1d4fb8", accent: "#111827", wheels: "alloy", twoTone: true,
      tagline: "A 300 mph hypercar family.",
      facts: [
        "It's named after Louis Chiron, a racing driver from Monaco.",
        "It has a 16-cylinder engine with four turbochargers.",
        "Only 500 were planned, and a special version was the first production-based car to go over 300 mph in 2019."
      ],
      quiz: [
        { q: "Who was the Chiron named after?", options: ["A racing driver", "A painter", "A city"], answer: 0 },
        { q: "How many cylinders does its engine have?", options: ["4", "8", "16"], answer: 2 }
      ],
      stats: { speed: 5, handling: 4 }
    },
    {
      id: "lamborghini-urus", name: "Urus", maker: "Lamborghini", year: 2018, country: "Italy", era: "modern",
      engine: "Twin-turbo V8", sound: { type: "v8", turbo: true },
      style: "suv", color: "#778374", accent: "#cfc7b3", wheels: "alloy",
      tagline: "Lamborghini's “super SUV.”",
      facts: [
        "Lamborghini calls it a \"super SUV.\"",
        "Lamborghini's earlier SUV, the LM002 from 1986, was nicknamed the \"Rambo Lambo.\""
      ],
      quiz: [
        { q: "What does Lamborghini call the Urus?", options: ["The Rambo Lambo", "A super SUV", "A grand tourer"], answer: 1 },
        { q: "What was the 1986 LM002 nicknamed?", options: ["Rambo Lambo", "Super SUV", "Urus"], answer: 0 }
      ],
      stats: { speed: 4, handling: 3 }
    },
    {
      id: "rolls-royce-cullinan", name: "Cullinan", maker: "Rolls-Royce", year: 2018, country: "United Kingdom", era: "modern",
      engine: "Twin-turbo V12", sound: { type: "v12", turbo: true, quiet: true },
      style: "suv", color: "#77715e", accent: "#d3c9b3", wheels: "chrome",
      tagline: "Rolls-Royce's first SUV.",
      facts: [
        "The Cullinan is Rolls-Royce's first SUV.",
        "It's named after the Cullinan diamond, the largest gem-quality diamond ever found."
      ],
      quiz: [
        { q: "What was the Cullinan for Rolls-Royce?", options: ["Its first SUV", "Its first race car", "Its first electric car"], answer: 0 },
        { q: "What was the Cullinan named after?", options: ["A mountain", "A diamond", "A racing driver"], answer: 1 }
      ],
      stats: { speed: 4, handling: 3 }
    },
    {
      id: "koenigsegg-jesko", name: "Jesko", maker: "Koenigsegg", year: 2019, country: "Sweden", era: "modern",
      engine: "Twin-turbo V8", sound: { type: "v8", turbo: true, flatPlane: true },
      style: "wedge", color: "#78826f", accent: "#d4cbb3", wheels: "alloy", wing: true,
      tagline: "Named after founder Christian's father.",
      facts: [
        "It's named after Jesko von Koenigsegg, the father of founder Christian von Koenigsegg.",
        "It was revealed at the 2019 Geneva Motor Show."
      ],
      quiz: [
        { q: "Who was the Koenigsegg Jesko named after?", options: ["Christian von Koenigsegg", "Jesko von Koenigsegg", "A racing driver"], answer: 1 },
        { q: "Where was it revealed?", options: ["The 2019 Geneva Motor Show", "The 2019 Paris Motor Show", "The 2018 Geneva Motor Show"], answer: 0 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "ferrari-sf90-stradale", name: "SF90 Stradale", maker: "Ferrari", year: 2019, country: "Italy", era: "modern",
      engine: "Hybrid twin-turbo V8", sound: { type: "v8", turbo: true, flatPlane: true },
      style: "wedge", color: "#80534a", accent: "#d2c1a8", wheels: "alloy",
      tagline: "Ferrari's first plug-in hybrid production car.",
      facts: [
        "SF90 celebrates 90 years of Scuderia Ferrari, the company's racing team, founded in 1929.",
        "It was Ferrari's first plug-in hybrid production car."
      ],
      quiz: [
        { q: "What does SF90 celebrate?", options: ["90 years of Scuderia Ferrari", "90 Ferrari models", "90 years of road cars"], answer: 0 },
        { q: "What was the SF90 Stradale first for Ferrari?", options: ["Its first SUV", "Its first plug-in hybrid production car", "Its first V12"], answer: 1 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "porsche-taycan", name: "Taycan", maker: "Porsche", year: 2019, country: "Germany", era: "modern",
      engine: "Electric motors", sound: { type: "electric" },
      style: "fastback", color: "#8a7772", accent: "#d3cab8", wheels: "alloy",
      tagline: "Porsche's first all-electric car.",
      facts: [
        "The Taycan is Porsche's first all-electric production car.",
        "Porsche says the name roughly means \"lively young horse.\""
      ],
      quiz: [
        { q: "What was the Taycan Porsche's first of?", options: ["All-electric production car", "SUV", "Racing car"], answer: 0 },
        { q: "What does Porsche say Taycan roughly means?", options: ["Silver road", "Lively young horse", "Fast mountain"], answer: 1 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "aston-martin-valkyrie", name: "Valkyrie", maker: "Aston Martin", year: 2021, country: "United Kingdom", era: "modern",
      engine: "Hybrid V12", sound: { type: "v12" },
      style: "hyper", color: "#536e5d", accent: "#c6b99f", wheels: "alloy", wing: true,
      tagline: "A Newey-designed hybrid with a high-revving V12.",
      facts: [
        "It was designed with Adrian Newey of Red Bull Racing.",
        "Its Cosworth V12 revs past 11,000 rpm."
      ],
      quiz: [
        { q: "Who helped design the Valkyrie?", options: ["Adrian Newey", "Horacio Pagani", "Jesko von Koenigsegg"], answer: 0 },
        { q: "How high does its Cosworth V12 rev?", options: ["Past 8,000 rpm", "Past 10,000 rpm", "Past 11,000 rpm"], answer: 2 }
      ],
      stats: { speed: 5, handling: 5 }
    },
    {
      id: "rolls-royce-spectre", name: "Spectre", maker: "Rolls-Royce", year: 2023, country: "United Kingdom", era: "modern",
      engine: "Electric motors", sound: { type: "electric", quiet: true },
      style: "gt", color: "#8f9692", accent: "#d3c8ae", wheels: "chrome",
      tagline: "The first all-electric Rolls-Royce.",
      facts: [
        "It's the first all-electric Rolls-Royce.",
        "Rolls-Royces are known for being very quiet, and going electric makes it even quieter."
      ],
      quiz: [
        { q: "What is the Spectre the first of for Rolls-Royce?", options: ["All-electric Rolls-Royce", "SUV", "Hybrid V12"], answer: 0 },
        { q: "What does going electric do to its sound?", options: ["Makes it louder", "Makes it quieter", "Adds a V12 rumble"], answer: 1 }
      ],
      stats: { speed: 4, handling: 4 }
    }
  ];

  var STARTERS = ["porsche-356", "300sl", "e-type"];

  return { ERAS: ERAS, CARS: CARS, STARTERS: STARTERS };
});
