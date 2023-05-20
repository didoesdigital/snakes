let sightingsData = null;
const timeParser = d3.timeParse("%d %b %Y"); // "02 Jan 2023"

function loadData() {
  d3.csv("./data/snake-sightings-public.csv", (d) => {
    return {
      ...d,
      date: timeParser(d.date),
      temp:
        d.temperature !== "unknown"
          ? d.temperature
          : d.estimatedTemperature.replace("~", ""),
    };
  }).then((data) => {
    sightingsData = data;
    console.log(sightingsData);

    const columnsToRollup = [
      "speciesBestGuess",
      "seenBy",
      "size",
      "chunkiness",
      "timeOfDay",
      "temp",
      "weather",
      "venom",
      "family",
      "cyclicActivity",
      "mating",
      "climbing",
      "lumps",
      "surface",
      "attackedByBirds",
      "watchingMe",
      "departure",
      "room",
      "yelp",
      "onCamera",
    ];
    columnsToRollup.forEach((columnName) =>
      console.log({ [columnName]: analyse(columnName) })
    );
  });
}

function analyse(columnName) {
  const result = d3
    .rollups(
      sightingsData,
      (v) => v.length,
      (d) => d[columnName]
    )
    .sort((a, b) => d3.descending(a[1], b[1]));

  return result;
}

loadData();
