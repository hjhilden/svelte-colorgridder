<script>
    import chroma from "chroma-js";

    export let diffPaletteSize, paletteMargin;
    export let deltaECutoff;
    export let colorSeries = [];
    export let steps;

    const diffPaletteData = (colorSeries, size, length, deltaECutoff) => {
        let data = [];
        let summary = [];
        let failingPairs = 0;
        colorSeries.forEach((dX, i) => {
            colorSeries.forEach((dY, j) => {
                if (i > j) {
                    let deltaE = chroma.deltaE(dX.color, dY.color);
                    if (deltaE < deltaECutoff) failingPairs += 1;

                    summary.push(deltaE);
                    data.push({
                        pairKey: `${dX.key} ${dY.key}`,
                        colorX: dX.color,
                        colorY: dY.color,
                        deltaE: deltaE,
                        aboveCutoff: deltaE > deltaECutoff,
                        x: (i * size) / length,
                        y: (j * size) / length,
                    });
                }
            });
        });
        return {
            paletteData: data,
            deltaEMax: Math.max(...summary),
            deltaEMin: Math.min(...summary),
            failingPairs: failingPairs,
        };
    };

    $: paletteStats = diffPaletteData(
        colorSeries,
        diffPaletteSize,
        steps * steps,
        deltaECutoff
    );
    $: console.log(paletteStats)

    const swatchWidth = diffPaletteSize / (steps * steps);
</script>

<svg
    width={diffPaletteSize + paletteMargin * 2}
    height={diffPaletteSize +20}
>
    <g
        transform={`translate(${0}, ${
            diffPaletteSize - paletteMargin
        }) rotate(-45)`}
    >
        {#each paletteStats.paletteData as colorPair}
            <g transform={`translate(${colorPair.x}, ${colorPair.y})`}>
                <polygon
                    points={`0,0
                                            0,${swatchWidth},
                                                ${swatchWidth},0
                                                `}
                    fill={colorPair.colorX}
                />
                <polygon
                    points={`
                                                ${swatchWidth},${swatchWidth}
                                                    0,${swatchWidth},
                                                    ${swatchWidth},0`}
                    fill={colorPair.colorY}
                />
                <rect
                    x={swatchWidth / 4}
                    y={swatchWidth / 4}
                    width={swatchWidth / 2}
                    height={swatchWidth / 2}
                    rx="30"
                    style="fill:{colorPair.colorY};"
                />
                {#if colorPair.aboveCutoff===false}
                    <rect
                        x={swatchWidth / 4}
                        y={swatchWidth / 4}
                        width={swatchWidth / 2}
                        height={swatchWidth / 2}
                        rx="30"
                        style="fill:#fff"
                    />
                    <circle
                    cx={swatchWidth/2}
                    cy={swatchWidth /2}
                    r={swatchWidth / 8}
                    style="fill:#bbb"
                />
                {/if}
            </g>
        {/each}
    </g>
    <text y={diffPaletteSize-20} font-size=11>
        deltaE, max: {paletteStats.deltaEMax.toFixed(2)}, min: {paletteStats.deltaEMin.toFixed(2)}
    </text>
    <text y={diffPaletteSize} font-size=11>
        failing pairs: {paletteStats.failingPairs} of {paletteStats.paletteData.length}
    </text>
</svg>
