---
layout: usage
menu: usage
title: Compiling Vega-Lite to Vega
permalink: /usage/compile.html
---

If you would rather compile your Vega-Lite specifications into Vega, you can use Vega-Lite's included [javascript compiler](#javascript) or one of several bundled [command line utilities](#cli).

First install Vega-Lite using npm (`npm install vega-lite`) or by [downloading the latest release](https://github.com/vega/vega-lite/releases/latest).
(For the latter, you will also have to download [Vega](https://github.com/vega/vega/releases/latest) and [D3](http://d3js.org).)


{:#javascript}
## Using Javascript

If you want access to the compiled Vega spec from a Javascript program, you can compile your Vega-Lite spec using the `vl.compile` function.

```js
var vgSpec = vl.compile(vlSpec, options).spec;
```

If provided, the `options` argument should be an object with one or more of the following properties:

* [`config`](#config) sets a default config
* [`logger`](#logging) sets a logger
* ['fieldTitle`](#field-title) sets a field title formatter

{:#config}
### Customized Configuration

You can specify a [config]({{site.baseurl}}/docs/config.html) object as a property of the `compile` function's `options` argument. Note that configuration properties provided via the `config` property in the Vega-Lite specification, will override the configurations passed in through the `compile` function.

{:#logging}
### Customized Logging

By default, warnings and other messages are printed to the JavaScript console (via `console.log/warn` methods). To redirect the log messages, you can pass a customize logger to the compile function.

```js
var vgSpec = vl.compile(vlSpec, {logger: logger}).spec;
```

A custom logger should implement the following interface:

```typescript
interface LoggerInterface {
  level: (_: number) => number | LoggerInterface;
  warn(...args: any[]): LoggerInterface;
  info(...args: any[]): LoggerInterface;
  debug(...args: any[]): LoggerInterface;
}
```

### Customized Field Title Formatter

To customize how Vega-Lite generates axis or legend titles for a [field definition](encoding.html#field-def), you can provide a `titleFormat` function as a property of the `compile` function's `options` argument.

```js
var vgSpec = vl.compile(vlSpec, {
  titleFormat: function (fieldDef, config) {
    const fn = fieldDef.aggregate || fieldDef.timeUnit || (fieldDef.bin && 'bin');
    if (fn) {
      return fn.toUpperCase() + '(' + fieldDef.field + ')';
    } else {
      return fieldDef.field;
    }
  }
}).spec;
```

{:#cli}
## From the Command Line
If you want to compile your Vega-Lite specs from the command line, we provide a set of scripts which make it easy to go from Vega-Lite to Vega, SVG, or PNG. These scripts are `vl2vg`, `vl2svg`, and `vl2png` respectively.

Each script simply accepts your Vega-Lite specification as its first argument.

`vl2svg vega-lite-spec.vl.json`
