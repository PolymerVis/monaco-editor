import {Axis} from '../axis';
import {Channel, NONPOSITION_SCALE_CHANNELS, SCALE_CHANNELS, ScaleChannel, SingleDefChannel, X, Y} from '../channel';
import {Config} from '../config';
import * as vlEncoding from '../encoding';
import {Encoding, normalizeEncoding} from '../encoding';
import {ChannelDef, FieldDef, getFieldDef, hasConditionalFieldDef, isFieldDef} from '../fielddef';
import {Legend} from '../legend';
import {isMarkDef, Mark, MarkDef} from '../mark';
import {Domain, Scale} from '../scale';
import {SelectionDef} from '../selection';
import {SortField, SortOrder} from '../sort';
import {LayoutSizeMixins, UnitSpec} from '../spec';
import {stack, StackProperties} from '../stack';
import {Dict, duplicate} from '../util';
import {VgData, VgEncodeEntry, VgLayout, VgSignal} from '../vega.schema';
import {AxisIndex} from './axis/component';
import {parseUnitAxis} from './axis/parse';
import {parseData} from './data/parse';
import {assembleLayoutSignals} from './layoutsize/assemble';
import {parseUnitLayoutSize} from './layoutsize/parse';
import {LegendIndex} from './legend/component';
import {initEncoding, normalizeMarkDef} from './mark/init';
import {parseMarkGroup} from './mark/mark';
import {isLayerModel, Model, ModelWithField} from './model';
import {RepeaterValue, replaceRepeaterInEncoding} from './repeater';
import {ScaleIndex} from './scale/component';
import {
  assembleTopLevelSignals,
  assembleUnitSelectionData,
  assembleUnitSelectionMarks,
  assembleUnitSelectionSignals,
  parseUnitSelection,
} from './selection/selection';


/**
 * Internal model of Vega-Lite specification for the compiler.
 */
export class UnitModel extends ModelWithField {
  public readonly type: 'unit' = 'unit';
  public readonly markDef: MarkDef;
  public readonly encoding: Encoding<string>;

  public readonly specifiedScales: ScaleIndex = {};

  public readonly stack: StackProperties;

  protected specifiedAxes: AxisIndex = {};

  protected specifiedLegends: LegendIndex = {};

  public readonly selection: Dict<SelectionDef> = {};
  public children: Model[] = [];

  constructor(spec: UnitSpec, parent: Model, parentGivenName: string,
    parentGivenSize: LayoutSizeMixins = {}, repeater: RepeaterValue, config: Config, public fit: boolean) {

    super(spec, parent, parentGivenName, config, undefined);
    this.initSize({
      ...parentGivenSize,
      ...(spec.width ? {width: spec.width} : {}),
      ...(spec.height ? {height: spec.height} : {})
    });
    const mark = isMarkDef(spec.mark) ? spec.mark.type : spec.mark;

    const encoding = this.encoding = normalizeEncoding(replaceRepeaterInEncoding(spec.encoding || {}, repeater), mark);

    this.markDef = normalizeMarkDef(spec.mark, encoding, config);

    // calculate stack properties
    this.stack = stack(mark, encoding, this.config.stack);
    this.specifiedScales = this.initScales(mark, encoding);

    // FIXME: this one seems out of place!
    this.encoding = initEncoding(this.markDef, encoding, this.stack, this.config);

    this.specifiedAxes = this.initAxes(encoding);
    this.specifiedLegends = this.initLegend(encoding);

    // Selections will be initialized upon parse.
    this.selection = spec.selection;
  }

  /**
   * Return specified Vega-lite scale domain for a particular channel
   * @param channel
   */
  public scaleDomain(channel: ScaleChannel): Domain {
    const scale = this.specifiedScales[channel];
    return scale ? scale.domain : undefined;
  }

  public sort(channel: Channel): SortField<string> | SortOrder {
    return (this.getMapping()[channel] || {}).sort;
  }

  public axis(channel: Channel): Axis {
    return this.specifiedAxes[channel];
  }

  public legend(channel: Channel): Legend {
    return this.specifiedLegends[channel];
  }

  private initScales(mark: Mark, encoding: Encoding<string>): ScaleIndex {
    return SCALE_CHANNELS.reduce((scales, channel) => {
      let fieldDef: FieldDef<string>;
      let specifiedScale: Scale;

      const channelDef = encoding[channel];

      if (isFieldDef(channelDef)) {
        fieldDef = channelDef;
        specifiedScale = channelDef.scale;
      } else if (hasConditionalFieldDef(channelDef)) {
        fieldDef = channelDef.condition;
        specifiedScale = channelDef.condition['scale'];
      } else if (channel === 'x') {
        fieldDef = getFieldDef(encoding.x2);
      } else if (channel === 'y') {
        fieldDef = getFieldDef(encoding.y2);
      }

      if (fieldDef) {
        scales[channel] = specifiedScale || {};
      }
      return scales;
    }, {} as ScaleIndex);
  }

  private initAxes(encoding: Encoding<string>): AxisIndex {
    return [X, Y].reduce(function(_axis, channel) {
      // Position Axis

      // TODO: handle ConditionFieldDef
      const channelDef = encoding[channel];
      if (isFieldDef(channelDef) ||
          (channel === X && isFieldDef(encoding.x2)) ||
          (channel === Y && isFieldDef(encoding.y2))) {

        const axisSpec = isFieldDef(channelDef) ? channelDef.axis : null;

        // We no longer support false in the schema, but we keep false here for backward compatability.
        if (axisSpec !== null && axisSpec !== false) {
          _axis[channel] = {
            ...axisSpec
          };
        }
      }
      return _axis;
    }, {});
  }

  private initLegend(encoding: Encoding<string>): LegendIndex {
    return NONPOSITION_SCALE_CHANNELS.reduce(function(_legend, channel) {
      const channelDef = encoding[channel];
      if (channelDef) {
        const legend = isFieldDef(channelDef) ? channelDef.legend :
          (hasConditionalFieldDef(channelDef)) ? channelDef.condition['legend'] : null;

        if (legend !== null && legend !== false) {
          _legend[channel] = {...legend};
        }
      }

      return _legend;
    }, {});
  }

  public parseData() {
    this.component.data = parseData(this);
  }

  public parseLayoutSize() {
    parseUnitLayoutSize(this);
  }

  public parseSelection() {
    this.component.selection = parseUnitSelection(this, this.selection);
  }

  public parseMarkGroup() {
    this.component.mark = parseMarkGroup(this);
  }

  public parseAxisAndHeader() {
    this.component.axes = parseUnitAxis(this);
  }

  public assembleSelectionTopLevelSignals(signals: any[]): VgSignal[] {
    return assembleTopLevelSignals(this, signals);
  }

  public assembleSelectionSignals(): VgSignal[] {
    return assembleUnitSelectionSignals(this, []);
  }

  public assembleSelectionData(data: VgData[]): VgData[] {
    return assembleUnitSelectionData(this, data);
  }

  public assembleLayout(): VgLayout {
    return null;
  }

  public assembleLayoutSignals(): VgSignal[] {
    return assembleLayoutSignals(this);
  }

  public assembleMarks() {
    let marks = this.component.mark || [];

    // If this unit is part of a layer, selections should augment
    // all in concert rather than each unit individually. This
    // ensures correct interleaving of clipping and brushed marks.
    if (!this.parent || !isLayerModel(this.parent)) {
      marks = assembleUnitSelectionMarks(this, marks);
    }

    return marks.map(this.correctDataNames);
  }

  public assembleLayoutSize(): VgEncodeEntry {
    return {
      width: this.getSizeSignalRef('width'),
      height: this.getSizeSignalRef('height')
    };
  }

  protected getMapping() {
    return this.encoding;
  }

  public toSpec(excludeConfig?: any, excludeData?: any) {
    const encoding = duplicate(this.encoding);
    let spec: any;

    spec = {
      mark: this.markDef,
      encoding: encoding
    };

    if (!excludeConfig) {
      spec.config = duplicate(this.config);
    }

    if (!excludeData) {
      spec.data = duplicate(this.data);
    }

    // remove defaults
    return spec;
  }

  public mark(): Mark {
    return this.markDef.type;
  }

  public channelHasField(channel: Channel) {
    return vlEncoding.channelHasField(this.encoding, channel);
  }

  public fieldDef(channel: SingleDefChannel): FieldDef<string> {
    const channelDef = this.encoding[channel] as ChannelDef<string>;
    return getFieldDef(channelDef);
  }
}
