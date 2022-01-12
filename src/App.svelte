<script>
	import chroma from "chroma-js";

	import { APCAcontrast, sRGBtoY, displayP3toY, colorParsley } from "apca-w3";
	import { hex } from "wcag-contrast";

	import {shiftHue, getHcl} from "../scripts/utility.js"

	import ColorMatrix from "../ColorMatrix.svelte"; 

	let inputcolors = "#ffffb2, #fed976, #feb24c, #fd8d3c, #f03b20, #bd0026";
	let colors = inputcolors.split(", ");
	colors.push('#ffffff')
	//let colors = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026'];

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
		colors = ['#ffffff'];
		if (inputcolors.length > 0) {
			colors = inputcolors.replaceAll("'", "").split(", ");
			colors.push('#ffffff')
		}
		
	};

	let calculateContrast = (colors) => {
		let contrast = [];
		colors.forEach((clrX) => {
			let row = [];
			colors.forEach((clrY) => {
				row.push({
					lC: getContrastLc(clrX, clrY),
					cR: hex(clrX, clrY).toFixed(2),
				});
			});
			contrast.push(row);
		});
		return contrast;
	};



	function handleClick(){
		index = this.id
	}

	function setColor(){
		colors[index]=adjustedColor.hex("rgb");

	}

	

	$: contrast = calculateContrast(colors);

	$: selectedColor = colors[index];

	$: selHcl = getHcl(selectedColor);

	$: adjustedColor = chroma.hcl(selHcl.h, selHcl.c, selHcl.l);

	$: adjustedTextColor = invertTextColor("black", adjustedColor.hex("rgb"));

	$: index = "0";

	let hueShift = 180

	let ls = ["a", "b", "c"];
	let chromatest = chroma.scale(["white", "red"]).mode("lab");
	// console.log(chromatest)
	console.log(
		hex(colors[0].replace(" ", ""), colors[1].replace(" ", "")),
		colors[0].replace(" ", "")
	);


	let showACPA = true
	let showWCAG = false

	let contrastChoice = [
		{ id: 15, text: `Absolute minimum for non-text` },
		{ id: 30, text: `Absolute minimum for text, identifiable objects` },
		{ id: 45, text: `Minimum for larger text such as headlines` },
		{ id: 60, text: `Minimum for readable content text` },
		{ id: 75, text: `Minimum level for body text` },
		{ id: 90, text: `Preferred for body text` },
	];

	let selected = contrastChoice[1]

	let lcCutoff = selected.id

</script>

<main>
	<div>
		<h2>Color value input</h2>
		<input class="colorinput"
			bind:value={inputcolors}
			placeholder="input colors"
			on:input={f}
		/>
		<h2>Color contrast grid</h2>
		<label><input type=checkbox bind:checked={showACPA}>
		show ACPA contrast</label>
		<label>
			<input type=checkbox bind:checked={showWCAG}>
			show WCAG contrast
		</label>
		<label>
			selected contrast level:
		<select bind:value={selected} >
			{#each contrastChoice as contrastValue, i}
				<option value={contrastValue} >
					{contrastValue.id} – {contrastValue.text}
				</option>
			{/each}
		</select></label>
		{#if colors.length > 0}
			{#each colors as codeX, j}
				<div class="row">
					{#each colors as codeY, i}
						<div
							class="cell"
							style="background-color:{codeX}; 
			color:{invertTextColor('black', codeY)};
			border:2px solid white;
			outline:{(Math.abs(contrast[i][j].lC) > lcCutoff ? '2px solid black' : '2px solid white' )};
			"
						>
							{#if codeX === codeY}
								{codeX}
							{:else}
								<div
									class="inner"
									style="background-color:{codeY}; color:{invertTextColor(
										'black',
										codeY
									)}; 
									"
								>
									<div class="scoreValue">
										{#if codeX != codeY}
											{#if showACPA}
											{#if Math.abs(contrast[i][j].lC) > lcCutoff}
												<strong
													>{contrast[i][j].lC}</strong
												>
											{:else}
												{contrast[i][j].lC}
											{/if}
											{/if}
											{#if showACPA && showWCAG }
											<br />
											——
											<br />
											{/if}
											{#if showWCAG}
											{contrast[i][j].cR}
											{/if}
										{/if}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		{/if}
		<div class="spacer"></div>
		{#each colors as codeX, j}
		<button id={j.toString()} class:selected="{(index === j.toString())}" on:click={handleClick}  style="background-color:{codeX}">{codeX}</button>
		{/each}
		
		<div class="colorpair">
			<div
				class="cell"
				style="background-color:{selectedColor}; color:{invertTextColor(
					'black',
					selectedColor
				)}"
			>
				{selectedColor}
			</div>
			<div
				class="cell"
				style="background-color:{adjustedColor}; color:{adjustedTextColor}"
			>
				{adjustedColor}
			</div>
		</div>
		<label class="colorslider">
			Adjust hue
			<input
				type="range"
				id="colorH"
				bind:value={selHcl.h}
				min="0"
				max={360.0}
			/>
			<input
			type="number"
			id="colorH"
			bind:value={selHcl.h}
			min="0"
			max={360.0}
		/>
		</label>
		<label class="colorslider">
			Adjust chroma
			<input type="range" bind:value={selHcl.c} min="0" max={150.0} />
			<input type="number" bind:value={selHcl.c} min="0" max={150.0} 			/>
		</label>
		<label class="colorslider">
			Adjust lightness
			<input type="range" bind:value={selHcl.l} min="0" max={150.0} />
			<input type="number" bind:value={selHcl.l} min="0" max={150.0} 			/>
		</label>

		<button on:click={setColor}> set color {index}</button>

		<div class="row">
			{#each ls as entry, i}
				<div
					class="cell"
					style="background-color:{chromatest((i + 1) / 3.0)}"
				>
					{entry}
				</div>
			{/each}
		</div>

		<label class="colorslider">
			Shift huezzz!
			<input type="range" bind:value={hueShift} min="0" max={360.0} />
			<input type="number" bind:value={hueShift} min="0" max={360.0} 			/>
		</label>

		<div class="row">
			{#each colors as entry, i}
				<div
					class="cell"
					style="background-color:{shiftHue(entry, hueShift)}"
				>
					{entry}
				</div>
			{/each}
		</div>
		<ColorMatrix></ColorMatrix>
	</div>
</main>

<style>
	main {
		display: flex;
		justify-content: space-around;
	}

	.row {
		display: flex;
		height: 5em;
	}
	.spacer{
		height: 2.5em;
	}
	button {
		margin: 0.25em;
		text-align: center;
		width: 4.5em;
		min-width: 4em;
		border-radius: 1em;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		flex-direction: row;
		font-size: 1rem;
	}
	button.selected{
		border-width: 2px;
		border-color: black;
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
		display: flex;
		align-items: center;
    text-align: center;
    flex-direction: column;
    justify-content: center;
	}


	.colorinput {
		width: 100%;
	}

	.colorslider {
		display: flex;
		justify-content: flex-end;
		flex-wrap: nowrap;
	}

	.colorslider input {
		flex: none;
		margin: 0 10px;
	}

	.colorslider input[type=number]{
		width:4em;
	}

	.colorslider input[type=range]{
		width:50%;
	}

	.colorpair {
		display: flex;
		height: 5rem;
	}

	.colorpair :first-child {
		border-radius: 1em 0em 0em 1em;
		margin-right: 2px;
	}

	.colorpair :last-child {
		border-radius: 0em 1em 1em 0em;
		margin-left: 2px;
	}

	strong {
		font-weight: 900;
	}
</style>
