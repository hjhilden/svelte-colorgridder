<script>
    import { scaleLinear } from 'd3-scale';
    import chroma from "chroma-js";
    import { getHcl, radians } from '../scripts/utility';
    export let width =90
    export let height =90
    export let colors = ["#b7ffff", "#4e6bcd"]
    export let xTicks = [ 0]
    
    $: points = colors.map(color=>{
        let h, c, l
        ({h, c, l} = getHcl(color))
        return {color:color, h: h, c:c, l:l}
    })


    let yTicks = [ 0, 50, 100]
    
    const padding = { top: 5, right: 5, bottom: 5, left: 5 };
    
    $: steps = colors.length
    
    $: xScale = scaleLinear()
            .domain([-100, 100])
            .range([padding.left, width - padding.right]);
    
        $: yScale = scaleLinear()
            .domain([-100, 100])
            .range([height - padding.bottom, padding.top]);

    const cX = (chroma, hue)=> {
let x = xScale(Math.sin(radians(hue))*chroma)
if(isNaN(x)) {x=xScale(0)}
return x
    }
    const cY = (chroma, hue)=> {

let y = yScale(Math.cos(radians(hue))*chroma)
if(isNaN(y)) {y=yScale(0)
}
return y
    }

let r = (x2, y2) => {
    const x1 = 0
    const y1 = 0
  return Math.sqrt((x2 - x1)^2 + (y2 - y1)^2)
}


let  colorCircle = []
let angle = 15
 for (let index = 0; index < 360/angle; index++) {
    colorCircle[index] = [index*angle, 50, 75]
    }
    
    </script>
    
    <div style="margin-bottom:-0.5em">
        <svg
        width={width+padding.left+padding.right}
        height={height+padding.top+padding.bottom}
    >
    <g class="axis y-axis">
            <g class="tick tick-{0}" transform="translate({padding.left}, {yScale(0)})">
                <line x2="{width-padding.right-padding.left}"></line>
            </g>
    </g>
    
    <g class="axis x-axis">
        {#each xTicks as tick, i}
            <g class="tick tick-{tick}" transform="translate({xScale(tick)}, {height} )">
                <line y1="{-padding.top}" y2="-{height-padding.top}"></line>
            </g>
        {/each}
    </g>
    <g>
        {#each colorCircle as swatch }

        <circle
fill={'rgba(0, 0, 0, 0.1)'}
cx="{xScale(Math.sin(radians(swatch[0]))*points[1].c)}"
cy="{yScale(Math.cos(radians(swatch[0]))*points[1].c)}"
r={(2)}
/>
{/each}
    </g>
        <g>
            {#each points as point, i}
            <line x1={xScale(0)} y1={yScale(0)} x2={cX(point.c, point.h)} y2="{cY(point.c, point.h)}"                     stroke={"rgba(0, 0, 0, 0.3)"}
            stroke-width={"1px"}></line>
                <circle
                    fill={point.color}
                    cx="{cX(point.c, point.h)}"
                    cy="{cY(point.c, point.h)}"
                    r={(7)}
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
            stroke: #595959b5;
            stroke-dasharray: 2;
        }
    
        .tick text {
            fill: #595959;
            text-anchor: start;
        }
    
        .tick.tick-0 line {
            stroke-dasharray: 0;
        }
        .tick.tick-theta line {
            stroke-dasharray: none;
        }

        .tick.tick-theta text {
            text-anchor: middle;
            stroke: white;
            fill: #595959;
            stroke-width:4px;
            paint-order:stroke;
        }
    
        .x-axis .tick text {
            text-anchor: middle;
        }
    </style>
