import {Config} from '../config';
import * as log from '../log';
import {ConcatSpec, isVConcatSpec} from '../spec';
import {VgLayout} from '../vega.schema';
import {BaseConcatModel} from './baseconcat';
import {buildModel} from './buildmodel';
import {parseConcatLayoutSize} from './layoutsize/parse';
import {Model} from './model';
import {RepeaterValue} from './repeater';

export class ConcatModel extends BaseConcatModel {
  public readonly type: 'concat' = 'concat';

  public readonly children: Model[];

  public readonly isVConcat: boolean;

  constructor(spec: ConcatSpec, parent: Model, parentGivenName: string, repeater: RepeaterValue, config: Config) {
    super(spec, parent, parentGivenName, config, spec.resolve);

    if (spec.resolve && spec.resolve.axis && (spec.resolve.axis.x === 'shared' || spec.resolve.axis.y === 'shared')) {
      log.warn(log.message.CONCAT_CANNOT_SHARE_AXIS);
    }

    this.isVConcat = isVConcatSpec(spec);

    this.children = (isVConcatSpec(spec) ? spec.vconcat : spec.hconcat).map((child, i) => {
      return buildModel(child, this, this.getName('concat_' + i), undefined, repeater, config, false);
    });
  }

  public parseLayoutSize() {
    parseConcatLayoutSize(this);
  }


  public parseAxisGroup(): void {
    return null;
  }

  public assembleLayout(): VgLayout {
    // TODO: allow customization
    return {
      padding: {row: 10, column: 10},
      offset: 10,
      ...(this.isVConcat ? {columns: 1} : {}),
      bounds: 'full',
      // Use align each so it can work with multiple plots with different size
      align: 'each'
    };
  }
}
