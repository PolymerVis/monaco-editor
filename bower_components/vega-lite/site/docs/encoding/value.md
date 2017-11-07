---
layout: docs
title: Value
permalink: /docs/value.html
---

{: .suppress-error}
```json
// Specification of a Single View
{
  ...,
  "encoding": {     // Encoding
    ...: {
      "value": ..., // Value
    },
    ...
  },
  ...
}
```

A [value definition](encoding.html#value-def) must include a `value` property
to map a constant value to an [encoding channel](encoding.html#channels).

{% include table.html props="value" source="ValueDef" %}

For example, you can set `color` and `shape` of a scatter plot to constant values.

<span class="vl-example" data-name="point_color_shape_constant"></span>


{:#ex-bar-size}

Similarly, `value` for `size` channel of bar marks will adjust the bar's size. By default, there will be 1 pixel offset between bars. The following example sets the size to 10 to add more offset between bars.

<span class="vl-example" data-name="bar_aggregate_size"></span>
