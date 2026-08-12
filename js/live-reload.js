(function () {
  const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  if (!isLocalDev || window.__portfolioLiveReload === true || !window.EventSource) {
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
