(function () {
  if (window.__portfolioLiveReload === true || !window.EventSource) {
    return;
  }

  window.__portfolioLiveReload = true;

  const source = new EventSource('/__livereload');

  source.addEventListener('reload', function () {
    window.location.reload();
  });

  source.onerror = function () {
    // Reconnect is managed by EventSource automatically.
  };
})();
