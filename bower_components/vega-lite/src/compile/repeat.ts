
import {Config} from '../config';
import * as log from '../log';
import {Repeat} from '../repeat';
import {RepeatSpec} from '../spec';
import {VgLayout} from '../vega.schema';
import {BaseConcatModel} from './baseconcat';
import {buildModel} from './buildmodel';
import {parseRepeatLayoutSize} from './layoutsize/parse';
import {Model} from './model';
import {RepeaterValue} from './repeater';

export class RepeatModel extends BaseConcatModel {
  public readonly type: 'repeat' = 'repeat';
  public readonly repeat: Repeat;

  public readonly children: Model[];

  constructor(spec: RepeatSpec, parent: Model, parentGivenName: string, repeatValues: RepeaterValue, config: Config) {
    super(spec, parent, parentGivenName, config, spec.resolve);

    if (spec.resolve && spec.resolve.axis && (spec.resolve.axis.x === 'shared' || spec.resolve.axis.y === 'shared')) {
      log.warn(log.message.REPEAT_CANNOT_SHARE_AXIS);
    }

    this.repeat = spec.repeat;
    this.children = this._initChildren(spec, this.repeat, repeatValues, config);
  }

  private _initChildren(spec: RepeatSpec, repeat: Repeat, repeater: RepeaterValue, config: Config): Model[] {
    const children: Model[] = [];
    const row = repeat.row || [repeater ? repeater.row : null];
    const column = repeat.column || [repeater ? repeater.column : null];

    // cross product
    for (const rowField of row) {
      for (const columnField of column) {
        const name = (rowField ? '_' + rowField : '') + (columnField ? '_' + columnField : '');

        const childRepeat = {
          row: rowField,
          column: columnField
        };

        children.push(buildModel(spec.spec, this, this.getName('child' + name), undefined, childRepeat, config, false));
      }
    }

    return children;
  }

  public parseLayoutSize() {
    parseRepeatLayoutSize(this);
  }

  public assembleLayout(): VgLayout {
    // TODO: allow customization
    return {
      padding: {row: 10, column: 10},
      offset: 10,
      columns: this.repeat && this.repeat.column ? this.repeat.column.length : 1,
      bounds: 'full',
      align: 'all'
    };
  }
}
