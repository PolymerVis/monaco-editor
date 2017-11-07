(function(a) {
  (a.loadScript = function(b, c, d, e = !0) {
    var f = document.createElement('script');
    return (
      (f.src = b),
      (f.async = e),
      c && (f.onload = c),
      d && (f.onerror = d),
      document.appendChild(f),
      f
    );
  }),
    (a.loadStylesheet = function(b, c, d, e = !0) {
      var f = document.createElement('link');
      return (
        (f.href = b),
        (f.rel = 'stylesheet'),
        (f.async = e),
        c && (f.onload = c),
        d && (f.onerror = d),
        document.appendChild(f),
        f
      );
    });
})((window.PolymerVis = window.PolymerVis || {}));
