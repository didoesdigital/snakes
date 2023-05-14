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
  console.log(response);
  // response = { element, direction, index }

  // add color to current step only
  step.classed("is-active", function (d, i) {
    return i === response.index;
  });

  // update graphic based on step
  if (![0, 3].includes(response.index)) {
    figure.select("p").text(response.index + 1);
  }

  if (response.index === 3) {
    figure.select("p").text("FIN");
  }

  if (response.index === 0) {
    firstChart();
  }
}

const data = [100, 250, 175, 200, 120];
const width = 343;
const height = 400;
const rScale = d3.scaleSqrt().domain([100, 250]).range([20, 50]);

function setupChart() {
  const svg = figure.select("div").append("svg");
  svg.attr("width", width).attr("height", height);

  const circles = svg.selectAll("circle").data(data);

  circles
    .join("circle")
    .attr("cx", (d, i) => (width / data.length) * i + rScale(d))
    .attr("cy", (d) => height - d)
    .attr("r", (d) => rScale(d))
    .attr("fill", "blue")
    .attr("stroke", "#fff");
}

function drawCircles(circles) {
  circles.join(
    (enter) =>
      enter
        .append("circle")
        .attr("cx", (d, i) => (width / data.length) * i + rScale(d))
        .attr("cy", (d) => height - d)
        .attr("r", (d) => rScale(d))
        .attr("fill", "blue")
        .attr("stroke", "#fff"),
    (update) =>
      update
        .transition()
        .duration(500)
        .attr("fill", (d) => "red")
        .attr("cx", (d, i) => (width / data.length) * i + rScale(d))
        .attr("cy", (d) => height - d)
        .attr("r", (d) => rScale(d))
  );
}

function firstChart() {
  const svg = figure.select("div").select("svg");
  const firstData = data.map((d) => d * 2);
  const circles = svg.selectAll("circle").data(firstData);
  drawCircles(circles);

  figure
    .select("p")
    .transition()
    .duration(250)
    .style("opacity", 0)
    .transition()
    .duration(250)
    .text("venomous vs non-venomous")
    .style("opacity", 1);
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

// kick things off
init();
