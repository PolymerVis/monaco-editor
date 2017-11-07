/*
 * Constants and utilities for encoding channels (Visual variables)
 * such as 'x', 'y', 'color'.
 */

import {RangeType} from './compile/scale/type';
import {Encoding} from './encoding';
import {FacetMapping} from './facet';
import {Mark} from './mark';
import {SCALE_TYPES, ScaleType} from './scale';
import {contains, Flag, flagKeys} from './util';

export namespace Channel {
  // Facet
  export const ROW: 'row' = 'row';
  export const COLUMN: 'column' = 'column';

  // Position
  export const X: 'x' = 'x';
  export const Y: 'y' = 'y';
  export const X2: 'x2' = 'x2';
  export const Y2: 'y2' = 'y2';

  // Mark property with scale
  export const COLOR: 'color' = 'color';
  export const SHAPE: 'shape' = 'shape';
  export const SIZE: 'size' = 'size';
  export const OPACITY: 'opacity' = 'opacity';

  // Non-scale channel
  export const TEXT: 'text' = 'text';
  export const ORDER: 'order' = 'order';
  export const DETAIL: 'detail' = 'detail';
  export const TOOLTIP: 'tooltip' = 'tooltip';
}

export type Channel = keyof Encoding<any> | keyof FacetMapping<any>;

export const X = Channel.X;
export const Y = Channel.Y;
export const X2 = Channel.X2;
export const Y2 = Channel.Y2;
export const ROW = Channel.ROW;
export const COLUMN = Channel.COLUMN;
export const SHAPE = Channel.SHAPE;
export const SIZE = Channel.SIZE;
export const COLOR = Channel.COLOR;
export const TEXT = Channel.TEXT;
export const DETAIL = Channel.DETAIL;
export const ORDER = Channel.ORDER;
export const OPACITY = Channel.OPACITY;
export const TOOLTIP = Channel.TOOLTIP;

const UNIT_CHANNEL_INDEX: Flag<keyof Encoding<any>> = {
  x: 1,
  y: 1,
  x2: 1,
  y2: 1,
  size: 1,
  shape: 1,
  color: 1,
  order: 1,
  opacity: 1,
  text: 1,
  detail: 1,
  tooltip: 1
};

const FACET_CHANNEL_INDEX: Flag<keyof FacetMapping<any>> = {
  row: 1,
  column: 1
};

const CHANNEL_INDEX = {
  ...UNIT_CHANNEL_INDEX,
  ...FACET_CHANNEL_INDEX
};

export const CHANNELS = flagKeys(CHANNEL_INDEX);

const {order: _o, detail: _d, ...SINGLE_DEF_CHANNEL_INDEX} = CHANNEL_INDEX;
/**
 * Channels that cannot have an array of channelDef.
 * model.fieldDef, getFieldDef only work for these channels.
 *
 * (The only two channels that can have an array of channelDefs are "detail" and "order".
 * Since there can be multiple fieldDefs for detail and order, getFieldDef/model.fieldDef
 * are not applicable for them.  Similarly, selection projecttion won't work with "detail" and "order".)
 */

export const SINGLE_DEF_CHANNELS: SingleDefChannel[] = flagKeys(SINGLE_DEF_CHANNEL_INDEX);

// Using the following line leads to TypeError: Cannot read property 'elementTypes' of undefined
// when running the schema generator
// export type SingleDefChannel = typeof SINGLE_DEF_CHANNELS[0];
export type SingleDefChannel = 'x' | 'y' | 'x2' | 'y2' | 'row' | 'column' | 'size' | 'shape' | 'color' | 'opacity' | 'text' | 'tooltip';



export function isChannel(str: string): str is Channel {
  return !!CHANNEL_INDEX[str];
}

// CHANNELS without COLUMN, ROW
export const UNIT_CHANNELS = flagKeys(UNIT_CHANNEL_INDEX);


// NONPOSITION_CHANNELS = UNIT_CHANNELS without X, Y, X2, Y2;
const {
  x: _x, y: _y,
  // x2 and y2 share the same scale as x and y
  x2: _x2, y2: _y2,
  // The rest of unit channels then have scale
  ...NONPOSITION_CHANNEL_INDEX
} = UNIT_CHANNEL_INDEX;

export const NONPOSITION_CHANNELS = flagKeys(NONPOSITION_CHANNEL_INDEX);
export type NonPositionChannel = typeof NONPOSITION_CHANNELS[0];

// POSITION_SCALE_CHANNELS = X and Y;
const POSITION_SCALE_CHANNEL_INDEX: {x:1, y:1} = {x:1, y:1};
export const POSITION_SCALE_CHANNELS = flagKeys(POSITION_SCALE_CHANNEL_INDEX);
export type PositionScaleChannel = typeof POSITION_SCALE_CHANNELS[0];

// NON_POSITION_SCALE_CHANNEL = SCALE_CHANNELS without X, Y
const {
    // x2 and y2 share the same scale as x and y
  // text and tooltip has format instead of scale
  text: _t, tooltip: _tt,
  // detail and order have no scale
  detail: _dd, order: _oo,
  ...NONPOSITION_SCALE_CHANNEL_INDEX
} = NONPOSITION_CHANNEL_INDEX;
export const NONPOSITION_SCALE_CHANNELS = flagKeys(NONPOSITION_SCALE_CHANNEL_INDEX);
export type NonPositionScaleChannel = typeof NONPOSITION_SCALE_CHANNELS[0];

// Declare SCALE_CHANNEL_INDEX
const SCALE_CHANNEL_INDEX = {
  ...POSITION_SCALE_CHANNEL_INDEX,
  ...NONPOSITION_SCALE_CHANNEL_INDEX
};

/** List of channels with scales */
export const SCALE_CHANNELS = flagKeys(SCALE_CHANNEL_INDEX);
export type ScaleChannel = typeof SCALE_CHANNELS[0];

export function isScaleChannel(channel: Channel): channel is ScaleChannel {
  return !!SCALE_CHANNEL_INDEX[channel];
}

export interface SupportedMark {
  point?: boolean;
  tick?: boolean;
  rule?: boolean;
  circle?: boolean;
  square?: boolean;
  bar?: boolean;
  rect?: boolean;
  line?: boolean;
  area?: boolean;
  text?: boolean;
  tooltip?: boolean;
}

/**
 * Return whether a channel supports a particular mark type.
 * @param channel  channel name
 * @param mark the mark type
 * @return whether the mark supports the channel
 */
export function supportMark(channel: Channel, mark: Mark) {
  return mark in getSupportedMark(channel);
}

/**
 * Return a dictionary showing whether a channel supports mark type.
 * @param channel
 * @return A dictionary mapping mark types to boolean values.
 */
export function getSupportedMark(channel: Channel): SupportedMark {
  switch (channel) {
    case X:
    case Y:
    case COLOR:
    case DETAIL:
    case TOOLTIP:
    case ORDER:    // TODO: revise (order might not support rect, which is not stackable?)
    case OPACITY:
    case ROW:
    case COLUMN:
      return { // all marks
        point: true, tick: true, rule: true, circle: true, square: true,
        bar: true, rect: true, line: true, area: true, text: true
      };
    case X2:
    case Y2:
      return {
        rule: true, bar: true, rect: true, area: true
      };
    case SIZE:
      return {
        point: true, tick: true, rule: true, circle: true, square: true,
        bar: true, text: true, line: true
      };
    case SHAPE:
      return {point: true};
    case TEXT:
      return {text: true};
  }
}

export function rangeType(channel: Channel): RangeType {
  switch (channel) {
    case X:
    case Y:
    case SIZE:
    case OPACITY:
    // X2 and Y2 use X and Y scales, so they similarly have continuous range.
    case X2:
    case Y2:
      return 'continuous';

    case ROW:
    case COLUMN:
    case SHAPE:
    // TEXT and TOOLTIP have no scale but have discrete output
    case TEXT:
    case TOOLTIP:
      return 'discrete';

    // Color can be either continuous or discrete, depending on scale type.
    case COLOR:
      return 'flexible';

    // No scale, no range type.
    case DETAIL:
    case ORDER:
      return undefined;
  }
  /* istanbul ignore next: should never reach here. */
  throw new Error('getSupportedRole not implemented for ' + channel);
}
