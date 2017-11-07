/**
 * Vega-Lite's singleton logger utility.
 */

import {logger, LoggerInterface, Warn} from 'vega-util';
import {AggregateOp} from './aggregate';
import {Channel} from './channel';
import {CompositeMark} from './compositemark';
import {DateTime, DateTimeExpr} from './datetime';
import {FieldDef} from './fielddef';
import {Mark} from './mark';
import {ScaleType} from './scale';
import {Type} from './type';
import {VgSortField} from './vega.schema';


export {LoggerInterface} from 'vega-util';

/**
 * Main (default) Vega Logger instance for Vega-Lite
 */
const main = logger(Warn);
let current: LoggerInterface = main;

/**
 * Logger tool for checking if the code throws correct warning
 */
export class LocalLogger implements LoggerInterface {
  public warns: any[] = [];
  public infos: any[] = [];
  public debugs: any[] = [];

  public level() {
    return this;
  }

  public warn(...args: any[]) {
    this.warns.push(...args);
    return this;
  }

  public info(...args: any[]) {
    this.infos.push(...args);
    return this;
  }

  public debug(...args: any[]) {
    this.debugs.push(...args);
    return this;
  }
}

export function wrap(f: (logger: LocalLogger) => void) {
  return () => {
    const logger = current = new LocalLogger();
    f(logger);
    reset();
  };
}

/**
 * Set the singleton logger to be a custom logger
 */
export function set(logger: LoggerInterface) {
  current = logger;
  return current;
}

/**
 * Reset the main logger to use the default Vega Logger
 */
export function reset() {
  current = main;
  return current;
}

export function warn(..._: any[]) {
  current.warn.apply(current, arguments);
}

export function info(..._: any[]) {
  current.info.apply(current, arguments);
}

export function debug(..._: any[]) {
  current.debug.apply(current, arguments);
}

/**
 * Collection of all Vega-Lite Error Messages
 */
export namespace message {
  export const INVALID_SPEC = 'Invalid spec';

  // FIT
  export const FIT_NON_SINGLE = 'Autosize "fit" only works for single views and layered views.';

  export const CANNOT_FIX_RANGE_STEP_WITH_FIT = 'Cannot use a fixed value of "rangeStep" when "autosize" is "fit".';

  // SELECTION
  export function cannotProjectOnChannelWithoutField(channel: Channel) {
    return `Cannot project a selection on encoding channel "${channel}", which has no field.`;
  }

  export function nearestNotSupportForContinuous(mark: string) {
    return `The "nearest" transform is not supported for ${mark} marks.`;
  }

  export function selectionNotFound(name: string) {
    return `Cannot find a selection named "${name}"`;
  }

  export const SCALE_BINDINGS_CONTINUOUS = 'Scale bindings are currently only supported for scales with unbinned, continuous domains.';

  // REPEAT
  export function noSuchRepeatedValue(field: string) {
    return `Unknown repeated value "${field}".`;
  }

  // CONCAT
  export const CONCAT_CANNOT_SHARE_AXIS = 'Axes cannot be shared in concatenated views.';

  // REPEAT
  export const REPEAT_CANNOT_SHARE_AXIS = 'Axes cannot be shared in repeated views.';

  // TITLE
  export function cannotSetTitleAnchor(type: string) {
    return `Cannot set title "anchor" for a ${type} spec`;
  }

  // DATA
  export function unrecognizedParse(p: string) {
    return `Unrecognized parse "${p}".`;
  }

  export function differentParse(field: string, local: string, ancestor: string) {
    return `An ancestor parsed field "${field}" as ${ancestor} but a child wants to parse the field as ${local}.`;
  }

  // TRANSFORMS
  export function invalidTransformIgnored(transform: any) {
    return `Ignoring an invalid transform: ${JSON.stringify(transform)}.`;
  }

  export const NO_FIELDS_NEEDS_AS = 'If "from.fields" is not specified, "as" has to be a string that specifies the key to be used for the the data from the secondary source.';

  // ENCODING & FACET

  export function primitiveChannelDef(channel: Channel, type: 'string' | 'number' | 'boolean', value: string | number | boolean) {
    return `Channel ${channel} is a ${type}. Converted to {value: ${value}}.`;
  }

  export function invalidFieldType(type: Type) {
    return `Invalid field type "${type}"`;
  }

  export function invalidFieldTypeForCountAggregate(type: Type, aggregate: string) {
    return `Invalid field type "${type}" for aggregate: "${aggregate}", using "quantitative" instead.`;
  }

  export function invalidAggregate(aggregate: AggregateOp | string) {
    return `Invalid aggregation operator "${aggregate}"`;
  }

  export function emptyOrInvalidFieldType(type: Type | string, channel: Channel, newType: Type) {
    return `Invalid field type "${type}" for channel "${channel}", using "${newType}" instead.`;
  }

  export function emptyFieldDef(fieldDef: FieldDef<string>, channel: Channel) {
    return `Dropping ${JSON.stringify(fieldDef)} from channel "${channel}" since it does not contain data field or value.`;
  }

  export function incompatibleChannel(channel: Channel, markOrFacet: Mark | 'facet' | CompositeMark, when?: string) {
    return `${channel} dropped as it is incompatible with "${markOrFacet}"${when ? ` when ${when}` : ''}.`;
  }

  export function facetChannelShouldBeDiscrete(channel: string) {
    return `${channel} encoding should be discrete (ordinal / nominal / binned).`;
  }

  export function discreteChannelCannotEncode(channel: Channel, type: Type) {
    return `Using discrete channel "${channel}" to encode "${type}" field can be misleading as it does not encode ${type === 'ordinal' ? 'order' : 'magnitude'}.`;
  }

  // Mark
  export const BAR_WITH_POINT_SCALE_AND_RANGESTEP_NULL = 'Bar mark should not be used with point scale when rangeStep is null. Please use band scale instead.';

  export function unclearOrientContinuous(mark: Mark) {
    return `Cannot clearly determine orientation for "${mark}" since both x and y channel encode continous fields. In this case, we use vertical by default`;
  }

  export function unclearOrientDiscreteOrEmpty(mark: Mark) {
    return `Cannot clearly determine orientation for "${mark}" since both x and y channel encode discrete or empty fields.`;
  }

  export function orientOverridden(original: string, actual: string) {
    return `Specified orient "${original}" overridden with "${actual}"`;
  }

  // SCALE
  export const CANNOT_UNION_CUSTOM_DOMAIN_WITH_FIELD_DOMAIN = 'custom domain scale cannot be unioned with default field-based domain';

  export function cannotUseScalePropertyWithNonColor(prop: string) {
    return `Cannot use the scale property "${prop}" with non-color channel.`;
  }

  export function unaggregateDomainHasNoEffectForRawField(fieldDef: FieldDef<string>) {
    return `Using unaggregated domain with raw field has no effect (${JSON.stringify(fieldDef)}).`;
  }

  export function unaggregateDomainWithNonSharedDomainOp(aggregate: string) {
    return `Unaggregated domain not applicable for "${aggregate}" since it produces values outside the origin domain of the source data.`;
  }

  export function unaggregatedDomainWithLogScale(fieldDef: FieldDef<string>) {
    return `Unaggregated domain is currently unsupported for log scale (${JSON.stringify(fieldDef)}).`;
  }

  export function cannotUseSizeFieldWithBandSize(positionChannel: 'x'|'y') {
    return `Using size field when ${positionChannel}-channel has a band scale is not supported.`;
  }

  export function cannotApplySizeToNonOrientedMark(mark: Mark) {
    return `Cannot apply size to non-oriented mark "${mark}".`;
  }

  export function rangeStepDropped(channel: Channel) {
    return `rangeStep for "${channel}" is dropped as top-level ${
      channel === 'x' ? 'width' : 'height'} is provided.`;
  }

  export function scaleTypeNotWorkWithChannel(channel: Channel, scaleType: ScaleType, defaultScaleType: ScaleType) {
    return `Channel "${channel}" does not work with "${scaleType}" scale. We are using "${defaultScaleType}" scale instead.`;
  }

  export function scaleTypeNotWorkWithFieldDef(scaleType: ScaleType, defaultScaleType: ScaleType) {
    return `FieldDef does not work with "${scaleType}" scale. We are using "${defaultScaleType}" scale instead.`;
  }

  export function scalePropertyNotWorkWithScaleType(scaleType: ScaleType, propName: string, channel: Channel) {
    return `${channel}-scale's "${propName}" is dropped as it does not work with ${scaleType} scale.`;
  }

  export function scaleTypeNotWorkWithMark(mark: Mark, scaleType: ScaleType) {
    return `Scale type "${scaleType}" does not work with mark "${mark}".`;
  }

  export function mergeConflictingProperty<T>(property: string, propertyOf: string, v1: T, v2: T) {
    return `Conflicting ${propertyOf} property "${property}" ("${v1}" and "${v2}").  Using "${v1}".`;
  }

  export function independentScaleMeansIndependentGuide(channel: Channel) {
    return `Setting the scale to be independent for "${channel}" means we also have to set the guide (axis or legend) to be independent.`;
  }

  export function conflictedDomain(channel: Channel) {
    return `Cannot set ${channel}-scale's "domain" as it is binned. Please use "bin"'s "extent" instead.`;
  }

  export function domainSortDropped(sort: VgSortField) {
    return `Dropping sort property "${JSON.stringify(sort)}" as unioned domains only support boolean or op 'count'.`;
  }

  export const UNABLE_TO_MERGE_DOMAINS = 'Unable to merge domains';

  export const MORE_THAN_ONE_SORT = 'Domains that should be unioned has conflicting sort properties. Sort will be set to true.';

  // AXIS
  export const INVALID_CHANNEL_FOR_AXIS = 'Invalid channel for axis.';

  // STACK
  export function cannotStackRangedMark(channel: Channel) {
    return `Cannot stack "${channel}" if there is already "${channel}2"`;
  }

  export function cannotStackNonLinearScale(scaleType: ScaleType) {
    return `Cannot stack non-linear scale (${scaleType})`;
  }

  export function stackNonSummativeAggregate(aggregate: string) {
    return `Stacking is applied even though the aggregate function is non-summative ("${aggregate}")`;
  }

  // TIMEUNIT
  export function invalidTimeUnit(unitName: string, value: string | number) {
    return `Invalid ${unitName}: "${value}"`;
  }

  export function dayReplacedWithDate(fullTimeUnit: string) {
    return `Time unit "${fullTimeUnit}" is not supported. We are replacing it with ${
      fullTimeUnit.replace('day', 'date')}.`;
  }

  export function droppedDay(d: DateTime | DateTimeExpr) {
    return `Dropping day from datetime ${JSON.stringify(d)} as day cannot be combined with other units.`;
  }
}

