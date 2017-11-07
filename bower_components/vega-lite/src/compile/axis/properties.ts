import {Axis} from '../../axis';
import {binToString} from '../../bin';
import {PositionScaleChannel, X, Y} from '../../channel';
import {Config} from '../../config';
import {DateTime, dateTimeExpr, isDateTime} from '../../datetime';
import {FieldDef, title as fieldDefTitle} from '../../fielddef';
import * as log from '../../log';
import {hasDiscreteDomain, ScaleType} from '../../scale';
import {QUANTITATIVE} from '../../type';
import {contains, truncate} from '../../util';
import {VgSignalRef} from '../../vega.schema';
import {UnitModel} from '../unit';


export function domainAndTicks(property: 'domain' | 'ticks', specifiedAxis: Axis, isGridAxis: boolean, channel: PositionScaleChannel) {
  if (isGridAxis) {
    return false;
  }
  return specifiedAxis[property];
}

export const domain = domainAndTicks;
export const ticks = domainAndTicks;

// TODO: we need to refactor this method after we take care of config refactoring
/**
 * Default rules for whether to show a grid should be shown for a channel.
 * If `grid` is unspecified, the default value is `true` for ordinal scales that are not binned
 */
export function grid(scaleType: ScaleType, fieldDef: FieldDef<string>) {
  return !hasDiscreteDomain(scaleType) && !fieldDef.bin;
}

export function gridScale(model: UnitModel, channel: PositionScaleChannel, isGridAxis: boolean) {
  if (isGridAxis) {
    const gridChannel: PositionScaleChannel = channel === 'x' ? 'y' : 'x';
    if (model.getScaleComponent(gridChannel)) {
      return model.scaleName(gridChannel);
    }
  }
  return undefined;
}

export function labelFlush(fieldDef: FieldDef<string>, channel: PositionScaleChannel, specifiedAxis: Axis, isGridAxis: boolean) {
  if (isGridAxis) {
    return undefined;
  }

  if (specifiedAxis.labelFlush !== undefined) {
    return specifiedAxis.labelFlush;
  }
  if (channel === 'x' && contains(['quantitative', 'temporal'], fieldDef.type)) {
    return true;
  }
  return undefined;
}

export function labelOverlap(fieldDef: FieldDef<string>, specifiedAxis: Axis, channel: PositionScaleChannel, scaleType: ScaleType) {
  if (specifiedAxis.labelOverlap !== undefined) {
    return specifiedAxis.labelOverlap;
  }

  // do not prevent overlap for nominal data because there is no way to infer what the missing labels are
  if (fieldDef.type !== 'nominal') {
    if (scaleType === 'log') {
      return 'greedy';
    }
    return true;
  }

  return undefined;
}

export function minMaxExtent(specifiedExtent: number, isGridAxis: boolean) {
  if (isGridAxis) {
    // Always return 0 to make sure that `config.axis*.minExtent` and `config.axis*.maxExtent`
    // would not affect gridAxis
    return 0;
  } else {
    return specifiedExtent;
  }
}

export function orient(channel: PositionScaleChannel) {
  switch (channel) {
    case X:
      return 'bottom';
    case Y:
      return 'left';
  }
  /* istanbul ignore next: This should never happen. */
  throw new Error(log.message.INVALID_CHANNEL_FOR_AXIS);
}

export function tickCount(channel: PositionScaleChannel, fieldDef: FieldDef<string>, scaleType: ScaleType, size: VgSignalRef) {
  if (!hasDiscreteDomain(scaleType) && scaleType !== 'log' && !contains(['month', 'hours', 'day', 'quarter'], fieldDef.timeUnit)) {

    if (fieldDef.bin) {
      // for binned data, we don't want more ticks than maxbins
      return {signal: `ceil(${size.signal}/20)`};
    }
    return {signal: `ceil(${size.signal}/40)`};
  }

  return undefined;
}

export function title(maxLength: number, fieldDef: FieldDef<string>, config: Config) {
  // if not defined, automatically determine axis title from field def
  const fieldTitle = fieldDefTitle(fieldDef, config);
  return maxLength ? truncate(fieldTitle, maxLength) : fieldTitle;
}

export function values(specifiedAxis: Axis, model: UnitModel, fieldDef: FieldDef<string>) {
  const vals = specifiedAxis.values;
  if (specifiedAxis.values && isDateTime(vals[0])) {
    return (vals as DateTime[]).map((dt) => {
      // normalize = true as end user won't put 0 = January
      return {signal: dateTimeExpr(dt, true)};
    });
  }

  if (!vals && fieldDef.bin && fieldDef.type === QUANTITATIVE) {
    const signal = model.getName(`${binToString(fieldDef.bin)}_${fieldDef.field}_bins`);
    return {signal: `sequence(${signal}.start, ${signal}.stop + ${signal}.step, ${signal}.step)`};
  }

  return vals;
}

export function zindex(isGridAxis: boolean) {
  if (isGridAxis) {
    // if grid is true, need to put layer on the back so that grid is behind marks
    return 0;
  }
  return 1; // otherwise return undefined and use Vega's default.
}
