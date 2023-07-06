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

const sansSerifStack =
  '"Source Sans Pro", "Work Sans", "Lato", "Noto Sans", "Assistant", "Helvetica", arial, sans-serif';
const sansSerifSize = "0.875rem";
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
    left: 96,
  },
};

let circles = null;
let sneks = null;
let nodes = null;
let sightingsData = null;

let speciesAngleScale = null;
let speciesColorScale = null;
let speciesBandScale = null;

let temperatureScale = null;
let temperatureColorScale = null;

let timeScale = null;
let timeDelayScale = null;
let seasonScale = null;
const delay = 100;

const metricTempProp = "temp";
const metricTempAccessor = (d) => d[metricTempProp];
const metricDateProp = "date";
const metricDateAccessor = (d) => d[metricDateProp];
const metricSpeciesProp = "speciesBestGuess";

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
    yellowFacedWhipSnakes,
    redBellies,
    keelbacks,
    temperatureStripPlot,
    timeline,
    species,
    seasons,
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

  seasonScale = d3
    .scalePoint()
    .domain(["Summer", "Autumn", "Winter", "Spring"])
    .range([circleSpacing, dimensions.width - circleSpacing])
    .padding(1);

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
      "M20.9419 12.7552C20.0054 12.3204 18.9014 11.7867 19.7829 12.9411C21.0272 14.572 22.0145 16.2463 21.8431 17.7912C21.6926 19.1472 20.6414 19.5082 19.525 19.3795C18.8371 19.3002 18.2688 18.7094 17.8656 18.2013C16.0688 15.9322 12.9485 15.3866 10.6714 17.3108C9.76002 18.0811 8.85765 19.4725 7.51998 19.475C6.13716 19.4695 5.33619 17.8816 5.80509 16.6783C6.66144 14.4919 9.13257 13.4757 10.8743 12.1333C13.0014 10.4943 14.3284 8.0177 13.9456 5.81558C13.5444 3.51028 11.8999 1.76687 9.43902 1.53836C7.20324 1.33075 6.45726 1.97744 4.68867 3.19783C3.77349 3.36958 2.28491 2.85465 0.900788 4.80019C0.0977723 5.92937 0.20221 7.6025 0.0504286 7.82759C-0.100884 8.05304 0.0013971 9.28412 1.59824 9.14945C3.19505 9.0152 6.28935 6.16817 6.28935 6.16817C7.32132 5.37275 8.11035 4.55428 9.39642 5.12932C10.6441 5.69369 10.6595 7.22654 9.90285 8.23259C9.57507 8.66741 8.4966 9.62735 8.0511 9.92696C7.46667 10.3188 6.87375 10.6981 6.30216 11.1081C5.13843 11.9419 4.04673 12.9096 3.27131 14.1253C1.75809 16.4988 1.90045 19.5538 4.01811 21.5254C5.05356 22.4892 6.45894 22.9973 7.87335 22.8962C9.29199 22.7952 10.5524 22.0782 11.6087 21.1639C12.2481 20.6114 12.9221 19.5321 13.8582 19.5299C14.7998 19.5372 15.3207 20.5956 15.9418 21.1468C17.464 22.498 19.6742 22.9942 21.5345 22.0385C25.4242 20.041 24.3193 14.7485 20.9419 12.7552Z"
      // "M8.7258 5.31467C8.33559 5.13351 7.87557 4.91115 8.24289 5.39212C8.76133 6.07165 9.1727 6.76931 9.10129 7.413C9.03859 7.97798 8.6006 8.12842 8.13543 8.0748C7.84878 8.04175 7.61201 7.79557 7.44399 7.58386C6.69535 6.63843 5.39521 6.41108 4.4464 7.21285C4.06667 7.5338 3.69069 8.11352 3.13332 8.11458C2.55715 8.11227 2.22341 7.45067 2.41879 6.94927C2.7756 6.0383 3.80524 5.61487 4.53096 5.05556C5.41725 4.37262 5.97015 3.34071 5.81065 2.42316C5.64351 1.46262 4.95828 0.736198 3.93292 0.640983C3.00135 0.554479 2.69052 0.823932 1.95361 1.33243C1.57229 1.40399 0.952048 1.18944 0.375328 2.00008C0.0407385 2.47057 0.0842541 3.16771 0.0210119 3.26149C-0.042035 3.35543 0.000582123 3.86838 0.665934 3.81227C1.33127 3.75633 2.62056 2.57007 2.62056 2.57007C3.05055 2.23864 3.37931 1.89762 3.91517 2.13722C4.43506 2.37237 4.44146 3.01106 4.12619 3.43024C3.98961 3.61142 3.54025 4.0114 3.35462 4.13623C3.11111 4.29948 2.86406 4.45755 2.6259 4.62838C2.14101 4.97581 1.68614 5.379 1.36305 5.88556C0.732536 6.87448 0.791852 8.14744 1.67421 8.9689C2.10565 9.37049 2.69122 9.5822 3.28056 9.54009C3.87166 9.498 4.39685 9.19925 4.83698 8.81827C5.10338 8.58807 5.3842 8.13837 5.77424 8.13747C6.16659 8.1405 6.38364 8.5815 6.64243 8.81116C7.27668 9.37419 8.19758 9.58094 8.9727 9.18272C10.5934 8.35043 10.133 6.14521 8.7258 5.31467Z"
      // "M7.5 4C7.5 5.933 5.933 7.5 4 7.5C2.067 7.5 0.5 5.933 0.5 4C0.5 2.067 2.067 0.5 4 0.5C5.933 0.5 7.5 2.067 7.5 4Z"
    )
    .attr("fill", (d) => speciesColorScale(d.speciesBestGuess))
    // .attr("opacity", 0.8)
    // .attr("style", "mix-blend-mode: color-dodge")
    .attr(
      "transform",
      (_d, i) => `translate(${leftPad + i * circleSpacing}, ${height - 10})`
    )
    // .attr("stroke", "#fff")
    // .attr("stroke-width", 2)
    // .attr("stroke-opacity", 0.2);
    // .attr("stroke",(d) => speciesColorScale(d.speciesBestGuess))
    .attr("stroke-width", 0.5)
    .attr("stroke-width", 1)
    .attr("stroke", circleStroke)
  // circles = nodes
  //   .join("circle")
  //   .attr("cx", (_d, i) => leftPad + i * circleSpacing)
  //   .attr("cy", (_d) => height - 10)
  //   .attr("r", (_d) => circleRadius)
  //   .attr("opacity", 1)
  //   .attr("fill", (d) => {
  //     return speciesColorScale(d.speciesBestGuess);
  //   })
  //   .attr("stroke", circleStroke);

  sneks.on("mouseenter", onMouseEnter);
  // circles.on("mouseenter", onMouseEnter);

  simulation = d3.forceSimulation(sightingsData);

  simulation.on("tick", () => {
    sneks.attr(
      "transform",
      (d) => `translate(${d.x - circleRadius}, ${d.y - circleRadius})`
    );
    // circles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  simulation.stop();

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
  let tempStripPlotXAxis = d3.axisBottom(temperatureScale).tickSize(0).ticks(6);
  // X-Axis labels:
  svg
    .append("g")
    .attr("class", "strip-plot-x")
    .attr("opacity", 0)
    .attr(
      "transform",
      `translate(0, ${dimensions.height - dimensions.margin.bottom})`
    )
    .call(tempStripPlotXAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").style("font-family", sansSerifStack))
    .call((g) => g.selectAll("text").style("font-size", sansSerifSize))
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
        .style("font-family", sansSerifStack)
        .style("font-size", sansSerifSize)
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
        .style("font-family", sansSerifStack)
        .style("font-size", sansSerifSize)
    )
    .call((g) => {
      g.selectAll(".tick:last-child").remove();
    })
    .attr("stroke-opacity", 0.2)
    .lower();

  const seasonAxis = d3.axisBottom(seasonScale).tickSize(0);

  // Seasons axis
  svg
    .append("g")
    .attr("class", "seasons-axis")
    .attr("opacity", 0)
    .attr(
      "transform",
      `translate(0, ${
        focalPointY + 6 * circleSpacing
        // dimensions.height - dimensions.margin.bottom - 50
      })`
    )
    .call(seasonAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").style("font-family", sansSerifStack))
    .call((g) => g.selectAll("text").style("font-size", sansSerifSize))
    .lower();
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

  // circles
  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) => speciesColorScale(d[metricSpeciesProp]))
    .attr("opacity", 1);

  simulation.alpha(0.9).restart();
}

function yellowFacedWhipSnakes() {
  hideOtherChartStuff("yellowFacedWhipSnakes");

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

  // circles
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

  simulation.alpha(0.9).restart();
}

function redBellies() {
  hideOtherChartStuff("redBellies");
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

  // circles
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

  simulation.alpha(0.9).restart();
}

function keelbacks() {
  hideOtherChartStuff("keelbacks");
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

  // circles
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

  simulation.alpha(0.9).restart();
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

  const jitterX = (i) => {
    return i % 2 === 0 ? 2 : -2; // try to minimise spinning nodes without pushing nodes off grid lines
  };

  simulation
    .force(
      "forceX",
      d3
        .forceX((d, i) => temperatureScale(d[metricTempProp]) + jitterX(i))
        .strength(0.9)
    )
    .force(
      "forceY",
      d3.forceY((d) => speciesBandScale(d[metricSpeciesProp])).strength(0.9)
    )
    // .force("charge", null)
    // .force("charge", d3.forceManyBody().strength(-2)) // try to minimise spinning nodes without pushing nodes off grid lines
    .force("collide", d3.forceCollide(circleRadius).strength(1));

  // circles
  sneks
    .transition()
    .duration(200)
    .attr(
      "fill",
      (d) =>
        console.log(temperatureColorScale(d[metricTempProp])) ||
        temperatureColorScale(d[metricTempProp])
    )
    .attr("opacity", 1);

  d3.select(".strip-plot-x").transition().attr("opacity", 1);
  d3.select(".strip-plot-y").transition().attr("opacity", 1);
  d3.select(".strip-plot-y-grid-lines").transition().attr("opacity", 1);
  simulation.alpha(0.9).restart();
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

  // circles
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
  simulation.alpha(0.9).restart();
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
    .force("forceY", d3.forceY(focalPointY).strength(1))
    .force("charge", d3.forceManyBody().strength(snekChargeStrength))
    .force("collide", null);
  // .force("collide", d3.forceCollide((_d) => circleRadius).strength(1))

  // circles
  sneks
    .transition()
    .duration(200)
    .attr("fill", (d) => {
      return speciesColorScale(d.speciesBestGuess);
    })
    .attr("opacity", 1);

  d3.select(".seasons-axis").transition().attr("opacity", 1);
  simulation.alpha(0.9).restart();
}

function fin() {
  hideOtherChartStuff("fin");
  chartTitle.text("All snakes, all the time");
}

function hideOtherChartStuff(stepFunctionName) {
  if (stepFunctionName !== "temperatureStripPlot") {
    svg.select(".strip-plot-x").transition().attr("opacity", 0);
    svg.select(".strip-plot-y").transition().attr("opacity", 0);
    svg.select(".strip-plot-y-grid-lines").transition().attr("opacity", 0);
    svg.select(".timeline-y-axis").transition().attr("opacity", 0);
    svg.select(".seasons-axis").transition().attr("opacity", 0);
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
    .onStepEnter(handleStepEnter);
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

loadData();
