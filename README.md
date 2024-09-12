# Living among snakes in Queensland, Australia

A scrollytelling visualisation of snake sightings in South-East Queensland, Australia.

This project uses [D3](https://d3js.org/), [scrollama](https://github.com/russellsamora/scrollama), and vanilla JavaScript.

I wrote about how I morphed circles into snakes on Observable:

- [Morphing shapes into circles using D3](https://observablehq.com/@didoesdigital/morphing-shapes-into-circles-with-d3)

## Setup

- [yarn](https://yarnpkg.com/lang/en/docs/install/) to install dev dependencies like live-server for hot reloading in local development

## Development

- `yarn dev`

For local, offline development, there are local copies of [d3 v7](https://d3js.org), [scrollama](https://github.com/russellsamora/scrollama), and [Textures.js](https://riccardoscalco.it/textures/) in `./vendor/` but otherwise the code uses CDN assets.

## Analysis

- Uncomment the `analysis.js` script in `index.html` to `console.log` basic data analysis:
    ```
    <script src="./script.js"></script>
    <!-- <script src="./analysis.js"></script> -->
    ```

## License

- The code is licensed under MIT License, as shown in [LICENSE_CODE.md](./LICENSE_CODE.md).
- The data `src/data/sunny-coast-snake-species.json` and `src/data/snake-sightings-public.csv` is licensed under CC-BY-SA-4.0, as shown in [LICENSE_DATA.md](./LICENSE_DATA.md).
- The terms of the licenses of third-party libraries are shown in [`LICENSE_3RD_PARTY.md`](./LICENSE_3RD_PARTY.md).

## Author

[Di](https://didoesdigital.com)
