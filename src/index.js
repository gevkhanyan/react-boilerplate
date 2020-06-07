// Use the window load event to keep the page load performance
window.addEventListener('load', function onLoad() {
    import('src/Pages/Index')
        .then(({ default: loadIndex }) => {
            loadIndex();
        });
});

