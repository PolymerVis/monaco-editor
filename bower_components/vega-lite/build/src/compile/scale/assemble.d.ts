import { Channel } from '../../channel';
import { VgRange, VgScale } from '../../vega.schema';
import { Model } from '../model';
export declare function assembleScales(model: Model): VgScale[];
export declare function assembleScalesForModel(model: Model): VgScale[];
export declare function assembleScaleRange(scaleRange: VgRange, scaleName: string, model: Model, channel: Channel): VgRange;
