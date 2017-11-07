import {Anchor, TitleOrient, VgMarkConfig, VgTitleConfig} from './vega.schema';

export interface TitleBase {
  /**
   * The orientation of the title relative to the chart. One of `"top"` (the default), `"bottom"`, `"left"`, or `"right"`.
   */
  orient?: TitleOrient;

  /**
   * The anchor position for placing the title. One of `"start"`, `"middle"`, or `"end"`. For example, with an orientation of top these anchor positions map to a left-, center-, or right-aligned title.
   *
   * __Default value:__ `"middle"` for [single](spec.html) and [layered](layer.html) views.
   * `"start"` for other composite views.
   *
   * __Note:__ [For now](https://github.com/vega/vega-lite/issues/2875), `anchor` is only customizable only for [single](spec.html) and [layered](layer.html) views.  For other composite views, `anchor` is always `"start"`.
   */
  anchor?: Anchor;

  /**
   * The orthogonal offset in pixels by which to displace the title from its position along the edge of the chart.
   */
  offset?: number;

  /**
   * A [mark style property](config.html#style) to apply to the title text mark.
   *
   * __Default value:__ `"group-title"`.
   */
  style?: string | string[];

  // TODO: name, encode, interactive, zindex
}

export interface TitleParams extends TitleBase {
  /**
   * The title text.
   */
  text: string;
}

export function extractTitleConfig(titleConfig: VgTitleConfig): {
  mark: VgMarkConfig,
  nonMark: TitleBase
} {
  const {
    // These are non-mark title config that need to be hardcoded
    anchor, offset, orient,
    // color needs to be redirect to fill
    color,
    // The rest are mark config.
    ...titleMarkConfig
  } = titleConfig;

  const mark: VgMarkConfig = {
    ...titleMarkConfig,
    ...color ? {fill: color} : {}
  };

  const nonMark: TitleBase = {
    ...anchor ? {anchor} : {},
    ...offset ? {offset} : {},
    ...orient ? {orient} : {}
  };

  return {mark, nonMark};
}
