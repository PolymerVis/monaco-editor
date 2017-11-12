monaco-editor
[![GitHub release](https://img.shields.io/github/release/PolymerVis/monaco-editor.svg)](https://github.com/PolymerVis/monaco-editor/releases)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/PolymerVis/monaco-editor)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
==========

<!---
```
<custom-element-demo>
  <template is="dom-bind">
    <link rel="import" href="monaco-schemas.html">
    <link rel="import" href="monaco-editor.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<monaco-schemas
  keys="vega-lite"
  schemas="{{schemas}}"></monaco-schemas>

<monaco-editor
  style="width:520px;"
  value="[[value]]"
  language="json"
  schemas="[[schemas]]">
<div slot="monaco-value">{
  "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
  "description": "A simple bar chart with embedded data.",
  "data": {
    "values": [
      {"a": "A","b": 28}, {"a": "B","b": 55}, {"a": "C","b": 43},
      {"a": "D","b": 91}, {"a": "E","b": 81}, {"a": "F","b": 53},
      {"a": "G","b": 19}, {"a": "H","b": 87}, {"a": "I","b": 52}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "ordinal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}</div>
</monaco-editor>
```

## Installation
```
bower install --save PolymerVis/monaco-editor
```

## Documentation and demos
More examples and documentation can be found at `monaco-editor` [webcomponents page](https://www.webcomponents.org/element/PolymerVis/monaco-editor).

The demos can be found at the [`monaco-editor` Github page](https://PolymerVis.github.io/monaco-editor/build/demo).

## Special notes on styling and demo
The layout of the hints are out for the demo because of the way the original monaco editor is styled and the way webcomponents.org renders the demo. It is very difficult for me to isolate the conflicts.

You can still view the demo at the [`monaco-editor` Github page](https://PolymerVis.github.io/monaco-editor/build/demo).

## Very important note on external dependencies when building/bundling your app
`monaco-editor` loads most of the required modules dynamically, hence `polymer-build` will not be able to properly detect these external modules. You will need to manually add `bower_components/monaco-editor/node_modules/monaco-editor/min/vs/**/*` into the `extraDependencies` to ensure these modules are exported together.

## Important note on "hack" to allow Monaco Editor to work inside a custom element
Monaco Editor only works properly in the light DOM and there are a few functions that access or check on `document.body`. The selection is also dependent on `document.caretPositionFromPoint` or its variant. Hence, there are only a few solutions:

- make a pull request and update the source code: but the source code seems to reside somewhere in [Visual Studio Code repo](https://github.com/Microsoft/vscode) instead of a proper `monaco-editor-core` repo,
- attach the element (which Monaco Editor will be anchoring to) in the `document.body`, and try to sync the position, size, and style with the `monaco-editor` custom element,
- create an iFrame and attach the iFrame to the `monaco-editor` custom element's shadowRoot.

The current approach now is, if the parent node of the `monaco-editor` is in the light DOM (it is not inside another custom element), the anchoring element will be insert as a slot (so that it remains in the light DOM), otherwise an iFrame will be created. In this case, a `monaco`, and `editor` proxy object will be created so that the some functions will be proxied into the iFrame.

## Disclaimers
PolymerVis is a personal project and is NOT in any way affliated with Microsoft, Polymer or Google.

# `monaco-editor`
`monaco-editor` is a Polymer 2.0 element for [Monaco Editor](https://microsoft.github.io/monaco-editor/), a browser-based code editor which also powers Visual Studio Code.

## Quick start
```html
<!-- enable code folding, minimap, and dark theme -->
<monaco-editor
  folding
  minimap
  theme="vs-dark"
  language="javascript"></monaco-editor>
```
Please look at the documentation for all the available options.

## Pre-populated with codes
1. Populate with the `value` property.
```js
var codes = `// this is a comment line
var helloworld = "hello world";
`;
```
```html
<!-- 2-way binding is available for `value` -->
<monaco-editor
  language="javascript"
  value="{{codes}}"></monaco-editor>
```

2. Populate with a `monaco-value` `slot` element.  
*Note that the `text` in the `slot` element is only loaded once during initialization. Subsequent changes to the slot will not change the `value`.*
```html
<!-- text is only loaded once, and not updated upon subsequent changes -->
<monaco-editor
  language="javascript"
  value="{{codes}}">
  <div slot="monaco-value">// comment line
var helloworld = "hello world";</div>
</monaco-editor>
```

# `monaco-schemas`
`monaco-schemas` is a Polymer 2.0 element to where you can retrieve a list of JSON schemas through a space-separated key string. These schemas can then be passed into `monaco-editor`.

`monaco-schemas` currently only has the schemas for [Vega v3.0](https://vega.github.io/vega/) and [Vega-Lite v2.0](https://vega.github.io/vega-lite/). However, you can easily add additional schemas into `monaco-schemas`.

```html
<!-- extract `schemas` by definiting a space-separated string, `keys`. -->
<monaco-schemas keys="vega-lite" schemas="{{schemas}}"></monaco-schemas>

<!--  
pass the `schemas` array to `json-schemas` and set `json-validate` flag
to enable hints, suggestions, and validation of the inputs.
-->
<monaco-editor json-validate language="json"
    json-schemas="[[schemas]]"></monaco-editor>
```

You can define your own schemas by providing the `uri` to the schema. `monaco-schemas` will automatically retrieve the schema from the `uri` if the `schema` field is empty.

```js
var data = {
  "vega-lite-uri": {
    "uri": "https://vega.github.io/schema/vega-lite/v2.json",
    "schema": null,
    "fileMatch": ["*"]
  }
}
```
```html
<!-- retrieve an array of schemas "vega-lite" and "vega-lite-uri". -->
<monaco-schemas keys="vega-lite vega-lite-uri"
  schemas="{{schemas}}"  
  data="[[data]]"></monaco-schemas>
```

You can also define a custom schema directly.

```json
var data_w_cat = {
  "cat": {
    "schema": {
      "title": "Cat",
      "type": "object",
      "properties": {
        "name": {
          "description": "Name of the cat",
          "type": "string"
        },
        "breed": {
          "description": "Breed of the cat",
          "type": "string"
        },
        "age": {
          "description": "Age of the cat",
          "type": "string",
          "enum": ["kitten", "young adult", "adult", "old cat"]
        }
      }
    },
    "fileMatch": ["*"]
  }
};
```
```html
<!-- retrieve custom schema "cat". -->
<monaco-schemas keys="cat"
  schemas="{{schemas}}"  
  data="[[data_w_cat]]"></monaco-schemas>
```
