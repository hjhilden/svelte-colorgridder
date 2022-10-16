<script>
import { scaleLinear } from 'd3-scale';
import {ascending} from 'd3-array'
import { getHcl } from '../scripts/utility';
export let width =300
export let height =200
export let colors = ["#b7ffff", "#4e6bcd"]
export let yTicks = []

const parseSum = (entry)=> {
 return entry.split('-').reduce((a,b)=>parseInt(a)+parseInt(b))
}


// sort by level sum

$: points = colors.map((color, i)=>{
    return {color:color, l:getHcl(color).l, id:yTicks[i]}
}).sort((a,b)=>ascending(parseSum(a.id), parseSum(b.id)))



let xTicks = [0, 25, 50, 75, 100]

const padding = { top: 20, right: 15, bottom: 20, left: 25 };


$: xScale = scaleLinear()
		.domain([0, Math.max.apply(null, xTicks)] )
		.range([padding.left, width - padding.right]);

	$: yScale = scaleLinear()
		.domain([colors.length, 0])
		.range([height - padding.bottom, padding.top]);
</script>

<div>
    <svg
    width={width+padding.left+padding.right}
    height={height+padding.top+padding.bottom}
>
<g class="axis y-axis">
    {#each points as tick, i}
        <g class="tick tick-{tick}" transform="translate(0, {yScale(i)})">
            <line x1="{xScale(xTicks[0])}" x2="{width-padding.right}"></line>
            <text y="2">{tick.id}</text>
        </g>
    {/each}
</g>

<g class="axis x-axis">
    {#each xTicks as tick, i}
        <g class="tick tick-{tick}" transform="translate({xScale(tick)}, {height} )">
            <line y1="-12" y2="-{height}"></line>
            <text y="0">l {tick}</text>
        </g>
    {/each}
</g>
    <g>
        {#each points as point, i}
            <circle
                fill={point.color}
                cx="{xScale(point.l)}"
                cy="{yScale(i)}"
                r={(8)}
                stroke={"rgba(0, 0, 0, 0.1)"}
                stroke-width={'2px'}
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