<script>
	let name = 'colors grid';
	let defaultColors = "'#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'";

	let inputcolors = "#ffffb2, #fed976, #feb24c, #fd8d3c, #f03b20, #bd0026";
	let colors = inputcolors.split(',')
			//let colors = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026'];
		let colorsR = colors.reverse();
	
	let f = ()=>{
		colors =[]
		if(inputcolors.length>0){
			
		colors = inputcolors.replaceAll("'", "").split(',')
			colorsR = colors.reverse();
			console.log(colors)
	}
	}
	
</script>
<input bind:value={inputcolors} placeholder="input colors" on:input={f} >
<h1>Hello {name}!</h1>
{#if colors.length>0}
{#each colors as codeX, j}
<div class=row>
	{#each colorsR as codeY, i}
<div class=cell style="background-color:{codeX}">
	<div class=inner style="background-color:{codeY}">
 &nbsp;
	</div>
			{#if codeX===codeY}{codeX}{/if}
</div>
		{/each}
</div>
	{/each}
{/if}
<style>
	input{
		width:100%;
	}
	.row{
		display:flex;
		height:5em;
	}
	.cell{
		margin:0.25em;
		text-align:center;
		width:4.5em;
		min-width:4em;
		border-radius: 1em;
		display:flex;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    flex-direction: column;
	}
	.inner{
    margin: 0.5em;
    width: 2em;
    height: 2em;
    border-radius: 2em;
	}
</style>