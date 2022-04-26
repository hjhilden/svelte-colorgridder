<script>
	
	import chroma from 'chroma-js'
	import { onMount, afterUpdate } from 'svelte';

	export let hclColor = {h:100, c:33, l:56} // input initial color

	export	let width = 480;
	export let height = 50;
	export let color;	
	let h, c, l;
			let canvas;
	$: ({h, c, l} = hclColor);
	$: color = chroma.hcl(h, c,l)
 // nb! binds must refer to object internals (hclColor.h), not unpacked values (h) 
	
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
	<input type=range bind:value={hclColor.h} min=0 max=360 style='background-color:{color.hex()}'>
</label>
<label>
	C
	<input type=range bind:value={hclColor.c} min=0 max=130>
</label>

<label>
	L
	<input type=range bind:value={hclColor.l} min=0 max=100 onchange={drawColorScale}>
</label>
<div>H:{h} C:{c} L:{l}</div>
<div style='border-top:{color.hex()} 4px solid'>
	{color.hex()} <span class='note'>{color.clipped() ? 'clipped!':''}</span>
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