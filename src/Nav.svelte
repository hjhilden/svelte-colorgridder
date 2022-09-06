<script context="module">
    // main navigation for the application
    import Main from './Main.svelte';
    import ColorMatrix from './ColorMatrix.svelte';
    import About from './About.svelte';

    export const hashIndex ={
        'main':0,
        'bivariate':1,
        'about':2
    }
    
    // these are our 'pages' to navigate through (in order for this export to work the script tag MUST include context="module")
    export const navOptions = [
        { page: 'Color scale grid',   component: Main, hash: 'main' },
        { page: 'Bivariate color matrix',   component: ColorMatrix, hash: 'bivariate' },
        { page: 'About this app',   component: About, hash:'about' },

            // other navigation pages can go here
    ];

    </script>