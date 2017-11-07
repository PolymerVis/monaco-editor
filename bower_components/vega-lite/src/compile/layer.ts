import {Config} from '../config';
import * as log from '../log';
import {isLayerSpec, isUnitSpec, LayerSpec, LayoutSizeMixins} from '../spec';
import {flatten, keys} from '../util';
import {VgData, VgLayout, VgLegend, VgSignal, VgTitle} from '../vega.schema';
import {parseLayerAxis} from './axis/parse';
import {parseData} from './data/parse';
import {assembleLayoutSignals} from './layoutsize/assemble';
import {parseLayerLayoutSize} from './layoutsize/parse';
import {assembleLegends} from './legend/assemble';
import {Model} from './model';
import {RepeaterValue} from './repeater';
import {assembleLayerSelectionMarks} from './selection/selection';
import {UnitModel} from './unit';


export class LayerModel extends Model {
  public readonly type: 'layer' = 'layer';

  // HACK: This should be (LayerModel | UnitModel)[], but setting the correct type leads to weird error.
  // So I'm just putting generic Model for now.
  public readonly children: Model[];



  constructor(spec: LayerSpec, parent: Model, parentGivenName: string,
    parentGivenSize: LayoutSizeMixins, repeater: RepeaterValue, config: Config, fit: boolean) {

    super(spec, parent, parentGivenName, config, spec.resolve);

    const layoutSize = {
      ...parentGivenSize,
      ...(spec.width ? {width: spec.width} : {}),
      ...(spec.height ? {height: spec.height} : {})
    };

    this.initSize(layoutSize);

    this.children = spec.layer.map((layer, i) => {
      if (isLayerSpec(layer)) {
        return new LayerModel(layer, this, this.getName('layer_'+i), layoutSize, repeater, config, fit);
      }

      if (isUnitSpec(layer)) {
        return new UnitModel(layer, this, this.getName('layer_'+i), layoutSize, repeater, config, fit);
      }

      throw new Error(log.message.INVALID_SPEC);
    });
  }

  public parseData() {
    this.component.data = parseData(this);
    for (const child of this.children) {
      child.parseData();
    }
  }

  public parseLayoutSize() {
    parseLayerLayoutSize(this);
  }

  public parseSelection() {
    // Merge selections up the hierarchy so that they may be referenced
    // across unit specs. Persist their definitions within each child
    // to assemble signals which remain within output Vega unit groups.
    this.component.selection = {};
    for (const child of this.children) {
      child.parseSelection();
      keys(child.component.selection).forEach((key) => {
        this.component.selection[key] = child.component.selection[key];
      });
    }
  }

  public parseMarkGroup() {
    for (const child of this.children) {
      child.parseMarkGroup();
    }
  }

  public parseAxisAndHeader() {
    parseLayerAxis(this);
  }

  public assembleSelectionTopLevelSignals(signals: any[]): VgSignal[] {
    return this.children.reduce((sg, child) => child.assembleSelectionTopLevelSignals(sg), signals);
  }

  // TODO: Support same named selections across children.
  public assembleSelectionSignals(): VgSignal[] {
    return this.children.reduce((signals, child) => {
      return signals.concat(child.assembleSelectionSignals());
    }, []);
  }


  public assembleLayoutSignals(): VgSignal[] {
    return this.children.reduce((signals, child) => {
      return signals.concat(child.assembleLayoutSignals());
    }, assembleLayoutSignals(this));
  }

  public assembleSelectionData(data: VgData[]): VgData[] {
    return this.children.reduce((db, child) => child.assembleSelectionData(db), []);
  }

  public assembleTitle(): VgTitle {
    let title = super.assembleTitle();
    if (title) {
      return title;
    }
    // If title does not provide layer, look into children
    for (const child of this.children) {
      title = child.assembleTitle();
      if (title) {
        return title;
      }
    }
    return undefined;
  }

  public assembleLayout(): VgLayout {
    return null;
  }

  public assembleMarks(): any[] {
    return assembleLayerSelectionMarks(this, flatten(this.children.map((child) => {
      return child.assembleMarks();
    })));
  }

  public assembleLegends(): VgLegend[] {
    return this.children.reduce((legends, child) => {
      return legends.concat(child.assembleLegends());
    }, assembleLegends(this));
  }
}
