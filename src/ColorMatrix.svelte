<script>
    import chroma from "chroma-js";
import { each } from "svelte/internal";

    import { shiftHue } from "../scripts/utility.js"

    export let colorseries;
    let shiftValue = 180;

    colorseries = ["#ffffb2", "#fed976", "#feb24c"];

    $: ab = shiftColorSeries(colorseries, shiftValue);

    function shiftColorSeries(colorseries, shiftValue){
        let colorseriesShifted = colorseries.map((d) => {
        return shiftHue(d, shiftValue);
    });

        const a = colorseries;
    const b = colorseriesShifted;

    console.log(shiftValue)
    let ab = [];

    if (b != undefined & a.length === b?.length) {
        for (let i = 0; i < a.length; i++) {
            const row = [];
            for (let j = 0; j < b.length; j++) {
                console.log(a[i], b[j]);
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

</script>
<main>
<div class="column">

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
</main>
<style>
	.styledtable {
		height:50vh
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