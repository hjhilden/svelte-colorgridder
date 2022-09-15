<script>

import {geoAlbersUsa, geoEqualEarth, geoTransverseMercator, geoPath} from "d3/node_modules/d3-geo";
import {scaleQuantile, scaleQuantize, scaleThreshold} from "d3/node_modules/d3-scale"
import {range} from "d3/node_modules/d3-array"
import { onMount } from 'svelte';

export let n = 3
export let colors = ["#c8efe2", "#baa68a", "#aa562c", "#81a8ce", "#78747e", "#6e3c28", "#3c62ba", "#384472", "#332324"]



// const projection = geoAlbersUsa().scale(1300).translate([487.5, 305])
const projection = geoTransverseMercator().scale(2500).rotate([-27, -65]).translate([200, 250])
	
	// const path = geoPath().projection(geoEqualEarth());
    const path = geoPath().projection(projection);


import * as topojson from 'topojson-client';

let features = [];
	let counties = []
let data = []
let x, y
    
let mesh
let f = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json'
  f = 'teollisuus_maakunnat.geojson'
onMount(async () => {
		const mapData = await fetch(f)
			.then(d => d.json())
		console.log({ mapData })
		
		//  features = topojson.feature(us, us.objects.states).features;
        // features = topojson.feature(us, us.features).features;
        features = mapData.features
		console.log({ features })
		mapData.features.forEach(feature => {
            data.push([feature.properties['emissions_'], feature.properties['val_added_']])
        });
		// counties = topojson.feature(us, us.objects.counties).features;
		
		// mesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
        //  x = scaleThreshold([7.5, 12.5, 18], range(n))
    //  y = scaleThreshold([6, 14.5, 18], range(n))
   
     x = scaleQuantize([6.5, 12.15], range(n))
     y = scaleQuantize([1, 11.5], range(n))
    //  x = scaleQuantile(Array.from(data.values(), d => d[0]), range(n))
    //  y = scaleQuantile(Array.from(data.values(), d => d[1]), range(n))
	})


const color = (value, colors) => {
    if (!value) return "#ccc";
    let [a, b] = value;
    return colors[y(b) + x(a) * n];
}


</script>
<div>

<svg viewBox="0, 0, 300, 500" width=300 height=500>
    <g fill="white" stroke="black">
    {#each features as feature, i}
    <path d={path(feature)} fill={color([feature.properties['emissions_'], feature.properties['val_added_']], colors) }/>
{/each}
    </g>
</svg>
</div>