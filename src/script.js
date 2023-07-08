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
// const circleStroke = "#525252";
const snekChargeStrength = -180;
const snekChargeStrength2 = -20;
const hideOffscreen = 80;
const goldenRatio = 1.618;
const focalPointX = width / 2;
const focalPointY = height / goldenRatio / goldenRatio;
const opacityFade = 0.2;

const speciesRadius = 50;
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
let sightingsData = null;

let speciesAngleScale = null;
let speciesColorScale = null;
let speciesBandScale = null;

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

function handleStepEnter(response) {
  // console.log(response);
  // response = { element, direction, index }

  // add color to current step only
  step.classed("is-active", function (_d, i) {
    return i === response.index;
  });

  // update graphic based on step
  const stepFunctionName = response.element.getAttribute("data-step-function");
  const stepFunctions = {
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
    birds,
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
  }).then((data) => {
    sightingsData = data.filter((d) => d.family !== "Pygopodidae"); // Legless lizards
    // console.log(sightingsData.map((d) => d.date));
    // console.log(sightingsData);
    // console.log(sightingsData.map((d) => d.temp).sort());
    // console.log(d3.extent(sightingsData, (d) => d.temp));

    setTimeout(init(), 0);
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

  nodes = svg.selectAll("circle").data(sightingsData);

  sneks = nodes
    .join("path")
    .attr(
      "d",
      "M22.8819 19.0069C22.6277 18.8795 21.9072 19.8292 21.7507 19.9716C21.2779 20.4027 20.7026 20.798 20.0531 20.8372C18.5508 20.9275 17.9932 19.2473 17.5753 18.0835C16.5942 15.3714 14.4843 12.6244 11.3384 14.1877C10.0127 14.8466 9.17201 16.1462 8.43054 17.4037C7.96011 18.2001 7.23317 19.9633 6.16329 20.0374C4.80457 20.1315 3.98801 18.7591 4.11631 17.4891C4.26154 16.05 5.35722 15.0128 6.34479 14.1064C8.41842 12.2037 10.5743 10.6833 11.2294 7.74472C11.8991 4.73821 10.5025 1.53632 7.56559 0.563717C6.47872 0.204233 4.66742 -0.792936 2.91572 1.23473C-0.079291 4.70029 2.46145 4.35871 3.36272 4.32707C6.39242 4.22043 7.67932 4.80899 7.25329 6.46016C7.11536 6.99331 6.80792 7.5394 6.50537 7.91928C6.3117 8.1792 5.47017 8.99721 5.09744 9.33171C4.24783 10.0944 3.38697 10.8483 2.6051 11.686C1.1504 13.2434 0.0732516 15.1294 0.00306388 17.3424C-0.132499 21.5919 4.2551 25.6969 8.27319 23.2818C10.1701 22.1417 10.8478 19.9462 11.9007 18.1006C12.3397 17.3304 13.1521 16.3286 14.0703 17.1062C14.832 17.7552 15.221 18.8586 15.684 19.7295C16.5716 21.3982 18.0925 22.9273 20.1128 22.5112C21.0826 22.3112 21.8967 21.639 22.414 20.7842C22.5447 20.5677 23.2829 19.2006 22.8819 19.0069Z"
    )
    .attr("fill", (d) => speciesColorScale(d.speciesBestGuess))
    // .attr("opacity", 0)
    // .attr("opacity", 0.8)
    // .attr("style", "mix-blend-mode: color-dodge")
    .attr(
      "transform",
      (_d, i) => `translate(${leftPad + i * circleSpacing}, ${height - 10})`
    )
    .attr("stroke-width", 1)
    .attr("stroke", circleStroke);

  sneks.on("mouseenter", onMouseEnter);

  simulation = d3.forceSimulation(sightingsData);

  simulation.on("tick", () => {
    sneks.attr(
      "transform",
      (d) => `translate(${d.x - circleRadius}, ${d.y - circleRadius})`
    );

    const matingSnakes = sightingsData.filter((d) => d["mating"] === "mating");
    const matingSnakeOne = matingSnakes.slice(0, 1)[0];
    const matingSnakeTwo = matingSnakes.slice(1, 2)[0];

    const startX = 60,
      startY = 120,
      endX = matingSnakeOne.x - circleRadius,
      endY = matingSnakeOne.y - circleRadius * 1.5,
      centrePointX = (startX + endX) / 2,
      centrePointY = (startY + endY) / 2,
      angle = Math.atan2(endY - startY, endX - startX),
      dist = -30;
    const arcControlPointX = -Math.sin(angle) * dist + centrePointX;
    const arcControlPointY = Math.cos(angle) * dist + centrePointY;

    const startX2 = 60,
      startY2 = 120,
      endX2 = matingSnakeTwo.x - circleRadius,
      endY2 = matingSnakeTwo.y - circleRadius * 1.5,
      centrePointX2 = (startX2 + endX2) / 2,
      centrePointY2 = (startY2 + endY2) / 2,
      angle2 = Math.atan2(endY2 - startY2, endX2 - startX2),
      dist2 = -30;
    const arcControlPointX2 = -Math.sin(angle2) * dist2 + centrePointX2;
    const arcControlPointY2 = Math.cos(angle2) * dist2 + centrePointY2;

    d3.select(".annotation-stem-one")
      .attr(
        "d",
        `M60 125Q${arcControlPointX},${arcControlPointY} ${endX},${endY}`
      )
      .attr("marker-end", `url(${new URL("#arrow-one", window.location)})`);

    d3.select(".annotation-stem-two")
      .attr(
        "d",
        `M60 125Q${arcControlPointX2},${arcControlPointY2} ${endX2},${endY2}`
      )
      .attr("marker-end", `url(${new URL("#arrow-one", window.location)})`);

    // d3.select(".annotation-stem-one").attr(
    //   "d",
    //   `M60 125L${matingSnakeOne.x - circleRadius},${
    //     matingSnakeOne.y - circleRadius
    //   }`
    // );
    // d3.select(".annotation-stem-two").attr(
    //   "d",
    //   `M60 125L${matingSnakeTwo.x - circleRadius},${
    //     matingSnakeTwo.y - circleRadius
    //   }`
    // );
  });

  simulation.stop();

  simulation
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
            speciesRadius *
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
            speciesRadius *
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

  simulation.restart();
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

  svg
    .append("path")
    .attr("class", "annotation-stem-one")
    .attr("opacity", 0)
    .attr("fill", "none")
    .attr("stroke", "#3C3941")
    .attr("stroke-width", 2);

  svg
    .append("path")
    .attr("class", "annotation-stem-two")
    .attr("opacity", 0)
    .attr("fill", "none")
    .attr("stroke", "#3C3941")
    .attr("stroke-width", 2);

  svg
    .append("text")
    .attr("class", "annotation-label")
    .attr("opacity", 0)
    .attr("stroke", "none")
    .attr("fill", "#3C3941");

  svg
    .append("defs")
    .selectAll("marker")
    .data([0])
    .join("marker")
    .attr("id", "arrow-one")
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

function species() {
  hideOtherChartStuff("species");

  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("All species")
    .style("opacity", 1);

  simulation
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            speciesRadius *
              Math.sin(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointX
        )
        .strength(1)
    )
    // .force("forceY", d3.forceY(focalPointY));
    .force(
      "forceY",
      d3
        .forceY(
          (d) =>
            speciesRadius *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    .force("collide", null);

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) => speciesColorScale(d[metricSpeciesProp]))
    .attr("opacity", 1);

  reheatSimulation();
}

function yellowFacedWhipSnake() {
  hideOtherChartStuff("yellowFacedWhipSnake");

  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Yellow-faced whip snakes")
    .style("opacity", 1);

  simulation
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            speciesRadius *
              Math.sin(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointX
        )
        .strength(1)
    )
    // .force("forceY", d3.forceY(focalPointY));
    .force(
      "forceY",
      d3
        .forceY(
          (d) =>
            speciesRadius *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    .force("collide", null);
  // .force(
  //   "collide",
  //   d3.forceCollide((d) =>
  //     d[metricSpeciesProp] === "Yellow-faced whip snake" ? circleRadius : 0
  //   )
  // );

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) =>
      d[metricSpeciesProp] === "Yellow-faced whip snake"
        ? speciesColorScale(d[metricSpeciesProp])
        : "#fff"
    )
    .attr("opacity", (d) =>
      d[metricSpeciesProp] === "Yellow-faced whip snake" ? 1 : opacityFade
    );

  reheatSimulation();
}

function redBelly() {
  hideOtherChartStuff("redBelly");
  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Red-bellied black snake")
    .style("opacity", 1);

  simulation
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            speciesRadius *
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
            speciesRadius *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    .force("collide", null);
  // .force(
  //   "collide",
  //   d3.forceCollide((d) =>
  //     d[metricSpeciesProp] === "Red-bellied black" ? circleRadius : 0
  //   )
  // );

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) =>
      d[metricSpeciesProp] === "Red-bellied black"
        ? speciesColorScale(d[metricSpeciesProp])
        : "#fff"
    )
    .attr("opacity", (d) =>
      d[metricSpeciesProp] === "Red-bellied black" ? 1 : opacityFade
    );

  reheatSimulation();
}

function commonTreeSnake() {
  hideOtherChartStuff("commonTreeSnake");
  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Common tree snake")
    .style("opacity", 1);

  simulation
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            speciesRadius *
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
            speciesRadius *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    .force("collide", null);
  // .force(
  //   "collide",
  //   d3.forceCollide((d) =>
  //     d[metricSpeciesProp] === "Keelback" ? circleRadius : 0
  //   )
  // );

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) =>
      d[metricSpeciesProp] === "Common tree snake"
        ? speciesColorScale(d[metricSpeciesProp])
        : "#fff"
    )
    .attr("opacity", (d) =>
      d[metricSpeciesProp] === "Common tree snake" ? 1 : opacityFade
    );

  reheatSimulation();
}

function easternSmallEyedSnake() {
  hideOtherChartStuff("easternSmallEyedSnake");
  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Eastern small-eyed snakes")
    .style("opacity", 1);

  simulation
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            speciesRadius *
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
            speciesRadius *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    .force("collide", null);
  // .force(
  //   "collide",
  //   d3.forceCollide((d) =>
  //     d[metricSpeciesProp] === "Eastern small-eyed snakes" ? circleRadius : 0
  //   )
  // );

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) =>
      d[metricSpeciesProp] === "Eastern small-eyed snake"
        ? speciesColorScale(d[metricSpeciesProp])
        : "#fff"
    )
    .attr("opacity", (d) =>
      d[metricSpeciesProp] === "Eastern small-eyed snake" ? 1 : opacityFade
    );

  reheatSimulation();
}

function marshSnake() {
  hideOtherChartStuff("marshSnake");
  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Marsh snake")
    .style("opacity", 1);

  simulation
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            speciesRadius *
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
            speciesRadius *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    .force("collide", null);
  // .force(
  //   "collide",
  //   d3.forceCollide((d) =>
  //     d[metricSpeciesProp] === "Marsh snake" ? circleRadius : 0
  //   )
  // );

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) =>
      d[metricSpeciesProp] === "Marsh snake"
        ? speciesColorScale(d[metricSpeciesProp])
        : "#fff"
    )
    .attr("opacity", (d) =>
      d[metricSpeciesProp] === "Marsh snake" ? 1 : opacityFade
    );

  reheatSimulation();
}

function carpetPython() {
  hideOtherChartStuff("carpetPython");
  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Carpet python")
    .style("opacity", 1);

  simulation
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            speciesRadius *
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
            speciesRadius *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    .force("collide", null);
  // .force(
  //   "collide",
  //   d3.forceCollide((d) =>
  //     d[metricSpeciesProp] === "Carpet python" ? circleRadius : 0
  //   )
  // );

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) =>
      d[metricSpeciesProp] === "Carpet python"
        ? speciesColorScale(d[metricSpeciesProp])
        : "#fff"
    )
    .attr("opacity", (d) =>
      d[metricSpeciesProp] === "Carpet python" ? 1 : opacityFade
    );

  reheatSimulation();
}

function unknownSpecies() {
  hideOtherChartStuff("unknownSpecies");
  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("unknown")
    .style("opacity", 1);

  simulation
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            speciesRadius *
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
            speciesRadius *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    .force("collide", null);
  // .force(
  //   "collide",
  //   d3.forceCollide((d) =>
  //     d[metricSpeciesProp] === "unknown" ? circleRadius : 0
  //   )
  // );

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) =>
      d[metricSpeciesProp] === "unknown"
        ? speciesColorScale(d[metricSpeciesProp])
        : "#fff"
    )
    .attr("opacity", (d) =>
      d[metricSpeciesProp] === "unknown" ? 1 : opacityFade
    );

  reheatSimulation();
}

function keelback() {
  hideOtherChartStuff("keelback");
  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Keelback")
    .style("opacity", 1);

  simulation
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            speciesRadius *
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
            speciesRadius *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    .force("collide", null);
  // .force(
  //   "collide",
  //   d3.forceCollide((d) =>
  //     d[metricSpeciesProp] === "Keelback" ? circleRadius : 0
  //   )
  // );

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) =>
      d[metricSpeciesProp] === "Keelback"
        ? speciesColorScale(d[metricSpeciesProp])
        : "#fff"
    )
    .attr("opacity", (d) =>
      d[metricSpeciesProp] === "Keelback" ? 1 : opacityFade
    );

  reheatSimulation();
}
function timeOfDayStripPlot() {
  hideOtherChartStuff("timeOfDayStripPlot");
  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("I see Keelbacks only at dusk")
    .style("opacity", 1);

  simulation.force("forceX", null).force("forceY", null).force("charge", null);
  // .force("collide", null);

  const jitter = (i) => {
    return i % 2 === 0 ? 2 : -2; // try to minimise spinning nodes without pushing nodes off grid lines
  };

  simulation
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
  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Nope ropes in all weather")
    // .text("Nope ropes, rain, hail, or shine")
    // .text("Rain, hail, or shine, there be nope ropes")
    .style("opacity", 1);

  simulation.force("forceX", null).force("forceY", null).force("charge", null);
  // .force("collide", null);

  const jitter = (i) => {
    return i % 2 === 0 ? 2 : -2; // try to minimise spinning nodes without pushing nodes off grid lines
  };

  simulation
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
  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Whip snakes like it hot")
    .style("opacity", 1);

  simulation.force("forceX", null).force("forceY", null).force("charge", null);
  // .force("collide", null);

  const jitter = (i) => {
    return i % 2 === 0 ? 2 : -2; // try to minimise spinning nodes without pushing nodes off grid lines
  };

  simulation
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

  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("On average, I've seen a snake every two and a half weeks")
    .style("opacity", 1);

  simulation
    // .force("forceX", d3.forceX(focalPointX).strength(1.55))
    .force("forceX", d3.forceX(xWiggle).strength(1))
    .force("forceY", d3.forceY((d) => timeScale(d[metricDateProp])).strength(1))
    .force("charge", d3.forceManyBody().strength(snekChargeStrength2))
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

  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Fewer snek in Winter")
    .style("opacity", 1);

  simulation
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

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) => {
      return speciesColorScale(d.speciesBestGuess);
    })
    .attr("opacity", 1);

  d3.select(".seasons-axis").transition().attr("opacity", 1);
  reheatSimulation();
}

function staringContest() {
  hideOtherChartStuff("staringContest");

  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("I won a staring contest with a noodle boi")
    .style("opacity", 1);

  simulation
    .force(
      "forceX",
      d3.forceX((d) => watchingMeScale(watchingMeGroup(d))).strength(1)
    )
    .force("forceY", d3.forceY(focalPointY).strength(0.3))
    .force("charge", null)
    // .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    // .force("collide", null);
    .force("collide", d3.forceCollide((_d) => circleRadius).strength(1));

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) => {
      return speciesColorScale(d.speciesBestGuess);
    })
    .attr("opacity", 1);

  d3.select(".watching-me-axis").transition().attr("opacity", 1);
  reheatSimulation();
}

function venom() {
  hideOtherChartStuff("venom");

  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Are they venomous?")
    .style("opacity", 1);

  const jitter = (d) => {
    return d[metricSpeciesProp] === "Keelback"
      ? -10
      : d[metricSpeciesProp] === "Common tree snake"
      ? 16
      : d[metricSpeciesProp] === "Carpet python"
      ? 18
      : 0;
  };

  simulation
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

  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) => {
      return speciesColorScale(d.speciesBestGuess);
    })
    .attr("opacity", (d) => (metricVenomAccessor(d) === "unknown" ? 0.2 : 1));

  d3.select(".venom-axis").transition().attr("opacity", 1);
  reheatSimulation();
}

function mating() {
  hideOtherChartStuff("mating");

  updateTitle("Caught in the act!");
  addSpeciesBlobForces(
    (d) => (d["mating"] === "no mating" ? 0.8 : 1),
    (d) => (d["mating"] === "no mating" ? 0.8 : 1)
  );
  addVisibleSpeciesColors((d) => (d["mating"] === "mating" ? 1 : 0.2));

  d3.select(".annotation-stem-one").transition().attr("opacity", 1);

  d3.select(".annotation-stem-two").transition().attr("opacity", 1);

  d3.select(".annotation-label")
    .text("Smoochy snakes")
    .attr("x", 60)
    .attr("y", 120)
    .attr("text-anchor", "middle")
    .style("font-family", chartTextFamily)
    .style("font-size", chartTextSize)
    .style("font-weight", chartTextWeight)
    .attr("opacity", 1)
    .transition();

  reheatSimulation();
}

function courting() {
  hideOtherChartStuff("courting");

  updateTitle("Separated by a roller door!");
  addSpeciesBlobForces(
    (d) => (d["mating"] === "no mating" ? 0.8 : 1),
    (d) => (d["mating"] === "no mating" ? 0.8 : 1)
  );
  addVisibleSpeciesColors((d) => (d["mating"] === "probably" ? 1 : 0.2));

  reheatSimulation();
}

function birds() {
  hideOtherChartStuff("birds");

  updateTitle("Hungry birbs");
  addSpeciesBlobForces(
    (d) => (d["mating"] === "no mating" ? 0.8 : 1),
    (d) => (d["mating"] === "no mating" ? 0.8 : 1)
  );
  addVisibleSpeciesColors((d) => (d["attackedByBirds"] === "no" ? 0.2 : 1));

  reheatSimulation();
}

function defensive() {
  hideOtherChartStuff("defensive");

  updateTitle("This red belly flattened its neck at me from 3m away");
  addSpeciesBlobForces(
    (d) => (d["mating"] === "no mating" ? 0.8 : 1),
    (d) => (d["mating"] === "no mating" ? 0.8 : 1)
  );
  addVisibleSpeciesColors((d) => (d["watchingMe"] === "flattened" ? 1 : 0.2));

  reheatSimulation();
}

function chill() {
  hideOtherChartStuff("chill");

  updateTitle("Bend frends");
  addSpeciesBlobForces(
    (d) => (d["mating"] === "no mating" ? 0.8 : 1),
    (d) => (d["mating"] === "no mating" ? 0.8 : 1)
  );
  addVisibleSpeciesColors((d) => (!didChill(d) ? 0.2 : 1));

  reheatSimulation();
}

function fled() {
  hideOtherChartStuff("fled");

  updateTitle("I'm scary");
  addSpeciesBlobForces(
    (d) => (d["mating"] === "no mating" ? 0.8 : 1),
    (d) => (d["mating"] === "no mating" ? 0.8 : 1)
  );
  addVisibleSpeciesColors((d) => (!didFlee(d) ? 0.2 : 1));

  reheatSimulation();
}

function attacked() {
  hideOtherChartStuff("attacked");

  updateTitle("Zero snakes have attacked me");
  addSpeciesBlobForces(
    (d) => (d["mating"] === "no mating" ? 0.8 : 1),
    (d) => (d["mating"] === "no mating" ? 0.8 : 1)
  );
  addVisibleSpeciesColors(0.2);

  reheatSimulation();
}

function onCamera() {
  hideOtherChartStuff("onCamera");

  updateTitle("Photographic proof!");
  addSpeciesBlobForces(
    (d) => (d["mating"] === "no mating" ? 0.8 : 1),
    (d) => (d["mating"] === "no mating" ? 0.8 : 1)
  );
  addVisibleSpeciesColors((d) => (d["onCamera"] === "no" ? 0.2 : 1));

  reheatSimulation();
}

function climbing() {
  hideOtherChartStuff("climbing");

  updateTitle("Tree snakes zoom up trees");
  addSpeciesBlobForces(
    (d) => (d["mating"] === "no mating" ? 0.8 : 1),
    (d) => (d["mating"] === "no mating" ? 0.8 : 1)
  );
  addVisibleSpeciesColors((d) => (d["climbing"] === "not climbing" ? 0.2 : 1));

  reheatSimulation();
}

function yard() {
  hideOtherChartStuff("yard");

  updateTitle("Too close to home");
  addSpeciesBlobForces(
    (d) => (d["mating"] === "no mating" ? 0.8 : 1),
    (d) => (d["mating"] === "no mating" ? 0.8 : 1)
  );
  addVisibleSpeciesColors((d) => (d["room"] === "elsewhere" ? 0.2 : 1));

  reheatSimulation();
}

function all() {
  hideOtherChartStuff("all");

  updateTitle("They're all good snakes, mate");
  addSpeciesBlobForces(1, 1);
  addVisibleSpeciesColors(1);

  reheatSimulation();
}

function fin() {
  hideOtherChartStuff("fin");
  chartTitle.text("");
  chartTitle.attr("opacity", 0);
  sneks.transition().duration(200).attr("opacity", 0);
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
    svg.select(".annotation-stem-one").transition().attr("opacity", 0);
    svg.select(".annotation-stem-two").transition().attr("opacity", 0);
    svg.select(".annotation-label").transition().attr("opacity", 0);
  }
}

function onMouseEnter(_event, d) {
  console.log(d);
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

function addSpeciesBlobForces(forceXStrength, forceYStrength) {
  simulation
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            circleRadius *
              1.25 *
              Math.sin(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointX
        )
        .strength(forceXStrength)
    )
    .force(
      "forceY",
      d3
        .forceY(
          (d) =>
            circleRadius *
              1.25 *
              Math.cos(
                speciesAngleScale(d.speciesBestGuess) * (Math.PI / 180)
              ) +
            focalPointY
        )
        .strength(forceYStrength)
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
  chartTitle
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text(title)
    .style("opacity", 1);
}

function reheatSimulation() {
  simulation.alpha(0.9).restart();
}

loadData();
