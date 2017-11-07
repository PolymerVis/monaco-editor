import { Channel } from './channel';
import { DateTime } from './datetime';
export declare namespace ScaleType {
    const LINEAR: 'linear';
    const BIN_LINEAR: 'bin-linear';
    const LOG: 'log';
    const POW: 'pow';
    const SQRT: 'sqrt';
    const TIME: 'time';
    const UTC: 'utc';
    const SEQUENTIAL: 'sequential';
    const QUANTILE: 'quantile';
    const QUANTIZE: 'quantize';
    const THRESHOLD: 'threshold';
    const ORDINAL: 'ordinal';
    const BIN_ORDINAL: 'bin-ordinal';
    const POINT: 'point';
    const BAND: 'band';
}
export declare type ScaleType = typeof ScaleType.LINEAR | typeof ScaleType.BIN_LINEAR | typeof ScaleType.LOG | typeof ScaleType.POW | typeof ScaleType.SQRT | typeof ScaleType.TIME | typeof ScaleType.UTC | typeof ScaleType.SEQUENTIAL | typeof ScaleType.ORDINAL | typeof ScaleType.BIN_ORDINAL | typeof ScaleType.POINT | typeof ScaleType.BAND;
export declare const SCALE_TYPES: ScaleType[];
/**
 * Whether the two given scale types can be merged together.
 */
export declare function scaleCompatible(scaleType1: ScaleType, scaleType2: ScaleType): boolean;
/**
 * Return scale categories -- only scale of the same categories can be merged together.
 */
export declare function scaleTypePrecedence(scaleType: ScaleType): number;
export declare const CONTINUOUS_TO_CONTINUOUS_SCALES: ScaleType[];
export declare const CONTINUOUS_DOMAIN_SCALES: ScaleType[];
export declare const DISCRETE_DOMAIN_SCALES: ScaleType[];
export declare const TIME_SCALE_TYPES: ScaleType[];
export declare function hasDiscreteDomain(type: ScaleType): type is 'ordinal' | 'bin-ordinal' | 'point' | 'band';
export declare function isBinScale(type: ScaleType): type is 'bin-linear' | 'bin-ordinal';
export declare function hasContinuousDomain(type: ScaleType): type is 'linear' | 'log' | 'pow' | 'sqrt' | 'time' | 'utc' | 'sequential';
export declare function isContinuousToContinuous(type: ScaleType): type is 'linear' | 'bin-linear' | 'log' | 'pow' | 'sqrt' | 'time' | 'utc';
export declare type NiceTime = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
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
    textXRangeStep?: number;
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
export declare const defaultScaleConfig: {
    textXRangeStep: number;
    rangeStep: number;
    pointPadding: number;
    bandPaddingInner: number;
    facetSpacing: number;
    minBandSize: number;
    minFontSize: number;
    maxFontSize: number;
    minOpacity: number;
    maxOpacity: number;
    minSize: number;
    minStrokeWidth: number;
    maxStrokeWidth: number;
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
export declare type SelectionDomain = {
    /**
     * The name of a selection.
     */
    selection: string;
    /**
     * The field name to extract selected values for, when a selection is [projected](project.html)
     * over multiple fields or encodings.
     */
    field?: string;
} | {
    /**
     * The name of a selection.
     */
    selection: string;
    /**
     * The encoding channel to extract selected values for, when a selection is [projected](project.html)
     * over multiple fields or encodings.
     */
    encoding?: string;
};
export declare type Domain = number[] | string[] | boolean[] | DateTime[] | 'unaggregated' | SelectionDomain;
export declare type Scheme = string | SchemeParams;
export declare type Range = number[] | string[] | string;
export declare function isExtendedScheme(scheme: string | SchemeParams): scheme is SchemeParams;
export declare function isSelectionDomain(domain: Domain): domain is SelectionDomain;
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
    nice?: boolean | number | NiceTime | {
        interval: string;
        step: number;
    };
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
export declare type Interpolate = 'rgb' | 'lab' | 'hcl' | 'hsl' | 'hsl-long' | 'hcl-long' | 'cubehelix' | 'cubehelix-long';
export interface InterpolateParams {
    type: 'rgb' | 'cubehelix' | 'cubehelix-long';
    gamma?: number;
}
export declare const SCALE_PROPERTIES: ("base" | "domain" | "type" | "range" | "clamp" | "exponent" | "interpolate" | "nice" | "padding" | "paddingInner" | "paddingOuter" | "reverse" | "round" | "zero" | "rangeStep" | "scheme")[];
export declare const NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES: ("base" | "clamp" | "exponent" | "interpolate" | "nice" | "padding" | "paddingInner" | "paddingOuter" | "reverse" | "round" | "zero")[];
export declare function scaleTypeSupportProperty(scaleType: ScaleType, propName: keyof Scale): boolean;
/**
 * Returns undefined if the input channel supports the input scale property name
 */
export declare function channelScalePropertyIncompatability(channel: Channel, propName: keyof Scale): string;
export declare function channelSupportScaleType(channel: Channel, scaleType: ScaleType): boolean;
