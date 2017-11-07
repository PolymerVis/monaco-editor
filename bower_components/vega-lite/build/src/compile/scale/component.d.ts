import { ScaleChannel } from '../../channel';
import { Scale, ScaleType } from '../../scale';
import { Omit } from '../../util';
import { VgNonUnionDomain, VgScale } from '../../vega.schema';
import { Explicit, Split } from '../split';
/**
 * All VgDomain property except domain.
 * (We exclude domain as we have a special "domains" array that allow us merge them all at once in assemble.)
 */
export declare type ScaleComponentProps = Partial<Omit<VgScale, 'domain'>>;
export declare class ScaleComponent extends Split<ScaleComponentProps> {
    merged: boolean;
    domains: VgNonUnionDomain[];
    constructor(name: string, typeWithExplicit: Explicit<ScaleType>);
}
export declare type ScaleComponentIndex = {
    [P in ScaleChannel]?: ScaleComponent;
};
export declare type ScaleIndex = {
    [P in ScaleChannel]?: Scale;
};
