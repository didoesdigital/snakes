let sightingsData = null;
let scSpeciesData = null;
let fatalitiesData = null;
let knownFatalities = null;
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
    console.log({ data: sightingsData });

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
    columnsToRollup.forEach(
      (columnName) =>
        console.log({ [columnName]: analyse(sightingsData, columnName) })
      // (columnName) => console.log(analyse(sightingsData, columnName).map((d) => d[0]))
    );

    console.log(validate("consistentSpeciesData"));
    console.log(validate("noMissingValues") || "No missing values");

    d3.json("./data/sunny-coast-snake-species.json", (d) => {
      return {
        group: d.venom,
        species: d.species,
        venom: d.venom,
      };
    }).then((data) => {
      scSpeciesData = data.filter(
        (d) => d.group !== "Legless and Snake-like Lizards"
      );
      console.log({ scSpeciesData });

      const columnsToRollup = ["group", "venom"];
      columnsToRollup.forEach((columnName) =>
        console.log({ [columnName]: analyse(scSpeciesData, columnName) })
      );
    });
  });
}

function analyse(dataSource, columnName) {
  const result = d3
    .rollups(
      dataSource,
      (v) => v.length,
      (d) => d[columnName]
    )
    .sort((a, b) => d3.descending(a[1], b[1]));

  return result;
}

function validate(detail) {
  if (detail === "consistentSpeciesData") {
    const result = d3.flatGroup(
      sightingsData,
      (d) => d.speciesBestGuess,
      (d) => d.venom,
      (d) => d.family,
      (d) => d.cyclicActivity
    );

    const numberOfSpecies = d3.groups(
      sightingsData,
      (d) => d.speciesBestGuess
    ).length;

    if (numberOfSpecies < result.length) {
      console.log(
        `⚠️ The number of species (${numberOfSpecies}) does not match the number of combinations of species and species-specific data (${result.length})`
      );
    } else {
      console.log("✅ Species-specific data looks good");
    }

    return result;
  } else if (detail === "noMissingValues") {
    const columnsThatShouldHaveData = sightingsData.columns.filter(
      (columnName) => columnName !== "estimatedTemperature"
    );
    sightingsData.forEach((datum) => {
      columnsThatShouldHaveData.forEach((columnName) => {
        const value = datum[columnName];
        if (!value) {
          console.log(`⚠️ Missing value for ${columnName} in:`);
          console.log(datum);
        }
      });
    });
  } else {
    return "Provide a detail to validate";
  }
}

loadData();

function cleanRawSpecies(species) {
  const cleanedSpeciesName = species
    .replace("snake", "Snake")
    .replace("brown", "Brown")
    .replace("death", "Death")
    .replace("adder", "Adder")
    .replace("taipan", "Taipan")
    .replace("?", "")
    .replace("  ", " ")
    .replace("Mainland ", "")
    .replace("Suspected ", "")
    .replace("/Gwardar", "")
    .replace("Gwardar", "Western Brown Snake");

  if (cleanedSpeciesName === "Brown Snake") return "Eastern Brown Snake";
  if (cleanedSpeciesName === "Whip Snake") return "Little Whip Snake";
  return cleanedSpeciesName;
}

async function getSnakeFatalitiesData() {
  // const result = await fetch(
  //   `https://en.wikipedia.org/w/api.php?format=json&origin=*&action=parse&prop=text&page=List_of_fatal_snake_bites_in_Australia`
  // ).then((response) => response.json());

  // const parser = new DOMParser();
  // const external = parser.parseFromString(result.parse.text["*"], "text/html");
  // const rows = external.querySelectorAll("table tr:not(:first-child)");
  // const table = [];
  // rows.forEach((row) => {
  //   const rowData = [];
  //   const cells = row.querySelectorAll("td");
  //   cells.forEach((cell) => {
  //     rowData.push(cell.textContent.trim());
  //   });
  //   table.push(rowData);
  // });
  // const outputJSON = table.map((d) => {
  //   return {
  //     rawDate: d[0],
  //     rawSpecies: d[1],
  //     rawNameAge: d[2],
  //     rawLocationComments: d[3],
  //   };
  // });
  // console.log(outputJSON);
  // debugger;
  // To copy to clipboard, use: `copy(outputJSON)`;

  d3.json("./data/Wikipedia_List_of_fatal_snake_bites_in_Australia.json").then(
    (data) => {
      fatalitiesData = data.map((d) => {
        return {
          year: d.rawDate.replace(/.+ /g, ""),
          species: cleanRawSpecies(d.rawSpecies),
        };
      });

      knownFatalities = fatalitiesData.filter(
        (d) =>
          !(
            d.species === "Undisclosed" ||
            d.species.includes("Unconfirmed") ||
            d.species.includes("Unknown") ||
            d.species.includes("Unidentified") ||
            !d.species
          )
      );

      const mostFatalitiesBySpecies = d3
        .rollups(
          knownFatalities.filter((d) => d.species !== "Sea Snake"),
          (v) => v.length,
          (d) => d.species
        )
        .sort((a, b) => d3.descending(a[1], b[1]));

      console.log({ mostFatalitiesBySpecies });
    }
  );
}

getSnakeFatalitiesData();
