<script>
	import chroma from "chroma-js";

	import { APCAcontrast, sRGBtoY, displayP3toY, colorParsley } from "apca-w3";
	import { hex } from "wcag-contrast";

	let name = "colors grid";
	let defaultColors =
		"'#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'";

	let inputcolors = "#ffffb2, #fed976, #feb24c, #fd8d3c, #f03b20, #bd0026";
	let colors = inputcolors.split(", ");
	//let colors = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026'];
	let colorsR = colors.reverse();

	let getContrastLc = (textColor, backgroundColor) => {
		return APCAcontrast(
			sRGBtoY(colorParsley(textColor)),
			sRGBtoY(colorParsley(backgroundColor))
		);
	};

	let invertTextColor = (textColor, backgroundColor) => {
		let Lc = getContrastLc(textColor, backgroundColor);
		if (Lc < 45) {
			return "white";
		} else return "black";
	};
	let f = () => {
		colors = [];
		if (inputcolors.length > 0) {
			colors = inputcolors.replaceAll("'", "").split(", ");
			colorsR = colors.reverse();
			console.log(colors);
		}
	};

	let calculateContrast = (colors, colorsR)=>{
		let contrast = []
		colors.forEach(clrX => {
			let row = []
			colorsR.forEach(clrY =>{
				row.push({"lC":getContrastLc(clrX, clrY),
			"cR":hex(clrX, clrY).toFixed(2)})
			});
			contrast.push(row)
		});
		return contrast
	}


	$: contrast =calculateContrast(colors, colorsR); 


	let ls = ["a", "b", "c"];
	let chromatest = chroma.scale(["white", "red"]).mode("lab");
	// console.log(chromatest)
	console.log(
		hex(colors[0].replace(" ", ""), colors[1].replace(" ", "")),
		colors[0].replace(" ", "")
	);
	let Lc;
</script>

<input bind:value={inputcolors} placeholder="input colors" on:input={f} />
<h1>Hello {name}!</h1>
{#if colors.length > 0}
	{#each colors as codeX, j}
		<div class="row">
			{#each colorsR as codeY, i}
				<div class="cell" style="background-color:{codeX}; 
			color:{invertTextColor(
							'black',
							codeY
						)}">
					{#if codeX === codeY}
					{codeX}
					{:else}
					<div
						class="inner"
						style="background-color:{codeY}; color:{invertTextColor(
							'black',
							codeY
						)}"
					>
						<div class="scoreValue">
							{#if codeX != codeY}
							{#if Math.abs(contrast[i][j].lC)>60}
							<strong>{contrast[i][j].lC}</strong>
							{:else}
							{contrast[i][j].lC}
							{/if}
							<br />
								——
								<br />
								{contrast[i][j].cR}
								
							{/if}
						</div>
					</div>
					{/if}
				</div>
			{/each}
		</div>
	{/each}
{/if}
<div class="row">
	{#each ls as entry, i}
		<div class="cell" style="background-color:{chromatest((i + 1) / 3.0)}">
			{entry}
		</div>
	{/each}
</div>

<style>
	input {
		width: 100%;
	}
	.row {
		display: flex;
		height: 5em;
	}
	.cell {
		margin: 0.25em;
		text-align: center;
		width: 4.5em;
		min-width: 4em;
		border-radius: 1em;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: nowrap;
		flex-direction: column;
		font-size: 1rem;
	}
	.inner {
		margin: 0.5em;
		width: 4em;
		height: 4em;
		border-radius: 2em;
		font-size: 0.75em;
		line-height: 1em;
	}
	.scoreValue {
		padding-top:0.5em;
	}
	strong{
		font-weight: 900;
	}
</style>
