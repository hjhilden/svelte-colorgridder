<script>
import chroma from "chroma-js";
import { invertTextColor } from "../scripts/utility";

import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

export let id ='palette'
export let paletteSize, paletteMargin

export let colorSeries = [] 
export let strokeSeries = []
export let steps
export let showStroke
export let clickedSwatch = 0



// make dispatch for clicked color
function clickMe(e) {
    console.log(e)
    let parentBounds = document.querySelector("#"+id).getBoundingClientRect()

    clickedSwatch = e.target.id
    let pos = [parentBounds.x, parentBounds.bottom ]
    console.log(pos)
    dispatch('clickedSwatch', {id:clickedSwatch, pos:pos, paletteId:id});

}
</script>


<svg id={id}
                            width={paletteSize + paletteMargin * 2}
                            height={paletteSize + paletteMargin * 2+25}
                        ><g transform="translate(-15, {-((paletteSize)/(steps*steps))*1.75+paletteMargin})">
                            <g
                                transform={"rotate(45)"}
                                transform-origin={"center center"}
                            >
                                {#each colorSeries as entry, i}
                                <g class='swatch'>
                                    {#if showStroke}
                                        <rect on:click={clickMe}
                                        id={i + '-swatch'}
                                            fill={entry.color}
                                            x={entry.x +paletteMargin}
                                            y={entry.y+ +paletteMargin}
                                            width={paletteSize / steps}
                                            height={paletteSize / steps}
                                            stroke={strokeSeries[i].c_out}
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
                                        {#if entry.key.split('-')[0] ===`${steps}` && entry.key.split('-')[1] === '1' }
                                        <text x={-60} y={5}>Y</text>
                                        {/if}
                                        {#if entry.key.split('-')[1] ===`${steps}` && entry.key.split('-')[0] === '1' }
                                        <text x={50} y={5}>X</text>
                                        {/if}
                                        {#if entry.key === '1-1' }
                                        <text x={0} y={60} text-anchor="middle">low</text>
                                        {/if}
                                    </g>
                                </g>
                                {/each}
                            </g></g>
                        </svg>
<style
>
text{
    user-select: none;
pointer-events: none;}

.swatch{
    pointer-events: bounding-box;
    pointer-events:all;

}
.swatch:hover{
    font-weight: bold;
    stroke-width: 3px;

}

.swatch :hover{
    stroke-width: 3px;
}

</style>