/**
 * PolymerVis is a suite of Polymer elements for visualizations.
 * @name PolymerVis
 * @module PolymerVis
 */

(function(PolymerVis) {
  /**
   * Convenience method for dynamically loading a script.
   *
   * This method creates a new `<script>` element with the provided URL and
   * appends it to the document to start loading. In the onload callback, the
   * import property of the link element will contain the imported document
   * contents.
   *
   * @alias module:loadScript
   * @param {string} src The url to the script to load.
   * @param {Function} onload callback when script is loaded.
   * @param {Function} onerror callback when error loading script.
   * @param {boolean} optAsync whether to execute the script asynchronously.
   * @return {HTMLScriptElement}
   */
  PolymerVis.loadScript = function(src, onload, onerror, optAsync = true) {
    var ele = document.createElement('script');
    ele.src = src;
    ele.async = optAsync;
    if (onload) ele.onload = onload;
    if (onerror) ele.onerror = onerror;
    document.body.appendChild(ele);
    return ele;
  };

  /**
   * Convenience method for dynamically loading a stylesheet.
   *
   * This method creates a new `<link rel="stylesheet">` element with the
   * provided URL and appends it to the document to start loading. In the onload
   * callback, the import property of the link element will contain the
   * imported document contents.
   *
   * @alias module:loadStylesheet
   * @param {string} href The url to the script to load.
   * @param {Function} onload callback when script is loaded.
   * @param {Function} onerror callback when error loading script.
   * @param {boolean} optAsync whether to execute the script asynchronously.
   * @return {HTMLLinkElement}
   */
  PolymerVis.loadStylesheet = function(href, onload, onerror, optAsync = true) {
    var ele = document.createElement('link');
    ele.href = href;
    ele.rel = 'stylesheet';
    ele.async = optAsync;
    if (onload) ele.onload = onload;
    if (onerror) ele.onerror = onerror;
    document.body.appendChild(ele);
    return ele;
  };
})((window.PolymerVis = window.PolymerVis || {}));
