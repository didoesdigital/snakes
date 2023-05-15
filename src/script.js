// Scrollama sticky-overlay example
// https://github.com/russellsamora/scrollama/blob/main/docs/sticky-overlay/index.html

// using d3 for convenience
var main = d3.select("main");
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");

// initialize the scrollama
var scroller = scrollama();

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
  step.classed("is-active", function (d, i) {
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

const data = [100, 250, 175, 200, 120];
const width = 343;
const height = 400;
const rScale = d3.scaleSqrt().domain([100, 250]).range([20, 50]);

const timeParser = d3.timeParse("%d %b %Y"); // "02 Jan 2023"
const leftPad = 5;
const circleRadius = 2;
const circleSpacing = circleRadius * 2 + 1;

let testData = null;

function loadData() {
  d3.csv("./data/data.csv", (d) => {
    return {
      date: timeParser(d.prettyDate),
      species: d.species,
    };
  }).then((data) => {
    testData = data;
    // console.log(testData);

    // kick things off
    setTimeout(init(), 0);
  });
}

function setupChart() {
  const svg = figure.select("div").append("svg");
  svg.attr("width", width).attr("height", height);

  const circles = svg.selectAll("circle").data(testData);

  circles
    .join("circle")
    .attr("cx", (_d, i) => leftPad + i * circleSpacing)
    .attr("cy", (d) => height - 10)
    .attr("r", (d) => circleRadius)
    .attr("fill", "#fff")
    .attr("stroke", "#fff");
}

function yellowFacedWhipSnakes() {
  const svg = figure.select("div").select("svg");
  const firstData = testData.filter(
    (d) => d.species === "Yellow-faced whip snake"
  );
  const circles = svg.selectAll("circle").data(firstData);
  // console.log(firstData);

  figure
    .select("p")
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Yellow-faced whip snakes")
    .style("opacity", 1);

  circles.join(
    (enter) =>
      enter
        .append("circle")
        .transition()
        .duration(500)
        .attr("cx", (_d, i) => leftPad + i * circleSpacing)
        .attr("cy", (d) => height - 10)
        .attr("r", (d) => circleRadius)
        .attr("fill", "yellow")
        .attr("stroke", "#fff"),
    (update) =>
      update
        .transition()
        .duration(500)
        .attr("cx", (_d, i) => leftPad + i * circleSpacing)
        .attr("cy", (d) => height - 10)
        .attr("r", (d) => circleRadius)
        .attr("fill", "yellow")
        .attr("stroke", "#fff"),
    (exit) => exit.transition().duration(500).style("opacity", 0).remove()
  );
}

function redBellies() {
  const svg = figure.select("div").select("svg");
  const secondData = testData.filter((d) => d.species === "Red-bellied black");
  const circles = svg.selectAll("circle").data(secondData);

  figure
    .select("p")
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Red-bellied black snake")
    .style("opacity", 1);

  circles.join(
    (enter) =>
      enter
        .append("circle")
        .transition()
        .duration(500)
        .attr("cx", (_d, i) => leftPad + i * circleSpacing)
        .attr("cy", (d) => height - 10)
        .attr("r", (d) => circleRadius)
        .attr("fill", "red")
        .attr("stroke", "#fff"),
    (update) =>
      update
        .transition()
        .duration(500)
        .attr("cx", (_d, i) => leftPad + i * circleSpacing)
        .attr("cy", (d) => height - 10)
        .attr("r", (d) => circleRadius)
        .attr("fill", "red")
        .attr("stroke", "#fff"),
    (exit) => exit.transition().duration(500).style("opacity", 0).remove()
  );
}

function keelbacks() {
  const svg = figure.select("div").select("svg");
  const secondData = testData.filter((d) => d.species === "Keelback");
  const circles = svg.selectAll("circle").data(secondData);

  figure
    .select("p")
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("Keelback")
    .style("opacity", 1);

  circles.join(
    (enter) =>
      enter
        .append("circle")
        .transition()
        .duration(500)
        .attr("cx", (_d, i) => leftPad + i * circleSpacing)
        .attr("cy", (d) => height - 10)
        .attr("r", (d) => circleRadius)
        .attr("fill", "grey")
        .attr("stroke", "#fff"),
    (update) =>
      update
        .transition()
        .duration(500)
        .attr("cx", (_d, i) => leftPad + i * circleSpacing)
        .attr("cy", (d) => height - 10)
        .attr("r", (d) => circleRadius)
        .attr("fill", "grey")
        .attr("stroke", "#fff"),
    (exit) => exit.transition().duration(500).style("opacity", 0).remove()
  );
}

function fin() {
  figure.select("p").text("FIN");
}

function init() {
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
