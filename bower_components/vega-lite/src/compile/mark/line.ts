import {UnitModel} from '../unit';
import {MarkCompiler} from './base';
import * as mixins from './mixins';
import * as ref from './valueref';


export const line: MarkCompiler = {
  vgMark: 'line',
  encodeEntry: (model: UnitModel) => {
    const {width, height} = model;

    return {
      ...mixins.markDefProperties(model.markDef, true),
      ...mixins.pointPosition('x', model, ref.mid(width)),
      ...mixins.pointPosition('y', model, ref.mid(height)),
      ...mixins.color(model),
      ...mixins.text(model, 'tooltip'),
      ...mixins.nonPosition('opacity', model),
      ...mixins.nonPosition('size', model, {
        vgChannel: 'strokeWidth'  // VL's line size is strokeWidth
      })
    };
  }
};
