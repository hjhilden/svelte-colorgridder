<script>
	
	import chroma from 'chroma-js'
	import { onMount, afterUpdate, beforeUpdate } from 'svelte';

	export let hclColor // optional input initial color as hcl

	export	let width = 480;
	export let height = 50;
	export let color = '#ffb';	
	let h, c, l;
			let canvas;
	
	if(hclColor === undefined)	{hclColor = getHcl(color);}// 

	$: ({h, c, l} = hclColor);
	$: color = chroma.hcl(h, c,l)

	// nb! binds must refer to object internals (hclColor.h), not unpacked values (h) 
	
	// weird async (?) workaround as color  
	// is interpreted as hex color instead of chroma color after input color change
	const getClipped = (color) => { 
		if (color.clipped) {return color.clipped()}
		else {return chroma(color).clipped()}
	}
	
 function getHcl(color) {
    let h, c, l;
    [h, c, l] = chroma(color).hcl();
    return { h: h, c: c, l: l };
};

beforeUpdate(() => {
	if (typeof color !== 'object'){

		hclColor = getHcl(color)}
		
	});
	
	onMount(() => {
					drawColorScale()
	})
	
		afterUpdate(() => {
					drawColorScale()
	})
	
	
	function drawColorScale(){

		const ctx = canvas.getContext('2d');
					ctx.fillStyle = '#eee';
				ctx.fillRect(0, 0, width, height);
			for (let i=0; i<width; i++){
				let currentColor = chroma.hcl(i, c, l)
				let strokeColor = currentColor.clipped() ? 'black' : currentColor.hex() 
			ctx.beginPath();
			ctx.moveTo(i, 10);
			ctx.lineTo(i, height-10);
			ctx.strokeStyle = strokeColor
			ctx.stroke();
			}
							ctx.beginPath();
			ctx.moveTo(h+0.5, 0);
			ctx.lineTo(h+0.5, height);
			ctx.strokeStyle = 'black'
			ctx.stroke();
	}

</script>

<div class='colorSelector'>
	<canvas
	bind:this={canvas}
	width={361}
	height={height}
></canvas>
<label >
	H
	<input type=range bind:value={hclColor.h} min=0 max=360 style='background-color:{color}'>
</label>
<label>
	C
	<input type=range bind:value={hclColor.c} min=0 max=130>
</label>

<label>
	L
	<input type=range bind:value={hclColor.l} min=0 max=100 >
</label>
<div>H:{h.toFixed(2)} C:{c.toFixed(2)} L:{l.toFixed(2)}</div>
<div style='border-top:{color} 4px solid'>
	{color} 
	<span class='note'>{getClipped(color) ? 'clipped!':''}</span>
	</div>
</div>

<style>
	canvas {
		width:13rem;
		padding-left:1.75rem;
		padding-right:.75rem;
		background-color:#eee
	}
input[type="range"] {
	width:14rem;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
		height: 5px;
}
	.note{
		color:#fa3239
	}
	.colorSelector{
		width: 16rem;
		padding: 0.5rem;
		font-family: 'Andale Mono', monospace;
				background-color:#eee

	}
</style>