<script>
	import chroma from "chroma-js";

	import { APCAcontrast, sRGBtoY, displayP3toY, colorParsley } from "apca-w3";
	import { hex } from "wcag-contrast";

	import { getHcl, parseColorInput, invertTextColor, getContrastLc } from "../scripts/utility.js";

	import ColorSelector from "./ColorSelector.svelte";
	import { bubble, each } from "svelte/internal";

	let defaultBgClr = "#ffffff";
	let inputcolors ="";
	let hash = window.location.hash
	let primaryHash
	if ( hash.split('|').length>1){
			primaryHash = hash.split('|')[0]
			inputcolors = hash.split('|')[1]
		} else primaryHash = '#main'
	// inputcolors = window.location.hash

	if (inputcolors === "") {
		inputcolors = "#ffffb2, #fed976, #feb24c, #fd8d3c, #f03b20, #bd0026";
	}


	const setAddress = (colors) => {
		history.pushState(
			colors,
			"",
			primaryHash + '|' + colors.slice(0, colors.length - 1).join(",")
		);
	};

	let updateColorInput = () => {
		colors = [];
		colors = parseColorInput(inputcolors, defaultBgClr);
		setAddress(colors);
	};
	// lC APCA contrast, cR WCAG2

	// reuse negative contrasts
	let adjustContrast = (clrX, clrY) => {
		let a, b;
		if (getContrastLc(clrX, clrY) < 0) {
			a = clrY;
			b = clrX;
		} else {
			a = clrX;
			b = clrY;
		}

		let adjustedClr = chroma(a);
		let n = 0;
		if (sRGBtoY(colorParsley(a)) > 0.25) {
			while (
				Math.abs(getContrastLc(adjustedClr.hex(), b) < 35) &
				(n < 6)
			) {
				adjustedClr = adjustedClr.darken();
				n += 1;
			}
		} else if (sRGBtoY(colorParsley(a)) < 0.25) {
			while (
				(Math.abs(getContrastLc(adjustedClr.hex(), b)) < 35) &
				(n < 6)
			) {
				adjustedClr = adjustedClr.brighten();
				n += 1;
			}
		}
		console.log(adjustedClr.hex(), sRGBtoY(colorParsley(clrX)));
		return adjustedClr.hex();
	};

	let colors = parseColorInput(inputcolors, defaultBgClr);
	setAddress(colors);

	let strokes = [];

	colors.forEach((clrX) => {
		strokes.push(adjustContrast(clrX, "#fff"));
	});

	console.log(strokes);

	let calculateContrast = (colors) => {
		let contrast = [];
		colors.forEach((clrX) => {
			let row = [];
			colors.forEach((clrY) => {
				row.push({
					lC: getContrastLc(clrX, clrY),
					cR: hex(clrX, clrY).toFixed(2),
					fill: clrX,
					stroke: adjustContrast(clrX, clrY),
				});
			});
			contrast.push(row);
		});
		return contrast;
	};

	// list color/stroke pairs (only one-way)
	let colorStrokePairs = [];

	if (contrast) {
		contrast.forEach((entryX, i) => {
			contrast.forEach((entryY, j) => {
				console.log(entryX);
				if (j >= i) {
					colorStrokePairs.push({
						fill: entryX.fill,
						stroke: entryX.stroke,
					});
				}
			});
		});
	}
	console.log(colorStrokePairs);

	function setColorIndex() {
		index = this.id;
	}

	function clickToCopy() {
		const svgstring = this.querySelector("svg").outerHTML;
		setClipboard(svgstring);
	}

	function setClipboard(text) {
		var type = "text/plain";
		var blob = new Blob([text], { type });
		var data = [new ClipboardItem({ [type]: blob })];
		var size = blob.size;
		navigator.clipboard.write(data).then(
			function () {
				/* success */
				console.log(`copied svg to clipboard, ${size}kb`);
			},
			function () {
				/* failure */
			}
		);
	}

	function setColor() {
		colors[index] = newSelectorColor.hex("rgb");

		inputcolors = colors.toString().replaceAll(",", ", ");
		setAddress(colors);
	}

	let newSelectorColor, selectedColor;

	$: contrast = calculateContrast(colors);

	$: selectedColor = colors[index];

	newSelectorColor = colors[index];

	$: selHcl = getHcl(selectedColor);

	$: adjustedTextColor = invertTextColor(
		"black",
		newSelectorColor?.hex("rgb")
	);

	$: index = "0";

	let showACPA = true;
	let showWCAG = false;

	let contrastChoice = [
		{ id: 15, text: `Absolute minimum for non-text` },
		{ id: 30, text: `Absolute minimum for text, identifiable objects` },
		{ id: 45, text: `Minimum for larger text such as headlines` },
		{ id: 60, text: `Minimum for readable content text` },
		{ id: 75, text: `Minimum level for body text` },
		{ id: 90, text: `Preferred for body text` },
	];

	let contrastChoiceWCAG = [
		{ id: 3, text: `AA large text, graphics` },
		{ id: 4.5, text: `AA normal text, AAA large text` },
		{ id: 7, text: `AAA normal text` },
	];

	let selected = contrastChoice[1];

	let selectedWCAG = contrastChoiceWCAG[0];

	$: lcCutoff = selected.id;
	$: wcagCutoff = selectedWCAG.id;

	const checkPassing = (contrast, cutoff) => {
		if (Math.abs(contrast) >= cutoff) {
			return "pass";
		} else return "fail";
	};

	const chooseEval = (condA, condB, exprA, exprB) => {

		if (condA & condB) return (exprA & exprB)
		else if (condA) return (exprA)
		else return exprB 

	}

	const markPassing = (contrastA, cutoffA, contrastB, cutoffB) => {
		let style = "2px solid white";
		// A not B
		if (
			(Math.abs(contrastA) >= cutoffA) &
			(Math.abs(contrastB) < cutoffB)
		) {
			style = "2px solid grey";
		}
		// B not A
		if (
			(Math.abs(contrastB) >= cutoffB) &
			(Math.abs(contrastA) < cutoffA)
		) {
			style = "2px dashed grey";
		}
		// B and A
		if (
			(Math.abs(contrastA) >= cutoffA) &
			(Math.abs(contrastB) >= cutoffB)
		) {
			style = "2px solid black";
		}

		return style;
	};
</script>

<main>
	<div class="column">
		<h2>Color values input</h2>
		<input
			class="colorinput"
			bind:value={inputcolors}
			placeholder="input colors"
			on:input={updateColorInput}
			on:change={updateColorInput}
		/>
		<label>
			Background color
			<input
				bind:value={defaultBgClr}
				placeholder={defaultBgClr}
				on:input={updateColorInput}
				on:change={updateColorInput}
				style="background: {defaultBgClr}"
			/>
		</label>

		<h2>Color contrast grid</h2>
<div class='settings'>
		<label>
			selected ACPA contrast level:
			<select bind:value={selected}>
				{#each contrastChoice as contrastValue, i}
					<option value={contrastValue}>
						{contrastValue.id} – {contrastValue.text}
					</option>
				{/each}
			</select></label
		>
		<label>
			selected WCAG contrast level:
			<select bind:value={selectedWCAG}>
				{#each contrastChoiceWCAG as contrastValue, i}
					<option value={contrastValue}>
						1:{contrastValue.id} – {contrastValue.text}
					</option>
				{/each}
			</select></label
		>

		<label
		><input type="checkbox" bind:checked={showACPA} />
		show ACPA contrast value</label
	>
	<label>
		<input type="checkbox" bind:checked={showWCAG} />
		show WCAG contrast value
	</label>
	</div>
		<div class="row" style="height:3em">
			<div
				class="cell key"
				style="border:2px solid white; outline: 2px solid grey"
			/>
			<p>pair passes APCA level</p>
			<div
				class="cell key"
				style="margin-left:1em; border:2px solid white; outline: 2px dashed grey"
			/>
			<p>pair passes WCAG level</p>
			<div
				class="cell key"
				style="margin-left:1em; border:2px solid white; outline: 2px solid black"
			/>
			<p>pair passes both levels</p>
		</div>


		{#if colors.length > 0}
			{#each colors as codeX, j}
				<div class="row">
					{#each colors as codeY, i}
						<div
							class="cell"
							style="background-color:{codeX}; 
			color:{invertTextColor('black', codeY)};
			border:2px solid white;
			outline:{markPassing(
								contrast[i][j].lC,
								lcCutoff,
								contrast[i][j].cR,
								wcagCutoff
							)};
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
														>{contrast[i][j]
															.lC}</strong
													>
												{:else}
													{contrast[i][j].lC}
												{/if}
											{/if}
											{#if showACPA && showWCAG}
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
		<div class="spacer" />
		{#each colors as codeX, j}
			<button
				id={j.toString()}
				class:selected={index === j.toString()}
				on:click={setColorIndex}
				style="background-color:{codeX}">{codeX}</button
			>
		{/each}

		<div class="two-cols">
			<ColorSelector
				bind:color={newSelectorColor}
				hclColor={{ h: selHcl.h, c: selHcl.c, l: selHcl.l }}
			/>
			<div class="colordata">
				<div class="colorblock">
					<div
						class="cell"
						style="background-color:{selectedColor}; color:{invertTextColor(
							'black',
							selectedColor
						)}"
					>
						{selectedColor}
					</div>
					<button
						on:click={setColor}
						class="cell"
						style="background-color:{newSelectorColor}; color:{adjustedTextColor}"
					>
						<span style="font-size:0.7em">set color {index} </span>
						{newSelectorColor}
					</button>
				</div>
				<div
					style="
			padding-left:1em;
			display: flex;
			flex-direction: column;
			justify-content: center;
		"
				>
					<div>
						<i>hue, chroma, lightness</i>:
						<input
							onClick="this.select();"
							value="[{[
								selHcl.h.toFixed(2),
								selHcl.c.toFixed(2),
								selHcl.l.toFixed(2),
							]}]"
						/>
					</div>
					<div>
						<i>r, g, b</i>:<br />
						<input
							onClick="this.select();"
							value="[{newSelectorColor?.rgb()}]"
						/>
					</div>
					{#if newSelectorColor?.clipped() === true}
						<b>clipped*</b>
					{:else}
						displayable*
					{/if}
				</div>
			</div>
		</div>
		<div class="spacer" />
		<div>*) clipping colors may occur due to rounding</div>
		<div class="spacer" />

		<div class="two-col">
			Click svg graphics to copy:
			<div
				class="svg_container"
				style={`width:${colors.length * 50}px`}
				on:click={clickToCopy}
			>
				Auto-adjusted strokes
				<svg height="70">
					{#each colors as pairx, j}
						{#each colors as pairy, i}
							{#if (j >= i) & (pairy != pairx) & (j - i == 1)}
								<g transform={`translate(${j * 50 - 50}, 10)`}>
									<rect
										x={0}
										y="0"
										width="40"
										height="40"
										rx="10"
										style="fill:{pairx};"
									/>
									<rect
										x={10}
										y="10"
										width="20"
										height="20"
										rx="30"
										style="fill:{pairy}; stroke:{contrast[
											i
										][j].stroke}; stroke-width:3px"
									/>
									<text x="0" y="50" font-size="9"
										>stroke:</text
									>
									<text x="0" y="60" font-size="9"
										>{contrast[i][j].stroke}</text
									>
								</g>
							{/if}
						{/each}
					{/each}
				</svg>
			</div>
			<div
				class="svg_container"
				style={`width:${colors.length * 50}px`}
				on:click={clickToCopy}
			>
				Contrast to background
				<svg height="100">
					<text x="0" y="15" font-size="12"
						>background: {colors[colors.length - 1]}</text
					>
					{#each colors as colorX, j}
						<g transform={`translate(${j * 50}, 30)`}>
							<rect
								x={0}
								y="0"
								width="40"
								height="40"
								rx="10"
								style="fill:{colorX};"
							/>
							<text x="0" y="-5" font-size="9">{colorX}</text>

							<text x="0" y="50" font-size="9"
								>{checkPassing(
									contrast[colors.length - 1][j].cR,
									wcagCutoff
								)}</text
							>
							<text x="0" y="60" font-size="9"
								>{contrast[colors.length - 1][j].cR}
							</text>
						</g>
					{/each}
				</svg>
			</div>
			<div
				class="svg_container"
				style={`width:${colors.length * 50 + 30}px`}
				on:click={clickToCopy}
			>
				Color pairings: passing combinations
				<svg height={colors.length * 50 + 30}>

					{#if showACPA}
					<text x="0" y="15" font-size="9">
						APCA: {selected.text} – {lcCutoff}
					</text>
					{/if}
					{#if showWCAG}
					<text x="0" y="25" font-size="9">
						WCAG: {selectedWCAG.text} – 1:{wcagCutoff}
					</text>
					{/if}


					{#each colors as codeX, j}
						{#each colors as codeY, i}
							<g
								transform={`translate(${j * 50}, ${
									i * 50 + 30
								})`}
							>
								{#if codeY != codeX}
									{#if chooseEval(showACPA, showWCAG, Math.abs(contrast[i][j].lC) >= lcCutoff, Math.abs(contrast[i][j].cR) >= wcagCutoff )}
										<rect
											x={0}
											y="0"
											width="40"
											height="40"
											rx="10"
											style="fill:{codeX};"
										/>
										<rect
											x={10}
											y="10"
											width="20"
											height="20"
											rx="30"
											style="fill:{codeY};"
										/>{:else}
										<rect
											x={0}
											y="0"
											width="40"
											height="40"
											rx="10"
											style="fill:none; stroke:{'#999'}; stroke-width:1px"
										/>
										<line
											x1={2.5}
											y1={2.5}
											x2={40 - 2.5}
											y2={40 - 2.5}
											style="stroke:{'#999'}; stroke-width:1px"
										/>
									{/if}
								{:else}
									<rect
										x={0}
										y="0"
										width="40"
										height="40"
										rx="10"
										style="fill:{codeX};"
									/>
									<text
										x="0"
										y="22.5"
										font-size="9"
										style="fill:{invertTextColor(
											'black',
											codeX
										)}">{codeX}</text
									>
								{/if}

							</g>
						{/each}
					{/each}
				</svg>
			</div>
		</div>
	</div>
</main>

<style>
	.column {
		background-color: white;
		padding: 0 2em;
	}

	.row {
		display: flex;
		height: 5em;
	}

	.two-cols {
		display: flex;
		flex-direction: row;
		height: fit-content;
	}

	.spacer {
		height: 2.5em;
	}
	button {
		margin: 0.25em;
		text-align: center;
		width: 4.8em;
		min-width: 4.8em;
		border-radius: 1em;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		flex-direction: row;
		font-size: 1rem;
	}
	button.selected {
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

	.key {
		width: 1.5em;
		min-width: 1.5em;
		height: 1.5em;
		border-radius: 0.6em;
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
	.settings {
		position: sticky;
		top: 0em; 
				background-color: #fff;
	}

	.svg_container {
		cursor: pointer;
		padding: 0.5em;
		border: 2px solid #fff;
		height: auto;
		width: auto;
		display: flex;
		flex-direction: column;
	}

	.svg_container:hover {
		border: 2px solid rgb(240, 238, 238);
	}

	.svg_container:active {
		border: 2px solid gray;
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

	.colorslider input[type="number"] {
		width: 4em;
	}

	.colorslider input[type="range"] {
		width: 50%;
	}

	.colordata {
		display: flex;
		width: 20rem;

		flex-direction: column;
	}
	.colorblock {
		flex-direction: row;
		display: flex;
	}

	.colorblock :first-child {
		border-radius: 1em 0em 0em 1em;
		margin-right: 2px;
	}

	.colorblock :last-child {
		border-radius: 0em 1em 1em 0em;
		margin-left: 2px;
	}

	strong {
		font-weight: 900;
	}
</style>
