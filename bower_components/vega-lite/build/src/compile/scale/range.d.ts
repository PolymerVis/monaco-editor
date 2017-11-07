import { Channel } from '../../channel';
import { Config } from '../../config';
import { Mark } from '../../mark';
import { Range, Scale, ScaleType, Scheme } from '../../scale';
import { Type } from '../../type';
import { VgRange } from '../../vega.schema';
import { Model } from '../model';
import { Explicit } from '../split';
export declare type RangeMixins = {
    range: Range;
} | {
    rangeStep: number;
} | {
    scheme: Scheme;
};
export declare const RANGE_PROPERTIES: (keyof Scale)[];
export declare function parseScaleRange(model: Model): void;
/**
 * Return mixins that includes one of the range properties (range, rangeStep, scheme).
 */
export declare function parseRangeForChannel(channel: Channel, scaleType: ScaleType, type: Type, specifiedScale: Scale, config: Config, zero: boolean, mark: Mark, sizeSpecified: boolean, sizeSignal: string, xyRangeSteps: number[]): Explicit<VgRange>;
export declare function defaultRange(channel: Channel, scaleType: ScaleType, type: Type, config: Config, zero: boolean, mark: Mark, sizeSignal: string, xyRangeSteps: number[], noRangeStep: boolean): VgRange;
