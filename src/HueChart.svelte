<script>
    import { scaleLinear } from 'd3-scale';
    import chroma from "chroma-js";
    import { getHcl, radians } from '../scripts/utility';
    export let width =300
    export let height =300
    export let colors = ["#b7ffff", "#4e6bcd"]
    export let xTicks = [ 0]
    
    $: points = colors.map(color=>{
        let h, c, l
        ({h, c, l} = getHcl(color))
        return {color:color, h: h, c:c, l:l}
    })

  let  colorCircle = []
 for (let index = 0; index < 360; index++) {
    colorCircle[index] = [index, 50, 75]
    }

    let thetaTicks = []
    let angle = 30
    for (let index = 0; index < 360/angle; index++) {
        thetaTicks[index] = [(index)*angle, 55, 65]
    }

    let yTicks = [ 0, 50, 100]
    
    const padding = { top: 20, right: 20, bottom: 20, left: 20 };
    
    $: steps = colors.length
    
    $: xScale = scaleLinear()
            .domain([-100, 100])
            .range([padding.left, width - padding.right]);
    
        $: yScale = scaleLinear()
            .domain([-100, Math.max.apply(null, yTicks)])
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

    
    </script>
    
    <div>
        <svg
        width={width+padding.left+padding.right}
        height={height+padding.top+padding.bottom}
    >
    <g class="axis y-axis">
        {#each yTicks as tick}
            <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
                <line x2="{width-padding.right}"></line>
                <text y="-4">c {tick}</text>
            </g>
        {/each}
    </g>
    
    <g class="axis x-axis">
        {#each xTicks as tick, i}
            <g class="tick tick-{tick}" transform="translate({xScale(tick)}, {height} )">
                <line y1="-12" y2="-{height}"></line>
                <text y="0">{tick}</text>
            </g>
        {/each}
    </g>
    <g class="axis">
        {#each thetaTicks as tick}
        <g class="tick tick-theta" >
/>
            <line x1={xScale(Math.sin(radians(tick[0]))*tick[1])}
            y1={yScale(Math.cos(radians(tick[0]))*tick[1])}
            x2={xScale(Math.sin(radians(tick[0]))*tick[2])}
            y2={yScale(Math.cos(radians(tick[0]))*tick[2])}
            ></line>
            <text x={xScale(Math.sin(radians(tick[0]))*tick[2]*1.2)} y={yScale(Math.cos(radians(tick[0]))*tick[2]*1.2)}>{tick[0]}°</text>

        </g>
        {/each}
    {#each colorCircle as swatch }

                <circle
        fill={chroma.hcl(swatch[0], swatch[1], swatch[2])}
        cx="{xScale(Math.sin(radians(swatch[0]))*swatch[1])}"
        cy="{yScale(Math.cos(radians(swatch[0]))*swatch[1])}"
        r={(1)}
    />
    {/each}
</g>

        <g>
            {#each points as point, i}
                <circle
                    fill={point.color}
                    cx="{cX(point.c, point.h)}"
                    cy="{cY(point.c, point.h)}"
                    r={(5)}
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