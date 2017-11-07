import {SCALE_CHANNELS, ScaleChannel} from '../../channel';
import {FieldDef, getFieldDef, hasConditionalFieldDef, isFieldDef} from '../../fielddef';
import {
  NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES,
  Scale,
  scaleCompatible,
  ScaleType,
  scaleTypePrecedence,
} from '../../scale';
import {keys} from '../../util';
import {VgScale} from '../../vega.schema';
import {isUnitModel, Model} from '../model';
import {defaultScaleResolve} from '../resolve';
import {Explicit, mergeValuesWithExplicit, tieBreakByComparing} from '../split';
import {UnitModel} from '../unit';
import {ScaleComponent, ScaleComponentIndex} from './component';
import {parseScaleDomain} from './domain';
import {parseScaleProperty} from './properties';
import {parseScaleRange} from './range';
import {scaleType} from './type';

export function parseScale(model: Model) {
  parseScaleCore(model);
  parseScaleDomain(model);
  for (const prop of NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES) {
    parseScaleProperty(model, prop);
  }
  // range depends on zero
  parseScaleRange(model);
}

export function parseScaleCore(model: Model) {
  if (isUnitModel(model)) {
    model.component.scales = parseUnitScaleCore(model);
  } else {
    model.component.scales = parseNonUnitScaleCore(model);
  }
}

/**
 * Parse scales for all channels of a model.
 */
function parseUnitScaleCore(model: UnitModel): ScaleComponentIndex {
  const {encoding, config} = model;
  const mark = model.mark();

  return SCALE_CHANNELS.reduce((scaleComponents: ScaleComponentIndex, channel: ScaleChannel) => {
    let fieldDef: FieldDef<string>;
    let specifiedScale: Scale = {};

    const channelDef = encoding[channel];

    if (isFieldDef(channelDef)) {
      fieldDef = channelDef;
      specifiedScale = channelDef.scale || {};
    } else if (hasConditionalFieldDef(channelDef)) {
      fieldDef = channelDef.condition;
      specifiedScale = channelDef.condition['scale'] || {}; // We use ['scale'] since we know that channel here has scale for sure
    } else if (channel === 'x') {
      fieldDef = getFieldDef(encoding.x2);
    } else if (channel === 'y') {
      fieldDef = getFieldDef(encoding.y2);
    }

    if (fieldDef) {
      const specifiedScaleType = specifiedScale.type;
      const sType = scaleType(specifiedScale.type, channel, fieldDef, mark, config.scale);
      scaleComponents[channel] = new ScaleComponent(
        model.scaleName(channel + '', true),
        {value: sType, explicit: specifiedScaleType === sType}
      );
    }
    return scaleComponents;
  }, {});
}

const scaleTypeTieBreaker = tieBreakByComparing(
  (st1: ScaleType, st2: ScaleType) => (scaleTypePrecedence(st1) - scaleTypePrecedence(st2))
);


function parseNonUnitScaleCore(model: Model) {
  const scaleComponents: ScaleComponentIndex = model.component.scales = {};

  const scaleTypeWithExplicitIndex: {
    // Using Mapped Type to declare type (https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types)
    [k in ScaleChannel]?: Explicit<ScaleType>
  } = {};
  const resolve = model.component.resolve;

  // Parse each child scale and determine if a particular channel can be merged.
  for (const child of model.children) {
    parseScaleCore(child);

    // Instead of always merging right away -- check if it is compatible to merge first!
    keys(child.component.scales).forEach((channel: ScaleChannel) => {
      // if resolve is undefined, set default first
      resolve.scale[channel] = resolve.scale[channel] || defaultScaleResolve(channel, model);

      if (resolve.scale[channel] === 'shared') {
        const scaleType = scaleTypeWithExplicitIndex[channel];
        const childScaleType = child.component.scales[channel].getWithExplicit('type');

        if (scaleType) {
          if (scaleCompatible(scaleType.value, childScaleType.value)) {
            // merge scale component if type are compatible
            scaleTypeWithExplicitIndex[channel] = mergeValuesWithExplicit<VgScale, ScaleType>(
              scaleType, childScaleType, 'type', 'scale', scaleTypeTieBreaker
            );
          } else {
            // Otherwise, update conflicting channel to be independent
            resolve.scale[channel] = 'independent';
            // Remove from the index so they don't get merged
            delete scaleTypeWithExplicitIndex[channel];
          }
        } else {
          scaleTypeWithExplicitIndex[channel] = childScaleType;
        }
      }
    });
  }

  // Merge each channel listed in the index
  keys(scaleTypeWithExplicitIndex).forEach((channel: ScaleChannel) => {
    // Create new merged scale component
    const name = model.scaleName(channel, true);
    const typeWithExplicit = scaleTypeWithExplicitIndex[channel];
    scaleComponents[channel] = new ScaleComponent(name, typeWithExplicit);

    // rename each child and mark them as merged
    for (const child of model.children) {
      const childScale = child.component.scales[channel];
      if (childScale) {
        child.renameScale(childScale.get('name'), name);
        childScale.merged = true;
      }
    }
  });

  return scaleComponents;
}
