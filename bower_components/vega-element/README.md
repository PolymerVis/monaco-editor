vega-element
[![GitHub release](https://img.shields.io/github/release/PolymerVis/vega-element.svg)](https://github.com/PolymerVis/vega-element/releases)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/PolymerVis/vega-element)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
==========

<!---
```
<custom-element-demo>
  <template is="dom-bind">
    <link rel="import" href="vega-tooltip.html">
    <link rel="import" href="vega-signal.html">
    <link rel="import" href="vega-element.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<vega-element tooltip hover
  vega-spec-url="./demo/barchart.json"></vega-element>

```

`vega-element` is the Polymer element to provide an easy HTML interface for [Vega](https://vega.github.io/vega) and [Vega-Lite](https://vega.github.io/vega-lite) visualizations.
More API documentation and Demos can be found on [the web components page for vega-element](https://www.webcomponents.org/element/PolymerVis/vega-element).

**Versions details**  
v2 is a breaking change from v1 as it is an upgrade in major versions for both Polymer and Vega.  
- [**v2**](https://github.com/PolymerVis/vega-element/tree/polymer2) Supports Polymer 2.0, Vega 3.0, and Vega-Lite 2.0
- [**v1**](https://github.com/PolymerVis/vega-element/tree/polymer1) Supports Polymer 1.0 and Vega 2.0

## Disclaimer
PolymerVis is a personal project and is NOT in any way affliated with Vega, Vega-Lite, Polymer or Google.

## Installation

```
bower install --save PolymerVis/vega-element
```

## Component summary

[Vega](http://vega.github.io/) is a declarative format for creating, saving, and sharing visualization designs. With Vega, visualizations are described in JSON, and generate interactive views using either HTML5 Canvas or SVG.

`vega-element` is the Polymer element to provide an easy HTML interface to render visualizations for any Vega and Vega-Lite specifications.

`vega-signal` and `vega-data` provide data-binding to the `signals` and `data` in the vega runtime.

`vega-data-stream` provide reactive updates to specific entry or entries in the specified data set in vega runtime.

[vega-tooltip](https://github.com/vega/vega-tooltip) the plugin for Vega/Vega-Lite is also available in the form of flag `tooltip` and property `tooltip-options` in `vega-element`.

Optional components such as `vega-signal`, `vega-data`, and `vega-data-stream` need to be **imported separately**. However, `vega-elements.html` provides a quick list of all the available components.

### Important notes on *d3*, *vega*, *vega-lite*, *vega-tooltip* dependencies:

`vega-element` depends on various dependencies such as [d3](https://d3js.org/), [Vega](https://vega.github.io/vega/), [Vega-Lite](https://vega.github.io/vega-lite/), and [Vega-Tooltip](https://github.com/vega/vega-tooltip). However, not all of them are required for all use cases, as such, by default none of these libraries will be included in the `vega-element` import.

Individual libraries can be included normally with `<script>` or through `<link rel="import">` with the provided imports. Either vega or vega-core **MUST** be included for `vega-element` to work. Include vega-core only if d3 needs to be separated from vega (i.e. d3 is used in other parts of the app).

**`vega.html`**  
Full vega bundle with all dependencies, including d3 modules.

**`vega-core.html`**  
Smaller vega bundle that excludes redundant d3 files.

**`d3.html`**  
Full d3 bundle. Not required if `vega.html` is imported. Can be imported together with `vega-core.html`.

**`vega-lite.html`**  
Full vega-lite bundle. Required only if vega-lite specifications are used.

**`vega-tooltip`**  
vega-tooltip bundle together with the corresponding stylesheet. Required only if the tooltip plugin is needed.

`vega-element` has built-in mechanism to include the appropriate libraries directly from CDN if they are not included. However, these libraries may not be the most updated versions. The default URLs can be modified through the properties: `vega-src`, `vega-core-src`, `vega-lite-src`, `tooltip-plugin-src`, and `tooltip-plugin-css-src`.

Including the required imports are more efficient than dynamically including the libraries as polymer-cli will able to optimize the build properly.

## Usage

**Basic Vega usage**
```html
<!-- load via URL to Vega specification -->
<vega-element vega-spec-url="vega-spec.json"></vega-element>

<!-- load via vega specification JSON object -->
<vega-element vega-spec="[[vegaSpecObject]]"></vega-element>
```

**Basic Vega-Lite usage**  
```html
<!-- load via URL to Vega-Lite specification -->
<vega-element vega-lite-spec-url="vega-lite-spec.json"></vega-element>

<!-- load via Vega-Lite specification JSON object -->
<vega-element vega-lite-spec="[[vegaLiteSpecObject]]"></vega-element>
```
vega-lite specification is automatically parsed into Vega specification and is available as `vega-spec` property.
```html
<!-- vegaLiteSpecObject is parse into resultantVegaSpecObject -->
<vega-element
  vega-lite-spec="[[vegaLiteSpecObject]]"
  vega-spec="{{resultantVegaSpecObject}}"></vega-element>
```

**Enable hover event processing**  
```html
<!--
  By default, hover events are not handled.
  Add `hover` flag to enable hover event handling.
 -->
<vega-element hover vega-spec-url="vega-spec.json"></vega-element>
```

**Enable tooltip plugin**  
```html
<!-- import vega-tooltip plugin -->
<link rel="import" href="vega-tooltip">
<!-- Add `tooltip` flag to enable vega-tooltip plugin -->
<vega-element tooltip
  tooltip-options="[[tooltipOptions]]"
  vega-spec-url="vega-spec.json"></vega-element>
```

`tooltipOptions`
```javascript
/**
 * more customization options at
 * https://github.com/vega/vega-tooltip/blob/master/docs/customizing_your_tooltip.md
 */
{
  showAllFields: false,
  fields: [
    {
      field: 'category',
      title: 'Category'
    },
    {
      field: 'amount',
      title: 'Amount',
      formatType: 'number',
      format: ',d'
    }
  ],
  delay: 250,
  colorTheme: 'light'
}
```

**Data-binding to signals**  
```html
<!-- import vega-signal -->
<import rel="import" href="vega-signal">

<!--
bar chart that takes in a signal "barColor"
which will update the color to fill the bars
-->
<vega-element hover vega-spec-url="barchart.json">
  <!-- bind variable "barColor" to signal "barColor" -->
  <vega-signal
    name="barColor"
    value="[[barColor]]"></vega-signal>
</vega-element>

Click to select color [[barColor]] for the bars
<!--
a list of colored circles which outputs
a signal "selectedColor" when clicked upon
 -->
<vega-element hover vega-spec-url="colors.json">
  <!-- bind signal "selectedColor" to variable "barColor" -->
  <vega-signal
    name="selectedColor"
    value="{{barColor}}"></vega-signal>
</vega-element>
```

**Data-binding to specified data set**
```html
<vega-element vega-lite-spec-url="linechart-vl.json">

  <!-- if name is not provided,
  the data set to bind to will be the
  corresponding data set in the same order
  as specified in the vega specification -->
  <vega-data
    name="table"
    value="{{table}}"></vega-data>

</vega-element>
```

**reactive updates to specific entry or entries**
```html
<vega-element vega-spec-url="barchart.json">

  <vega-data-stream
    name="table"
    field="amount"
    predicate="[[predicate]]"
    value="[[randomValue]]"></vega-data-stream>

</vega-element>
```

**headless mode and exporting SVG or PNG images**
```html
<vega-element id="chart"
  headless
  vega-spec-url="barchart.json"></vega-element>

<button onclick="javascript:downloadImage('svg')">Download SVG</button>
<button onclick="javascript:downloadImage('png')">Download PNG</button>
```
```javascript
function downloadImage(type) {
  return this.$.chart.downloadImage(type);
}
```

## Bl.ocks examples
- [Simple barchart](https://bl.ocks.org/eterna2/65dacb480846bf08f645033b607b1e93)
- [Data-binding with `vega-data`](http://bl.ocks.org/eterna2/d0d0c4593b8306926161571814859055)
- [Data-binding with `vega-signal`](https://bl.ocks.org/eterna2/77329460e8e405b701699863ac2ce6e3)
