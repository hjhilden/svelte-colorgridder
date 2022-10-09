<script>
import chroma from "chroma-js";
import { invertTextColor } from "../scripts/utility";

export let paletteSize, paletteMargin

export let colorSeries = [] 
export let strokeSeries = []
export let steps
export let showStroke
export let clickedSwatch = 0

// make dispatch for clicked color
function clickMe(e) {
    console.log(e.target.id)
    clickedSwatch = e.target.id
}
</script>


<svg
                            width={paletteSize + paletteMargin * 2}
                            height={paletteSize + paletteMargin * 2}
                        >
                            <g
                                transform={"rotate(45)"}
                                transform-origin={"center center"}
                            >
                                {#each colorSeries as entry, i}
                                    {#if showStroke}
                                        <rect on:click={clickMe}
                                        id={i + '-swatch'}
                                            fill={entry.color}
                                            x={entry.x + paletteMargin}
                                            y={entry.y + paletteMargin}
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
                                    </g>
                                {/each}
                            </g>
                        </svg>