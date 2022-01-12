<script>
    import chroma from "chroma-js";
import { each } from "svelte/internal";

    import { shiftHue } from "./scripts/utility.js";

    export let colorseries;

    colorseries = ["#ffffb2", "#fed976", "#feb24c"];

    let colorseriesShifted = colorseries.map((d) => {
        return shiftHue(d);
    });

    const a = colorseries;
    const b = colorseriesShifted;

    let ab = [];

    if (a.length === b.length) {
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
</script>

<div class=styledtable style="display: grid; grid-template-columns: 1fr 1fr 1fr; grid-gap: 1em">
    {#each ab as row, i}
    {#each row as entry}
        <div class="cell" style="background-color:{entry}">
            {entry}
        </div>
    {/each}
    {/each}
</div>

<style>
	.styledtable {
		height:50vh
	}

</style>