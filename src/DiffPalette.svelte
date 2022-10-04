<script>
    import chroma from "chroma-js";

    export let diffPaletteSize, paletteMargin
    export let deltaECutoff
    export let colorSeries = [] 
    export let steps
</script>

<svg
                            width={diffPaletteSize + paletteMargin * 2}
                            height={diffPaletteSize - paletteMargin }
                        >
                            <g transform={`translate(${0}, ${diffPaletteSize-paletteMargin}) rotate(-45)`}>
                                {#each colorSeries as entryX, i}
                                    {#each colorSeries as entryY, j}
                                        {#if j>i}
                                        <g
                                            transform={`translate(${
                                                (j * diffPaletteSize) /
                                                (steps * steps)
                                            }, ${
                                                (i * diffPaletteSize) /
                                                (steps * steps)
                                            })`}
                                        >   
                                            <polygon points={`0,0
                                            0,${diffPaletteSize / (steps * steps)},
                                                ${diffPaletteSize /(steps * steps)},0
                                                `}
                                                fill={entryX.color}/>
                                                <polygon points={`
                                                ${diffPaletteSize /
                                                    (steps * steps)},${diffPaletteSize /
                                                    (steps * steps)}
                                                    0,${diffPaletteSize /
                                                    (steps * steps)},
                                                    ${diffPaletteSize /
                                                    (steps * steps)},0`}
                                                    fill={entryY.color}/>
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
                                                <rect
                                                    x={diffPaletteSize/ (steps*steps)/4}
                                                    y={diffPaletteSize/ (steps*steps)/4}
                                                    width={diffPaletteSize/ (steps*steps)/2}
                                                    height={diffPaletteSize/ (steps*steps)/2}
                                                    rx="30"
                                                    style="fill:#fff"
                                                />
                                            {/if}
                                        </g>
                                        {/if}
                                    {/each}
                                    
                                {/each}
                            </g>
                        </svg>