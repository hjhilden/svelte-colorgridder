<script context="module">
    // main navigation for the application
    import Main from './Main.svelte';
    import ColorMatrix from './ColorMatrix.svelte';
    import About from './About.svelte';
    
    // these are our 'pages' to navigate through (in order for this export to work the script tag MUST include context="module")
    export const navOptions = [
        { page: 'Color scale grid',   component: Main },
        { page: 'About this app',   component: About },
        { page: 'Bivariate color matrix',   component: ColorMatrix },
            // other navigation pages can go here
    ];
    </script>