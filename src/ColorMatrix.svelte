<script>
    // easing function from https://easings.net/#easeOutExpo

    import chroma from "chroma-js";
    import { each } from "svelte/internal";

    import { scaleLinear } from "d3/node_modules/d3-scale";

    import ColorSelector from "./ColorSelector.svelte";
    import MultivariatePalette from "./MultivariatePalette.svelte";
    import ColorChart from "./ColorChart.svelte";
    import HueChart from "./HueChart.svelte";
    import MiniHueChart from "./MiniHueChart.svelte";
    import DemoMap from "./DemoMap.svelte";
    import DiffPalette from "./DiffPalette.svelte";

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

    function clickToCopySvg() {
		const svgstring = this.querySelector("svg").outerHTML;
		setClipboard(svgstring);
	}

    export let colors;

    // window.location.hash = "bivariate";

    // interface values
    let steps = 3;
    let shiftHueValue = 85;
    let shiftLValue = 0.0;
    let shiftCValue = 0.0;
    let deltaECutoff = 11;
    let darkenCoeff = 1.5;
    let darkenBoost = 0.7;

    let colorseriesShifted;
    let selHcl;
    let index = "0";
    const paletteSize = 200;
    const paletteMargin = 65;

    console.log(chroma("#feb24c").oklch())


    const diffPaletteSize = 225;

    $: colorLabels = [
        "Color low 1-1",
        `Color Y ${steps}-1`,
        `Color X 1-${steps}`,
    ];

    let inputcolors;
    let inputcolorsParsed = [];
    let inputPalette;
    let inputPaletteParsed = [];

    let hash = window.location.hash;
    let primaryHash;

    if (hash.split("|").length > 1) {
        primaryHash = hash.split("|")[0];
        inputcolors = hash.split("|")[1];
        inputcolorsParsed = parseColorInput(inputcolors);
        console.log(inputcolors, hash);
    } else {
        primaryHash = "#bivariate";
        inputcolors = "#ffffd4, #4e6bcd";
        inputcolorsParsed = parseColorInput(inputcolors);
    }

    const setAddress = (colors) => {
        history.pushState(colors, "", primaryHash + "|" + colors.join(","));
    };

    let blendingMode = "multiply";
    let shareLightest = true;
    let showStroke = true;

    let secondaryPaletteChoice = [
        { id: 1, text: `Multiply palette` },
        { id: 2, text: `Mix palette` },
        { id: 3, text: `Predefined palette` },
    ];

    let selectedPaletteLeft = secondaryPaletteChoice[0];
    let selectedPaletteRight = secondaryPaletteChoice[1];

    $: index;
    $: inputcolors;
    $: inputPalette;

    // first color is common low value, second high X, third high Y

    $: colors = chroma
        .scale([inputcolorsParsed[0], inputcolorsParsed[1]])
        .correctLightness()
        .classes(steps)
        .colors(steps);

    let selectedColor = inputcolorsParsed[0];

    if (inputcolorsParsed.length < 3) {
        inputcolorsParsed.push(
            shiftHcl(
                inputcolorsParsed[1],
                shiftHueValue,
                shiftCValue,
                shiftLValue
            )
        );
    }

    $: colorseriesShifted = chroma
        .scale([inputcolorsParsed[0], inputcolorsParsed[2]])
        .correctLightness()
        .classes(steps)
        .colors(steps);

    $: selHcl = getHcl(selectedColor);

    // $: altColorSeriesM = blendColorSeriesAlt(
    //     colors,
    //     colorseriesShifted,
    //     "multiply"
    // );

    $: colorPalettes = {
        "1": blendColorSeriesAlt(colors, colorseriesShifted, "multiply"),
        "2": blendColorSeriesAlt(
            colors,
            colorseriesShifted,
            "mix",
            darkenCoeff,
            darkenBoost
        ),
        "3": mapColorSeries(inputPaletteParsed),
    };

    // $: bivarPaletteRight =
    //     inputPaletteParsed.length > 0
    //         ? mapColorSeries(inputPaletteParsed)
    //         : blendColorSeriesAlt(
    //               colors,
    //               colorseriesShifted,
    //               "mix",
    //               darkenCoeff,
    //               darkenBoost
    //           );

    $: bivarPaletteLeft = colorPalettes[selectedPaletteLeft.id];
    $: bivarPaletteRight = colorPalettes[selectedPaletteRight.id];

    // plain color series arrays
    $: bivarPaletteLeftColors = bivarPaletteLeft.map((d) => {
        return d.color;
    });

    $: bivarPaletteRightColors = bivarPaletteRight.map((d) => {
        return d.color;
    });

    $: bivarPaletteLeftStroke = adjustColorList(bivarPaletteLeftColors);
    $: bivarPaletteRightStroke = adjustColorList(bivarPaletteRightColors);

    let updateColorInput = () => {
        inputcolorsParsed = parseColorInput(inputcolors);
        inputPaletteParsed = parseColorInput(inputPalette);
        inputcolorsParsed[2] = shiftHcl(
            inputcolorsParsed[1],
            shiftHueValue,
            shiftCValue,
            shiftLValue
        );
        inputcolors = inputcolorsParsed.join(", ");
        setAddress(inputcolorsParsed);
        if(inputPalette?.length>0){
            selectedPaletteRight = secondaryPaletteChoice[2]
        }
    };

    function setColorIndex() {
        index = this.id;
        selectedColor = inputcolorsParsed[index];
        inputcolors = inputcolorsParsed.join(", ");
    }

    let pickerPos, colorPickerState
    pickerPos = [0,0]
    colorPickerState ='hidden'
    
    let editColorIndex = 0
    let selectedColorLeft
    let selectedColorRight 

    // $: selectedColorLeft = bivarPaletteLeft[editColorIndex].color
 
    // also selects individual colors in generated palette
    function showColorSelector(){
        console.log(this.id)
        editColorIndex = this.id.split('.')[0]
		colorPickerState = (colorPickerState == 'visible' ? 'hidden' : 'visible')
		pickerPos = [this.getBoundingClientRect().left, this.getBoundingClientRect().top]
		// console.log(this.getBoundingClientRect().left+10, this.getBoundingClientRect().top+10)
        selectedColorLeft = bivarPaletteLeft[editColorIndex].color
	}

    function colorSelectorCallback(colorDispatch) {

        bivarPaletteLeft[editColorIndex].color = colorDispatch.detail
        selectedColorLeft = bivarPaletteLeft[editColorIndex].color

}    

function showColorSelectorForSwatch(detail){
        console.log(detail)
        const paletteId = detail.paletteId

        if (editColorIndex===detail.id.split('-')[0]){		colorPickerState = (colorPickerState == 'visible' ? 'hidden' : 'visible')}
        else if(colorPickerState === 'hidden' ) {colorPickerState = 'visible'}

        editColorIndex = detail.id.split('-')[0]

		pickerPos = detail.pos
		// console.log(this.getBoundingClientRect().left+10, this.getBoundingClientRect().top+10)
        switch(paletteId){
            case 'paletteLeft': selectedColorLeft = bivarPaletteLeft[editColorIndex].color
            case 'paletteRight': selectedColorRight = bivarPaletteRight[editColorIndex].color
        }
        
	}

function paletteSwatchCallback(clickedSwatch) {
    // console.log(clickedSwatch)
    showColorSelectorForSwatch(clickedSwatch.detail)
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

    function blendColorSeriesAlt(
        a,
        b,
        mode = blendingMode,
        darkenCoeff,
        darkenBoost
    ) {
        const scale1 = a;
        const scale2 = b;

        const data = [];

        // mixRange returns a value between 0 and 1 to mix colors depending on position.
        // plus axis 50/50 mix, 0.5
        const mixRange = scaleLinear([0, 1]).domain([-steps + 1, steps - 1]);

        const easeOutExpo = (x) => {
            const f = scaleLinear([0, 1]).domain([0, steps * steps]);
            return 1 - Math.pow(darkenCoeff, -10 * f(x));
        };

        const easeInExpo = (x) => {
            const f = scaleLinear([0, 1]).domain([0, steps * steps]);
             return Math.pow(darkenCoeff, 10 * f(x) - 10)-0.02;
            //return Math.pow(2, 10 * f(x) - 10);

        };

        if ((scale2 != undefined) & (scale1?.length === scale2?.length)) {
            for (let i = 0; i < steps; i++) {
                for (let j = 0; j < steps; j++) {
                    let color;

                    if (mode === "mix") {
                        // this darkens only colors above 3-1 / 1-3
                         let d = easeInExpo(i * j)+(i*j)*darkenBoost
                         // this darkens more, but also ”pure” colors
                        // d = (i+j)*0.2+easeInExpo(i * j) * darkenBoost + easeOutExpo(i * j)
                                    //  
                        color = chroma
                            .mix(scale1[i], scale2[j], mixRange(j - i), "lab")
                            // .darken(Math.sin((i * j) * darkenCoeff), "lab");
                            // .darken(easeOutExpo(i * j) + (i+j)*darkenBoost, "lab");
                            .darken(d, 'lab')
                            // .darken(
                            //     easeInExpo(i * j) * darkenBoost +
                            //         easeOutExpo(i * j),
                            //     "lab"
                            // );
                        // .darken((i * j) ** darkenCoeff, "lab");
                    } else color = chroma.blend(scale1[i], scale2[j], mode);
                    data[i * steps + j] = {
                        color: color,
                        x: 125 + (-i * paletteSize) / steps,
                        y: 125 + (-j * paletteSize) / steps,
                        key: `${i + 1}-${j + 1}`,
                    };
                }
            }
        }
        return data;
    }

    function mapColorSeries(scaleAB) {
        // for pre-existing color series
        const steps = Math.sqrt(scaleAB.length);
        const data = [];

        for (let i = 0; i < steps; i++) {
            for (let j = 0; j < steps; j++) {
                let color = scaleAB[i * steps + j];
                data[i * steps + j] = {
                    color: color,
                    x: 125 + (-i * paletteSize) / steps,
                    y: 125 + (-j * paletteSize) / steps,
                    key: `${i + 1}-${j + 1}`,
                };
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

    /*
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
    }*/

</script>

<main>
    <div style="width:80vw;">
        <div class ="intro">
        The bivariate hue blender creates new color palettes for <a href="https://www.joshuastevens.net/cartography/make-a-bivariate-choropleth-map/" target="blank">bivariate choropleth maps</a>. 
        It takes two input colors — a low color 
        <button class="introbutton"
        id={"0"}
        class:selected={index === "0"}
        on:click={setColorIndex}
        style="background-color:{inputcolorsParsed[0]}; color:{invertTextColor(
            'black',
            inputcolorsParsed[0]
        )}">{inputcolorsParsed[0]}</button>, and a color Y <button class="introbutton"
        id={"1"}
        class:selected={index === "1"}
        on:click={setColorIndex}
        style="background-color:{inputcolorsParsed[1]}; color:{invertTextColor(
            'black',
            inputcolorsParsed[1]
        )}">{inputcolorsParsed[1]}</button> — and creates a third color X <button class="introbutton"
        id={"2"}
        class:selected={index === "2"}
        on:click={setColorIndex}
        style="background-color:{inputcolorsParsed[2]}; color:{invertTextColor(
            'black',
            inputcolorsParsed[2]
        )}">{inputcolorsParsed[2]}</button>, by rotating the hue angle of color Y {shiftHueValue}° using the <a href="https://hclwizard.org/why-hcl/" target="blank"> Hue-Chroma-Lightness (HCL)</a> color mode. The remaining colors are created based on this. Individual colors in the left column can be changed by clicking the palette visualization.<br> 
        <span style="font-size:0.8em">NB! This is a prototype tool with known (and unknown) bugs. Use in full-screen on desktop. Refresh if it crashes.</span>
    </div>
        <div class="column_box">
            <div class="column_header">
                <h2>Color values input</h2>
                <input
                    class="colorinput"
                    bind:value={inputcolors}
                    placeholder="input colors"
                    on:input={updateColorInput}
                    on:change={updateColorInput}
                />
                <label style="padding-left: 0.5em;">
                    Color scale steps: {steps} × {steps}
                    <input
                        type="range"
                        bind:value={steps}
                        on:input={updateColorInput}
                        min="2"
                        max={4}
                    />
                </label>
            </div>

            <div class="column">
                <div class="colorbuttons">
                    {#each inputcolorsParsed as codeX, j}
                        <label>
                            <span class="annotation">{colorLabels[j]}</span>
                            <button
                                id={j.toString()}
                                class:selected={index === j.toString()}
                                on:click={setColorIndex}
                                style="background-color:{codeX}; color:{invertTextColor(
                                    'black',
                                    codeX
                                )}">{codeX}</button
                            >
                        </label>
                    {/each}
                </div>
                <ColorSelector
                    bind:color={inputcolorsParsed[index]}
                    on:change={updateColorInput}
                    hclColor={selHcl}
                />
                <label style="padding-top:0.5em">
                    Show strokes?
                    <input
                        type="checkbox"
                        id="strokeVisible"
                        bind:checked={showStroke}
                    />
                </label>
                <label style="padding-left: 0;">
                    Set delta E cutoff
                    <input
                        type="number"
                        id="deltaE"
                        bind:value={deltaECutoff}
                        min={1.0}
                        max={100.0}
                    />
                </label>
            </div>
            <div class="column">
                <p><b>Adjust colors</b></p>
                <div class="inputs">
                    <div style="    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap; align-items: center;">
                    <b>Set color X hue offset, degrees</b>
                    <MiniHueChart colors={[inputcolorsParsed[1], inputcolorsParsed[inputcolorsParsed.length-1]]} />
                    <input style="height: 50%;"
                    type="number"
                    id="colorH"
                    bind:value={shiftHueValue}
                    min="0"
                    max={360.0}
                    step="0.1"
                    on:change={updateColorInput}
                />
                <div class="break"></div>
                    <label class="colorslider" style="display:flex;">
                        angle° 
                        <input 
                            type="range"
                            id="colorH"
                            bind:value={shiftHueValue}
                            min="0"
                            max={360.0}
                            on:change={updateColorInput}
                        />

                    </label>
                </div>
                    <div class="inputs secondary" 
                    >
                    <label class="adjustment">
                        X lightness tweak
                        <!-- <input
                            type="range"
                            id="colorL"
                            bind:value={shiftLValue}
                            min={-100.0}
                            max={100.0}
                            on:change={updateColorInput}
                        /> -->
                        <input
                        style="width:4em"
                            type="number"
                            id="colorL"
                            bind:value={shiftLValue}
                            min={-100.0}
                            max={100.0}
                            step="0.1"
                            on:change={updateColorInput}
                        />
                    </label>

                    <label class="adjustment">
                        X chroma tweak
                        <!-- <input
                            type="range"
                            id="colorC"
                            bind:value={shiftCValue}
                            min={-100.0}
                            max={100.0}
                            on:change={updateColorInput}
                        /> -->
                        <input
                        style="width:4em"
                            type="number"
                            id="colorC"
                            bind:value={shiftCValue}
                            min={-100.0}
                            max={100.0}
                            step="0.1"
                            on:change={updateColorInput}
                        />
                    </label>
                </div>
                <div class="divider"></div>
                <div class="inputs secondary">
                    <label class="adjustment">
                        Darken exponential (mix mode)
                        <input style="width:4em"
                            type="number"
                            id="darkenC"
                            bind:value={darkenCoeff}
                            min={1.0}
                            max={10.0}
                            step="0.1"
                        />
                    </label>
                    <label class="adjustment">
                        Additional darken multiplier
                        <input style="width:4em"
                            type="number"
                            id="darkenC"
                            bind:value={darkenBoost}
                            min={0.0}
                            max={100.0}
                            step="0.01"
                        />
                    </label>
                </div>
                </div>
            </div>
            <div class="column">
                <p><b>Or input existing palette</b></p>
                <textarea
                    style="height:auto; font-size:10pt"
                    cols="30"
                    rows="3"
                    type="text"
                    bind:value={inputPalette}
                    placeholder="paste existing palette here"
                    on:input={updateColorInput}
                    on:change={updateColorInput}
                />
            </div>
        </div>
        <div class="column" style="display: grid; margin: 2em; padding:2em">
            <div id="colorpicker" class={"picker "+colorPickerState} style={`left:${270}px; top:${100}px; width:17rem`}>
                <div style="
                background-color:#eee;
                display: flex;
                padding-left: 0.5rem;
                margin-bottom: -0.5rem;
                justify-content: space-between;
                align-items: center;
            ">Adjust generated colors<button style='line-height: 0px;
                    margin: 0.25em;
                    height: 1.5rem;' on:click={()=> {
                    colorPickerState = (colorPickerState == 'visible' ? 'hidden' : 'visible')
                }}>×</button></div>
                
                <ColorSelector color={bivarPaletteLeft[editColorIndex].color} on:colorChange={colorSelectorCallback}
                />

            
        </div>
            <div class="row">
                <div class="defaultBlock">
                    <label>
                        Selected left palette:
                        <select bind:value={selectedPaletteLeft}>
                            {#each secondaryPaletteChoice as option, i}
                                <option value={option}>
                                    {option.id} – {option.text}
                                </option>
                            {/each}
                        </select></label
                    >
                    <div on:click={clickToCopySvg}>
                    <MultivariatePalette
                    id={'paletteLeft'}
                        colorSeries={bivarPaletteLeft}
                        {steps}
                        strokeSeries={bivarPaletteLeftStroke}
                        {showStroke}
                        {paletteSize}
                        {paletteMargin}
                        on:clickedSwatch={paletteSwatchCallback}
                    /></div>
                    <!-- {#each bivarPaletteLeft as paletteColor, i}
                    <button
                                id={i.toString()+'.bivarPaletteLeft'}
                                class:selected={index === i.toString()+'_pal'}
                                on:click={showColorSelector}
                                style="background-color:{paletteColor.color}; color:{invertTextColor(
                                    'black',
                                    paletteColor.color
                                )}">{paletteColor.key}: {paletteColor.color}</button
                            >
                    {/each} -->
                </div>
                <div class="defaultBlock">
                    <label>
                        Selected right palette:
                        <select bind:value={selectedPaletteRight}>
                            {#each secondaryPaletteChoice as option, i}
                                <option value={option}>
                                    {option.id} – {option.text}
                                </option>
                            {/each}
                        </select></label
                    >
                    <MultivariatePalette
                    id={'paletteRight'}

                        colorSeries={bivarPaletteRight}
                        {steps}
                        strokeSeries={bivarPaletteRightStroke}
                        {showStroke}
                        {paletteSize}
                        {paletteMargin}
                        on:clickedSwatch={paletteSwatchCallback}

                    />
                </div>
            </div>
            <div class="row">
                <div>
                    <p>
                        Pairs with circled grey dot have Delta E below {deltaECutoff}
                    </p>
                    <DiffPalette
                        {diffPaletteSize}
                        {paletteMargin}
                        {deltaECutoff}
                        colorSeries={bivarPaletteLeft}
                        {steps}
                    />
                </div>
                <div>
                    <p>Pairs for {selectedPaletteRight.text}</p>
                    <DiffPalette
                        {diffPaletteSize}
                        {paletteMargin}
                        {deltaECutoff}
                        colorSeries={bivarPaletteRight}
                        {steps}
                    />
                </div>
            </div>
            <div class="row">
                <div>
                    <p>Lightness chart, {selectedPaletteLeft.text}</p>
                    <ColorChart
                        colors={bivarPaletteLeftColors}
                        yTicks={bivarPaletteLeft.map((d) => {
                            return d.key;
                        })}
                    />
                </div>
                <div>
                    <p>Lightness chart, {selectedPaletteRight.text}</p>
                    <ColorChart
                        colors={bivarPaletteRightColors}
                        yTicks={bivarPaletteRight.map((d) => {
                            return d.key;
                        })}
                    />
                </div>
            </div>

            <div class="row">
                <div on:click={clickToCopySvg}
                >
                    <p>Hue chart, {selectedPaletteLeft.text}</p>
                    <HueChart colors={bivarPaletteLeftColors} />
                </div>
                <div on:click={clickToCopySvg}>
                    <p>Hue chart, {selectedPaletteRight.text}</p>
                    <HueChart colors={bivarPaletteRightColors} />
                </div>
            </div>

            <div class="row" on:click={clickToCopySvg}>

                <DemoMap
                    n={steps}
                    colors={bivarPaletteLeftColors}
                    strokes={bivarPaletteLeftStroke.map((d) => {
                        return d.c_out;
                    })}
                />
                <DemoMap
                    n={steps}
                    colors={bivarPaletteRightColors}
                    strokes={bivarPaletteRightStroke.map((d) => {
                        return d.c_out;
                    })}
                />
            </div>

            <div class="row">
                <div>
                    <p>Color codes for {selectedPaletteLeft.text}</p>

                    <div style="    display: flex;">
                        <button on:click={clickToCopy} class="copybutton"
                            >Copy</button
                        >
                        <textarea
                            style="height:auto"
                            cols="32"
                            rows="3"
                            type="text"
                            value={formatColorSeries(bivarPaletteLeft)}
                        />
                    </div>
                    <div
                        style="display: flex; height:{20 *
                            bivarPaletteLeft.length +
                            60}px"
                    >
                        <button on:click={clickToCopy} class="copybutton"
                            >Copy<br />for R</button
                        >
                        <textarea
                            style="height:auto"
                            cols="32"
                            rows="20"
                            type="text"
                            value={formatColorSeries(
                                bivarPaletteLeft,
                                "biscale"
                            )}
                        />
                    </div>
                </div>
                <div>
                    <p>Color codes for {selectedPaletteRight.text}</p>

                    <div style="    display: flex;">
                        <button on:click={clickToCopy} class="copybutton"
                            >Copy</button
                        >
                        <textarea
                            style="height:auto"
                            cols="32"
                            rows="3"
                            type="text"
                            value={formatColorSeries(bivarPaletteRight)}
                        />
                    </div>
                    <div
                        style="display: flex; height:{20 *
                            bivarPaletteRight.length +
                            60}px"
                    >
                        <button on:click={clickToCopy} class="copybutton"
                            >Copy<br />for R</button
                        >
                        <textarea
                            style="height:auto"
                            cols="32"
                            rows="20"
                            type="text"
                            value={formatColorSeries(
                                bivarPaletteRight,
                                "biscale"
                            )}
                        />
                    </div>
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
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        margin: 2em;
        padding: 0em 2em 1em;
        justify-content: left;
    }

    .column_header {
        grid-column-start: span 3;
        margin-bottom: 0.5;
        display: flex;
        align-items: baseline;
    }

    .introbutton{
    margin: 0 0;
    padding: 0.08em;
    font-size: 0.9em;
    }

    .inputs {
        font-size: 0.9rem;
    }

    .secondary{
        font-size: .75rem;
        display: grid;
    grid-template-columns: 50% 1fr;
    }

    .adjustment {
        margin-left: 0.5em;
        padding-left: 0.5em;
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-gap: 0.25em;
        margin: 0em 0.25em;
        padding: 0.25em;
        align-items: center;
    }

    .colorinput {
        flex-grow: 0.2;
        margin-left: 1em;
    }

    .colorslider {
        display: grid;
        grid-template-columns: 50% 35% 15%;
        grid-gap: 0.5em;
        margin: 0em 0.25em;
        padding: 0.25em;
        align-items: center;
    }

    .colorbuttons {
        display: flex;
    }

    .copybutton {
        width: 13%;
        border-radius: 3px 0 0 3px;
    }

    .row {
        display: grid;
        grid-gap: 1em;
        grid-template-columns: 1fr 1fr;
    }

    input[type="radio"] {
        margin: 0.2em;
    }

    /* hideable secondary color picker */
    .visible{
		display:block;
	}
	.hidden{
		display:none;
	}
	.picker{position:relative;
    height: 0;}
</style>
