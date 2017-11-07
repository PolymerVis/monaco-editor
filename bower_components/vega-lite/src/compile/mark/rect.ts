import {X, Y} from '../../channel';
import {isFieldDef} from '../../fielddef';
import * as log from '../../log';
import {RECT} from '../../mark';
import {hasDiscreteDomain, ScaleType} from '../../scale';
import {UnitModel} from '../unit';
import {MarkCompiler} from './base';
import * as mixins from './mixins';


export const rect: MarkCompiler = {
  vgMark: 'rect',
  encodeEntry: (model: UnitModel) => {
    return {
      ...mixins.markDefProperties(model.markDef, true),
      ...x(model),
      ...y(model),
      ...mixins.color(model),
      ...mixins.text(model, 'tooltip'),
      ...mixins.nonPosition('opacity', model),
    };
  }
};

function x(model: UnitModel) {
  const xDef = model.encoding.x;
  const x2Def = model.encoding.x2;
  const xScale = model.getScaleComponent(X);
  const xScaleType = xScale ? xScale.get('type') : undefined;

  if (isFieldDef(xDef) && xDef.bin && !x2Def) {
    return mixins.binnedPosition(xDef, 'x', model.scaleName('x'), 0, xScale.get('reverse'));
  } else if (isFieldDef(xDef) && xScale && hasDiscreteDomain(xScaleType)) {
    /* istanbul ignore else */
    if (xScaleType === ScaleType.BAND) {
      return mixins.bandPosition(xDef, 'x', model);
    } else {
      // We don't support rect mark with point/ordinal scale
      throw new Error(log.message.scaleTypeNotWorkWithMark(RECT, xScaleType));
    }
  } else { // continuous scale or no scale
    return {
      ...mixins.pointPosition('x', model, 'zeroOrMax'),
      ...mixins.pointPosition2(model, 'zeroOrMin', 'x2')
    };
  }
}

function y(model: UnitModel) {
  const yDef = model.encoding.y;
  const y2Def = model.encoding.y2;
  const yScale = model.getScaleComponent(Y);
  const yScaleType = yScale ? yScale.get('type') : undefined;

  if (isFieldDef(yDef) && yDef.bin && !y2Def) {
    return mixins.binnedPosition(yDef, 'y', model.scaleName('y'), 0, yScale.get('reverse'));
  } else if (isFieldDef(yDef) && yScale && hasDiscreteDomain(yScaleType)) {
    /* istanbul ignore else */
    if (yScaleType === ScaleType.BAND) {
      return mixins.bandPosition(yDef, 'y', model);
    } else {
      // We don't support rect mark with point/ordinal scale
      throw new Error(log.message.scaleTypeNotWorkWithMark(RECT, yScaleType));
    }
  } else { // continuous scale or no scale
    return {
      ...mixins.pointPosition('y', model, 'zeroOrMax'),
      ...mixins.pointPosition2(model, 'zeroOrMin', 'y2')
    };
  }
}
