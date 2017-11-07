# PolymerVis
PolymerVis is a suite of Polymer elements for visualizations.

*Quick start*
Import the `polymer-vis.html` file to use any of the utility functions.

```html
<link rel="import" href="../bower_components/polymer-vis.html">
```

Alternatively, you can also include it as a script instead.
```html
<script src="../bower_components/build/es5/polymer-vis.js"></script>
```

  <a name="exp_module_loadScript--PolymerVis.loadScript"></a>

## PolymerVis.loadScript(src, onload, onerror, optAsync) ⇒ <code>HTMLScriptElement</code> ⏏
Convenience method for dynamically loading a script.

This method creates a new `<script>` element with the provided URL and
appends it to the document to start loading. In the onload callback, the
import property of the link element will contain the imported document
contents.

**Kind**: global method of [<code>PolymerVis.loadScript</code>](#exp_module_loadScript--PolymerVis.loadScript)  

| Param | Type | Description |
| --- | --- | --- |
| src | <code>string</code> | The url to the script to load. |
| onload | <code>function</code> | callback when script is loaded. |
| onerror | <code>function</code> | callback when error loading script. |
| optAsync | <code>boolean</code> | whether to execute the script asynchronously. |

  <a name="exp_module_loadStylesheet--PolymerVis.loadStylesheet"></a>

## PolymerVis.loadStylesheet(href, onload, onerror, optAsync) ⇒ <code>HTMLLinkElement</code> ⏏
Convenience method for dynamically loading a stylesheet.

This method creates a new `<link rel="stylesheet">` element with the
provided URL and appends it to the document to start loading. In the onload
callback, the import property of the link element will contain the
imported document contents.

**Kind**: global method of [<code>PolymerVis.loadStylesheet</code>](#exp_module_loadStylesheet--PolymerVis.loadStylesheet)  

| Param | Type | Description |
| --- | --- | --- |
| href | <code>string</code> | The url to the script to load. |
| onload | <code>function</code> | callback when script is loaded. |
| onerror | <code>function</code> | callback when error loading script. |
| optAsync | <code>boolean</code> | whether to execute the script asynchronously. |

