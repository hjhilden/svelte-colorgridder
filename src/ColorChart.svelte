<script>
import { scaleLinear } from 'd3-scale';
import chroma from "chroma-js";
import { getHcl } from '../scripts/utility';
export let width =300
export let height =200
export let colors = ["#b7ffff", "#4e6bcd"]
export let xTicks = []

$: points = colors.map(color=>{
    return {color:color, l:getHcl(color).l}
})

let yTicks = [0, 25, 50, 75, 100]

const padding = { top: 20, right: 15, bottom: 20, left: 50 };

$: steps = colors.length

$: xScale = scaleLinear()
		.domain([0, colors.length])
		.range([padding.left, width - padding.right]);

	$: yScale = scaleLinear()
		.domain([0, Math.max.apply(null, yTicks)])
		.range([height - padding.bottom, padding.top]);
</script>

<div>
    Lightness chart
    <svg
    width={width+padding.left+padding.right}
    height={height+padding.top+padding.bottom}
>
<g class="axis y-axis">
    {#each yTicks as tick}
        <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
            <line x2="{width-padding.right}"></line>
            <text y="-4">l {tick}</text>
        </g>
    {/each}
</g>

<g class="axis x-axis">
    {#each xTicks as tick, i}
        <g class="tick tick-{tick}" transform="translate({xScale(i)}, {height} )">
            <line y1="-12" y2="-{height}"></line>
            <text y="0">{tick}</text>
        </g>
    {/each}
</g>
    <g>
        {#each points as point, i}
            <circle
                fill={point.color}
                cx="{xScale(i)}"
                cy="{yScale(point.l)}"
                r={(5)}
            />

        {/each}
    </g>
</svg>
</div>
<style>
    .tick {
		font-size: .725em;
		font-weight: 200;
	}

	.tick line {
		stroke: #595959;
		stroke-dasharray: 2;
	}

	.tick text {
		fill: #595959;
		text-anchor: start;
	}

	.tick.tick-0 line {
		stroke-dasharray: 0;
	}

	.x-axis .tick text {
		text-anchor: middle;
	}
</style>