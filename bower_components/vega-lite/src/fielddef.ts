// Declaration and utility for variants of a field definition object
import {AggregateOp, isAggregateOp, isCountingAggregateOp} from './aggregate';
import {Axis} from './axis';
import {autoMaxBins, BinParams, binToString} from './bin';
import {Channel, rangeType} from './channel';
import {CompositeAggregate} from './compositemark';
import {Config} from './config';
import {Legend} from './legend';
import * as log from './log';
import {LogicalOperand} from './logical';
import {Scale} from './scale';
import {SortField, SortOrder} from './sort';
import {StackOffset} from './stack';
import {getTimeUnitParts, normalizeTimeUnit, TimeUnit} from './timeunit';
import {getFullName, Type} from './type';
import {accessPath, isArray, isBoolean, isNumber, isString, titlecase} from './util';


/**
 * Definition object for a constant value of an encoding channel.
 */
export interface ValueDef {
  /**
   * A constant value in visual domain (e.g., `"red"` / "#0099ff" for color, values between `0` to `1` for opacity).
   */
  value: number | string | boolean;
}

/**
 * Generic type for conditional channelDef.
 * F defines the underlying FieldDef type.
 */
export type ChannelDefWithCondition<F extends FieldDef<any>> = FieldDefWithCondition<F> | ValueDefWithCondition<F>;


export type Conditional<T> = {
  /**
   * A [selection name](selection.html), or a series of [composed selections](selection.html#compose).
   */
  selection: LogicalOperand<string>;
} & T;

/**
 * A FieldDef with Condition<ValueDef>
 * {
 *   condition: {value: ...},
 *   field: ...,
 *   ...
 * }
 */
export type FieldDefWithCondition<F extends FieldDef<any>> = F & {
  /**
   * One or more value definition(s) with a selection predicate.
   *
   * __Note:__ A field definition's `condition` property can only contain [value definitions](encoding.html#value)
   * since Vega-Lite only allows at mosty  one encoded field per encoding channel.
   */
  condition?: Conditional<ValueDef> | Conditional<ValueDef>[];
};

/**
 * A ValueDef with Condition<ValueDef | FieldDef>
 * {
 *   condition: {field: ...} | {value: ...},
 *   value: ...,
 * }
 */
export interface ValueDefWithCondition<F extends FieldDef<any>> {
  /**
   * A field definition or one or more value definition(s) with a selection predicate.
   */
  condition?: Conditional<F> | Conditional<ValueDef> | Conditional<ValueDef>[];

  /**
   * A constant value in visual domain.
   */
  value?: number | string | boolean;
}

/**
 * Reference to a repeated value.
 */
export type RepeatRef = {
  repeat: 'row' | 'column'
};

export type Field = string | RepeatRef;

export function isRepeatRef(field: Field): field is RepeatRef {
  return field && !isString(field) && 'repeat' in field;
}

/** @hide */
export type HiddenCompositeAggregate = CompositeAggregate;

export type Aggregate = AggregateOp | HiddenCompositeAggregate;

export interface FieldDefBase<F> {

  /**
   * __Required.__ A string defining the name of the field from which to pull a data value
   * or an object defining iterated values from the [`repeat`](repeat.html) operator.
   *
   * __Note:__ `field` is not required if `aggregate` is `count`.
   */
  field?: F;

  // function

  /**
   * Time unit (e.g., `year`, `yearmonth`, `month`, `hours`) for a temporal field.
   * or [a temporal field that gets casted as ordinal](type.html#cast).
   *
   * __Default value:__ `undefined` (None)
   */
  timeUnit?: TimeUnit;

  /**
   * A flag for binning a `quantitative` field, or [an object defining binning parameters](bin.html#params).
   * If `true`, default [binning parameters](bin.html) will be applied.
   *
   * __Default value:__ `false`
   */
  bin?: boolean | BinParams;

  /**
   * Aggregation function for the field
   * (e.g., `mean`, `sum`, `median`, `min`, `max`, `count`).
   *
   * __Default value:__ `undefined` (None)
   *
   */
  aggregate?: Aggregate;
}

/**
 *  Definition object for a data field, its type and transformation of an encoding channel.
 */
export interface FieldDef<F> extends FieldDefBase<F> {
  /**
   * The encoded field's type of measurement (`"quantitative"`, `"temporal"`, `"ordinal"`, or `"nominal"`).
   */
  // * or an initial character of the type name (`"Q"`, `"T"`, `"O"`, `"N"`).
  // * This property is case-insensitive.
  type: Type;
}

export interface ScaleFieldDef<F> extends FieldDef<F> {
  /**
   * An object defining properties of the channel's scale, which is the function that transforms values in the data domain (numbers, dates, strings, etc) to visual values (pixels, colors, sizes) of the encoding channels.
   *
   * __Default value:__ If undefined, default [scale properties](scale.html) are applied.
   */
  scale?: Scale;

  /**
   * Sort order for the encoded field.
   * Supported `sort` values include `"ascending"`, `"descending"` and `null` (no sorting).
   * For fields with discrete domains, `sort` can also be a [sort field definition object](sort.html#sort-field).
   *
   * __Default value:__ `"ascending"`
   *
   * @nullable
   */
  sort?: SortOrder | SortField<F> | null;
}

export interface PositionFieldDef<F> extends ScaleFieldDef<F> {
  /**
   * An object defining properties of axis's gridlines, ticks and labels.
   * If `null`, the axis for the encoding channel will be removed.
   *
   * __Default value:__ If undefined, default [axis properties](axis.html) are applied.
   *
   * @nullable
   */
  axis?: Axis | null;

  /**
   * Type of stacking offset if the field should be stacked.
   * `stack` is only applicable for `x` and `y` channels with continuous domains.
   * For example, `stack` of `y` can be used to customize stacking for a vertical bar chart.
   *
   * `stack` can be one of the following values:
   * - `"zero"`: stacking with baseline offset at zero value of the scale (for creating typical stacked [bar](stack.html#bar) and [area](stack.html#area) chart).
   * - `"normalize"` - stacking with normalized domain (for creating [normalized stacked bar and area charts](stack.html#normalized). <br/>
   * -`"center"` - stacking with center baseline (for [streamgraph](stack.html#streamgraph)).
   * - `null` - No-stacking. This will produce layered [bar](stack.html#layered-bar-chart) and area chart.
   *
   * __Default value:__ `zero` for plots with all of the following conditions are true:
   * (1) the mark is `bar` or `area`;
   * (2) the stacked measure channel (x or y) has a linear scale;
   * (3) At least one of non-position channels mapped to an unaggregated field that is different from x and y.  Otherwise, `null` by default.
   */
  stack?: StackOffset | null;
}

/**
 * Field definition of a mark property, which can contain a legend.
 */
export interface MarkPropFieldDef<F> extends ScaleFieldDef<F> {
   /**
    * An object defining properties of the legend.
    * If `null`, the legend for the encoding channel will be removed.
    *
    * __Default value:__ If undefined, default [legend properties](legend.html) are applied.
    *
    * @nullable
    */
  legend?: Legend | null;
}

// Detail

// Order Path have no scale

export interface OrderFieldDef<F> extends FieldDef<F> {
  /**
   * The sort order. One of `"ascending"` (default) or `"descending"`.
   */
  sort?: SortOrder;
}

export interface TextFieldDef<F> extends FieldDef<F> {
  /**
   * The [formatting pattern](format.html) for a text field. If not defined, this will be determined automatically.
   */
  format?: string;
}

export type ChannelDef<F> = ChannelDefWithCondition<FieldDef<F>>;

export function isConditionalDef<F>(channelDef: ChannelDef<F>): channelDef is ChannelDefWithCondition<FieldDef<F>> {
  return !!channelDef && !!channelDef.condition;
}

/**
 * Return if a channelDef is a ConditionalValueDef with ConditionFieldDef
 */
export function hasConditionalFieldDef<F>(channelDef: ChannelDef<F>): channelDef is (ValueDef & {condition: Conditional<FieldDef<F>>}) {
  return !!channelDef && !!channelDef.condition && !isArray(channelDef.condition) && isFieldDef(channelDef.condition);
}

export function hasConditionalValueDef<F>(channelDef: ChannelDef<F>): channelDef is (ValueDef & {condition: Conditional<ValueDef> | Conditional<ValueDef>[]}) {
  return !!channelDef && !!channelDef.condition && (
    isArray(channelDef.condition) || isValueDef(channelDef.condition)
  );
}

export function isFieldDef<F>(channelDef: ChannelDef<F>): channelDef is FieldDef<F> | PositionFieldDef<F> | MarkPropFieldDef<F> | OrderFieldDef<F> | TextFieldDef<F> {
  return !!channelDef && (!!channelDef['field'] || channelDef['aggregate'] === 'count');
}

export function isStringFieldDef(fieldDef: ChannelDef<string|RepeatRef>): fieldDef is FieldDef<string> {
  return isFieldDef(fieldDef) && isString(fieldDef.field);
}

export function isValueDef<F>(channelDef: ChannelDef<F>): channelDef is ValueDef {
  return channelDef && 'value' in channelDef && channelDef['value'] !== undefined;
}

export function isScaleFieldDef(channelDef: ChannelDef<any>): channelDef is ScaleFieldDef<any> {
    return !!channelDef && (!!channelDef['scale'] || !!channelDef['sort']);
}

export interface FieldRefOption {
  /** exclude bin, aggregate, timeUnit */
  nofn?: boolean;
  /** Wrap the field with datum or parent (e.g., datum['...'] for Vega Expression */
  expr?: 'datum' | 'parent';
  /** prepend fn with custom function prefix */
  prefix?: string;
  /** append suffix to the field ref for bin (default='start') */
  binSuffix?: 'end' | 'range' | 'mid';
  /** append suffix to the field ref (general) */
  suffix?: string;
  /** Overrride which aggregate to use. Needed for unaggregated domain. */
  aggregate?: AggregateOp;
}

export function field(fieldDef: FieldDefBase<string>, opt: FieldRefOption = {}): string {
  let field = fieldDef.field;
  const prefix = opt.prefix;
  let suffix = opt.suffix;

  if (isCount(fieldDef)) {
    field = 'count_*';
  } else {
    let fn: string = undefined;

    if (!opt.nofn) {
      if (fieldDef.bin) {
        fn = binToString(fieldDef.bin);
        suffix = opt.binSuffix || '';
      } else if (fieldDef.aggregate) {
        fn = String(opt.aggregate || fieldDef.aggregate);
      } else if (fieldDef.timeUnit) {
        fn = String(fieldDef.timeUnit);
      }
    }

    if (fn) {
      field = `${fn}_${field}`;
    }
  }

  if (suffix) {
    field = `${field}_${suffix}`;
  }

  if (prefix) {
    field = `${prefix}_${field}`;
  }

  if (opt.expr) {
    field = `${opt.expr}${accessPath(field)}`;
  }

  return field;
}

export function isDiscrete(fieldDef: FieldDef<Field>) {
  switch (fieldDef.type) {
    case 'nominal':
    case 'ordinal':
      return true;
    case 'quantitative':
      return !!fieldDef.bin;
    case 'temporal':
      return false;
  }
  throw new Error(log.message.invalidFieldType(fieldDef.type));
}

export function isContinuous(fieldDef: FieldDef<Field>) {
  return !isDiscrete(fieldDef);
}

export function isCount(fieldDef: FieldDefBase<Field>) {
  return fieldDef.aggregate === 'count';
}

export type FieldTitleFormatter = (fieldDef: FieldDef<string>, config: Config) => string;

export function verbalTitleFormatter(fieldDef: FieldDef<string>, config: Config) {
  const {field, bin, timeUnit, aggregate} = fieldDef;
  if (aggregate === 'count') {
    return config.countTitle;
  } else if (bin) {
    return `${field} (binned)`;
  } else if (timeUnit) {
    const units = getTimeUnitParts(timeUnit).join('-');
    return `${field} (${units})`;
  } else if (aggregate) {
    return `${titlecase(aggregate)} of ${field}`;
  }
  return field;
}

export function functionalTitleFormatter(fieldDef: FieldDef<string>, config: Config) {
  const fn = fieldDef.aggregate || fieldDef.timeUnit || (fieldDef.bin && 'bin');
  if (fn) {
    return fn.toUpperCase() + '(' + fieldDef.field + ')';
  } else {
    return fieldDef.field;
  }
}

export const defaultTitleFormatter: FieldTitleFormatter = (fieldDef: FieldDef<string>, config: Config) => {
  switch (config.fieldTitle) {
    case 'plain':
      return fieldDef.field;
    case 'functional':
      return functionalTitleFormatter(fieldDef, config);
    default:
      return verbalTitleFormatter(fieldDef, config);
  }
};

let titleFormatter = defaultTitleFormatter;

export function setTitleFormatter(formatter: (fieldDef: FieldDef<string>, config: Config) => string) {
  titleFormatter = formatter;
}

export function resetTitleFormatter() {
  setTitleFormatter(defaultTitleFormatter);
}

export function title(fieldDef: FieldDef<string>, config: Config) {
  return titleFormatter(fieldDef, config);
}

export function defaultType(fieldDef: FieldDef<Field>, channel: Channel): Type {
  if (fieldDef.timeUnit) {
    return 'temporal';
  }
  if (fieldDef.bin) {
    return 'quantitative';
  }
  switch (rangeType(channel)) {
    case 'continuous':
      return 'quantitative';
    case 'discrete':
      return 'nominal';
    case 'flexible': // color
      return 'nominal';
    default:
      return 'quantitative';
  }
}

/**
 * Returns the fieldDef -- either from the outer channelDef or from the condition of channelDef.
 * @param channelDef
 */
export function getFieldDef<F>(channelDef: ChannelDef<F>): FieldDef<F> {
  if (isFieldDef(channelDef)) {
    return channelDef;
  } else if (hasConditionalFieldDef(channelDef)) {
    return channelDef.condition;
  }
  return undefined;
}

/**
 * Convert type to full, lowercase type, or augment the fieldDef with a default type if missing.
 */
export function normalize(channelDef: ChannelDef<string>, channel: Channel): ChannelDef<any> {
  if (isString(channelDef) || isNumber(channelDef) || isBoolean(channelDef)) {
    const primitiveType = isString(channelDef) ? 'string' :
      isNumber(channelDef) ? 'number' : 'boolean';
    log.warn(log.message.primitiveChannelDef(channel, primitiveType, channelDef));
    return {value: channelDef};
  }

  // If a fieldDef contains a field, we need type.
  if (isFieldDef(channelDef)) {
    return normalizeFieldDef(channelDef, channel);
  } else if (hasConditionalFieldDef(channelDef)) {
    return {
      ...channelDef,
      // Need to cast as normalizeFieldDef normally return FieldDef, but here we know that it is definitely Condition<FieldDef>
      condition: normalizeFieldDef(channelDef.condition, channel) as Conditional<FieldDef<string>>
    };
  }
  return channelDef;
}
export function normalizeFieldDef(fieldDef: FieldDef<string>, channel: Channel) {
  // Drop invalid aggregate
  if (fieldDef.aggregate && !isAggregateOp(fieldDef.aggregate)) {
    const {aggregate, ...fieldDefWithoutAggregate} = fieldDef;
    log.warn(log.message.invalidAggregate(fieldDef.aggregate));
    fieldDef = fieldDefWithoutAggregate;
  }

  // Normalize Time Unit
  if (fieldDef.timeUnit) {
    fieldDef = {
      ...fieldDef,
      timeUnit: normalizeTimeUnit(fieldDef.timeUnit)
    };
  }

  // Normalize bin
  if (fieldDef.bin) {
    fieldDef = {
      ...fieldDef,
      bin: normalizeBin(fieldDef.bin, channel)
    };
  }

  // Normalize Type
  if (fieldDef.type) {
    const fullType = getFullName(fieldDef.type);
    if (fieldDef.type !== fullType) {
      // convert short type to full type
      fieldDef = {
        ...fieldDef,
        type: fullType
      };
    }
    if (fieldDef.type !== 'quantitative') {
      if (isCountingAggregateOp(fieldDef.aggregate)) {
        log.warn(log.message.invalidFieldTypeForCountAggregate(fieldDef.type, fieldDef.aggregate));
        fieldDef = {
          ...fieldDef,
          type: 'quantitative'
        };
      }
    }
  } else {
    // If type is empty / invalid, then augment with default type
    const newType = defaultType(fieldDef, channel);
    log.warn(log.message.emptyOrInvalidFieldType(fieldDef.type, channel, newType));
    fieldDef = {
        ...fieldDef,
      type: newType
    };
  }

  const {compatible, warning} = channelCompatibility(fieldDef, channel);
  if (!compatible) {
    log.warn(warning);
  }
  return fieldDef;
}

export function normalizeBin(bin: BinParams|boolean, channel: Channel) {
  if (isBoolean(bin)) {
    return {maxbins: autoMaxBins(channel)};
  } else if (!bin.maxbins && !bin.step) {
    return {...bin, maxbins: autoMaxBins(channel)};
  } else {
    return bin;
  }
}

const COMPATIBLE = {compatible: true};
export function channelCompatibility(fieldDef: FieldDef<Field>, channel: Channel): {compatible: boolean; warning?: string;} {
  switch (channel) {
    case 'row':
    case 'column':
      if (isContinuous(fieldDef) && !fieldDef.timeUnit) {
        // TODO:(https://github.com/vega/vega-lite/issues/2011):
        // with timeUnit it's not always strictly continuous
        return {
          compatible: false,
          warning: log.message.facetChannelShouldBeDiscrete(channel)
        };
      }
      return COMPATIBLE;

    case 'x':
    case 'y':
    case 'color':
    case 'text':
    case 'detail':
    case 'tooltip':
      return COMPATIBLE;

    case 'opacity':
    case 'size':
    case 'x2':
    case 'y2':
      if (isDiscrete(fieldDef) && !fieldDef.bin) {
        return {
          compatible: false,
          warning: `Channel ${channel} should not be used with discrete field.`
        };
      }
      return COMPATIBLE;

    case 'shape':
      if (fieldDef.type !== 'nominal') {
        return {
          compatible: false,
          warning: 'Shape channel should be used with nominal data only'
        };
      }
      return COMPATIBLE;

    case 'order':
      if (fieldDef.type === 'nominal') {
        return {
          compatible: false,
          warning: `Channel order is inappropriate for nominal field, which has no inherent order.`
        };
      }
      return COMPATIBLE;
  }
  throw new Error('channelCompatability not implemented for channel ' + channel);
}

export function isNumberFieldDef(fieldDef: FieldDef<any>) {
  return fieldDef.type === 'quantitative' || !!fieldDef.bin;
}

export function isTimeFieldDef(fieldDef: FieldDef<any>) {
  return fieldDef.type === 'temporal' || !!fieldDef.timeUnit;
}
