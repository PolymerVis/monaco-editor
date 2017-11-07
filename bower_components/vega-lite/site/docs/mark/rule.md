---
layout: docs
menu: docs
title: Rule
permalink: /docs/rule.html
---

{: .suppress-error}
```json
// Single View Specification
{
  "data": ... ,
  "mark": "rule",
  "encoding": ... ,
  ...
}
```

The `rule` mark represents each data point as a line segment. It can be used in two ways. First, as a line segment that spans the complete width or height of a view. Second, a rule can be used to draw a line segment between two positions.

## Documentation Overview
{:.no_toc}

* TOC
{:toc}

## Width/Height-Spanning Rules

If the `rule` mark only has `y` encoding, the output view produces horizontal rules that  spans the complete width.  Similarly, if the `rule` mark only has `x` encoding, the output view produces vertical rules that spans the height.

We can use rules to show the average price of different stocks akin to [`tick`](tick.html) marks.

<span class="vl-example" data-name="rule_color_mean"></span>

The fact that rule marks span the width or the height of a single view make them useful as an annotation [layer](layer.html).  For example, we can use rules to show average values of different stocks alongside the price curve.

<span class="vl-example" data-name="layer_line_color_rule"></span>

We can also use a rule mark to show global mean value over a histogram.

<span class="vl-example" data-name="layer_histogram_global_mean"></span>

{:#ranged}
## Ranged Rules

To control the spans of horizontal/vertical rules, `x` and `x2`/`y` and `y2` channels can be specified.

For example, we can use `y` and `y2` show the `"min"` and `"max"` values of horsepowers for cars from different locations.

<span class="vl-example" data-name="rule_extent"></span>

We can also use rule to create error bars. In the example below, we use the [`ci0` and `ci1` aggregation operators](aggregate.html#ops) to visualize the [95% confidence interval](https://en.wikipedia.org/wiki/Confidence_interval) as a measure of the spread of the average yields for a variety of barley strains.

<span class="vl-example" data-name="layer_error_bars"></span>

Alternatively, we can create error bars showing one standard deviation (`stdev`) over and below the mean value.

<span class="vl-example" data-name="layer_error_bars_dev"></span>

{:#config}
## Rule Config


{: .suppress-error}
```json
// Top-level View Specification
{
  ...
  "config": {
    "rule": ...,
    ...
  }
}
```

The `rule` property of the top-level [`config`](config.html) object sets the default properties for all rule marks.  If [mark property encoding channels](encoding.html#mark-prop) are specified for marks, these config values will be overridden.

For the list of all supported properties, please see the [mark config documentation](mark.html#config).
