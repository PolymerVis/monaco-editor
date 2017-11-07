---
layout: docs
menu: docs
title: Circle
permalink: /docs/circle.html
---

{: .suppress-error}
```json
// Single View Specification
{
  "data": ... ,
  "mark": "circle",
  "encoding": ... ,
  ...
}
```

`circle` mark is similar to [`point`](point.html) mark, except that (1) the `shape` value is always set to `circle` (2) they are filled by default.

## Scatterplot with Circle

Here is an example scatter plot with `circle` marks:

<span class="vl-example" data-name="circle"></span>


{:#config}
## Circle Config

{: .suppress-error}
```json
// Top-level View Specification
{
  ...
  "config": {
    "circle": ...,
    ...
  }
}
```

The `circle` property of the top-level [`config`](config.html) object sets the default properties for all circle marks.  If [mark property encoding channels](encoding.html#mark-prop) are specified for marks, these config values will be overridden.

For the list of all supported properties, please see the [mark config documentation](mark.html#config).
