import { Channel, ScaleChannel, SingleDefChannel } from '../channel';
import { Config } from '../config';
import { Data, DataSourceType } from '../data';
import { FieldDef, FieldRefOption } from '../fielddef';
import { Resolve } from '../resolve';
import { BaseSpec } from '../spec';
import { TitleParams } from '../title';
import { Transform } from '../transform';
import { Dict } from '../util';
import { VgAxis, VgData, VgEncodeEntry, VgLayout, VgLegend, VgMarkGroup, VgSignal, VgSignalRef, VgTitle } from '../vega.schema';
import { AxisComponentIndex } from './axis/component';
import { ConcatModel } from './concat';
import { DataComponent } from './data/index';
import { FacetModel } from './facet';
import { LayerModel } from './layer';
import { LayoutHeaderComponent } from './layout/header';
import { LayoutSizeComponent, LayoutSizeIndex } from './layoutsize/component';
import { LegendComponentIndex } from './legend/component';
import { RepeatModel } from './repeat';
import { ScaleComponent, ScaleComponentIndex } from './scale/component';
import { SelectionComponent } from './selection/selection';
import { UnitModel } from './unit';
/**
 * Composable Components that are intermediate results of the parsing phase of the
 * compilations.  The components represents parts of the specification in a form that
 * can be easily merged (during parsing for composite specs).
 * In addition, these components are easily transformed into Vega specifications
 * during the "assemble" phase, which is the last phase of the compilation step.
 */
export interface Component {
    data: DataComponent;
    layoutSize: LayoutSizeComponent;
    layoutHeaders: {
        row?: LayoutHeaderComponent;
        column?: LayoutHeaderComponent;
    };
    mark: VgMarkGroup[];
    scales: ScaleComponentIndex;
    selection: Dict<SelectionComponent>;
    /** Dictionary mapping channel to VgAxis definition */
    axes: AxisComponentIndex;
    /** Dictionary mapping channel to VgLegend definition */
    legends: LegendComponentIndex;
    resolve: Resolve;
}
export interface NameMapInterface {
    rename(oldname: string, newName: string): void;
    has(name: string): boolean;
    get(name: string): string;
}
export declare class NameMap implements NameMapInterface {
    private nameMap;
    constructor();
    rename(oldName: string, newName: string): void;
    has(name: string): boolean;
    get(name: string): string;
}
export declare function isUnitModel(model: Model): model is UnitModel;
export declare function isFacetModel(model: Model): model is FacetModel;
export declare function isRepeatModel(model: Model): model is RepeatModel;
export declare function isConcatModel(model: Model): model is ConcatModel;
export declare function isLayerModel(model: Model): model is LayerModel;
export declare abstract class Model {
    readonly abstract type: 'unit' | 'facet' | 'layer' | 'concat' | 'repeat';
    readonly parent: Model;
    readonly name: string;
    readonly title: TitleParams;
    readonly description: string;
    readonly data: Data;
    readonly transforms: Transform[];
    /** Name map for scales, which can be renamed by a model's parent. */
    protected scaleNameMap: NameMapInterface;
    /** Name map for size, which can be renamed by a model's parent. */
    protected layoutSizeNameMap: NameMapInterface;
    readonly config: Config;
    readonly component: Component;
    readonly abstract children: Model[];
    constructor(spec: BaseSpec, parent: Model, parentGivenName: string, config: Config, resolve: Resolve);
    readonly width: VgSignalRef;
    readonly height: VgSignalRef;
    protected initSize(size: LayoutSizeIndex): void;
    parse(): void;
    abstract parseData(): void;
    abstract parseSelection(): void;
    parseScale(): void;
    abstract parseLayoutSize(): void;
    /**
     * Rename top-level spec's size to be just width / height, ignoring model name.
     * This essentially merges the top-level spec's width/height signals with the width/height signals
     * to help us reduce redundant signals declaration.
     */
    private renameTopLevelLayoutSize();
    abstract parseMarkGroup(): void;
    abstract parseAxisAndHeader(): void;
    parseLegend(): void;
    abstract assembleSelectionTopLevelSignals(signals: any[]): any[];
    abstract assembleSelectionSignals(): any[];
    abstract assembleSelectionData(data: VgData[]): VgData[];
    assembleGroupStyle(): string;
    assembleLayoutSize(): VgEncodeEntry;
    abstract assembleLayout(): VgLayout;
    abstract assembleLayoutSignals(): VgSignal[];
    assembleHeaderMarks(): VgMarkGroup[];
    abstract assembleMarks(): VgMarkGroup[];
    assembleAxes(): VgAxis[];
    assembleLegends(): VgLegend[];
    assembleTitle(): VgTitle;
    /**
     * Assemble the mark group for this model.  We accept optional `signals` so that we can include concat top-level signals with the top-level model's local signals.
     */
    assembleGroup(signals?: VgSignal[]): any;
    hasDescendantWithFieldOnChannel(channel: Channel): boolean;
    getName(text: string): string;
    /**
     * Request a data source name for the given data source type and mark that data source as required. This method should be called in parse, so that all used data source can be correctly instantiated in assembleData().
     */
    requestDataName(name: DataSourceType): string;
    getSizeSignalRef(sizeType: 'width' | 'height'): VgSignalRef;
    /**
     * Lookup the name of the datasource for an output node. You probably want to call this in assemble.
     */
    lookupDataSource(name: string): string;
    getSizeName(oldSizeName: string): string;
    renameLayoutSize(oldName: string, newName: string): void;
    renameScale(oldName: string, newName: string): void;
    /**
     * @return scale name for a given channel after the scale has been parsed and named.
     */
    scaleName(originalScaleName: Channel | string, parse?: boolean): string;
    /**
     * Corrects the data references in marks after assemble.
     */
    correctDataNames: (mark: any) => any;
    /**
     * Traverse a model's hierarchy to get the scale component for a particular channel.
     */
    getScaleComponent(channel: ScaleChannel): ScaleComponent;
    /**
     * Traverse a model's hierarchy to get a particular selection component.
     */
    getSelectionComponent(varName: string, origName: string): SelectionComponent;
}
/** Abstract class for UnitModel and FacetModel.  Both of which can contain fieldDefs as a part of its own specification. */
export declare abstract class ModelWithField extends Model {
    abstract fieldDef(channel: SingleDefChannel): FieldDef<string>;
    /** Get "field" reference for vega */
    field(channel: SingleDefChannel, opt?: FieldRefOption): string;
    protected abstract getMapping(): {
        [key: string]: any;
    };
    reduceFieldDef<T, U>(f: (acc: U, fd: FieldDef<string>, c: Channel) => U, init: T, t?: any): any;
    forEachFieldDef(f: (fd: FieldDef<string>, c: Channel) => void, t?: any): void;
    abstract channelHasField(channel: Channel): boolean;
}
