const textures = window.textures;
const texture = textures.lines().thicker();
const textureWeaklyVenomous = textures
  .paths()
  .d("woven")
  .lighter()
  .thicker()
  .size(20);
// .background("#E17547");
const textureMildlyVenomous = textures
  .paths()
  .d("woven")
  .lighter()
  .thicker()
  .size(14);
// .background("#F6D43C");
const textureVenomous = textures.paths().d("woven").lighter().thicker().size(8);
// .background("#09A573");
const textureHighlyVenomous = textures
  .paths()
  .d("woven")
  .lighter()
  .thicker()
  .size(5);
// .background("#5598E2");

// Selections
const main = d3.select("main");
const scrolly = main.select("#scrolly");
const figure = scrolly.select("figure");
const chartTitle = scrolly.select("#chart-title");
const svg = scrolly.select("#viz svg");
const article = scrolly.select("article");
const step = article.selectAll(".step");

// Initialize the scrollama
const scroller = scrollama();

const width = 343; // 375 - 16 - 16
const height = 555; //400;
const rScale = d3.scaleSqrt().domain([100, 250]).range([20, 50]);

const chartTextFamily =
  '"Overpass Mono", "Varela", "Varela Round", "Helvetica", arial, sans-serif';
const chartTextSize = "0.75rem";
const chartTextWeight = 300;
const timeParser = d3.timeParse("%d %b %Y %H"); // "02 Jan 2023 06"
const leftPad = 5;
// const circleDiameter = 40; // big enough to tap
const circleDiameter = 24; // small enough to fit within plot area
// const circleDiameter = 10; // small enough to fit within plot area
const circleRadius = circleDiameter / 2;
const circleSpacing = circleDiameter + 2;
const circleStroke = "#3C3941";
const scSpeciesNodeRadius = 12;
const scSpeciesGroupChargeStrength = -180;
const scSpeciesGroupRadius = 16;
const snekChargeStrength = -180;
const snekChargeStrengthTimeline = -20;
const hideOffscreen = 80;
const goldenRatio = 1.618;
const focalPointX = width / 2;
const focalPointY = height / goldenRatio / goldenRatio;
const opacityFade = 0.2;
const circlePath =
  "M26,13.5L26,13.5C26,12.4659 25.8744,11.4611 25.6377,10.5C25.4226,9.62696 25.1158,8.79003 24.7281,8C24.381,7.29275 23.9691,6.62309 23.5,5.99878C22.9167,5.22238 22.245,4.51612 21.5,3.89491C20.5986,3.14334 19.5898,2.51627 18.5,2.04011C16.9688,1.37112 15.2778,1 13.5,1C12.6438,1 11.8078,1.08608 11,1.25005C10.1305,1.42655 9.29376,1.6933 8.5,2.04011C7.12946,2.63893 5.88705,3.4764 4.82531,4.5C4.34493,4.96312 3.90154,5.46433 3.5,5.99878C2.81499,6.91052 2.25177,7.91897 1.83449,9C1.29551,10.3963 1,11.9136 1,13.5C1,15.0864 1.29551,16.6037 1.83449,18C2.25177,19.081 2.815,20.0895 3.5,21.0012C4.05068,21.7342 4.68006,22.4046 5.3756,23C6.02885,23.5592 6.74044,24.0522 7.5,24.4685C8.43393,24.9805 9.44037,25.3767 10.5,25.6377C11.4611,25.8744 12.4659,26 13.5,26C14.5341,26 15.5389,25.8744 16.5,25.6377C17.9493,25.2807 19.2991,24.6708 20.5,23.8577C21.0971,23.4534 21.6573,22.9988 22.1747,22.5C22.6551,22.0369 23.0985,21.5357 23.5,21.0012C24.3898,19.8169 25.0741,18.4694 25.5,17.0116C25.8255,15.8976 26,14.7192 26,13.5";
const speciesSnakePath =
  "M23.8819 20.0069C23.6277 19.8795 22.9072 20.8292 22.7507 20.9716C22.2779 21.4027 21.7026 21.798 21.0531 21.8372C19.5508 21.9275 18.9932 20.2473 18.5753 19.0835C17.5942 16.3714 15.4843 13.6244 12.3384 15.1877C11.0127 15.8466 10.172 17.1462 9.43054 18.4037C8.96011 19.2001 8.23317 20.9633 7.16329 21.0374C5.80457 21.1315 4.98801 19.7591 5.11631 18.4891C5.26154 17.05 6.35722 16.0128 7.34479 15.1064C9.41842 13.2037 11.5743 11.6833 12.2294 8.74472C12.8991 5.73821 11.5025 2.53632 8.56559 1.56372C7.47872 1.20423 5.66742 0.207064 3.91572 2.23473C0.920709 5.70029 3.46145 5.35871 4.36272 5.32707C7.39242 5.22043 8.67932 5.80899 8.25329 7.46016C8.11536 7.99331 7.80792 8.5394 7.50537 8.91928C7.3117 9.1792 6.47017 9.99721 6.09744 10.3317C5.24783 11.0944 4.38697 11.8483 3.6051 12.686C2.1504 14.2434 1.07325 16.1294 1.00306 18.3424C0.867501 22.5919 5.2551 26.6969 9.27319 24.2818C11.1701 23.1417 11.8478 20.9462 12.9007 19.1006C13.3397 18.3304 14.1521 17.3286 15.0703 18.1062C15.832 18.7552 16.221 19.8586 16.684 20.7295C17.5716 22.3982 19.0925 23.9273 21.1128 23.5112C22.0826 23.3112 22.8967 22.639 23.414 21.7842C23.5447 21.5677 24.2829 20.2006 23.8819 20.0069Z";
const individualSnakePath =
  "M22.8819 19.0069C22.6277 18.8795 21.9072 19.8292 21.7507 19.9716C21.2779 20.4027 20.7026 20.798 20.0531 20.8372C18.5508 20.9275 17.9932 19.2473 17.5753 18.0835C16.5942 15.3714 14.4843 12.6244 11.3384 14.1877C10.0127 14.8466 9.17201 16.1462 8.43054 17.4037C7.96011 18.2001 7.23317 19.9633 6.16329 20.0374C4.80457 20.1315 3.98801 18.7591 4.11631 17.4891C4.26154 16.05 5.35722 15.0128 6.34479 14.1064C8.41842 12.2037 10.5743 10.6833 11.2294 7.74472C11.8991 4.73821 10.5025 1.53632 7.56559 0.563717C6.47872 0.204233 4.66742 -0.792936 2.91572 1.23473C-0.079291 4.70029 2.46145 4.35871 3.36272 4.32707C6.39242 4.22043 7.67932 4.80899 7.25329 6.46016C7.11536 6.99331 6.80792 7.5394 6.50537 7.91928C6.3117 8.1792 5.47017 8.99721 5.09744 9.33171C4.24783 10.0944 3.38697 10.8483 2.6051 11.686C1.1504 13.2434 0.0732516 15.1294 0.00306388 17.3424C-0.132499 21.5919 4.2551 25.6969 8.27319 23.2818C10.1701 22.1417 10.8478 19.9462 11.9007 18.1006C12.3397 17.3304 13.1521 16.3286 14.0703 17.1062C14.832 17.7552 15.221 18.8586 15.684 19.7295C16.5716 21.3982 18.0925 22.9273 20.1128 22.5112C21.0826 22.3112 21.8967 21.639 22.414 20.7842C22.5447 20.5677 23.2829 19.2006 22.8819 19.0069Z";
const morphDuration = 500;
const seenStrokeWidth = 3;
const snakeShapeStrokeWidth = 2;

const snekSpeciesRadius = 50;
const speciesColors = [
  "#F1EEF6",
  "#E4DDEE",
  "#D5CBE6",
  "#B19CD3",
  "#9880C2",
  "#5F428F",
  "#452D6C",
  "#331A5B",
  "#1C0A39",
];

const dimensions = {
  width: 343,
  height: 455, // 400,
  margin: {
    top: 48,
    right: 24, // at least circleRadius wide
    bottom: 24,
    left: 112,
  },
};

const boundingPadding = 0;
const boundingMinX = circleRadius;
const boundingMaxX = dimensions.width - circleRadius;
const boundingMinY = circleRadius;
const boundingMaxY = dimensions.height - circleRadius;

let sneks = null;
let nodes = null;
let scSpeciesNodes = null;
let sightingsData = null;
let scSpeciesData = null;
let speciesGroupSimulation = null;
let snekSimulation = null;

let activeStepFunctionName = null;

// Data Points of Interest:
let matingSnakeOne = null;
let matingSnakeTwo = null;
let courtingSnakeOne = null;
let courtingSnakeTwo = null;
let butcherBirdsSnake = null;
let magpiesSnake = null;
let flyingSnake = null;

const annotations = {
  mating: {
    labels: [
      {
        id: "smoochy",
        text: "Smoochy snakes",
        labelX: 60,
        labelY: 90,
        paddingY: 3,
      },
    ],
    connectors: [
      {
        labelId: "smoochy",
        targetSnake: "matingSnakeOne",
        snakeXOffset: -circleRadius * 1.5,
        snakeYOffset: -circleRadius * 1.25,
        distance: 30,
      },
      {
        labelId: "smoochy",
        targetSnake: "matingSnakeTwo",
        snakeXOffset: -circleRadius * 1.5,
        snakeYOffset: -circleRadius * 0.75,
        distance: 30,
      },
    ],
  },
  courting: {
    labels: [
      {
        id: "snuggle",
        text: "Looking to snuggle",
        labelX: 270,
        labelY: 100,
        paddingY: 3,
      },
    ],
    connectors: [
      {
        labelId: "snuggle",
        targetSnake: "courtingSnakeOne",
        snakeXOffset: circleRadius,
        snakeYOffset: -circleRadius,
        distance: -30,
      },
      {
        labelId: "snuggle",
        targetSnake: "courtingSnakeTwo",
        snakeXOffset: circleRadius,
        snakeYOffset: -circleRadius,
        distance: -30,
      },
    ],
  },
  butcherBirds: {
    labels: [
      {
        id: "cowering",
        text: "Cowering",
        labelX: 60,
        labelY: 340,
        paddingY: -12,
      },
    ],
    connectors: [
      {
        labelId: "cowering",
        targetSnake: "butcherBirdsSnake",
        snakeXOffset: -circleRadius * 1.75,
        snakeYOffset: 0,
        distance: -30,
      },
    ],
  },
  magpies: {
    labels: [
      { id: "gulped", text: "Gulped", labelX: 270, labelY: 100, paddingY: 3 },
    ],
    connectors: [
      {
        labelId: "gulped",
        targetSnake: "magpiesSnake",
        snakeXOffset: circleRadius,
        snakeYOffset: -circleRadius,
        distance: -30,
      },
    ],
  },
  flying: {
    labels: [
      { id: "flying", text: "Flying", labelX: 270, labelY: 100, paddingY: 3 },
    ],
    connectors: [
      {
        labelId: "flying",
        targetSnake: "flyingSnake",
        snakeXOffset: circleRadius * 1.75,
        snakeYOffset: -circleRadius * 0.5,
        distance: -30,
      },
    ],
  },
};

let speciesAngleScale = null;
let speciesColorScale = null;
let speciesBandScale = null;

let speciesGroupAngleScale = null;
let speciesGroupColorScale = null;

let temperatureScale = null;
let temperatureColorScale = null;

let timeOfDayScale = null;

let weatherScale = null;

let timeScale = null;
let timeDelayScale = null;
let seasonScale = null;
const delay = 100;

const metricTimeOfDayProp = "timeOfDay";
const metricTimeOfDayAccessor = (d) => d[metricTimeOfDayProp];
const metricWeatherProp = "weather";
const metricWeatherAccessor = (d) => d[metricWeatherProp];
const metricTempProp = "temp";
const metricTempAccessor = (d) => d[metricTempProp];
const metricDateProp = "date";
const metricDateAccessor = (d) => d[metricDateProp];
const metricSpeciesProp = "speciesBestGuess";
const metricVenomProp = "venom";
const metricVenomAccessor = (d) => d[metricVenomProp];
const metricMatingProp = "mating";
const metricMatingAccessor = (d) => d[metricMatingProp];
const metricBirdsProp = "attackedByBirds";
const metricBirdsAccessor = (d) => d[metricBirdsProp];

const metricSpeciesGroupProp = "group";
const metricSpeciesGroupAccessor = (d) => d[metricSpeciesGroupProp];
const metricSpeciesVenomProp = "venom";
const metricSpeciesGroupSpProp = "species";

const weatherGroup = (d) => {
  const weather = d[metricWeatherProp];
  if (
    [
      "cloudy",
      "cloudy",
      "partly cloudy",
      "overcast",
      "cloudy,spitting",
      "cloudy,sunny",
      "muggy",
      "cloudy,humid",
    ].includes(weather)
  ) {
    return "cloudy";
  }
  if (["sunny", "clear"].includes(weather)) {
    return "clear";
  }

  return "unknown";
};

const watchingMeGroup = (d) => {
  const watchingMe = d["watchingMe"];
  if (["staring"].includes(watchingMe)) {
    return "staring";
  }
  if (["probably", "yes", "possibly", "flattened"].includes(watchingMe)) {
    return "yeah";
  }
  if (["unlikely", "oblivious"].includes(watchingMe)) {
    return "nah";
  }
  return "not sure";
};

const didFlee = (d) => {
  const departure = d["departure"];
  return (
    departure.includes("fled") ||
    departure.includes("quickly") ||
    departure.includes("rapid") ||
    departure.includes("recoiled") ||
    departure.includes("fleeing")
  );
};

const didChill = (d) => {
  const departure = d["departure"];
  return departure.includes("chill") || departure.includes("slowly");
};

// generic window resize listener event
function handleResize() {
  // Update height of step elements
  var stepH = Math.floor(window.innerHeight * (goldenRatio - 1));
  step.style("height", stepH + "px");

  var figureHeight = window.innerHeight / 2;
  var figureMarginTop = (window.innerHeight - figureHeight) / 2;

  figure
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  // Tell scrollama to update new element dimensions
  scroller.resize();
}

const sightingsFunctions = {
  yellowFacedWhipSnake,
  redBelly,
  keelback,
  commonTreeSnake,
  easternSmallEyedSnake,
  marshSnake,
  carpetPython,
  unknownSpecies,
  all,
  staringContest,
  mating,
  courting,
  butcherBirds,
  magpies,
  flying,
  yard,
  climbing,
  onCamera,
  attacked,
  fled,
  chill,
  defensive,
  temperatureStripPlot,
  weatherStripPlot,
  timeOfDayStripPlot,
  venom,
  timeline,
  species,
  seasons,
  fin,
  first,
};
const sunnyCoastSpeciesFunctions = {
  scCount,
  scSeenSpecies,
  scVenomQuestion,
  scNonVenomous,
  scWeaklyVenomous,
  scMildlyVenomous,
  scModeratelyVenomous,
  scVenom,
  scSeaSnakes,
  scBlindSnakes,
  scPythons,
  scRearFangedSnakes,
  scLandSnakes,
  scSpecies,
};
const stepFunctions = {
  ...sightingsFunctions,
  ...sunnyCoastSpeciesFunctions,
};
const sunnyCoastSpeciesStepNames = Object.keys(sunnyCoastSpeciesFunctions);
const sightingsStepNames = Object.keys(sightingsFunctions);

function handleStepEnter(response) {
  // console.log(response);
  // response = { element, direction, index }

  // add color to current step only
  step.classed("is-active", function (_d, i) {
    return i === response.index;
  });

  // update graphic based on step
  const stepFunctionName = response.element.getAttribute("data-step-function");
  activeStepFunctionName = stepFunctionName;
  const stepFn = stepFunctions[stepFunctionName];
  if (stepFn) {
    stepFn();
  }
}

function handleStepExit(response) {
  // console.log(response);
  // response = { element, direction, index }

  if (response.index === 0 && response.direction === "up") {
    step.classed("is-active", false);
    first("first");
  }
}

function loadData() {
  d3.csv("./data/snake-sightings-public.csv", (d) => {
    return {
      ...d,
      // Note: the data is recorded in AEST but we're going to treat it all as local time so that, for example, 01 Oct 2021 is always shown as 01 Oct 2021 and not accidentally 30 Sep 2021, which could change how data are grouped into months, etc.
      // We add 6 hours to it so that regions with daylight savings don't change a date like 01 Oct 2021 midnight to 30 Sep 2021 11pm
      // date: timeParser(`${d.date} +1000`), // AEST
      date: timeParser(`${d.date} 06`),
      temp:
        d.temperature !== "unknown"
          ? +d.temperature
          : +d.estimatedTemperature.replace("~", ""),
      // initialize x/y values for force simulation to start from center
      x: width / 2,
      y: height / 2,
    };
  })
    .then((data) => {
      sightingsData = data.filter((d) => d.family !== "Pygopodidae"); // Legless lizards
      // console.log(sightingsData.map((d) => d.date));
      // console.log(sightingsData);
      // console.log(sightingsData.map((d) => d.temp).sort());
      // console.log(d3.extent(sightingsData, (d) => d.temp));
    })
    .then(() => {
      d3.json("./data/sunny-coast-snake-species.json", (d) => {
        return {
          group: d.venom,
          species: d.species,
          venom: d.venom,
        };
      })
        .then((data) => {
          scSpeciesData = data.filter(
            (d) =>
              d[metricSpeciesGroupProp] !== "Legless and Snake-like Lizards"
          );
        })
        .then(() => {
          setTimeout(init(), 0);
        });
    });
}

function setupScales() {
  const allSnakeSpecies = Array.from(
    new Set(sightingsData.map((d) => d.speciesBestGuess))
  );
  const orderedSnakeSpecies = d3
    .rollups(
      sightingsData,
      (v) => v.length,
      (d) => d[metricSpeciesProp]
    )
    .sort((a, b) => {
      if (a[0] === "unknown") return 1;
      if (b[0] === "unknown") return -1;
      return b[1] < a[1] ? -1 : b[1] > a[1] ? 1 : b[1] >= a[1] ? 0 : 0;
    })
    .map((d) => d[0]);
  // console.log(orderedSnakeSpecies);

  speciesGroupAngleScale = d3
    .scaleBand()
    .domain(Array.from(new Set(scSpeciesData.map(metricSpeciesGroupAccessor))))
    .range([0, 360]);

  speciesAngleScale = d3
    .scaleBand()
    .domain(orderedSnakeSpecies)
    .range([0, 360]);
  // speciesAngleScale = d3.scaleBand().domain(allSnakeSpecies).range([0, 360]);

  speciesBandScale = d3
    .scalePoint()
    .domain(orderedSnakeSpecies)
    .range([
      dimensions.margin.top,
      dimensions.height - dimensions.margin.bottom,
    ])
    .padding(0.5);

  speciesColorScale = (species) => {
    switch (species) {
      case "Yellow-faced whip snake":
        return "#F6D43C";
      case "Red-bellied black":
        return "#930B0D";
      case "Keelback":
        return "#5598E2";
      case "Common tree snake":
        return "#067551";
      case "Verreaux's skink":
        return "#E17547";
      case "Eastern small-eyed snake":
        return "#E26F99";
      case "Marsh snake":
        return "#CD840E";
      case "Carpet python":
        return "#045D40";
      default:
        return speciesColors[Math.floor(Math.random() * speciesColors.length)];
    }
  };

  speciesGroupColorScale = (species) => {
    switch (species) {
      case "Blind Snakes":
        return "#9880C2";
      case "Pythons":
        return "#ECB255";
      case "Solid Toothed and Rear Fanged":
        return "#ED9873";
      case "Front Fanged, Venomous, Terrestrial":
        return "#84DCC0";
      case "Front Fanged, Venomous, Sea Snakes":
        return "#7BB2EF";
      default:
        return "#D5CBE6";
    }
  };

  watchingMeScale = d3
    .scalePoint()
    .domain(["staring", "yeah", "nah", "not sure"])
    .range([circleSpacing, dimensions.width - circleSpacing])
    .padding(0.25);

  seasonScale = d3
    .scalePoint()
    .domain(["Summer", "Autumn", "Winter", "Spring"])
    .range([circleSpacing, dimensions.width - circleSpacing])
    .padding(0.25);

  venomScale = d3
    .scalePoint()
    .domain(["non venomous", "mildly venomous", "highly venomous", "unknown"])
    .range([circleSpacing, dimensions.width - circleSpacing])
    .padding(0.25);

  timeScale = d3
    .scaleTime()
    .domain(d3.extent(sightingsData, metricDateAccessor))
    .range([
      dimensions.margin.top + circleSpacing,
      dimensions.height - circleSpacing,
    ])
    .nice();

  timeDelayScale = d3
    .scaleLinear()
    .domain(d3.extent(sightingsData, metricDateAccessor))
    // .range([0, 716 * 20]);
    .range([0, sightingsData.length * delay]);

  temperatureScale = d3
    .scaleLinear()
    .domain(d3.extent(sightingsData, metricTempAccessor))
    .range([
      dimensions.margin.left,
      dimensions.width - dimensions.margin.right,
    ]);

  const timesOfDay = [
    "morning",
    "mid morning",
    "late morning",
    "midday",
    "early afternoon",
    "afternoon",
    "mid afternoon",
    "late afternoon",
    "dusk",
    "early evening",
    "evening",
  ];

  timeOfDayScale = d3
    .scalePoint()
    .domain(timesOfDay)
    .range([
      dimensions.margin.left + circleSpacing,
      dimensions.width - dimensions.margin.right - circleSpacing,
    ]);

  weatherScale = d3
    .scalePoint()
    .domain(["clear", "cloudy", "unknown"])
    .range([
      dimensions.margin.left + circleSpacing,
      dimensions.width - dimensions.margin.right - circleSpacing,
    ]);

  weatherColorScale = d3
    .scaleOrdinal()
    .domain(["clear", "cloudy"])
    .range(["#ECB255", "#ADCFF5"])
    .unknown("#E2E0E5");

  temperatureColorScale = d3
    .scaleSequential()
    .domain(d3.extent(sightingsData, metricTempAccessor))
    .interpolator(d3.interpolateHsl("#7BB2EF", "#ED9798"));
}

function setupChart() {
  svg.attr("width", width).attr("height", height);

  svg.call(texture);
  // svg.call(textureNonVenomous);
  svg.call(textureWeaklyVenomous);
  svg.call(textureMildlyVenomous);
  svg.call(textureVenomous);
  svg.call(textureHighlyVenomous);

  snakeSimulation();
  scSpeciesSimulation();
}

function snakeSimulation() {
  nodes = svg.selectAll("path.snek").data(sightingsData);

  sneks = nodes
    .join("path")
    .attr("class", "snek")
    .attr("d", individualSnakePath)
    .attr("data-id", (d) => d.id)
    .attr("fill", (d) => speciesColorScale(d.speciesBestGuess))
    .attr("opacity", 0)
    // .attr("opacity", 0)
    // .attr("opacity", 0.8)
    // .attr("style", "mix-blend-mode: color-dodge")
    .attr(
      "transform",
      (_d, i) => `translate(${leftPad + i * circleSpacing}, ${height - 10})`
    )
    .attr("pointer-events", "none") // TODO: remove this for interactivity
    .attr("stroke-width", 1)
    .attr("stroke", circleStroke);

  sneks.on("mouseenter", onMouseEnter);

  snekSimulation = d3.forceSimulation(sightingsData);

  snekSimulation.on("tick", () => {
    sneks.attr(
      "transform",
      (d) => `translate(${d.x - circleRadius}, ${d.y - circleRadius})`
    );

    updateAnnotationConnectors();
  });

  snekSimulation.stop();

  snekSimulation
    .force("bounding-rect", () => {
      sightingsData.forEach((node) => {
        node.x = Math.max(node.x, boundingMinX + boundingPadding);
        node.x = Math.min(node.x, boundingMaxX - boundingPadding);
        node.y = Math.max(node.y, boundingMinY + boundingPadding);
        node.y = Math.min(node.y, boundingMaxY - boundingPadding);
      });
    })
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            snekSpeciesRadius *
              Math.sin(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointX
        )
        .strength(1)
    )
    .force(
      "forceY",
      d3
        .forceY(
          (d) =>
            snekSpeciesRadius *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    .force("collide", null)
    // .force("collide", d3.forceCollide((_d) => circleRadius).strength(1))
    // .alpha(1)
    // .alphaDecay(0.0228)
    // .alphaMin(0.001)
    // .alphaTarget(0)
    // .velocityDecay(0.4);
    .alpha(0.9)
    .velocityDecay(0.6)
    .stop();

  snekSimulation.restart();
}

function scSpeciesSimulation() {
  scSpeciesNodes = svg
    .selectAll("g.species")
    .data(scSpeciesData)
    .join("g")
    .attr("class", "species")
    .attr("opacity", 0)
    .attr(
      "transform",
      (_d, i) => `translate(${leftPad + i * circleSpacing}, ${height - 10})`
    )
    .call((g) => {
      g.append("path")
        .attr("d", circlePath)
        .attr("class", "species--fill")
        .attr("fill", "#fff")
        .attr("opacity", 1)
        .attr("stroke-width", 1)
        .attr("stroke", circleStroke);
    })
    .call((g) => {
      g.append("path")
        .attr("class", "species--pattern")
        .attr("d", circlePath)
        .attr("opacity", 0)
        .attr("fill", (d) => getVenomPatternFill(d))
        .attr("stroke-width", 1)
        .attr("stroke", circleStroke);
    });

  scSpeciesNodes.on("mouseenter", onMouseEnterSpecies);

  speciesGroupSimulation = d3.forceSimulation(scSpeciesData);

  speciesGroupSimulation
    .force("bounding-rect", () => {
      sightingsData.forEach((node) => {
        node.x = Math.max(node.x, boundingMinX + boundingPadding);
        node.x = Math.min(node.x, boundingMaxX - boundingPadding);
        node.y = Math.max(node.y, boundingMinY + boundingPadding);
        node.y = Math.min(node.y, boundingMaxY - boundingPadding);
      });
    })
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            scSpeciesGroupRadius *
              Math.sin(
                speciesGroupAngleScale(d[metricSpeciesGroupProp]) *
                  (Math.PI / 180)
              ) +
            focalPointX
        )
        .strength(0.9)
    )
    .force(
      "forceY",
      d3
        .forceY(
          (d) =>
            scSpeciesGroupRadius *
              Math.cos(
                speciesGroupAngleScale(d[metricSpeciesGroupProp]) *
                  (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(0.9)
    )
    .force("charge", d3.forceManyBody().strength(scSpeciesGroupChargeStrength))
    // .force("collide", null)
    .force(
      "collide",
      d3.forceCollide((_d) => scSpeciesNodeRadius + 2).strength(1)
    )
    // .alpha(1)
    // .alphaDecay(0.0228)
    // .alphaMin(0.001)
    // .alphaTarget(0)
    // .velocityDecay(0.4);
    .alpha(0.9)
    .velocityDecay(0.6)
    .stop();

  const ticked = () => {
    scSpeciesNodes.attr(
      "transform",
      (d) =>
        `translate(${d.x - scSpeciesNodeRadius}, ${d.y - scSpeciesNodeRadius})`
    );
  };

  while (speciesGroupSimulation.alpha() > speciesGroupSimulation.alphaMin()) {
    speciesGroupSimulation.tick();
    ticked();
  }
}

function setupAxes() {
  let weatherStripPlotXAxis = d3.axisBottom(weatherScale).tickSize(0).ticks(6);
  // X-Axis labels:
  svg
    .append("g")
    .attr("class", "strip-plot-x-weather")
    .attr("opacity", 0)
    .attr(
      "transform",
      `translate(0, ${dimensions.height - dimensions.margin.bottom})`
    )
    .call(weatherStripPlotXAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").style("font-family", chartTextFamily))
    .call((g) => g.selectAll("text").style("font-size", chartTextSize))
    .call((g) => g.selectAll("text").style("font-weight", chartTextWeight))
    .call(
      (g) =>
        g
          .selectAll("text")
          .attr("opacity", (d) =>
            ["clear", "cloudy", "unknown"].includes(d) ? 1 : 0
          )
      // .attr("opacity", (d) => (["sunny", "cloudy"].includes(d) ? 1 : 0))
    )
    .lower();

  let timeOfDayStripPlotXAxis = d3
    .axisBottom(timeOfDayScale)
    .tickSize(0)
    .ticks(6);
  // X-Axis labels:
  svg
    .append("g")
    .attr("class", "strip-plot-x-time-of-day")
    .attr("opacity", 0)
    .attr(
      "transform",
      `translate(0, ${dimensions.height - dimensions.margin.bottom})`
    )
    .call(timeOfDayStripPlotXAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").style("font-family", chartTextFamily))
    .call((g) => g.selectAll("text").style("font-size", chartTextSize))
    .call((g) => g.selectAll("text").style("font-weight", chartTextWeight))
    .call((g) =>
      g
        .selectAll("text")
        .attr("opacity", (d) =>
          ["morning", "afternoon", "evening"].includes(d) ? 1 : 0
        )
    )
    .lower();

  let tempStripPlotXAxis = d3.axisBottom(temperatureScale).tickSize(0).ticks(6);
  // X-Axis labels:
  svg
    .append("g")
    .attr("class", "strip-plot-x-temperature")
    .attr("opacity", 0)
    .attr(
      "transform",
      `translate(0, ${dimensions.height - dimensions.margin.bottom})`
    )
    .call(tempStripPlotXAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").style("font-family", chartTextFamily))
    .call((g) => g.selectAll("text").style("font-size", chartTextSize))
    .call((g) => g.selectAll("text").style("font-weight", chartTextWeight))
    .lower();

  let tempStripPlotYAxis = d3.axisLeft(speciesBandScale).tickFormat("");

  // Temperature Y-Axis labels:
  svg
    .append("g")
    .attr("class", "strip-plot-y")
    .attr("opacity", 0)
    .attr("transform", `translate(${dimensions.margin.left}, 0)`)
    .call(tempStripPlotYAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick text")
        .selectAll("tspan")
        .data((species) => splitSpeciesLabels(species))
        .join("tspan")
        .attr("x", 0)
        .attr("dx", -(circleRadius + 8))
        .attr("dy", getLabelPartYShift)
        .style("font-family", chartTextFamily)
        .style("font-size", chartTextSize)
        .style("font-weight", chartTextWeight)
        .text((d) => `${d}`)
    )
    .attr("stroke-opacity", 0.2)
    .attr("stroke-dasharray", 2.5)
    .lower();

  // Temperature Y-Axis grid lines:
  svg
    .append("g")
    .attr("class", "strip-plot-y-grid-lines")
    .attr("opacity", 0)
    .attr(
      "transform",
      `translate(${dimensions.width - dimensions.margin.right}, 0)`
    )
    .call(
      d3
        .axisLeft(speciesBandScale)
        .tickSize(
          dimensions.width - dimensions.margin.right - dimensions.margin.left
        )
        .tickFormat("")
    )
    .call((g) => g.select(".domain").remove())
    .attr("stroke-opacity", 0.2)
    .attr("stroke-dasharray", 2.5)
    .lower();

  let timeAxis = d3
    .axisLeft(timeScale)
    .tickSizeOuter(20)
    .tickFormat((d) => d3.timeFormat("%b %Y")(d));

  // Timeline Y-Axis labels:
  svg
    .append("g")
    .attr("class", "timeline-y-axis")
    .attr("opacity", 0)
    .attr("transform", `translate(${dimensions.margin.left}, 0)`)
    .call(timeAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick text")
        .style("font-family", chartTextFamily)
        .style("font-size", chartTextSize)
        .style("font-weight", chartTextWeight)
    )
    .call((g) => {
      g.selectAll(".tick:last-child").remove();
    })
    .attr("stroke-opacity", 0.2)
    .lower();

  // Watching me axis
  const watchingMeAxis = d3.axisBottom(watchingMeScale).tickSize(0);
  const watchingMeSneksTallCount = 4;
  svg
    .append("g")
    .attr("class", "watching-me-axis")
    .attr("opacity", 0)
    .attr(
      "transform",
      `translate(0, ${focalPointY + watchingMeSneksTallCount * circleSpacing})`
    )
    .call(watchingMeAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").style("font-family", chartTextFamily))
    .call((g) => g.selectAll("text").style("font-size", chartTextSize))
    .call((g) => g.selectAll("text").style("font-weight", chartTextWeight))
    .lower();

  // Seasons axis
  const seasonAxis = d3.axisBottom(seasonScale).tickSize(0);
  const seasonSneksTallCount = 4;
  svg
    .append("g")
    .attr("class", "seasons-axis")
    .attr("opacity", 0)
    .attr(
      "transform",
      `translate(0, ${focalPointY + seasonSneksTallCount * circleSpacing})`
    )
    .call(seasonAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").style("font-family", chartTextFamily))
    .call((g) => g.selectAll("text").style("font-size", chartTextSize))
    .call((g) => g.selectAll("text").style("font-weight", chartTextWeight))
    .lower();

  const venomLabel = (d) => {
    const labels = {
      "non venomous": "Nope",
      "mildly venomous": "Mildly",
      "highly venomous": "Highly",
    };
    return labels[d] ?? "probably";
  };

  // Venom axis
  const venomAxis = d3.axisBottom(venomScale).tickSize(0);
  const venomSneksTallCount = 4;
  svg
    .append("g")
    .attr("class", "venom-axis")
    .attr("opacity", 0)
    .attr(
      "transform",
      `translate(0, ${focalPointY + venomSneksTallCount * circleSpacing})`
    )
    .call(venomAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").style("font-family", chartTextFamily))
    .call((g) => g.selectAll("text").style("font-size", chartTextSize))
    .call((g) => g.selectAll("text").style("font-weight", chartTextWeight))
    .call((g) => g.selectAll("text").text((d) => venomLabel(d)))
    .lower();
}

function setupAnnotations() {
  for (const snakeFn in annotations) {
    for (const label of annotations[snakeFn]["labels"]) {
      svg
        .append("text")
        .attr("class", `annotation-label-${label["id"]}`)
        .attr("opacity", 0)
        .attr("stroke", "none")
        .attr("fill", "#3C3941");
    }

    for (const connector of annotations[snakeFn]["connectors"]) {
      svg
        .append("path")
        .attr(
          "class",
          `annotation-connector-${connector["labelId"]}-${connector["targetSnake"]}`
        )
        .attr("opacity", 0)
        .attr("fill", "none")
        .attr("stroke", "#3C3941")
        .attr("stroke-width", 2);
    }
  }

  svg
    .append("defs")
    .selectAll("marker")
    .data([0])
    .join("marker")
    .attr("id", "arrow-head")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", "#000")
    .attr("d", "M0,-5L10,0L0,5");
}

function setupPointsOfInterestDataPoints() {
  const matingSnakes = sightingsData.filter(
    (d) => d[metricMatingProp] === "mating"
  );
  matingSnakeOne = matingSnakes[0];
  matingSnakeTwo = matingSnakes[1];

  const courtingSnakes = sightingsData.filter(
    (d) => d[metricMatingProp] === "probably"
  );
  courtingSnakeOne = courtingSnakes[0];
  courtingSnakeTwo = courtingSnakes[1];

  butcherBirdsSnake = sightingsData.filter(
    (d) => d[metricBirdsProp] === "Butcher birds"
  )[0];
  magpiesSnake = sightingsData.filter(
    (d) => d[metricBirdsProp] === "magpies"
  )[0];
  flyingSnake = sightingsData.filter((d) => d["departure"] === "flying")[0];
}

function species() {
  hideOtherChartStuff("species");

  updateTitle("All species");
  addSpeciesBlobForces();
  addVisibleSpeciesColors(1);

  reheatSimulation();
}

function yellowFacedWhipSnake() {
  hideOtherChartStuff("yellowFacedWhipSnake");

  updateTitle("Yellow-faced whip snakes");
  addSpeciesBlobForces();
  addVisibleSpeciesColors((d) =>
    d[metricSpeciesProp] === "Yellow-faced whip snake" ? 1 : opacityFade
  );

  reheatSimulation();
}

function redBelly() {
  hideOtherChartStuff("redBelly");

  updateTitle("Red-bellied black snakes");
  addSpeciesBlobForces();
  addVisibleSpeciesColors((d) =>
    d[metricSpeciesProp] === "Red-bellied black" ? 1 : opacityFade
  );

  reheatSimulation();
}

function commonTreeSnake() {
  hideOtherChartStuff("commonTreeSnake");

  updateTitle("Common tree snake");
  addSpeciesBlobForces();
  addVisibleSpeciesColors((d) =>
    d[metricSpeciesProp] === "Common tree snake" ? 1 : opacityFade
  );

  reheatSimulation();
}

function easternSmallEyedSnake() {
  hideOtherChartStuff("easternSmallEyedSnake");

  updateTitle("Eastern small-eyed snakes");
  addSpeciesBlobForces();
  addVisibleSpeciesColors((d) =>
    d[metricSpeciesProp] === "Eastern small-eyed snake" ? 1 : opacityFade
  );

  reheatSimulation();
}

function marshSnake() {
  hideOtherChartStuff("marshSnake");

  updateTitle("Marsh snake");
  addSpeciesBlobForces();
  addVisibleSpeciesColors((d) =>
    d[metricSpeciesProp] === "Marsh snake" ? 1 : opacityFade
  );

  reheatSimulation();
}

function carpetPython() {
  hideOtherChartStuff("carpetPython");

  updateTitle("Carpet python");
  addSpeciesBlobForces();
  addVisibleSpeciesColors((d) =>
    d[metricSpeciesProp] === "Carpet python" ? 1 : opacityFade
  );

  reheatSimulation();
}

function unknownSpecies() {
  hideOtherChartStuff("unknownSpecies");

  updateTitle("unknown");
  addSpeciesBlobForces();
  addVisibleSpeciesColors((d) =>
    d[metricSpeciesProp] === "unknown" ? 1 : opacityFade
  );

  reheatSimulation();
}

function keelback() {
  hideOtherChartStuff("keelback");

  updateTitle("Keelbacks");
  addSpeciesBlobForces();
  addVisibleSpeciesColors((d) =>
    d[metricSpeciesProp] === "Keelback" ? 1 : opacityFade
  );

  reheatSimulation();
}

function timeOfDayStripPlot() {
  hideOtherChartStuff("timeOfDayStripPlot");

  updateTitle("I see Keelbacks only at dusk");
  snekSimulation
    .force("forceX", null)
    .force("forceY", null)
    .force("charge", null);
  // .force("collide", null);

  const jitter = (i) => {
    return i % 2 === 0 ? 2 : -2; // try to minimise spinning nodes without pushing nodes off grid lines
  };

  snekSimulation
    .force(
      "forceX",
      d3.forceX((d) => timeOfDayScale(d[metricTimeOfDayProp])).strength(0.9)
    )
    .force(
      "forceY",
      d3
        .forceY((d, i) => speciesBandScale(d[metricSpeciesProp]) + jitter(i))
        .strength(0.9)
    )
    // .force("charge", null)
    // .force("charge", d3.forceManyBody().strength(-2)) // try to minimise spinning nodes without pushing nodes off grid lines
    .force("collide", d3.forceCollide(circleRadius).strength(1));

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) => temperatureColorScale(d[metricTempProp]))
    .attr("opacity", 1);

  d3.select(".strip-plot-x-time-of-day").transition().attr("opacity", 1);
  d3.select(".strip-plot-y").transition().attr("opacity", 1);
  d3.select(".strip-plot-y-grid-lines").transition().attr("opacity", 1);
  reheatSimulation();
}

function weatherStripPlot() {
  hideOtherChartStuff("weatherStripPlot");

  // updateTitle("Nope ropes, rain, hail, or shine");
  // updateTitle("Rain, hail, or shine, there be nope ropes");
  updateTitle("Nope ropes in all weather");
  snekSimulation
    .force("forceX", null)
    .force("forceY", null)
    .force("charge", null);
  // .force("collide", null);

  const jitter = (i) => {
    return i % 2 === 0 ? 2 : -2; // try to minimise spinning nodes without pushing nodes off grid lines
  };

  snekSimulation
    .force(
      "forceX",
      d3.forceX((d) => weatherScale(weatherGroup(d))).strength(0.9)
    )
    .force(
      "forceY",
      d3
        .forceY((d, i) => speciesBandScale(d[metricSpeciesProp]) + jitter(i))
        .strength(0.9)
    )
    // .force("charge", null)
    // .force("charge", d3.forceManyBody().strength(-2)) // try to minimise spinning nodes without pushing nodes off grid lines
    .force("collide", d3.forceCollide(circleRadius).strength(1));

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) => weatherColorScale(weatherGroup(d)))
    .attr("opacity", 1);

  d3.select(".strip-plot-x-weather").transition().attr("opacity", 1);
  d3.select(".strip-plot-y").transition().attr("opacity", 1);
  d3.select(".strip-plot-y-grid-lines").transition().attr("opacity", 1);
  reheatSimulation();
}

function temperatureStripPlot() {
  hideOtherChartStuff("temperatureStripPlot");

  updateTitle("Whip snakes like it hot");
  snekSimulation
    .force("forceX", null)
    .force("forceY", null)
    .force("charge", null);
  // .force("collide", null);

  const jitter = (i) => {
    return i % 2 === 0 ? 2 : -2; // try to minimise spinning nodes without pushing nodes off grid lines
  };

  snekSimulation
    .force(
      "forceX",
      d3.forceX((d) => temperatureScale(d[metricTempProp])).strength(0.9)
    )
    .force(
      "forceY",
      d3
        .forceY((d, i) => speciesBandScale(d[metricSpeciesProp]) + jitter(i))
        .strength(0.9)
    )
    // .force("charge", null)
    // .force("charge", d3.forceManyBody().strength(-2)) // try to minimise spinning nodes without pushing nodes off grid lines
    .force("collide", d3.forceCollide(circleRadius).strength(1));

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) => temperatureColorScale(d[metricTempProp]))
    .attr("opacity", 1);

  d3.select(".strip-plot-x-temperature").transition().attr("opacity", 1);
  d3.select(".strip-plot-y").transition().attr("opacity", 1);
  d3.select(".strip-plot-y-grid-lines").transition().attr("opacity", 1);
  reheatSimulation();
}

function timeline() {
  hideOtherChartStuff("timeline");

  updateTitle("On average, I've seen a snake every two and a half weeks");
  snekSimulation
    // .force("forceX", d3.forceX(focalPointX).strength(1.55))
    .force("forceX", d3.forceX(xWiggle).strength(1))
    .force("forceY", d3.forceY((d) => timeScale(d[metricDateProp])).strength(1))
    .force("charge", d3.forceManyBody().strength(snekChargeStrengthTimeline))
    .force("collide", null);
  // .force("collide", d3.forceCollide((_d) => circleRadius).strength(1));

  sneks
    .attr("opacity", 0)
    .transition()
    .duration(200)
    .attr("fill", (d) => {
      return speciesColorScale(d.speciesBestGuess);
    })
    .transition()
    .duration(10)
    .delay((d) => accelerate(timeDelayScale(d[metricDateProp])))
    .attr("opacity", 1);

  d3.select(".timeline-y-axis").transition().attr("opacity", 1);
  reheatSimulation();
}

function seasons() {
  hideOtherChartStuff("seasons");

  updateTitle("Fewer snek in Winter");
  snekSimulation
    .force(
      "forceX",
      d3
        .forceX((d) => seasonScale(getSeason(d[metricDateProp].getMonth())))
        .strength(1)
    )
    .force("forceY", d3.forceY(focalPointY).strength(0.3))
    .force("charge", null)
    // .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    // .force("collide", null);
    .force("collide", d3.forceCollide((_d) => circleRadius).strength(1));

  addVisibleSpeciesColors(1);

  d3.select(".seasons-axis").transition().attr("opacity", 1);
  reheatSimulation();
}

function staringContest() {
  hideOtherChartStuff("staringContest");

  updateTitle("I won a staring contest with a noodle boi");
  snekSimulation
    .force(
      "forceX",
      d3.forceX((d) => watchingMeScale(watchingMeGroup(d))).strength(1)
    )
    .force("forceY", d3.forceY(focalPointY).strength(0.3))
    .force("charge", null)
    // .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    // .force("collide", null);
    .force("collide", d3.forceCollide((_d) => circleRadius).strength(1));

  addVisibleSpeciesColors(1);

  d3.select(".watching-me-axis").transition().attr("opacity", 1);
  reheatSimulation();
}

function venom() {
  hideOtherChartStuff("venom");

  updateTitle("Are they venomous?");

  const jitter = (d) => {
    return d[metricSpeciesProp] === "Keelback"
      ? -10
      : d[metricSpeciesProp] === "Common tree snake"
      ? 16
      : d[metricSpeciesProp] === "Carpet python"
      ? 18
      : 0;
  };

  snekSimulation
    .force(
      "forceX",
      d3
        .forceX((d) => venomScale(metricVenomAccessor(d)) + jitter(d) * 0.5)
        .strength(1)
    )
    .force("forceY", d3.forceY((d) => focalPointY + jitter(d)).strength(0.3))
    .force("charge", null)
    // .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    // .force("collide", null);
    .force("collide", d3.forceCollide((_d) => circleRadius).strength(1));

  addVisibleSpeciesColors((d) =>
    metricVenomAccessor(d) === "unknown" ? 0.2 : 1
  );

  d3.select(".venom-axis").transition().attr("opacity", 1);
  reheatSimulation();
}

function mating() {
  hideOtherChartStuff("mating");

  updateTitle("Caught in the act!");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors((d) => (d["mating"] === "mating" ? 1 : 0.2));

  d3.selectAll(
    ".annotation-connector-smoochy-matingSnakeOne,.annotation-connector-smoochy-matingSnakeTwo"
  )
    .raise()
    .transition()
    .attr("opacity", 1);

  d3.select(".annotation-label-smoochy")
    .text(annotations.mating.labels[0].text)
    .attr("x", annotations.mating.labels[0].labelX)
    .attr("y", annotations.mating.labels[0].labelY)
    .attr("text-anchor", "middle")
    .style("font-family", chartTextFamily)
    .style("font-size", chartTextSize)
    .style("font-weight", chartTextWeight)
    .attr("opacity", 1)
    .transition();

  d3.selectAll(
    `path[data-id="${matingSnakeOne.id}"],path[data-id="${matingSnakeTwo.id}"]`
  ).raise();

  reheatSimulation();
}

function courting() {
  hideOtherChartStuff("courting");

  updateTitle("Separated by a roller door!");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors((d) => (d["mating"] === "probably" ? 1 : 0.2));

  d3.selectAll(
    ".annotation-connector-snuggle-courtingSnakeOne, .annotation-connector-snuggle-courtingSnakeTwo"
  )
    .raise()
    .transition()
    .attr("opacity", 1);

  d3.select(".annotation-label-snuggle")
    .text(annotations.courting.labels[0].text)
    .attr("x", annotations.courting.labels[0].labelX)
    .attr("y", annotations.courting.labels[0].labelY)
    .attr("text-anchor", "middle")
    .style("font-family", chartTextFamily)
    .style("font-size", chartTextSize)
    .style("font-weight", chartTextWeight)
    .attr("opacity", 1)
    .transition();

  d3.selectAll(
    `path[data-id="${courtingSnakeOne.id}"],path[data-id="${matingSnakeTwo.id}"]`
  ).raise();

  reheatSimulation();
}

function flying() {
  hideOtherChartStuff("flying");

  updateTitle("Hungry birbs");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors((d) => (d["attackedByBirds"] === "no" ? 0.2 : 1));

  d3.select(".annotation-connector-flying-flyingSnake")
    .raise()
    .transition()
    .attr("opacity", 1);

  d3.select(".annotation-label-flying")
    .text(annotations.flying.labels[0].text)
    .attr("x", annotations.flying.labels[0].labelX)
    .attr("y", annotations.flying.labels[0].labelY)
    .attr("text-anchor", "middle")
    .style("font-family", chartTextFamily)
    .style("font-size", chartTextSize)
    .style("font-weight", chartTextWeight)
    .attr("opacity", 1)
    .transition();

  d3.select(`path[data-id="${flyingSnake.id}"]`).raise();

  reheatSimulation();
}

function magpies() {
  hideOtherChartStuff("magpies");

  updateTitle("Hungry birbs");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors((d) => (d["attackedByBirds"] === "no" ? 0.2 : 1));

  d3.select(".annotation-connector-gulped-magpiesSnake")
    .raise()
    .transition()
    .attr("opacity", 1);

  d3.select(".annotation-label-gulped")
    .text(annotations.magpies.labels[0].text)
    .attr("x", annotations.magpies.labels[0].labelX)
    .attr("y", annotations.magpies.labels[0].labelY)
    .attr("text-anchor", "middle")
    .style("font-family", chartTextFamily)
    .style("font-size", chartTextSize)
    .style("font-weight", chartTextWeight)
    .attr("opacity", 1)
    .transition();

  d3.select(`path[data-id="${magpiesSnake.id}"]`).raise();

  reheatSimulation();
}

function butcherBirds() {
  hideOtherChartStuff("butcherBirds");

  updateTitle("Hungry birbs");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors((d) => (d["attackedByBirds"] === "no" ? 0.2 : 1));

  d3.select(".annotation-connector-cowering-butcherBirdsSnake")
    .raise()
    .transition()
    .attr("opacity", 1);

  d3.select(".annotation-label-cowering")
    .text(annotations.butcherBirds.labels[0].text)
    .attr("x", annotations.butcherBirds.labels[0].labelX)
    .attr("y", annotations.butcherBirds.labels[0].labelY)
    .attr("text-anchor", "middle")
    .style("font-family", chartTextFamily)
    .style("font-size", chartTextSize)
    .style("font-weight", chartTextWeight)
    .attr("opacity", 1)
    .transition();

  d3.select(`path[data-id="${butcherBirdsSnake.id}"]`).raise();

  reheatSimulation();
}

function defensive() {
  hideOtherChartStuff("defensive");

  updateTitle("This red belly flattened its neck at me from 3m away");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors((d) => (d["watchingMe"] === "flattened" ? 1 : 0.2));

  reheatSimulation();
}

function chill() {
  hideOtherChartStuff("chill");

  updateTitle("Bend frends");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors((d) => (!didChill(d) ? 0.2 : 1));

  reheatSimulation();
}

function fled() {
  hideOtherChartStuff("fled");

  updateTitle("I'm scary");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors((d) => (!didFlee(d) ? 0.2 : 1));

  reheatSimulation();
}

function attacked() {
  hideOtherChartStuff("attacked");

  updateTitle("Zero snakes have attacked me");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors(0.2);

  reheatSimulation();
}

function onCamera() {
  hideOtherChartStuff("onCamera");

  updateTitle("Photographic proof!");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors((d) => (d["onCamera"] === "no" ? 0.2 : 1));

  reheatSimulation();
}

function climbing() {
  hideOtherChartStuff("climbing");

  updateTitle("Tree snakes zoom up trees");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors((d) => (d["climbing"] === "not climbing" ? 0.2 : 1));

  reheatSimulation();
}

function yard() {
  hideOtherChartStuff("yard");

  updateTitle("Too close to home");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors((d) => (d["room"] === "elsewhere" ? 0.2 : 1));

  reheatSimulation();
}

function all() {
  hideOtherChartStuff("all");

  updateTitle("They're all good snakes, mate");
  addPointsOfInterestBlobForces();
  addVisibleSpeciesColors(1);

  reheatSimulation();
}

function fin() {
  hideOtherChartStuff("fin");
  chartTitle.text("");
  chartTitle.attr("opacity", 0);
  sneks.transition().duration(200).attr("opacity", 0);
}

function scCount() {
  hideOtherChartStuff("scCount");

  updateTitle("Many hazard spaghetti");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", 1)
    .attr("stroke-dasharray", null)
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("fill", "#fff")
        .attr("opacity", 1)
        .attr("stroke", circleStroke)
        .transition()
        .duration(morphDuration)
        .attr("d", circlePath)
        .attr("stroke-width", 1);
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("opacity", 0)
        .attr("stroke", circleStroke)
        .transition()
        .duration(morphDuration)
        .attr("d", circlePath)
        .attr("stroke-width", 1);
    });

  reheatSimulation();
}

function scSeenSpecies() {
  hideOtherChartStuff("scSeenSpecies");

  updateTitle("Gotta catch 'em all!");

  // const seenSnakeSpeciesWithMatchingNamingConvention = [
  //   "Red-bellied Black Snake", // "Snake" included here
  //   "Keelback",
  //   "Yellow-faced Whipsnake", // "Whipsnake" 1 word instead of 2 here
  //   "Eastern Small-eyed Snake", // title cased
  //   "Common Tree Snake", // title cased
  //   "Marsh Snake", // title cased
  //   "Carpet Python", // title cased
  // ];

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("stroke", circleStroke)
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", null)
    .attr("opacity", 1)
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("fill", "#fff")
        .attr("opacity", 1)
        .attr("stroke", circleStroke)
        .transition()
        .duration(morphDuration)
        .attr("d", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? speciesSnakePath
            : circlePath
        )
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? snakeShapeStrokeWidth
            : 1
        );
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("opacity", 0)
        .attr("stroke", circleStroke)
        .transition()
        .duration(morphDuration)
        .attr("d", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? speciesSnakePath
            : circlePath
        )
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? 2
            : 1
        );
    });

  reheatSimulation();
}

function scVenomQuestion() {
  hideOtherChartStuff("scVenomQuestion");

  updateTitle("Not actually murder noodles?");

  // const seenSnakeSpeciesWithMatchingNamingConvention = [
  //   "Red-bellied Black Snake", // "Snake" included here
  //   "Keelback",
  //   "Yellow-faced Whipsnake", // "Whipsnake" 1 word instead of 2 here
  //   "Eastern Small-eyed Snake", // title cased
  //   "Common Tree Snake", // title cased
  //   "Marsh Snake", // title cased
  //   "Carpet Python", // title cased
  // ];

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("stroke", circleStroke)
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", null)
    .attr("opacity", 1)
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("fill", "#fff")
        .attr("opacity", 1)
        .attr("stroke", circleStroke)
        .transition()
        .duration(morphDuration)
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        );
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("opacity", 0)
        .attr("stroke", circleStroke)
        .transition()
        .duration(morphDuration)
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        );
    });

  reheatSimulation();
}

function scNonVenomous() {
  hideOtherChartStuff("scNonVenomous");

  updateTitle("Shabby fangs");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", 1)
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("fill", "#fff")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", (d) =>
          ["non venomous"].includes(d[metricSpeciesVenomProp]) ? 1 : opacityFade
        );
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", (d) =>
          ["non venomous"].includes(d[metricSpeciesVenomProp]) ? 1 : 0
        );
    });

  reheatSimulation();
}

function scWeaklyVenomous() {
  hideOtherChartStuff("scWeaklyVenomous");

  updateTitle("Weak sauce");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", 1)
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("fill", "#fff")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", (d) =>
          ["weakly venomous"].includes(d[metricSpeciesVenomProp])
            ? 1
            : opacityFade
        );
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", (d) =>
          ["weakly venomous"].includes(d[metricSpeciesVenomProp]) ? 1 : 0
        );
    });

  reheatSimulation();
}

function scMildlyVenomous() {
  hideOtherChartStuff("scMildlyVenomous");

  updateTitle("A bit nippy");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", 1)
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("fill", "#fff")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", (d) =>
          ["mildly venomous"].includes(d[metricSpeciesVenomProp])
            ? 1
            : opacityFade
        );
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", (d) =>
          ["mildly venomous"].includes(d[metricSpeciesVenomProp])
            ? 1
            : ["weakly venomous"].includes(d[metricSpeciesVenomProp])
            ? opacityFade
            : 0
        );
    });

  reheatSimulation();
}

function scModeratelyVenomous() {
  hideOtherChartStuff("scModeratelyVenomous");

  updateTitle("A bit nippy");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", 1)
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("fill", "#fff")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", (d) =>
          ["moderately venomous"].includes(d[metricSpeciesVenomProp])
            ? 1
            : opacityFade
        );
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", (d) =>
          ["moderately venomous"].includes(d[metricSpeciesVenomProp])
            ? 1
            : ["mildly venomous", "weakly venomous"].includes(
                d[metricSpeciesVenomProp]
              )
            ? opacityFade
            : 0
        );
    });

  reheatSimulation();
}

function scVenom() {
  hideOtherChartStuff("scVenom");

  updateTitle("So much hurt juice");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", 1)
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("fill", "#fff")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", (d) =>
          [
            "potentially dangerous",
            "dangerously venomous",
            "highly venomous",
          ].includes(d[metricSpeciesVenomProp])
            ? 1
            : opacityFade
        );
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", (d) =>
          [
            "potentially dangerous",
            "dangerously venomous",
            "highly venomous",
          ].includes(d[metricSpeciesVenomProp])
            ? 1
            : [
                "moderately venomous",
                "mildly venomous",
                "weakly venomous",
              ].includes(d[metricSpeciesVenomProp])
            ? opacityFade
            : 0
        );
    });

  reheatSimulation();
}

function scSeaSnakes() {
  hideOtherChartStuff("scSeaSnakes");

  updateTitle("Sea snakes");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", (d) =>
      d[metricSpeciesGroupProp].includes("Sea Snakes") ? 1 : opacityFade
    )
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("d", circlePath)
        .attr("fill", (d) =>
          d[metricSpeciesGroupProp].includes("Sea Snakes")
            ? speciesGroupColorScale(d[metricSpeciesGroupProp])
            : "#fff"
        )
        .attr("opacity", 1);
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", 1);
    });

  reheatSimulation();
}

function scBlindSnakes() {
  hideOtherChartStuff("scBlindSnakes");

  updateTitle("Blind snakes");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", (d) =>
      d[metricSpeciesGroupProp].includes("Blind Snakes") ? 1 : opacityFade
    )
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("d", circlePath)
        .attr("fill", (d) =>
          d[metricSpeciesGroupProp].includes("Sea Snakes") ||
          d[metricSpeciesGroupProp].includes("Blind Snakes")
            ? speciesGroupColorScale(d[metricSpeciesGroupProp])
            : "#fff"
        )
        .attr("opacity", 1);
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", 1);
    });

  reheatSimulation();
}

function scPythons() {
  hideOtherChartStuff("scPythons");

  updateTitle("Pythons");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", (d) =>
      d[metricSpeciesGroupProp].includes("Pythons") ? 1 : opacityFade
    )
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("d", circlePath)
        .attr("fill", (d) =>
          d[metricSpeciesGroupProp].includes("Sea Snakes") ||
          d[metricSpeciesGroupProp].includes("Blind Snakes") ||
          d[metricSpeciesGroupProp].includes("Pythons")
            ? speciesGroupColorScale(d[metricSpeciesGroupProp])
            : "#fff"
        )
        .attr("opacity", 1);
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", 1);
    });

  reheatSimulation();
}

function scRearFangedSnakes() {
  hideOtherChartStuff("scRearFangedSnakes");

  updateTitle("Tree & water snakes");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", (d) =>
      d[metricSpeciesGroupProp].includes("Rear") ? 1 : opacityFade
    )
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("d", circlePath)
        .attr("fill", (d) =>
          d[metricSpeciesGroupProp].includes("Sea Snakes") ||
          d[metricSpeciesGroupProp].includes("Blind Snakes") ||
          d[metricSpeciesGroupProp].includes("Pythons") ||
          d[metricSpeciesGroupProp].includes("Rear")
            ? speciesGroupColorScale(d[metricSpeciesGroupProp])
            : "#fff"
        )
        .attr("opacity", 1);
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", 1);
    });

  reheatSimulation();
}

function scLandSnakes() {
  hideOtherChartStuff("scLandSnakes");

  updateTitle("Land snakes");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", (d) =>
      d[metricSpeciesGroupProp].includes("Terrestrial") ? 1 : opacityFade
    )
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("d", circlePath)
        .attr("fill", (d) => speciesGroupColorScale(d[metricSpeciesGroupProp]))
        .attr("opacity", 1);
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("d", circlePath)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Common Tree") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        )
        .attr("stroke", circleStroke)
        .attr("opacity", 1);
    });

  reheatSimulation();
}

function scSpecies() {
  hideOtherChartStuff("scSpecies");

  updateTitle("And that's that");

  scSpeciesNodes
    .transition()
    .duration(200)
    .attr("opacity", 1)
    .call((g) => {
      g.selectAll("path.species--fill")
        .attr("d", circlePath)
        .attr("fill", (d) => speciesGroupColorScale(d[metricSpeciesGroupProp]))
        .attr("opacity", 1);
    })
    .call((g) => {
      g.selectAll("path.species--pattern")
        .attr("d", circlePath)
        .attr("opacity", 1)
        // .attr("stroke", circleStroke);
        .attr("stroke", circleStroke)
        .attr("stroke-width", (d) =>
          d.species.includes("Yellow-faced") ||
          d.species.includes("Red-bellied") ||
          d.species.includes("Marsh") ||
          d.species.includes("Carpet") ||
          d.species.includes("Small-eyed") ||
          d.species.includes("Keelback")
            ? seenStrokeWidth
            : 1
        );
    });

  reheatSimulation();
}

function first() {
  hideOtherChartStuff("first");
  // chartTitle.text("");
  // chartTitle.attr("opacity", 0);
  // sneks.transition().duration(200).attr("opacity", 0);
}

function hideOtherChartStuff(stepFunctionName) {
  // if (stepFunctionName === "first") {
  //   sneks.transition().duration(200).attr("opacity", 0);
  //   chartTitle.transition().duration(200).attr("opacity", 0).text("");
  // }

  if (
    ![
      "temperatureStripPlot",
      "timeOfDayStripPlot",
      "weatherStripPlot",
    ].includes(stepFunctionName)
  ) {
    svg.select(".strip-plot-y").transition().attr("opacity", 0);
    svg.select(".strip-plot-y-grid-lines").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "temperatureStripPlot") {
    svg.select(".strip-plot-x-temperature").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "weatherStripPlot") {
    svg.select(".strip-plot-x-weather").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "timeOfDayStripPlot") {
    svg.select(".strip-plot-x-time-of-day").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "timeline") {
    svg.select(".timeline-y-axis").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "seasons") {
    svg.select(".seasons-axis").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "watchingMe") {
    svg.select(".watching-me-axis").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "venom") {
    svg.select(".venom-axis").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "mating") {
    svg
      .select(".annotation-connector-smoochy-matingSnakeOne")
      .transition()
      .attr("opacity", 0);
    svg
      .select(".annotation-connector-smoochy-matingSnakeTwo")
      .transition()
      .attr("opacity", 0);
    svg.select(".annotation-label-smoochy").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "courting") {
    svg
      .select(".annotation-connector-snuggle-courtingSnakeOne")
      .transition()
      .attr("opacity", 0);
    svg
      .select(".annotation-connector-snuggle-courtingSnakeTwo")
      .transition()
      .attr("opacity", 0);
    svg.select(".annotation-label-snuggle").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "butcherBirds") {
    svg
      .select(".annotation-connector-cowering-butcherBirdsSnake")
      .transition()
      .attr("opacity", 0);
    svg.select(".annotation-label-cowering").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "magpies") {
    svg
      .select(".annotation-connector-gulped-magpiesSnake")
      .transition()
      .attr("opacity", 0);
    svg.select(".annotation-label-gulped").transition().attr("opacity", 0);
  }

  if (stepFunctionName !== "flying") {
    svg
      .select(".annotation-connector-flying-flyingSnake")
      .transition()
      .attr("opacity", 0);
    svg.select(".annotation-label-flying").transition().attr("opacity", 0);
  }

  if (sunnyCoastSpeciesStepNames.includes(stepFunctionName)) {
    sneks.transition().attr("opacity", 0);
  }
  if (sightingsStepNames.includes(stepFunctionName)) {
    scSpeciesNodes.transition().attr("opacity", 0);
  }
}

function onMouseEnter(_event, d) {
  console.log(d);
  // console.log([d.temp, d.speciesBestGuess]);
  // console.log([d3.timeFormat("%d %b %Y")(d.date), d.speciesBestGuess]);
}

function onMouseEnterSpecies(_event, d) {
  console.log(d.species);
  // console.log([d.temp, d.speciesBestGuess]);
  // console.log([d3.timeFormat("%d %b %Y")(d.date), d.speciesBestGuess]);
}

function splitSpeciesLabels(species) {
  const speciesLabelParts = {
    "Yellow-faced whip snake": ["Yellow-faced", "whip snake"],
    "Eastern small-eyed snake": ["Small-eyed", "snake"],
    "Red-bellied black": ["Red-bellied", "black"],
    "Common tree snake": ["Common tree", "snake"],
  };
  return speciesLabelParts[species] ?? [species];
}

function getLabelPartYShift(_d, i, labelParts) {
  return labelParts.length === 1 ? "0.32em" : i < 1 ? "-0.32em" : "1em";
}

function init() {
  setupScales();
  setupChart();
  setupAxes();
  setupAnnotations();
  setupPointsOfInterestDataPoints();

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller
    .setup({
      step: "#scrolly article .step",
      offset: "220px", // 0.33,
      debug: false,
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);
}

const monthIndexToSeason = {
  0: "Summer",
  1: "Summer",
  2: "Autumn",
  3: "Autumn",
  4: "Autumn",
  5: "Winter",
  6: "Winter",
  7: "Winter",
  8: "Spring",
  9: "Spring",
  10: "Spring",
  11: "Summer",
};
function getSeason(zeroIndexedMonth) {
  return monthIndexToSeason[zeroIndexedMonth];
}

function xWiggle(_d, i) {
  // return 5 * Math.sin(i % 4) + focalPointX;
  return focalPointX;
}

function accelerate(delay) {
  const max = timeDelayScale.range()[1];
  const delayDecimal = delay / max;
  const customEaseOut = 1 - Math.pow(1 - delayDecimal, 6);
  const easedDelay = customEaseOut * max;
  return easedDelay;
}

function getQuadraticBezierCurveControlPoint(
  startX,
  startY,
  endX,
  endY,
  distance
) {
  const midPointX = (startX + endX) / 2;
  const midPointY = (startY + endY) / 2;
  const angle = Math.atan2(endY - startY, endX - startX);
  const controlPointX = -Math.sin(angle) * distance + midPointX;
  const controlPointY = Math.cos(angle) * distance + midPointY;
  return [controlPointX, controlPointY];
}

function updateAnnotationConnectors() {
  if (activeStepFunctionName === "mating") {
    updateConnectorPaths(
      annotations.mating.labels[0],
      matingSnakeOne,
      annotations.mating.connectors[0],
      ".annotation-connector-smoochy-matingSnakeOne"
    );

    updateConnectorPaths(
      annotations.mating.labels[0],
      matingSnakeTwo,
      annotations.mating.connectors[1],
      ".annotation-connector-smoochy-matingSnakeTwo"
    );
  }

  if (activeStepFunctionName === "courting") {
    updateConnectorPaths(
      annotations.courting.labels[0],
      courtingSnakeOne,
      annotations.courting.connectors[0],
      ".annotation-connector-snuggle-courtingSnakeOne"
    );

    updateConnectorPaths(
      annotations.courting.labels[0],
      courtingSnakeTwo,
      annotations.courting.connectors[1],
      ".annotation-connector-snuggle-courtingSnakeTwo"
    );
  }

  if (activeStepFunctionName === "flying") {
    updateConnectorPaths(
      annotations.flying.labels[0],
      flyingSnake,
      annotations.flying.connectors[0],
      ".annotation-connector-flying-flyingSnake"
    );
  }

  if (activeStepFunctionName === "magpies") {
    updateConnectorPaths(
      annotations.magpies.labels[0],
      magpiesSnake,
      annotations.magpies.connectors[0],
      ".annotation-connector-gulped-magpiesSnake"
    );
  }

  if (activeStepFunctionName === "butcherBirds") {
    updateConnectorPaths(
      annotations.butcherBirds.labels[0],
      butcherBirdsSnake,
      annotations.butcherBirds.connectors[0],
      ".annotation-connector-cowering-butcherBirdsSnake"
    );
  }
}

function updateConnectorPaths(label, snake, connector, selector) {
  const [controlPointX, controlPointY] = getQuadraticBezierCurveControlPoint(
    label.labelX,
    label.labelY,
    snake.x,
    snake.y,
    connector.distance
  );

  d3.select(selector)
    .attr(
      "d",
      `M${label.labelX} ${label.labelY + label.paddingY}
        Q${controlPointX},${controlPointY} ${
        snake.x + connector.snakeXOffset
      },${snake.y + connector.snakeYOffset}`
    )
    .attr("marker-end", `url(${new URL("#arrow-head", window.location)})`);
}

function addSpeciesBlobForces() {
  addBlobForces(snekSpeciesRadius);
}

function addPointsOfInterestBlobForces() {
  addBlobForces(circleRadius * 1.25);
}

function addBlobForces(radius) {
  snekSimulation
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            radius *
              Math.sin(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointX
        )
        .strength((d) => (d["mating"] === "no mating" ? 0.8 : 1))
    )
    .force(
      "forceY",
      d3
        .forceY(
          (d) =>
            radius *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength((d) => (d["mating"] === "no mating" ? 0.8 : 1))
    )
    // .force("charge", null)
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    // .force("collide", null);
    .force("collide", d3.forceCollide((_d) => circleRadius).strength(1));
}

function addVisibleSpeciesColors(opacityFnOrNumber) {
  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) => {
      return speciesColorScale(d.speciesBestGuess);
    })
    .attr("opacity", opacityFnOrNumber);
}

function updateTitle(title) {
  if (chartTitle.text() !== title) {
    chartTitle
      .transition()
      .duration(250)
      .style("opacity", 0)
      .transition()
      .duration(250)
      .text(title)
      .style("opacity", 1);
  }
}

function reheatSimulation() {
  snekSimulation.alpha(0.9).restart();
}

const venomTextures = {
  "highly venomous": textureHighlyVenomous.url(),
  "dangerously venomous": textureHighlyVenomous.url(),
  "potentially dangerous": textureHighlyVenomous.url(),
  "moderately venomous": textureVenomous.url(),
  "mildly venomous": textureMildlyVenomous.url(),
  "weakly venomous": textureWeaklyVenomous.url(),
  "non venomous": "transparent",
  harmless: "transparent",
};
function getVenomPatternFill(d) {
  return venomTextures[d[metricSpeciesVenomProp]] || "transparent";
}

loadData();
