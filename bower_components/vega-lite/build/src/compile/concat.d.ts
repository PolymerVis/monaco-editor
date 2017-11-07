import { Config } from '../config';
import { ConcatSpec } from '../spec';
import { VgLayout } from '../vega.schema';
import { BaseConcatModel } from './baseconcat';
import { Model } from './model';
import { RepeaterValue } from './repeater';
export declare class ConcatModel extends BaseConcatModel {
    readonly type: 'concat';
    readonly children: Model[];
    readonly isVConcat: boolean;
    constructor(spec: ConcatSpec, parent: Model, parentGivenName: string, repeater: RepeaterValue, config: Config);
    parseLayoutSize(): void;
    parseAxisGroup(): void;
    assembleLayout(): VgLayout;
}
