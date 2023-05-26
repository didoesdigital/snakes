// Scrollama sticky-overlay example
// https://github.com/russellsamora/scrollama/blob/main/docs/sticky-overlay/index.html

// using d3 for convenience
const main = d3.select("main");
const scrolly = main.select("#scrolly");
const figure = scrolly.select("figure");
const article = scrolly.select("article");
const step = article.selectAll(".step");

// initialize the scrollama
const scroller = scrollama();

const width = 343; // 375 - 16 - 16
const height = 555; //400;
const rScale = d3.scaleSqrt().domain([100, 250]).range([20, 50]);

const timeParser = d3.timeParse("%d %b %Y"); // "02 Jan 2023"
const leftPad = 5;
// const circleDiameter = 40; // big enough to tap
const circleDiameter = 10; // small enough to fit within plot area
const circleRadius = circleDiameter / 2;
const circleSpacing = circleRadius * 2 + 1;
const circleStroke = "#525252";
const hideOffscreen = 80;
const goldenRatio = 1.618;
const focalPointX = width / 2;
const focalPointY = height / goldenRatio / goldenRatio;
const opacityFade = 0; // 0.2;
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
  height: 400,
  margin: {
    top: 48,
    right: 24, // at least circleRadius wide
    bottom: 24,
    left: 80,
  },
};

let circles = null;
let nodes = null;
let sightingsData = null;

let speciesAngleScale = null;
let speciesColorScale = null;
let speciesBandScale = null;

let temperatureScale = null;
let temperatureColorScale = null;

const metricTempProp = "temp";
const metricTempAccessor = (d) => d[metricTempProp];
const metricSpeciesProp = "speciesBestGuess";

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  var stepH = Math.floor(window.innerHeight * (goldenRatio - 1));
  step.style("height", stepH + "px");

  var figureHeight = window.innerHeight / 2;
  var figureMarginTop = (window.innerHeight - figureHeight) / 2;

  figure
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}

// scrollama event handlers
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
    yellowFacedWhipSnakes,
    redBellies,
    keelbacks,
    temperatureStripPlot,
    timeline,
    fin,
  };
  const stepFn = stepFunctions[stepFunctionName];
  if (stepFn) {
    stepFn();
  }
}

function loadData() {
  d3.csv("./data/snake-sightings-public.csv", (d) => {
    return {
      ...d,
      date: timeParser(d.date),
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

  speciesAngleScale = d3.scaleBand().domain(allSnakeSpecies).range([0, 360]);

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

  temperatureScale = d3
    .scaleLinear()
    .domain(d3.extent(sightingsData, metricTempAccessor))
    .range([
      dimensions.margin.left,
      dimensions.width - dimensions.margin.right,
    ]);

  temperatureColorScale = d3
    .scaleSequential()
    .domain(d3.extent(sightingsData, metricTempAccessor))
    .interpolator(d3.interpolateHsl("#7BB2EF", "#ED9798"));
}

function setupChart() {
  const svg = figure.select("#viz").append("svg");
  svg.attr("width", width).attr("height", height);

  nodes = svg.selectAll("circle").data(sightingsData);

  circles = nodes
    .join("circle")
    .attr("cx", (_d, i) => leftPad + i * circleSpacing)
    .attr("cy", (_d) => height - 10)
    .attr("r", (_d) => circleRadius)
    .attr("opacity", 1)
    .attr("fill", (d) => {
      return speciesColorScale(d.speciesBestGuess);
    })
    .attr("stroke", circleStroke);

  circles.on("mouseenter", onMouseEnter);

  simulation = d3.forceSimulation(sightingsData);

  simulation.on("tick", () => {
    circles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  simulation.stop();

  simulation
    // .force("charge", d3.forceManyBody().strength(2).distanceMax(50))
    .force("center", d3.forceCenter(170, focalPointY).strength(1))
    .force(
      "forceX",
      d3
        .forceX(
          (d) =>
            speciesRadius * Math.sin(speciesAngleScale(d.speciesBestGuess)) +
            focalPointX
        )
        .strength(1.5)
    )
    .force(
      "forceY",
      d3
        .forceY(
          (d) =>
            speciesRadius * Math.cos(speciesAngleScale(d.speciesBestGuess)) +
            focalPointY
        )
        .strength(1.5)
    )
    .force("collide", d3.forceCollide((_d) => circleRadius).strength(1))
    .alphaDecay(0.02)
    .velocityDecay(0.4)
    .alpha(0.9)
    .stop();

  simulation.restart();
}

function yellowFacedWhipSnakes() {
  hideOtherChartStuff("yellowFacedWhipSnakes");

  figure
    .select("p")
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
            speciesRadius * Math.sin(speciesAngleScale(d.speciesBestGuess)) +
            focalPointX
        )
        .strength(1.5)
    )
    // .force("forceY", d3.forceY(focalPointY));
    .force(
      "forceY",
      d3
        .forceY(
          (d) =>
            speciesRadius * Math.cos(speciesAngleScale(d.speciesBestGuess)) +
            focalPointY
        )
        .strength(1.5)
    )
    .force(
      "collide",
      d3.forceCollide((d) =>
        d[metricSpeciesProp] === "Yellow-faced whip snake" ? circleRadius : 0
      )
    );

  circles
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

  simulation.alpha(0.9).restart();
}

function redBellies() {
  hideOtherChartStuff("redBellies");
  figure
    .select("p")
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
            speciesRadius * Math.sin(speciesAngleScale(d.speciesBestGuess)) +
            focalPointX
        )
        .strength(1.5)
    )
    .force(
      "forceY",
      d3
        .forceY(
          (d) =>
            speciesRadius * Math.cos(speciesAngleScale(d.speciesBestGuess)) +
            focalPointY
        )
        .strength(1.5)
    )
    .force(
      "collide",
      d3.forceCollide((d) =>
        d[metricSpeciesProp] === "Red-bellied black" ? circleRadius : 0
      )
    );

  circles
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

  simulation.alpha(0.9).restart();
}

function keelbacks() {
  hideOtherChartStuff("keelbacks");
  figure
    .select("p")
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
            speciesRadius * Math.sin(speciesAngleScale(d.speciesBestGuess)) +
            focalPointX
        )
        .strength(1.5)
    )
    .force(
      "forceY",
      d3
        .forceY(
          (d) =>
            speciesRadius * Math.cos(speciesAngleScale(d.speciesBestGuess)) +
            focalPointY
        )
        .strength(1.5)
    )
    .force(
      "collide",
      d3.forceCollide((d) =>
        d[metricSpeciesProp] === "Keelback" ? circleRadius : 0
      )
    );

  circles
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

  simulation.alpha(0.9).restart();
}

function temperatureStripPlot() {
  hideOtherChartStuff("temperatureStripPlot");
  figure
    .select("p")
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Do they like it hot?")
    .style("opacity", 1);

  simulation
    .force("charge", null)
    .force("center", null)
    .force("forceX", null)
    .force("forceY", null)
    .force("collide", null);

  simulation
    .force(
      "forceX",
      d3.forceX((d) => temperatureScale(d[metricTempProp])).strength(1)
    )
    .force(
      "forceY",
      d3.forceY((d) => speciesBandScale(d[metricSpeciesProp])).strength(1)
    )
    .force("collide", d3.forceCollide((_d) => circleRadius).strength(1));

  circles
    .transition()
    .duration(200)
    .attr("fill", (d) => temperatureColorScale(d[metricTempProp]))
    .attr("opacity", 1);

  const svg = figure.select("#viz").select("svg");

  let tempStripPlotXAxis = d3.axisBottom(temperatureScale).tickSize(4);
  svg
    .append("g")
    .attr("class", "strip-plot-x")
    .attr(
      "transform",
      `translate(0, ${dimensions.height - dimensions.margin.bottom})`
    )
    .call(tempStripPlotXAxis)
    .call((g) => g.select(".domain").remove())
    .attr("stroke-opacity", 0.2)
    .lower();

  let tempStripPlotYAxis = d3
    .axisLeft(speciesBandScale)
    .tickSizeInner(12)
    .tickSizeOuter(0)
    .tickFormat("");
  svg
    .append("g")
    .attr("class", "strip-plot-y")
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
        .attr("dx", "-1em")
        .attr("dy", getLabelPartYShift)
        .text((d) => `${d}`)
    )
    .attr("stroke-opacity", 0.2)
    .attr("stroke-dasharray", 2.5)
    .lower();

  simulation.alpha(0.9).restart();
}

function timeline() {
  figure
    .select("p")
    .text("On average, I've seen a snake every two and a half weeks");
}

function fin() {
  hideOtherChartStuff("fin");
  figure.select("p").text("FIN");
}

function hideOtherChartStuff(stepFunctionName) {
  if (stepFunctionName !== "temperatureStripPlot") {
    figure.select(".strip-plot-x").remove();
    figure.select(".strip-plot-y").remove();
  }
}

function onMouseEnter(_event, d) {
  console.log(d);
  // console.log([d.temp, d.speciesBestGuess]);
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
    .onStepEnter(handleStepEnter);
}

loadData();
