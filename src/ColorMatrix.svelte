<script>
    import chroma from "chroma-js";
import { each } from "svelte/internal";

import ColorSelector from "./ColorSelector.svelte";
    import { shiftHue, parseColorInput, getHcl} from "../scripts/utility.js"

    export let colors;
    let shiftValue = 180;
    let colorseriesShifted;
    let selHcl;
    let index = "0";
    let steps = 3;
    let inputcolors = "#b7ffff, #4e6bcd";
    $: index
    let inputcolorsParsed = parseColorInput(inputcolors)
    $: colors = chroma.scale(inputcolorsParsed)
    .correctLightness().classes(steps).colors(steps)

    let updateColorInput = () => {
		colors = []
		colors = chroma.scale(inputcolorsParsed)
    .correctLightness().classes(steps).colors(steps)
    console.log('update')
	};

    function setColorIndex() {
		index = this.id;
        selectedColor = inputcolorsParsed[index]
	}

    function blendColorSeries(a, b) {
        let ab = [];

    if (b != undefined & a.length === b?.length) {
        for (let i = 0; i < a.length; i++) {
            const row = [];
            for (let j = 0; j < b.length; j++) {
                // console.log(a[i], b[j]);
                if ((i < 1) & (j < 1)) {
                    row.push(chroma.blend(a[i], b[j], "multiply"));
                } else if (i < 1) {
                    row.push(b[j]);
                } else if (j < 1) {
                    row.push(a[i]);
                } else {
                    row.push(chroma.blend(a[i], b[j], "multiply"));
                }
            }
            ab.push(row);
        }
    }

        return ab;
    }

    function shiftColorSeries(colors, shiftValue){
        if (colors){
        let colorseriesShifted = colors.map((d) => {
        return shiftHue(d, shiftValue);
    });
    return colorseriesShifted;}
    }
    let selectedColor = inputcolorsParsed[0]


    $: colorseriesShifted = shiftColorSeries(colors, shiftValue);
    $: ab = blendColorSeries(colors, colorseriesShifted);
    $: selHcl = getHcl(selectedColor);


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
        <input
        type="number"
        bind:value={steps}
        on:input={updateColorInput}
    />
    {#each inputcolorsParsed as codeX, j}
    <button
        id={j.toString()}
        class:selected={index === j.toString()}
        on:click={setColorIndex}
        style="background-color:{codeX}">{codeX}</button
    >
{/each}
{inputcolorsParsed[index]}
    <ColorSelector
    bind:color={inputcolorsParsed[index]}
    hclColor={selHcl}

/>

<label class="colorslider">
    Adjust offset angle
    <input
        type="range"
        id="colorH"
        bind:value={shiftValue}
        min="0"
        max={360.0}
    />
    <input
    type="number"
    id="colorH"
    bind:value={shiftValue}
    min="0"
    max={360.0}
    step="0.1"
/>
</label>
<div class=column style="display: grid; grid-template-columns: 0fr 1fr; grid-gap: 1em; margin: 2em; padding:2em">
    <div></div>
    <div class=styledtable style="display: grid; grid-template-columns: 1fr 1fr 1fr; grid-gap: 1em;     height: 5em;">
        
        {#each colorseriesShifted as clr, i}
        <div class="cell" style="background-color:{clr}"></div>
        {/each}
    
    </div>

<div class=styledtable style="display: grid; grid-template-rows: 1fr 1fr 1fr; grid-gap: 1em; width: 5em;">
    {#each colors as clr, i}
    <div class="cell" style="background-color:{clr}"></div>
    {/each}

</div>
<div class=styledtable style="display: grid; grid-template-columns: 1fr 1fr 1fr; grid-gap: 1em">
    {#each ab as row, i}

    {#each row as entry}

        <div class="cell" style="background-color:{entry}">
            {entry}
        </div>
    {/each}
    {/each}
</div>
</div>
</div>
</main>
<style>
	.styledtable {
		height:35vh;
        width: 35vh;
	}

    .styledtable .cell{
        /* width:10em;
        height: 10em; */
    }
	.column{
	background-color: white;

	padding: 0 2em;
}

.row {
	display: flex;
	height: 5em;
}
</style>