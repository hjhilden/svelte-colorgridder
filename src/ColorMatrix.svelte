<script>
    import chroma from "chroma-js";
    import { each } from "svelte/internal";

    import { scaleLinear } from "d3/node_modules/d3-scale";

    import ColorSelector from "./ColorSelector.svelte";
    import ColorChart from "./ColorChart.svelte";
    import HueChart from "./HueChart.svelte";
    import DemoMap from "./DemoMap.svelte";

    import {
        clamp,
        shiftHcl,
        parseColorInput,
        getHcl,
        invertTextColor,
        setClipboard,
    } from "../scripts/utility.js";
    import { colorParsley } from "apca-w3";

    function clickToCopy() {
        const copyString = this.parentElement.querySelector("textarea").value;
        setClipboard(copyString);
    }

    export let colors;

    // window.location.hash = "bivariate";
    
    // interface values
    let steps = 3;
    let shiftHueValue = 180;
    let shiftLValue = 0.0;
    let shiftCValue = 0.0;
    let deltaECutoff = 22;
    let darkenCoeff = 2;
    let darkenBoost = 1.5;
    

    let colorseriesShifted;
    let selHcl;
    let index = "0";
    const paletteSize = 200;
    const paletteMargin = 55;

    const diffPaletteSize = 300;

    $: colorLabels = ['Color 0 1-1', `Color X ${steps}-1`, `Color Y 1-${steps}`]

    let inputcolors = ""
    let blendingMode = "multiply";
    let shareLightest = true;
    let showStroke = true;
    $: index;

    if (inputcolors === "") {
        inputcolors = "#b7ffff, #4e6bcd";
    }

    let inputcolorsParsed = parseColorInput(inputcolors);

    $: colors = chroma
        .scale(inputcolorsParsed)
        .correctLightness()
        .classes(steps)
        .colors(steps);

    let updateColorInput = () => {
        inputcolorsParsed = parseColorInput(inputcolors)
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
        inputcolors = inputcolorsParsed.join(', ')

    }

    const formatColorSeries = (colorSeries, target = "js") => {
        if (target === "js") {
            return `[${colorSeries
                .map((d) => {
                    return `"${d.color}"`;
                })
                .join(", ")}]`;
        }
        if (target === "biscale") {
            return `c(\n${colorSeries
                .map((d) => {
                    return `   "${d.key}" = "${d.color}"`;
                })
                .join(",\n")}\n)`;
        }
    };

    function blendColorSeriesAlt(a, b, mode = blendingMode, darkenCoeff, darkenBoost) {
        const scale1 = a;
        const scale2 = b;

        const data = [];

        // mixRange returns a value between 0 and 1 to mix colors depending on position.
        // plus axis 50/50 mix, 0.5
        const mixRange = scaleLinear([0,1]).domain([-steps+1, steps-1])

       const easeOutExpo = (x) => {
 const f =  scaleLinear([0,1]).domain([0, steps*steps])
return (1)-Math.pow(darkenCoeff, -10 * f(x));
}

        if ((scale2 != undefined) & (scale1?.length === scale2?.length)) {
            for (let i = 0; i < steps; i++) {
                for (let j = 0; j < steps; j++) {
                    let color;

                    if (mode === "mix") {
                        color = chroma
                            .mix(
                                scale1[i],
                                scale2[j],
                                mixRange(j-i),
                                "lab"
                            )
                            // .darken(Math.sin((i * j) * darkenCoeff), "lab");
                            .darken(easeOutExpo(i * j)*darkenBoost, "lab");
                            // .darken((i * j) ** darkenCoeff, "lab");
                    } else color = chroma.blend(scale1[i], scale2[j], mode);
                    data[i * steps + j] = {
                        color: color,
                        x: 125 + (-i * 200) / steps,
                        y: 125 + (-j * 200) / steps,
                        key: `${i + 1}-${j + 1}`,
                    };
                }
            }
        }

        return data;
    }

    function adjustColor(color, contrastValue = 3, grayscale = false) {
        let c_in;
        if (grayscale) {
            c_in = chroma.hex(color).desaturate(9);
        } else {
            c_in = chroma.hex(color);
        }
        let c_out = c_in;

        const maxIterations = 9;
        let n = 0;

        const clr = { c_out: "", contrast: 0, satisfies: false };
        while (
            (chroma.contrast(c_out.hex(), c_in.hex()) < contrastValue) &
            (n < maxIterations)
        ) {
            if (chroma.contrast(c_in.hex(), "#fff") < 3) {
                c_out = c_out.darken(0.25);
            } else {
                c_out = c_out.brighten(0.25);
            }

            n += 1;
        }
        clr["c_out"] = c_out.hex();
        clr["contrast"] = chroma.contrast(c_out.hex(), c_in.hex());
        clr["satisfies"] =
            chroma.contrast(c_out.hex(), c_in.hex()) < contrastValue
                ? false
                : true;
        return clr;
    }

    function adjustColorList(colorList, f = adjustColor, contrastvalue = 3) {
        let adjustedColors = colorList.map((color) => {
            return f(color, contrastvalue, false);
        });
        return adjustedColors;
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
        "mix",
        darkenCoeff,
        darkenBoost
    );

    // plain color series array
    $: colorSeriesMcolors = altColorSeriesM.map((d) => {
        return d.color;
    });

    $: colorSeriesMStroke = adjustColorList(colorSeriesMcolors);
</script>

<main>
    <div style="width:80vw; height: 50vh">

        <div class="column_box">

            <div class="column">
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
                        max={4}
                    />
                </label>
                {#each inputcolorsParsed as codeX, j}
                <label> <span class='annotation'>{colorLabels[j]}</span>
                    <button
                        id={j.toString()}
                        class:selected={index === j.toString()}
                        on:click={setColorIndex}
                        style="background-color:{codeX}">{codeX}</button
                    >
                </label>
                {/each}
                <label><span class='annotation'>{colorLabels[2]}</span>
                    <button
                        id={'0'}
                        class:selected={index ==='0'}
                        on:click={setColorIndex}
                        style="background-color:{colorseriesShifted.slice(-1)[0]}">{colorseriesShifted.slice(-1)[0]}</button
                    >
                </label>
                {inputcolorsParsed[index]}

                <ColorSelector
                    bind:color={inputcolorsParsed[index]}
                    hclColor={selHcl}
                />
            </div>
            <div class="column">
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

                <label style="margin-left:0.5em; padding-left:0.5em">
                    Adjust darken exponential for mix mode
                    <input
                        type="number"
                        id="darkenC"
                        bind:value={darkenCoeff}
                        min={1.0}
                        max={10.0}
                        step="0.1"
                    />
                </label>
                <label style="margin-left:0.5em; padding-left:0.5em">
                    Additional darken multiplier
                    <input
                        type="number"
                        id="darkenC"
                        bind:value={darkenBoost}
                        min={1.0}
                        max={2.0}
                        step="0.1"
                    />
                </label>

                <label style="margin-left:0.5em; padding-left:0.5em">
                    Adjust delta E cutoff
                    <input
                        type="number"
                        id="deltaE"
                        bind:value={deltaECutoff}
                        min={1.0}
                        max={100.0}
                    />
                </label>

                <label style="margin-left:0.5em; padding-left:0.5em">
                    Show strokes?
                    <input
                        type="checkbox"
                        id="strokeVisible"
                        bind:checked={showStroke}
                    />
                </label>
            </div>
        </div>
        <div
            class="column"
            style="display: grid; grid-template-columns: 0fr 1fr; grid-gap: 1em; margin: 2em; padding:2em"
        >
            <div />

            <div style="display: flex">
                <div>
                    <div class="defaultBlock">
                        Mode: multiply
                        <svg
                            width={paletteSize + paletteMargin * 2}
                            height={paletteSize + paletteMargin * 2}
                        >
                            <g
                                transform={"rotate(45)"}
                                transform-origin={"center center"}
                            >
                                {#each altColorSeriesM as entry, i}
                                    {#if showStroke}
                                        <rect
                                            fill={entry.color}
                                            x={entry.x + paletteMargin}
                                            y={entry.y + paletteMargin}
                                            width={paletteSize / steps}
                                            height={paletteSize / steps}
                                            stroke={colorSeriesMStroke[i].c_out}
                                            stroke-width={"2px"}
                                        />
                                {:else}
                                    <rect
                                        fill={entry.color}
                                        x={entry.x + paletteMargin}
                                        y={entry.y + paletteMargin}
                                        width={paletteSize / steps}
                                        height={paletteSize / steps}
                                    />
                                    {/if}

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
                    </div>

                    <div>
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
                    </div>
                    <div>
                        Lightness chart
                        <ColorChart
                            colors={colorSeriesMcolors}
                            yTicks={altColorSeriesM.map((d) => {
                                return d.key;
                            })}
                        />
                    </div>

                    <div>
                        Hue chart
                        <HueChart colors={colorSeriesMcolors} />
                    </div>
                    <div class="row">
                        <button on:click={clickToCopy}>Copy</button>
                        <textarea
                            style="height:auto"
                            cols="32"
                            rows="8"
                            type="text"
                            value={formatColorSeries(altColorSeriesM)}
                        />
                    </div>
                    <div
                        class="row"
                        style="height:{20 * altColorSeriesM.length + 40}px"
                    >
                        <button on:click={clickToCopy}>Copy</button>
                        <textarea
                            style="height:auto"
                            cols="32"
                            rows="15"
                            type="text"
                            value={formatColorSeries(
                                altColorSeriesM,
                                "biscale"
                            )}
                        />
                    </div>
                </div>
                <div class="column">
                    <div class="defaultBlock">
                        Mode: mix
                        <svg
                            width={paletteSize + paletteMargin * 2}
                            height={paletteSize + paletteMargin * 2}
                        >
                            <g
                                transform={"rotate(45), scale(1)"}
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
                    <DemoMap n={steps} colors={colorSeriesMcolors} strokes={colorSeriesMStroke.map(d=>{return d.c_out})} />
                </div>
            </div>
        </div>
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

    .defaultBlock {
        display: flex;
        flex-direction: column;
    }

    .column {
        background-color: white;
        padding: 0 2em;
    }

    .column_box {
        background-color: white;
        display: flex;
        margin: 2em;
        padding: 2em;
        justify-content: left;
    }

    .colorslider {
        display: grid;
        grid-template-columns: 50% 35% 15%;
        grid-gap: 0.5em;
        margin: 0em 0.5em;
        padding: 0.5em;
        align-items: center;
    }

    .row {
        display: flex;
        height: 5em;
    }

    input[type="radio"] {
        margin: 0.2em;
    }
</style>
