---
layout: docs
menu: docs
title: Scale
permalink: /docs/scale.html
---

Scales are functions that transform a domain of data values (numbers, dates, strings, etc.) to a range of visual values (pixels, colors, sizes).
Internally, Vega-Lite uses [Vega scales](https://vega.github.io/vega/docs/scales/), which are derived from the [d3-scale](https://github.com/d3/d3-scale) library. For more background about scales, please see ["Introducing d3-scale"](https://medium.com/@mbostock/introducing-d3-scale-61980c51545f) by Mike Bostock.

Vega-Lite automatically creates scales for fields that are mapped to [position](encoding.html#position) and [mark property](encoding.html#mark-prop) channels.
To customize the scale of a field, users can provide a `scale` object as a part of the [field definition](encoding.html#field) to customize scale properties (e.g., [type](#type), [domain](#domain), and [range](#range)).

{: .suppress-error}
```json
// Single View Specification
{
  "data": ... ,
  "mark": ... ,
  "encoding": {
    "x": {
      "field": ...,
      "type": ...,
      "scale": {                // scale
        "type": ...,
        ...
      },
      ...
    },
    "y": ...,
    ...
  },
  ...
}
```

Besides the `scale` property of each encoding channel, the top-level configuration object ([`config`](config.html)) also provides [scale config](#config) (`config: {scale: {...}}`) for setting default scale properties for all scales.

For more information about guides that visualize the scales, please see the [axes](axis.html) and [legends](legend.html) pages.


## Documentation Overview
{:.no_toc}

* TOC
{:toc}

{:#type}
## Scale Types

The `type` property can be specified to customize the scale type.

{% include table.html props="type" source="Scale" %}


By default, Vega-Lite use the following scale types for the following [data types](type.html) and [encoding channels](encoding.html#channel):

|                      | Nominal / Ordinal               | Quantitative              | Bin-Quantitative<sup>1</sup>    | Temporal                  |
|---------------------:|:------------------------------:|:-------------------------:|:------------------------:|:-------------------------:|
| __X, Y__ | [Band](#band) / [Point](#point)<sup>2</sup>| [Linear](#linear)         | [Linear](#linear) <sup>3</sup>       | [Time](#time)             |
| __Size, Opacity__    | [Point](#point)                | [Linear](#linear)         | [Bin-Linear](#bin-linear)| [Time](#time)             |
| __Color__            | [Ordinal](#ordinal)            | [Sequential](#sequential) | [Bin-Ordinal](#ordinal)  | [Sequential](#sequential) |
| __Shape__            | [Ordinal](#ordinal)            | N/A                       | N/A                      | N/A                       |

<span class="note-line">
<sup>1</sup> Quantitative fields with the [`bin`](bin.html) transform.
</span>
<span class="note-line">
<sup>2</sup> For positional (x and y) ordinal and ordinal fields, `"point"` is the default scale type for all marks except
bar and rect marks, which use `"band"` scales.
</span>
<span class="note-line">
<sup>3</sup> For static plots, both `"linear"` and `"bin-linear"` work with binned fields on x and y.  However, [panning](translate.html) and [zooming](zoom.html) do not work with discretized scales such as `"bin-linear"`, thus we use `"linear"` as the default scale type for binned fields on x and y.
</span>

{:#domain}
## Scale Domains

By default, a scale in Vega-Lite draws domain values directly from a channel's encoded field. Users can specify the `domain` property of a scale to customize its domain values. To sort the order of the domain of the encoded, the [`sort`](sort.html) property of a [field definition](encoding.html#field-def) can be specified.

{% include table.html props="domain" source="Scale" %}

<!--
#### Example: Custom Domain
TODO: Custom Domain for quantitative / discrete scales
-->

{:#range}
## Scale Ranges

The range of the scale represents the set of output visual values. Vega-Lite automatically determines the default range for each [encoding channel](encoding.html#channel) using the following rules:

| Channels    | Default Range  |
| :---------- | :-----------------  |
| `x`         | The range is _always_ `[0, width]`.  Any directly specified `range` will be ignored. Range can be customized via the view's [`width`](size.html) property or via [range steps and paddings properties](#range-step) for [band](#band) and [point](#point) scales.  |
| `y`         | The range is _always_ `[0, height]`. Any directly specified `range` will be ignored. Range can be customized via the view's [`height`](size.html) property or via [range steps and paddings properties](#range-step) for [band](#band) and [point](#point) scales. |
| `opacity`   | Derived from the [scale config](#config)'s `min/maxOpacity`. |
| `color`     | Derived from the following [named ranges](scale.html#range-config) based on the field's [`type`](type.html): <br/> • `"category"` for _nominal_ fields. <br/> • `"ordinal"` for _ordinal_ fields. <br/> • `"heatmap"` for _quantitative_ and _temporal_ fields with `"rect"` marks and `"ramp'` for other marks. <br/><br/> See the [color scheme](#scheme) section for examples. |
| `size`      | Derived from the following [named ranges](#config) based on the `mark` type: <br/> • `min/maxBandSize` for bar and tick. <br/> • `min/maxStrokeWidth` for line and rule. <br/> • `min/maxSize` for point, square, and circle <br/> • `min/maxFontSize` for text |
| `shape`   | Derived from the [pre-defined named range](#range-config) `"symbol"`. |

To customize range values, users can directly specify `range`, or the special range properties: [`rangeStep`](#range-step) and [`padding`](#padding) for [band](#band) and [point](#point) scales and [`scheme`](#scheme) for [ordinal](#ordinal) and [sequential](#sequential) color scales.

{% include table.html props="range" source="Scale" %}

{:#scheme}
### Color Schemes

Color schemes provide a set of named color palettes as a scale range for the `color` channel. Vega-Lite (via Vega) provides a collection of perceptually-motivated color schemes, many of which are drawn from the [d3-scale](https://github.com/d3/d3-scale), [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic), and [ColorBrewer](http://colorbrewer2.org/) projects.

By default, Vega-Lite assigns different [default color schemes](#range-config) based on the types of the encoded fields:

-  _Nominal_ fields use the `"categorical"` [pre-defined named range](#range-config) (the `"category20"` scheme by default).

<div class="vl-example" data-name="point_color"></div>

- _Ordinal_ fields use the `"ordinal"` [pre-defined named color range](#range-config) (the `"blues"` color scheme by default).

<div class="vl-example" data-name="point_color_ordinal"></div>

- _Quantitative_ and _temporal_ fields use the [pre-defined named color range](#range-config) `"heatmap"` (the `"viridis"` scheme by default) for rect marks and `"ramp"` (the `"blues"` scheme by default) for other marks.

<div class="vl-example" data-name="rect_heatmap"></div>

<div class="vl-example" data-name="point_color_quantitative"></div>

There are multiple ways to customize the scale range for the color encoding channel:

1) Set a custom `scheme`.

{% include table.html props="scheme" source="Scale" %}

For example, the following plot use the `"category20b"` scheme.

<div class="vl-example" data-name="stacked_area"></div>

{:#scheme-params}

The `scheme` property can also be a __scheme parameter object__, which contain the following properties:

{% include table.html props="name,extent" source="SchemeParams" %}

2) Setting the `range` property to an array of valid CSS color strings.

<div class="vl-example" data-name="point_color_custom"></div>

3) Change the default color schemes using the [range config](#range-config).

{:#continuous}
## Continuous Scales

Continuous scales map a continuous domain (numbers or dates) to a continuous output range (pixel locations, sizes, colors).  Supported continuous scale types for _quantitative_ fields are [`"linear"`](#linear), [`"log"`](#log), [`"pow"`](#pow), [`"sqrt"`](#sqrt), and [`"sequential"`](#sequential).  Meanwhile, supported continuous scale types for _temporal_ fields are [`"time"`](#time), [`"utc"`](#utc), and [`"sequential"`](#sequential).

By default, Vega-Lite uses `"linear"` scales for quantitative fields and uses `"time"` scales for temporal fields for all [encoding channels](encoding.html#channel) except for `color`, which uses `"sequential"` scales for both quantitative and temporal fields.

In addition to [`type`](#type), [`domain`](#domain), and [`range`](#range), continuous scales support the following properties:

{% include table.html props="clamp,interpolate,nice,padding,round,zero" source="Scale" %}

{:#linear}
### Linear Scales

Linear scales (`"linear"`) are quantitative scales scales that preserve proportional differences. Each range value y can be expressed as a linear function of the domain value _x_: _y = mx + b_.

{:#pow}
### Power Scales

Power scales (`"pow"`) are quantitative scales scales that apply an exponential transform to the input domain value before the output range value is computed. Each range value y can be expressed as a polynomial function of the domain value  _x_: _y = mx^k + b_, where _k_ is the `exponent` value. Power scales also support negative domain values, in which case the input value and the resulting output value are multiplied by -1.

{% include table.html props="exponent" source="Scale" %}

{:#sqrt}
### Square Root Scales

Square root (`"sqrt"`) scales are a convenient shorthand for power scales with an `exponent` of `0.5`, indicating a square root transform.

{:#log}

### Logarithmic Scales

Log scales (`"log"`) are quantitative scales in which a logarithmic transform is applied to the input domain value before the output range value is computed. Log scales are particularly useful for plotting data that varies over multiple orders of magnitude. The mapping to the range value y can be expressed as a logarithmic function of the domain value _x_: _y = m log<sub>a</sub>(x) + b_, where _a_ is the logarithmic `base`.

As _log(0) = -∞_, a log scale domain must be strictly-positive or strictly-negative; the domain must not include or cross zero.
A log scale with a positive domain has a well-defined behavior for positive values, and a log scale with a negative domain has a well-defined behavior for negative values. (For a negative domain, input and output values are implicitly multiplied by -1.) The behavior of the scale is undefined if you run a negative value through a log scale with a positive domain or vice versa.

{% include table.html props="base" source="Scale" %}

__Example:__ The following plot has a logarithmic y-scale.

<div class="vl-example" data-name="point_log"></div>

<!-- {% include table.html props="base" source="Scale" %} -->

<!--
- `quantize` scale maps continuous value to a discrete range by dividing the domain into uniform segments based on the number of values in (i.e., the cardinality of) the output range. Each range value _y_ can be expressed as a quantized linear function of the domain value _x_: _y = m round(x) + b_.
- `quantile` scale maps a sampled input domain to a discrete range by sorting the domain and compute the quantiles. The cardinality of the output range determines the number of quantiles that will be computed. -->

<!-- TODO: need to test if we support threshold scale correctly before writing about it-->

{:#time}
### Time and UTC Scales

Time and UTC scales (`"time"` and `"utc"`) are [continuous scales](#quantitative) with a temporal domain: values in the input domain are assumed to be [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) objects or timestamps. Time scales use the current local timezone setting. UTC scales instead use [Coordinated Universal Time](https://en.wikipedia.org/wiki/Coordinated_Universal_Time).

{:#sequential}
### Sequential Scales

Sequential scales (`"sequential"`) are similar to linear scales, but use a fixed interpolator to determine the output range. By default, Vega-lite uses sequential scales to encode continuous (quantitative and temporal) fields with `color`s.

To customize the range of a sequential scale, either a [`range`](#range) array listing colors or a color [`scheme`](#scheme) can be specified.

{:#piecewise}
### Piecewise Scales

We can use any types of continuous scales ([`"linear"`](scale.html#linear), [`"pow"`](scale.html#pow), [`"sqrt"`](scale.html#sqrt), [`"log"`](scale.html#log), [`"time"`](scale.html#time), [`"utc"`](scale.html#utc), [`"sequential"`](scale.html#sequential)) to create a diverging color graph by specifying a custom `domain` with multiple elements.

If `range` is specified, the number of elements in `range` should match with the number of elements in `domain`. [Diverging color `scheme`s](https://vega.github.io/vega/docs/schemes/#diverging) are also useful as a range for a piecewise scale.

__Example__

<div class="vl-example" data-name="point_diverging_color"></div>

{:#discrete}
## Discrete Scales

Discrete scales map values from a discrete domain to a discrete or continuous range.

{:#ordinal}
### Ordinal Scales

Ordinal scales (`"ordinal"`) have a discrete domain and range. These scales function as a “lookup table” from a domain value to a range value.

By default, Vega-Lite automatically creates ordinal scales for `color` and `shape` channels.  For example, the following plot implicitly has two ordinal scales, which map the values of the field `"Origin"` to a set of `color`s and a set of `shape`s.

<div class="vl-example" data-name="point_color_with_shape"></div>

The [`range`](#range) of an ordinal scale can be an array of desired output values, which are directly mapped to elements in the [`domain`](#domain).  Both `domain` and `range` array can be re-ordered to specify the order and mapping between the domain and the output range. For ordinal color scales, a custom [`scheme`](#scheme) can be set as well.

<a name="point"></a><!-- point and band are in the same section -->

{:#band}
### Band and Point Scales

Band and point scales accept a discrete domain similar to [ordinal scales](#ordinal), but map this domain to a continuous, numeric output range such as pixels.

__Band scales__ (`"band"`) compute the discrete output values by dividing the continuous range into uniform _bands_. Band scales are typically used for bar charts with an ordinal or categorical dimension.

In addition to a standard numerical _range_ value (such as `[0, 500]`), band scales can be given a fixed _step_ size for each band. The actual range is then determined by both the step size and the cardinality (element count) of the input domain.

This image from the [d3-scale documentation](https://github.com/d3/d3-scale#band-scales) illustrates how a band scale works:

<img src="https://raw.githubusercontent.com/d3/d3-scale/master/img/band.png"/>

__Point scales__ (`"point"`) are a variant of [band scales](#band) where the internal band width is fixed to zero. Point scales are typically used for scatterplots with an ordinal or categorical dimension. Similar to band scales, point scale _range_ values may be specified using either a numerical extent (`[0, 500]`) or a step size (`{"step": 20}`).

This image from the [d3-scale documentation](https://github.com/d3/d3-scale#band-scales) illustrates how a point scale works:

<img src="https://raw.githubusercontent.com/d3/d3-scale/master/img/point.png"/>


By default, Vega-Lite uses band scales for nominal and ordinal fields on [position channels](encoding.html#position) (`x` and `y`) of [bar](bar.html) or [rect](rect.html) marks.
For `x` and `y` of other marks and `size` and `opacity`, Vega-Lite uses point scales by default.

For example, the following bar chart has uses a band scale for its x-position.

<div class="vl-example" data-name="bar"></div>

<a name="padding"/>
{:#range-step}

To customize the range of band and point scales, users can provide the following properties:

{% include table.html props="padding,paddingInner,paddingOuter,rangeStep,round" source="Scale" %}

For example, we can set the `rangeStep` property to make the bands of the bars smaller.

<span class="vl-example" data-name="bar_size_rangestep_small"></span>

{:#discretizing}
## Discretizing Scales

Discretizing scales break up a continuous domain into discrete segments, and then map values in each segment to a range value.

{:#bin-linear}
### Bin-Linear Scales

Binned linear scales (`"bin-linear"`) are a special type of linear scale for use with [binned](bin.html) fields to correctly create legend labels.
Vega-Lite _always_ uses binned linear scales with binned quantitative fields on size and opacity channels.

For example, the following plot has a binned field on the `size` channel.

<span class="vl-example" data-name="point_binned_size"></span>


{:#bin-ordinal}
### Bin-Ordinal Scales

Binned ordinal scales (`"bin-ordinal"`) are a special type of ordinal scale for use with [binned](bin.html) fields to correctly create legend labels.
Vega-Lite _always_ uses binned ordinal scales with binned quantitative fields on the color channel.

For example, the following plot has a binned field on the `color` channel.

<span class="vl-example" data-name="point_binned_color"></span>

Similar to [ordinal](#ordinal) color scales, a custom [`range`](#range) or [`scheme`](#scheme) can be specified for binned ordinal scales.

{:#config}
## Configuration

{: .suppress-error}
```json
// Top-level View Specification
{
  ...
  "config": {
    "scale": {
      ...                       // Scale Config
    },
    "range": {
      ...                       // Scale Range Config
    },
    ...
  }
  ...
}
```

### Scale Config

To provide themes for all scales, the scale config (`config: {scale: {...}}`) can contain the following properties:

{% include table.html props="bandPaddingInner,bandPaddingOuter,clamp,maxBandSize,minBandSize,maxFontSize,minFontSize,maxOpacity,minOpacity,maxSize,minSize,maxStrokeWidth,minStrokeWidth,pointPadding,rangeStep,round,textXRangeStep,useUnaggregatedDomain" source="ScaleConfig" %}

{:#range-config}
### Range Config

The scale range configuration (`config: {range: {...}}`) defines key-value mapping for named scale ranges: the keys represent the range names, while the values define valid [`range`](#range) or, for named color ranges, [Vega scheme definitions](https://vega.github.io/vega/docs/schemes/#scheme-properties).

By default, Vega-Lite (via Vega) includes the following pre-defined named ranges:

{% include table.html props="category,diverging,heatmap,ordinal,ramp,symbol" source="RangeConfig" %}

See [this file](https://github.com/vega/vega-parser/blob/master/src/config.js#L188) for the default values of named ranges.
