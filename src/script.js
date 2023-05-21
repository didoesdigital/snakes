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

const width = 343;
const height = 400;
const rScale = d3.scaleSqrt().domain([100, 250]).range([20, 50]);

const timeParser = d3.timeParse("%d %b %Y"); // "02 Jan 2023"
const leftPad = 5;
const circleRadius = 10;
const circleSpacing = circleRadius * 2 + 1;
const hideOffscreen = 80;
const focalPointY = 300;
const opacityFade = 0; // 0.2;
const speciesRadius = 50;

let circles = null;
let nodes = null;
let testData = null;

let speciesAngleScale = null;

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  var stepH = Math.floor(window.innerHeight * 0.75);
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
    fin,
  };
  const stepFn = stepFunctions[stepFunctionName];
  if (stepFn) {
    stepFn();
  }
}

function loadData() {
  d3.csv("./data/data.csv", (d) => {
    return {
      date: timeParser(d.prettyDate),
      species: d.species,
      // initialize x/y values for force simulation to start from center
      x: width / 2,
      y: height / 2,
    };
  }).then((data) => {
    testData = data;
    // console.log(testData);

    setTimeout(init(), 0);
  });
}

function setupScales() {
  const allSnakeSpecies = Array.from(new Set(testData.map((d) => d.species)));

  speciesAngleScale = d3.scaleBand().domain(allSnakeSpecies).range([0, 360]);

  speciesColorScale = d3
    .scaleOrdinal()
    .domain(allSnakeSpecies)
    .range([
      "#09A573",
      "#5598E2",
      "#9880C2",
      "#E26F99",
      "#E8686A",
      "#E17547",
      "#CD840E",
      "#CFAA07",
    ]);
}

function setupChart() {
  const svg = figure.select("div").append("svg");
  svg.attr("width", width).attr("height", height);

  nodes = svg.selectAll("circle").data(testData);

  circles = nodes
    .join("circle")
    .attr("cx", (_d, i) => leftPad + i * circleSpacing)
    .attr("cy", (_d) => height - 10)
    .attr("r", (_d) => circleRadius)
    .attr("opacity", 1)
    .attr("fill", (d) => {
      return speciesColorScale(d.species)
    })
    .attr("stroke", "#fff");

  circles.on("mouseenter", onMouseEnter);

  simulation = d3.forceSimulation(testData);

  simulation.on("tick", () => {
    circles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  simulation.stop();

  simulation
    .force("charge", d3.forceManyBody().strength(2))
    .force("center", d3.forceCenter(170, focalPointY).strength(1))
    .force(
      "forceX",
      d3
        .forceX((d) => speciesRadius * Math.sin(speciesAngleScale(d.species)))
        .strength(3)
    )
    .force(
      "forceY",
      d3
        .forceY((d) => speciesRadius * Math.cos(speciesAngleScale(d.species)))
        .strength(3)
    )
    .force(
      "collide",
      d3.forceCollide((_d) => circleRadius)
    )
    .alphaDecay(0.02)
    .velocityDecay(0.4);

  simulation.alpha(0.9).restart();
}

function yellowFacedWhipSnakes() {
  figure
    .select("p")
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Yellow-faced whip snakes")
    .style("opacity", 1);

  simulation.force(
    "collide",
    d3.forceCollide((d) =>
      d.species === "Yellow-faced whip snake" ? circleRadius : 0
    )
  );

  circles
    .transition()
    .duration(200)
    .attr("fill", (d) =>
      d.species === "Yellow-faced whip snake" ? "yellow" : "#fff"
    )
    .attr("opacity", (d) =>
      d.species === "Yellow-faced whip snake" ? 1 : opacityFade
    );

  simulation.alpha(0.9).restart();
}

function redBellies() {
  figure
    .select("p")
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Red-bellied black snake")
    .style("opacity", 1);

  simulation.force(
    "collide",
    d3.forceCollide((d) =>
      d.species === "Red-bellied black" ? circleRadius : 0
    )
  );

  circles
    .transition()
    .duration(200)
    .attr("fill", (d) => (d.species === "Red-bellied black" ? "red" : "#fff"))
    .attr("opacity", (d) =>
      d.species === "Red-bellied black" ? 1 : opacityFade
    );

  simulation.alpha(0.9).restart();
}

function keelbacks() {
  figure
    .select("p")
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Keelback")
    .style("opacity", 1);

  simulation.force(
    "collide",
    d3.forceCollide((d) => (d.species === "Keelback" ? circleRadius : 0))
  );

  circles
    .transition()
    .duration(200)
    .attr("fill", (d) => (d.species === "Keelback" ? "grey" : "#fff"))
    .attr("opacity", (d) => (d.species === "Keelback" ? 1 : opacityFade));

  simulation.alpha(0.9).restart();
}

function fin() {
  figure.select("p").text("FIN");
}

function onMouseEnter(_event, d) {
  console.log(d);
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
      offset: 0.33,
      debug: false,
    })
    .onStepEnter(handleStepEnter);
}

loadData();
