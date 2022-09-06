<script>
    import chroma from "chroma-js";
    import { each } from "svelte/internal";

    import ColorSelector from "./ColorSelector.svelte";
    import ColorChart from "./ColorChart.svelte";
    import {
        shiftHcl,
        parseColorInput,
        getHcl,
        invertTextColor,
        setClipboard
        
    } from "../scripts/utility.js";
    import { colorParsley } from "apca-w3";


    function clickToCopy() {
     const copyString = this.parentElement.querySelector('textarea').value;
    setClipboard(copyString);

}

    export let colors;

    // window.location.hash = "bivariate";

    let shiftHueValue = 180;
    let shiftLValue = 0.0;
    let shiftCValue = 0.0;
    let deltaECutoff = 50;
    let colorseriesShifted;
    let selHcl;
    let index = "0";
    let steps = 3;
    const paletteSize = 200;
    const paletteMargin = 45;

    const diffPaletteSize = 300;

    let inputcolors = "#b7ffff, #4e6bcd";
    let blendingMode = "multiply";
    let shareLightest = false;
    $: index;
    let inputcolorsParsed = parseColorInput(inputcolors);

    $: colors = chroma
        .scale(inputcolorsParsed)
        .correctLightness()
        .classes(steps)
        .colors(steps);

    let updateColorInput = () => {
        colors = [];
        colors = chroma
            .scale(inputcolorsParsed)
            .correctLightness()
            .classes(steps)
            .colors(steps);
        console.log("update");
    };

    function setColorIndex() {
        index = this.id;
        selectedColor = inputcolorsParsed[index];
    }

    const formatColorSeries = (colorSeries) =>{
       return `[${colorSeries.map((d) => {
                                return `"${d.color}"`;
                            }).join(', ')}]`

    }

    function blendColorSeriesAlt(a, b, mode = blendingMode) {
        const scale1 = a;
        const scale2 = b;

        const data = [];
        if ((scale2 != undefined) & (scale1?.length === scale2?.length)) {
            for (let i = 0; i < steps; i++) {
                for (let j = 0; j < steps; j++) {
                    data[i * steps + j] = {
                        color: chroma.blend(scale1[i], scale2[j], mode),
                        x: (i * 200) / steps,
                        y: (j * 200) / steps,
                        key: `${i + 1}-${j + 1}`,
                    };
                }
            }
        }

        return data;
    }

    function blendColorSeries(a, b, mode = blendingMode) {
        let ab = [];

        if ((b != undefined) & (a.length === b?.length)) {
            for (let i = 0; i < a.length; i++) {
                const row = [];
                for (let j = 0; j < b.length; j++) {
                    // console.log(a[i], b[j]);
                    if ((i < 1) & (j < 1)) {
                        row.push(chroma.blend(a[i], b[j], mode));
                    } else if (i < 1) {
                        row.push(b[j]);
                    } else if (j < 1) {
                        row.push(a[i]);
                    } else {
                        row.push(chroma.blend(a[i], b[j], mode));
                    }
                }
                ab.push(row);
            }
        }

        return ab;
    }

    function shiftColorSeries(
        colors,
        shiftValues = { h: 0, c: 0, l: 0 },
        shareLightest
    ) {
        if (colors) {
            // let colorseriesShifted = colors.map((d) => {
            //     return shiftHcl(d, shiftValue);
            // });
            // don’t shift lightness, chroma for light color
            let colorseriesShifted = chroma
                .scale([
                    shiftHcl(colors[0], 0, 0, 0),
                    shiftHcl(
                        colors[colors.length - 1],
                        shiftValues.h,
                        shiftValues.c,
                        shiftValues.l
                    ),
                ])
                .correctLightness()
                .classes(steps)
                .colors(steps);

            if (shareLightest) {
                colorseriesShifted[0] = colors[0];
            }
            return colorseriesShifted;
        }
    }
    let selectedColor = inputcolorsParsed[0];

    $: colorseriesShifted = shiftColorSeries(
        colors,
        { h: shiftHueValue, c: shiftCValue, l: shiftLValue },
        shareLightest
    );
    $: selHcl = getHcl(selectedColor);
    $: altColorSeriesM = blendColorSeriesAlt(
        colors,
        colorseriesShifted,
        "multiply"
    );
    $: altColorSeriesD = blendColorSeriesAlt(
        colors,
        colorseriesShifted,
        "darken"
    );
</script>

<main>
    <div style="width:80vw; height: 50vh">
        <h2>Color values input</h2>
        <input
            class="colorinput"
            bind:value={inputcolors}
            placeholder="input colors"
            on:input={updateColorInput}
            on:change={updateColorInput}
        />
        <label>
            Scale steps: {steps}
            <input
                type="range"
                bind:value={steps}
                on:input={updateColorInput}
                min="2"
                max={5}
            />
        </label>
        {#each inputcolorsParsed as codeX, j}
            <button
                id={j.toString()}
                class:selected={index === j.toString()}
                on:click={setColorIndex}
                style="background-color:{codeX}">{codeX}</button
            >
        {/each}

        {inputcolorsParsed[index]}
        <label
            ><input type="checkbox" bind:checked={shareLightest} />
            Common lightest color?</label
        >
        <ColorSelector
            bind:color={inputcolorsParsed[index]}
            hclColor={selHcl}
        />

        <label class="colorslider">
            Adjust offset angle
            <input
                type="range"
                id="colorH"
                bind:value={shiftHueValue}
                min="0"
                max={360.0}
            />
            <input
                type="number"
                id="colorH"
                bind:value={shiftHueValue}
                min="0"
                max={360.0}
                step="0.1"
            />
        </label>
        <label class="colorslider">
            Adjust offset color lightness
            <input
                type="range"
                id="colorL"
                bind:value={shiftLValue}
                min={-100.0}
                max={100.0}
            />
            <input
                type="number"
                id="colorL"
                bind:value={shiftLValue}
                min={-100.0}
                max={100.0}
                step="0.1"
            />
        </label>

        <label class="colorslider">
            Adjust offset color chroma
            <input
                type="range"
                id="colorC"
                bind:value={shiftCValue}
                min={-100.0}
                max={100.0}
            />
            <input
                type="number"
                id="colorC"
                bind:value={shiftCValue}
                min={-100.0}
                max={100.0}
                step="0.1"
            />
        </label>

        <label class="colorslider">
            Adjust delta E cutoff
            <input
                type="range"
                id="deltaE"
                bind:value={deltaECutoff}
                min={1.0}
                max={100.0}
            />

            <div
                class="column"
                style="display: grid; grid-template-columns: 0fr 1fr; grid-gap: 1em; margin: 2em; padding:2em"
            >
                <div />

                <div style="display: flex">
                    <div>
                        Mode: multiply
                        <svg
                            width={paletteSize + paletteMargin * 2}
                            height={paletteSize + paletteMargin * 2}
                        >
                            <g
                                transform={"rotate(45)"}
                                transform-origin={"center center"}
                            >
                                {#each altColorSeriesM as entry}
                                    <rect
                                        fill={entry.color}
                                        x={entry.x + paletteMargin}
                                        y={entry.y + paletteMargin}
                                        width={paletteSize / steps}
                                        height={paletteSize / steps}
                                    />
                                    <g
                                        transform={`translate(${
                                            entry.x +
                                            paletteMargin +
                                            paletteSize / steps / 2
                                        }, ${
                                            entry.y +
                                            paletteMargin +
                                            paletteSize / steps / 2
                                        }) rotate(-45)`}
                                    >
                                        <text
                                            fill={invertTextColor(
                                                "black",
                                                chroma(entry.color).hex("rgb")
                                            )}
                                            text-anchor="middle"
                                            x={0}
                                            y={5}
                                        >
                                            {entry.key}
                                        </text>
                                    </g>
                                {/each}
                            </g>
                        </svg>
                        <p>
                            Pairs with tag corner have Delta E distance below {deltaECutoff}
                        </p>
                        <svg
                            width={diffPaletteSize + paletteMargin * 2}
                            height={diffPaletteSize + paletteMargin * 2}
                        >
                            <g>
                                {#each altColorSeriesM as entryX, i}
                                    {#each altColorSeriesM as entryY, j}
                                        <g
                                            transform={`translate(${
                                                (j * diffPaletteSize) /
                                                (steps * steps)
                                            }, ${
                                                (i * diffPaletteSize) /
                                                (steps * steps)
                                            })`}
                                        >
                                            <rect
                                                fill={entryX.color}
                                                x={0}
                                                y={0}
                                                width={diffPaletteSize /
                                                    (steps * steps)}
                                                height={diffPaletteSize /
                                                    (steps * steps)}
                                            />
                                            <rect
                                                x={diffPaletteSize /
                                                    (steps * steps) /
                                                    4}
                                                y={diffPaletteSize /
                                                    (steps * steps) /
                                                    4}
                                                width={diffPaletteSize /
                                                    (steps * steps) /
                                                    2}
                                                height={diffPaletteSize /
                                                    (steps * steps) /
                                                    2}
                                                rx="30"
                                                style="fill:{entryY.color};"
                                            />
                                            {#if (chroma.distance(entryX.color, entryY.color) < deltaECutoff) & (entryX.color !== entryY.color)}
                                                <polygon
                                                    points={`0,0 0,${
                                                        diffPaletteSize /
                                                        (steps * steps) /
                                                        4
                                                    } ${
                                                        diffPaletteSize /
                                                        (steps * steps) /
                                                        4
                                                    }, 0`}
                                                    style="fill:#fff"
                                                />
                                            {/if}
                                        </g>
                                    {/each}
                                {/each}
                            </g>
                        </svg>
                        <ColorChart
                            colors={altColorSeriesM.map((d) => {
                                return d.color;
                            })}
                            xTicks={altColorSeriesM.map((d) => {
                                return d.key;
                            })}
                        />
                        <div>
                        <button on:click="{clickToCopy}">Copy</button>
                        <textarea
                        style="height:auto"
                        cols="32"
                        rows=8
                            type="text"
                            value={formatColorSeries(altColorSeriesM)}
                        />
                    </div>
                    </div>
                    <div>
                        Mode: darken
                        <svg
                            width={paletteSize + paletteMargin * 2}
                            height={paletteSize + paletteMargin * 2}
                        >
                            <g
                                transform={"rotate(45)"}
                                transform-origin={"center center"}
                            >
                                {#each altColorSeriesD as entry}
                                    <rect
                                        fill={entry.color}
                                        x={entry.x + paletteMargin}
                                        y={entry.y + paletteMargin}
                                        width={paletteSize / steps}
                                        height={paletteSize / steps}
                                    />
                                {/each}
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        </label>
    </div>
</main>

<style>
    .styledtable {
        height: 35vh;
        width: 35vh;
    }

    .styledtable .cell {
        /* width:10em;
        height: 10em; */
    }
    .column {
        background-color: white;

        padding: 0 2em;
    }

    .row {
        display: flex;
        height: 5em;
    }

    input[type="radio"] {
        margin: 0.2em;
    }
</style>
