---
layout: docs
menu: docs
title: Transformation
permalink: /docs/transform.html
---

Data transformations in Vega-Lite are described via either top-level transforms (the `transform` property) or [field transforms inside `encoding`](encoding.html#field-transform) (`aggregate`, `bin`, `timeUnit`, and `sort`).

When both types of transforms are specified, the top-level `transform`s are executed first based on the order in the array. Then the inline transforms are executed in this order: `bin`, `timeUnit`, `aggregate`, and `sort`.

## Top-level Transform Property

{: .suppress-error}
```json
{
  "data": ... ,
  "transform": [
     ...
  ],
  "mark": ... ,
  "encoding": ... ,
  ...
}
```

The top-level `transform` object is an array of objects describing transformations. The transformations are executed in the order in which they are specified in the array.
Vega-Lite's `transform` supports the following types of transformations:

- [Aggregate](aggregate.html#transform)
- [Bin](bin.html#transform)
- [Calculate](calculate.html)
- [Filter](filter.html)
- [TimeUnit](timeunit.html#transform)
