<script>
	import { navOptions, hashIndex } from  './Nav.svelte';	// import application navigation
	let selected = navOptions[0];	// keep track of the selected 'page' object (default to the about component since we must have local db connection established first)
	let intSelected = 0;	// selected page index
	
	let page = window.location.hash;
	let primaryHash
	// take subpage hash in case colors etc. stored in hash
	if(page) {
		if ( page.split('|').length>1){
			primaryHash = page.split('|')[0]
		} else primaryHash = page
		selected = navOptions[hashIndex[primaryHash.slice(1)]]
		intSelected = navOptions[hashIndex[primaryHash.slice(1)]]
	}

    window.onpopstate = function(event) {
        page = selected.hash
    };

	// change the selected component (the event.originalTarget.id is not accessible in Chrome so switched to event.srcElement.id)
	function changeComponent(event) {
		selected = navOptions[event.srcElement.id];
		intSelected = event.srcElement.id;
		page = navOptions[event.srcElement.id].hash
		window.location.hash = navOptions[event.srcElement.id].hash
	}
	</script>
<!-- Include Bootstrap CSS-->
<!-- <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'> -->
	<div class="container">
		<!--app navigation -->
		<ul class="nav nav-tabs">
			{#each navOptions as option, i}
			<li class="nav-item">
				<button class={intSelected==i ? "nav-link active p-2 ml-1" : "p-2 ml-1 nav-link"} on:click={changeComponent} id={i} role="tab">{option.page}</button>
			</li>
			{/each}
		</ul>
		<!-- content wrapper -->
		<div class="row">
			<div class="col-sm-12">
				<div class="p-2">
					<h1>{selected.page}</h1>
					<!-- this is where our main content is placed -->
					<svelte:component this={selected.component}/>
				</div>
			</div>
		</div>
	</div>