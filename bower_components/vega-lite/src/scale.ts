import {Channel} from './channel';
import {ScaleComponentProps} from './compile/scale/component';
import {DateTime} from './datetime';
import * as log from './log';
import {contains, Flag, flagKeys, keys, toSet} from './util';

export namespace ScaleType {
  // Continuous - Quantitative
  export const LINEAR: 'linear' = 'linear';
  export const BIN_LINEAR: 'bin-linear' = 'bin-linear';
  export const LOG: 'log' = 'log';
  export const POW: 'pow' = 'pow';
  export const SQRT: 'sqrt' = 'sqrt';
  // Continuous - Time
  export const TIME: 'time' = 'time';
  export const UTC: 'utc' = 'utc';
  // sequential
  export const SEQUENTIAL: 'sequential' = 'sequential';

  // Quantile, Quantize, threshold
  export const QUANTILE: 'quantile' = 'quantile';
  export const QUANTIZE: 'quantize' = 'quantize';
  export const THRESHOLD: 'threshold' = 'threshold';

  export const ORDINAL: 'ordinal' = 'ordinal';
  export const BIN_ORDINAL: 'bin-ordinal' = 'bin-ordinal';
  export const POINT: 'point' = 'point';
  export const BAND: 'band' = 'band';
}

export type ScaleType = typeof ScaleType.LINEAR | typeof ScaleType.BIN_LINEAR |
  typeof ScaleType.LOG | typeof ScaleType.POW | typeof ScaleType.SQRT |
  typeof ScaleType.TIME | typeof ScaleType.UTC |
  // TODO: add 'quantize', 'quantile', 'threshold' back when we really support them
  typeof ScaleType.SEQUENTIAL | // typeof ScaleType.QUANTILE | typeof ScaleType.QUANTIZE | typeof ScaleType.THRESHOLD |
  typeof ScaleType.ORDINAL | typeof ScaleType.BIN_ORDINAL | typeof ScaleType.POINT | typeof ScaleType.BAND;


/**
 * Index for scale categories -- only scale of the same categories can be merged together.
 * Current implementation is trying to be conservative and avoid merging scale type that might not work together
 */
const SCALE_CATEGORY_INDEX: {
  // Using Mapped Type to declare type (https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types)
  [k in ScaleType]: ScaleType | 'numeric' | 'ordinal-position'
} = {
  linear: 'numeric',
  log: 'numeric',
  pow: 'numeric',
  sqrt: 'numeric',
  'bin-linear': 'bin-linear', // TODO: should bin-linear support merging with other
  time: 'time',
  utc: 'time',
  sequential: 'sequential',
  ordinal: 'ordinal',
  'bin-ordinal': 'bin-ordinal', // TODO: should bin-ordinal support merging with other
  point: 'ordinal-position',
  band: 'ordinal-position'
};

export const SCALE_TYPES = keys(SCALE_CATEGORY_INDEX) as ScaleType[];

/**
 * Whether the two given scale types can be merged together.
 */
export function scaleCompatible(scaleType1: ScaleType, scaleType2: ScaleType) {
  const scaleCategory1 = SCALE_CATEGORY_INDEX[scaleType1];
  const scaleCategory2 = SCALE_CATEGORY_INDEX[scaleType2];
  return scaleCategory1 === scaleCategory2 ||
    (scaleCategory1 === 'ordinal-position' && scaleCategory2 === 'time') ||
    (scaleCategory2 === 'ordinal-position' && scaleCategory1 === 'time');
}

/**
 * Index for scale predecence -- high score = higher priority for merging.
 */
const SCALE_PRECEDENCE_INDEX: {
  // Using Mapped Type to declare type (https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types)
  [k in ScaleType]: number
} = {
  // numeric
  linear: 0,
  log: 1,
  pow: 1,
  sqrt: 1,
  // time
  time: 0,
  utc: 0,
  // ordinal-position -- these have higher precedence than continuous scales as they support more types of data
  point: 10,
  band: 11, // band has higher precedence as it is better for interaction
  // non grouped types
  'bin-linear': 0,
  sequential: 0,
  ordinal: 0,
  'bin-ordinal': 0,
};

/**
 * Return scale categories -- only scale of the same categories can be merged together.
 */
export function scaleTypePrecedence(scaleType: ScaleType): number {
  return SCALE_PRECEDENCE_INDEX[scaleType];
}

export const CONTINUOUS_TO_CONTINUOUS_SCALES: ScaleType[] = ['linear', 'bin-linear', 'log', 'pow', 'sqrt', 'time', 'utc'];
const CONTINUOUS_TO_CONTINUOUS_INDEX = toSet(CONTINUOUS_TO_CONTINUOUS_SCALES);

export const CONTINUOUS_DOMAIN_SCALES: ScaleType[] = CONTINUOUS_TO_CONTINUOUS_SCALES.concat(['sequential' /* TODO add 'quantile', 'quantize', 'threshold'*/]);
const CONTINUOUS_DOMAIN_INDEX = toSet(CONTINUOUS_DOMAIN_SCALES);

export const DISCRETE_DOMAIN_SCALES: ScaleType[] = ['ordinal', 'bin-ordinal', 'point', 'band'];
const DISCRETE_DOMAIN_INDEX = toSet(DISCRETE_DOMAIN_SCALES);

const BIN_SCALES_INDEX = toSet(['bin-linear', 'bin-ordinal']);

export const TIME_SCALE_TYPES: ScaleType[] = ['time', 'utc'];

export function hasDiscreteDomain(type: ScaleType): type is 'ordinal' | 'bin-ordinal' | 'point' | 'band' {
  return type in DISCRETE_DOMAIN_INDEX;
}

export function isBinScale(type: ScaleType): type is 'bin-linear' | 'bin-ordinal' {
  return type in BIN_SCALES_INDEX;
}

export function hasContinuousDomain(type: ScaleType):
  type is 'linear' | 'log' | 'pow' | 'sqrt' | 'time' | 'utc'|
          'sequential' /* TODO add | 'quantile' | 'quantize' | 'threshold' */ {
  return type in CONTINUOUS_DOMAIN_INDEX;
}

export function isContinuousToContinuous(type: ScaleType): type is 'linear' | 'bin-linear' | 'log' | 'pow' | 'sqrt' | 'time' | 'utc' {
  return type in CONTINUOUS_TO_CONTINUOUS_INDEX;
}

export type NiceTime = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface ScaleConfig {
  /**
   * If true, rounds numeric output values to integers.
   * This can be helpful for snapping to the pixel grid.
   * (Only available for `x`, `y`, and `size` scales.)
   */
  round?: boolean;

  /**
   * If true, values that exceed the data domain are clamped to either the minimum or maximum range value
   */
  clamp?: boolean;
  /**
   *  Default range step for `x` band and point scales of text marks.
   *
   * __Default value:__ `90`
   *
   *  @minimum 0
   */
  textXRangeStep?: number; // FIXME: consider if we will rename this "tableColumnWidth"

  /**
   * Default range step for band and point scales of (1) the `y` channel
   * and (2) the `x` channel when the mark is not `text`.
   *
   * __Default value:__ `21`
   *
   * @minimum 0
   * @nullable
   */
  rangeStep?: number | null;

  /**
   * Default inner padding for `x` and `y` band-ordinal scales.
   *
   * __Default value:__ `0.1`
   *
   * @minimum 0
   * @maximum 1
   */
  bandPaddingInner?: number;

  /**
   * Default outer padding for `x` and `y` band-ordinal scales.
   * If not specified, by default, band scale's paddingOuter is paddingInner/2.
   * @minimum 0
   * @maximum 1
   */
  bandPaddingOuter?: number;

  /**
   * Default padding for continuous scales.
   *
   * __Default:__ `5` for continuous x-scale of a vertical bar and continuous y-scale of a horizontal bar.; `0` otherwise.
   *
   * @minimum 0
   */
  continuousPadding?: number;

  /**
   * Default outer padding for `x` and `y` point-ordinal scales.
   *
   * __Default value:__ `0.5`
   *
   * @minimum 0
   * @maximum 1
   */
  pointPadding?: number;

  /**
   * Use the source data range before aggregation as scale domain instead of aggregated data for aggregate axis.
   *
   * This is equivalent to setting `domain` to `"unaggregate"` for aggregated _quantitative_ fields by default.
   *
   * This property only works with aggregate functions that produce values within the raw data domain (`"mean"`, `"average"`, `"median"`, `"q1"`, `"q3"`, `"min"`, `"max"`). For other aggregations that produce values outside of the raw data domain (e.g. `"count"`, `"sum"`), this property is ignored.
   *
   * __Default value:__ `false`
   */
  useUnaggregatedDomain?: boolean;

  // nice should depends on type (quantitative or temporal), so
  // let's not make a config.

  // Configs for Range

  /**
   * The default max value for mapping quantitative fields to bar's size/bandSize.
   *
   * If undefined (default), we will use the scale's `rangeStep` - 1.
   * @minimum 0
   */
  maxBandSize?: number;

  /**
   * The default min value for mapping quantitative fields to bar and tick's size/bandSize scale with zero=false.
   *
   * __Default value:__ `2`
   *
   * @minimum 0
   */
  minBandSize?: number;

  /**
   * The default max value for mapping quantitative fields to text's size/fontSize.
   *
   * __Default value:__ `40`
   *
   * @minimum 0
   */
  maxFontSize?: number;

  /**
   * The default min value for mapping quantitative fields to tick's size/fontSize scale with zero=false
   *
   * __Default value:__ `8`
   *
   * @minimum 0
   */
  minFontSize?: number;

  /**
   * Default minimum opacity for mapping a field to opacity.
   *
   * __Default value:__ `0.3`
   *
   * @minimum 0
   * @maximum 1
   */
  minOpacity?: number;

  /**
   * Default max opacity for mapping a field to opacity.
   *
   * __Default value:__ `0.8`
   *
   * @minimum 0
   * @maximum 1
   */
  maxOpacity?: number;


  /**
   * Default minimum value for point size scale with zero=false.
   *
   * __Default value:__ `9`
   *
   * @minimum 0
   */
  minSize?: number;

  /**
   * Default max value for point size scale.
   * @minimum 0
   */
  maxSize?: number;

  /**
   * Default minimum strokeWidth for strokeWidth (or rule/line's size) scale with zero=false.
   *
   * __Default value:__ `1`
   *
   * @minimum 0
   */
  minStrokeWidth?: number;

  /**
   * Default max strokeWidth for strokeWidth  (or rule/line's size) scale.
   *
   * __Default value:__ `4`
   *
   * @minimum 0
   */
  maxStrokeWidth?: number;
}

export const defaultScaleConfig = {
  textXRangeStep: 90,
  rangeStep: 21,
  pointPadding: 0.5,
  bandPaddingInner: 0.1,
  facetSpacing: 16,

  minBandSize: 2,

  minFontSize: 8,
  maxFontSize: 40,

  minOpacity: 0.3,
  maxOpacity: 0.8,

  // FIXME: revise if these *can* become ratios of rangeStep
  minSize: 9, // Point size is area. For square point, 9 = 3 pixel ^ 2, not too small!

  minStrokeWidth: 1,
  maxStrokeWidth: 4
};

export interface SchemeParams {
  /**
   * A color scheme name for sequential/ordinal scales (e.g., `"category10"` or `"viridis"`).
   *
   * For the full list of supported scheme, please refer to the [Vega Scheme](https://vega.github.io/vega/docs/schemes/#reference) reference.
   */
  name: string;

  /**
   * For sequential and diverging schemes only, determines the extent of the color range to use. For example `[0.2, 1]` will rescale the color scheme such that color values in the range _[0, 0.2)_ are excluded from the scheme.
   */
  extent?: number[];

  /**
   * The number of colors to use in the scheme. This can be useful for scale types such as `"quantize"`, which use the length of the scale range to determine the number of discrete bins for the scale domain.
   *
   * @hide
   */
  count?: number;
}

export type SelectionDomain = {
  /**
   * The name of a selection.
   */
  selection: string,
  /**
   * The field name to extract selected values for, when a selection is [projected](project.html)
   * over multiple fields or encodings.
   */
  field?: string
} | {
  /**
   * The name of a selection.
   */
  selection: string,
  /**
   * The encoding channel to extract selected values for, when a selection is [projected](project.html)
   * over multiple fields or encodings.
   */
  encoding?: string
};

export type Domain = number[] | string[] | boolean[] | DateTime[] | 'unaggregated' | SelectionDomain;
export type Scheme = string | SchemeParams;

export type Range = number[] | string[] | string;

export function isExtendedScheme(scheme: string | SchemeParams): scheme is SchemeParams {
  return scheme && !!scheme['name'];
}

export function isSelectionDomain(domain: Domain): domain is SelectionDomain {
  return domain && domain['selection'];
}

export interface Scale {
  /**
   * The type of scale.  Vega-Lite supports the following categories of scale types:
   *
   * 1) [**Continuous Scales**](scale.html#continuous) -- mapping continuous domains to continuous output ranges ([`"linear"`](scale.html#linear), [`"pow"`](scale.html#pow), [`"sqrt"`](scale.html#sqrt), [`"log"`](scale.html#log), [`"time"`](scale.html#time), [`"utc"`](scale.html#utc), [`"sequential"`](scale.html#sequential)).
   *
   * 2) [**Discrete Scales**](scale.html#discrete) -- mapping discrete domains to discrete ([`"ordinal"`](scale.html#ordinal)) or continuous ([`"band"`](scale.html#band) and [`"point"`](scale.html#point)) output ranges.
   *
   * 3) [**Discretizing Scales**](scale.html#discretizing) -- mapping continuous domains to discrete output ranges ([`"bin-linear"`](scale.html#bin-linear) and [`"bin-ordinal"`](scale.html#bin-ordinal)).
   *
   * __Default value:__ please see the [scale type table](scale.html#type).
   */
  type?: ScaleType;

  /**
   * Customized domain values.
   *
   * For _quantitative_ fields, `domain` can take the form of a two-element array with minimum and maximum values.  [Piecewise scales](scale.html#piecewise) can be created by providing a `domain` with more than two entries.
   * If the input field is aggregated, `domain` can also be a string value `"unaggregated"`, indicating that the domain should include the raw data values prior to the aggregation.
   *
   * For _temporal_ fields, `domain` can be a two-element array minimum and maximum values, in the form of either timestamps or the [DateTime definition objects](types.html#datetime).
   *
   * For _ordinal_ and _nominal_ fields, `domain` can be an array that lists valid input values.
   *
   * The `selection` property can be used to [interactively determine](selection.html#scale-domains) the scale domain.
   */
  domain?: number[] | string[] | boolean[] | DateTime[] | 'unaggregated' | SelectionDomain;


  // Hide because we might not really need this.
  /**
   * If true, reverses the order of the scale range.
   * __Default value:__ `false`.
   *
   * @hide
   */
  reverse?: boolean;

  /**
   * The range of the scale. One of:
   *
   * - A string indicating a [pre-defined named scale range](scale.html#range-config) (e.g., example, `"symbol"`, or `"diverging"`).
   *
   * - For [continuous scales](scale.html#continuous), two-element array indicating  minimum and maximum values, or an array with more than two entries for specifying a [piecewise scale](scale.html#piecewise).
   *
   * - For [discrete](scale.html#discrete) and [discretizing](scale.html#discretizing) scales, an array of desired output values.
   *
   * __Notes:__
   *
   * 1) For [sequential](scale.html#sequential), [ordinal](scale.html#ordinal), and discretizing color scales, you can also specify a color [`scheme`](scale.html#scheme) instead of `range`.
   *
   * 2) Any directly specified `range` for `x` and `y` channels will be ignored. Range can be customized via the view's corresponding [size](size.html) (`width` and `height`) or via [range steps and paddings properties](#range-step) for [band](#band) and [point](#point) scales.
   */
  range?: number[] | string[] | string;

  // ordinal
  /**
   * The distance between the starts of adjacent bands or points in [band](scale.html#band) and [point](scale.html#point) scales.
   *
   * If `rangeStep` is `null` or if the view contains the scale's corresponding [size](size.html) (`width` for `x` scales and `height` for `y` scales), `rangeStep` will be automatically determined to fit the size of the view.
   *
   * __Default value:__  derived the [scale config](config.html#scale-config)'s `textXRangeStep` (`90` by default) for x-scales of `text` marks and `rangeStep` (`21` by default) for x-scales of other marks and y-scales.
   *
   * __Warning__: If `rangeStep` is `null` and the cardinality of the scale's domain is higher than `width` or `height`, the rangeStep might become less than one pixel and the mark might not appear correctly.
   *
   * @minimum 0
   * @nullable
   */
  rangeStep?: number | null;

  /**
   * A string indicating a color [scheme](scale.html#scheme) name (e.g., `"category10"` or `"viridis"`) or a [scheme parameter object](scale.html#scheme-params).
   *
   * Discrete color schemes may be used with [discrete](scale.html#discrete) or [discretizing](scale.html#discretizing) scales. Continuous color schemes are intended for use with [sequential](scales.html#sequential) scales.
   *
   * For the full list of supported scheme, please refer to the [Vega Scheme](https://vega.github.io/vega/docs/schemes/#reference) reference.
   */
  scheme?: string | SchemeParams;

  /**
   * If `true`, rounds numeric output values to integers. This can be helpful for snapping to the pixel grid.
   *
   * __Default value:__ `false`.
   */
  round?: boolean;

  /**
   * For _[continuous](scale.html#continuous)_ scales, expands the scale domain to accommodate the specified number of pixels on each of the scale range. The scale range must represent pixels for this parameter to function as intended. Padding adjustment is performed prior to all other adjustments, including the effects of the zero, nice, domainMin, and domainMax properties.
   *
   * For _[band](scale.html#band)_ scales, shortcut for setting `paddingInner` and `paddingOuter` to the same value.
   *
   * For _[point](scale.html#point)_ scales, alias for `paddingOuter`.
   *
   * __Default value:__ For _continuous_ scales, derived from the [scale config](scale.html#config)'s `continuousPadding`.
   * For _band and point_ scales, see `paddingInner` and `paddingOuter`.
   *
   * @minimum 0
   */
  padding?: number;

  /**
   * The inner padding (spacing) within each band step of band scales, as a fraction of the step size. This value must lie in the range [0,1].
   *
   * For point scale, this property is invalid as point scales do not have internal band widths (only step sizes between bands).
   *
   * __Default value:__ derived from the [scale config](scale.html#config)'s `bandPaddingInner`.
   *
   * @minimum 0
   * @maximum 1
   */
  paddingInner?: number;

  /**
   * The outer padding (spacing) at the ends of the range of band and point scales,
   * as a fraction of the step size. This value must lie in the range [0,1].
   *
   * __Default value:__ derived from the [scale config](scale.html#config)'s `bandPaddingOuter` for band scales and `pointPadding` for point scales.
   *
   * @minimum 0
   * @maximum 1
   */
  paddingOuter?: number;

  // typical
  /**
   * If `true`, values that exceed the data domain are clamped to either the minimum or maximum range value
   *
   * __Default value:__ derived from the [scale config](config.html#scale-config)'s `clamp` (`true` by default).
   */
  clamp?: boolean;

  /**
   * Extending the domain so that it starts and ends on nice round values. This method typically modifies the scale’s domain, and may only extend the bounds to the nearest round value. Nicing is useful if the domain is computed from data and may be irregular. For example, for a domain of _[0.201479…, 0.996679…]_, a nice domain might be _[0.2, 1.0]_.
   *
   * For quantitative scales such as linear, `nice` can be either a boolean flag or a number. If `nice` is a number, it will represent a desired tick count. This allows greater control over the step size used to extend the bounds, guaranteeing that the returned ticks will exactly cover the domain.
   *
   * For temporal fields with time and utc scales, the `nice` value can be a string indicating the desired time interval. Legal values are `"millisecond"`, `"second"`, `"minute"`, `"hour"`, `"day"`, `"week"`, `"month"`, and `"year"`. Alternatively, `time` and `utc` scales can accept an object-valued interval specifier of the form `{"interval": "month", "step": 3}`, which includes a desired number of interval steps. Here, the domain would snap to quarter (Jan, Apr, Jul, Oct) boundaries.
   *
   * __Default value:__ `true` for unbinned _quantitative_ fields; `false` otherwise.
   *
   */
  nice?: boolean | number | NiceTime | {interval: string, step: number};

  /**
   * The logarithm base of the `log` scale (default `10`).
   */
  base?: number;

  /**
   * The exponent of the `pow` scale.
   */
  exponent?: number;

  /**
   * If `true`, ensures that a zero baseline value is included in the scale domain.
   *
   * __Default value:__ `true` for x and y channels if the quantitative field is not binned and no custom `domain` is provided; `false` otherwise.
   *
   * __Note:__ Log, time, and utc scales do not support `zero`.
   */
  zero?: boolean;

  /**
   * The interpolation method for range values. By default, a general interpolator for numbers, dates, strings and colors (in RGB space) is used. For color ranges, this property allows interpolation in alternative color spaces. Legal values include `rgb`, `hsl`, `hsl-long`, `lab`, `hcl`, `hcl-long`, `cubehelix` and `cubehelix-long` ('-long' variants use longer paths in polar coordinate spaces). If object-valued, this property accepts an object with a string-valued _type_ property and an optional numeric _gamma_ property applicable to rgb and cubehelix interpolators. For more, see the [d3-interpolate documentation](https://github.com/d3/d3-interpolate).
   */
  interpolate?: Interpolate | InterpolateParams;
}

export type Interpolate = 'rgb'| 'lab' | 'hcl' | 'hsl' | 'hsl-long' | 'hcl-long' | 'cubehelix' | 'cubehelix-long';

export interface InterpolateParams {
  type: 'rgb' | 'cubehelix' | 'cubehelix-long';
  gamma?: number;
}

const SCALE_PROPERTY_INDEX: Flag<keyof Scale> = {
  type: 1,
  domain: 1,
  range: 1,
  rangeStep: 1,
  scheme: 1,
  // Other properties
  reverse: 1,
  round: 1,
  // quantitative / time
  clamp: 1,
  nice: 1,
  // quantitative
  base: 1,
  exponent: 1,
  interpolate: 1,
  zero: 1, // zero depends on domain
  // band/point
  padding: 1,
  paddingInner: 1,
  paddingOuter: 1
};

export const SCALE_PROPERTIES = flagKeys(SCALE_PROPERTY_INDEX);

const {type, domain, range, rangeStep, scheme, ...NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTY_INDEX} = SCALE_PROPERTY_INDEX;

export const NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES = flagKeys(NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTY_INDEX);

export function scaleTypeSupportProperty(scaleType: ScaleType, propName: keyof Scale) {
  switch (propName) {
    case 'type':
    case 'domain':
    case 'reverse':
    case 'range':
      return true;
    case 'scheme':
      return contains(['sequential', 'ordinal', 'bin-ordinal', 'quantile', 'quantize'], scaleType);
    case 'interpolate':
      // FIXME(https://github.com/vega/vega-lite/issues/2902) how about ordinal?
      return contains(['linear', 'bin-linear', 'pow', 'log', 'sqrt', 'utc', 'time'], scaleType);
    case 'round':
      return isContinuousToContinuous(scaleType) || scaleType === 'band' || scaleType === 'point';
    case 'padding':
      return isContinuousToContinuous(scaleType) || contains(['point', 'band'], scaleType);
    case 'paddingOuter':
    case 'rangeStep':
      return contains(['point', 'band'], scaleType);
    case 'paddingInner':
      return scaleType === 'band';
    case 'clamp':
      return isContinuousToContinuous(scaleType) || scaleType === 'sequential';
    case 'nice':
      return isContinuousToContinuous(scaleType) || scaleType === 'sequential' || scaleType as any === 'quantize';
    case 'exponent':
      return scaleType === 'pow';
    case 'base':
      return scaleType === 'log';
    case 'zero':
      return hasContinuousDomain(scaleType) && !contains([
        'log',  // log scale cannot have zero value
        'time', 'utc', // zero is not meaningful for time
        'bin-linear', // binning should not automatically add zero
        'threshold', // threshold requires custom domain so zero does not matter
        'quantile' // quantile depends on distribution so zero does not matter
      ], scaleType);
  }
  /* istanbul ignore next: should never reach here*/
  throw new Error(`Invalid scale property ${propName}.`);
}

/**
 * Returns undefined if the input channel supports the input scale property name
 */
export function channelScalePropertyIncompatability(channel: Channel, propName: keyof Scale): string {
  switch (propName) {
    case 'interpolate':
    case 'scheme':
      if (channel !== 'color') {
        return log.message.cannotUseScalePropertyWithNonColor(channel);
      }
      return undefined;
    case 'type':
    case 'domain':
    case 'range':
    case 'base':
    case 'exponent':
    case 'nice':
    case 'padding':
    case 'paddingInner':
    case 'paddingOuter':
    case 'rangeStep':
    case 'reverse':
    case 'round':
    case 'clamp':
    case 'zero':
      return undefined; // GOOD!
  }
  /* istanbul ignore next: it should never reach here */
  throw new Error(`Invalid scale property "${propName}".`);
}

export function channelSupportScaleType(channel: Channel, scaleType: ScaleType): boolean {
  switch (channel) {
    case Channel.X:
    case Channel.Y:
    case Channel.SIZE: // TODO: size and opacity can support ordinal with more modification
    case Channel.OPACITY:
      // Although it generally doesn't make sense to use band with size and opacity,
      // it can also work since we use band: 0.5 to get midpoint.
      return isContinuousToContinuous(scaleType) || contains(['band', 'point'], scaleType);
    case Channel.COLOR:
      return scaleType !== 'band';    // band does not make sense with color
    case Channel.SHAPE:
      return scaleType === 'ordinal'; // shape = lookup only
  }
  /* istanbul ignore next: it should never reach here */
  return false;
}
