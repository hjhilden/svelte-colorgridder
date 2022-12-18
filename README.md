
# Svelte colorgridder


This app was created by Jonatan Hildén as part of a Master’s Thesis in Art and Media for Aalto University.

It has two modes: **Contrast grid** and **Bivariate hue blender**


## Contrast grid 
Contrast grid takes a list of colors and compares their contrasts.
It displays [APCA](https://github.com/Myndex/apca-w3) (upper row) and [wcag-contrast](https://www.npmjs.com/package/wcag-contrast) (lower row) values. 

The tool generates strokes that can be used to achieve sufficient contrast between adjacent hues or light colors and a background.

## Bivariate hue blender
Bivariate hue blender is a tool for creating custom color scales for bivariate choropleth maps using two starting colors (for low and high Y values) as input. The high X color is created by rotating the Y color using the Hue-Chroma-Lightness color space. Intermediate colors are blended from these pairs using two alternative methods: multiply and mix. Multiply uses the multiply blending mode, while mix uses Chroma.js to calculate intermediate hues and adjust the lightness of higher values.

Color schemes can be used with the R package <a href="https://github.com/chris-prener/biscale">biscale</a> or the <a href="https://observablehq.com/@d3/bivariate-choropleth">Bivariate choropleth example</a> on Observable. 

### Acknowledgements
The principle for creating the color palettes builds on the blog post <a href="https://web.archive.org/web/20210424085202/https://www.joshuastevens.net/cartography/make-a-bivariate-choropleth-map/"><i>Bivariate Choropleth Maps: A How-to Guide</i></a> by Joshua Stevens.

Color scale generation is done with <a href="https://gka.github.io/chroma.js/">Chroma.js</a> and <a href="https://github.com/Myndex/apca-w3">APCA contrast algorithms</a> are used for additional color analysis. <br>

The palette design was inspired by the <a href="https://observablehq.com/@benjaminadk/bivariate-choropleth-color-generator">@benjaminadk/bivariate-choropleth-color-generator</a>.



## Run locally

Install the dependencies...

```bash
cd svelte-app
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode). If you are using other editors you may need to install a plugin in order to get syntax highlighting and intellisense.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).

