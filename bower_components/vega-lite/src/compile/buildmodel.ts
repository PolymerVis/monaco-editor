import {Config} from '../config';
import * as log from '../log';
import {isConcatSpec, isFacetSpec, isLayerSpec, isRepeatSpec, isUnitSpec, LayoutSizeMixins, Spec} from '../spec';
import {ConcatModel} from './concat';
import {FacetModel} from './facet';
import {LayerModel} from './layer';
import {Model} from './model';
import {RepeatModel} from './repeat';
import {RepeaterValue} from './repeater';
import {UnitModel} from './unit';

export function buildModel(spec: Spec, parent: Model, parentGivenName: string,
  unitSize: LayoutSizeMixins, repeater: RepeaterValue, config: Config, fit: boolean): Model {
  if (isFacetSpec(spec)) {
    return new FacetModel(spec, parent, parentGivenName, repeater, config);
  }

  if (isLayerSpec(spec)) {
    return new LayerModel(spec, parent, parentGivenName, unitSize, repeater, config, fit);
  }

  if (isUnitSpec(spec)) {
    return new UnitModel(spec, parent, parentGivenName, unitSize, repeater, config, fit);
  }

  if (isRepeatSpec(spec)) {
    return new RepeatModel(spec, parent, parentGivenName, repeater, config);
  }

  if (isConcatSpec(spec)) {
    return new ConcatModel(spec, parent, parentGivenName, repeater, config);
  }

  throw new Error(log.message.INVALID_SPEC);
}
