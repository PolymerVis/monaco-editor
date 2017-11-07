import {isString} from 'vega-util';
import {SHARED_DOMAIN_OP_INDEX} from '../../aggregate';
import {binToString} from '../../bin';
import {isScaleChannel, ScaleChannel} from '../../channel';
import {MAIN, RAW} from '../../data';
import {DateTime, dateTimeExpr, isDateTime} from '../../datetime';
import {FieldDef} from '../../fielddef';
import * as log from '../../log';
import {Domain, hasDiscreteDomain, isBinScale, isSelectionDomain, ScaleConfig, ScaleType} from '../../scale';
import {isSortField, SortField} from '../../sort';
import * as util from '../../util';
import {
  isDataRefDomain,
  VgDataRef,
  VgDomain,
  VgFieldRefUnionDomain,
  VgNonUnionDomain,
  VgSortField,
  VgUnionSortField,
} from '../../vega.schema';
import {isDataRefUnionedDomain, isFieldRefUnionDomain} from '../../vega.schema';
import {binRequiresRange} from '../common';
import {FACET_SCALE_PREFIX} from '../data/optimize';
import {isFacetModel, isUnitModel, Model} from '../model';
import {SELECTION_DOMAIN} from '../selection/selection';
import {UnitModel} from '../unit';
import {ScaleComponent, ScaleComponentIndex} from './component';


export function parseScaleDomain(model: Model) {
  if (isUnitModel(model)) {
    parseUnitScaleDomain(model);
  } else {
    parseNonUnitScaleDomain(model);
  }
}

function parseUnitScaleDomain(model: UnitModel) {
  const scales = model.specifiedScales;
  const localScaleComponents: ScaleComponentIndex = model.component.scales;

  util.keys(localScaleComponents).forEach((channel: ScaleChannel) => {
    const specifiedScale = scales[channel];
    const specifiedDomain = specifiedScale ? specifiedScale.domain : undefined;

    const domains = parseDomainForChannel(model, channel);
    const localScaleCmpt = localScaleComponents[channel];
    localScaleCmpt.domains = domains;

    if (isSelectionDomain(specifiedDomain)) {
      // As scale parsing occurs before selection parsing, we use a temporary
      // signal here and append the scale.domain definition. This is replaced
      // with the correct domainRaw signal during scale assembly.
      // For more information, see isRawSelectionDomain in selection.ts.

      // FIXME: replace this with a special property in the scaleComponent
      localScaleCmpt.set('domainRaw', {
        signal: SELECTION_DOMAIN + JSON.stringify(specifiedDomain)
      }, true);
    }
  });
}

function parseNonUnitScaleDomain(model: Model) {
  for (const child of model.children) {
    parseScaleDomain(child);
  }

  const localScaleComponents: ScaleComponentIndex = model.component.scales;

  util.keys(localScaleComponents).forEach((channel: ScaleChannel) => {
    // FIXME: Arvind -- Please revise logic for merging selectionDomain / domainRaw

    let domains: VgNonUnionDomain[];

    for (const child of model.children) {
      const childComponent = child.component.scales[channel];
      if (childComponent) {
        if (domains === undefined) {
          domains = childComponent.domains;
        } else {
          domains = domains.concat(childComponent.domains);
        }
      }
    }

    if (isFacetModel(model)) {
      domains.forEach((domain) => {
        // Replace the scale domain with data output from a cloned subtree after the facet.
        if (isDataRefDomain(domain)) {
          // use data from cloned subtree (which is the same as data but with a prefix added once)
          domain.data = FACET_SCALE_PREFIX + domain.data.replace(FACET_SCALE_PREFIX, '');
        }
      });
    }

    localScaleComponents[channel].domains = domains;
  });
}


/**
 * Remove unaggregated domain if it is not applicable
 * Add unaggregated domain if domain is not specified and config.scale.useUnaggregatedDomain is true.
 */
function normalizeUnaggregatedDomain(domain: Domain, fieldDef: FieldDef<string>, scaleType: ScaleType, scaleConfig: ScaleConfig) {
  if (domain === 'unaggregated') {
    const {valid, reason} = canUseUnaggregatedDomain(fieldDef, scaleType);
    if(!valid) {
      log.warn(reason);
      return undefined;
    }
  } else if (domain === undefined && scaleConfig.useUnaggregatedDomain) {
    // Apply config if domain is not specified.
    const {valid} = canUseUnaggregatedDomain(fieldDef, scaleType);
    if (valid) {
      return 'unaggregated';
    }
  }

  return domain;
}

export function parseDomainForChannel(model: UnitModel, channel: ScaleChannel): VgNonUnionDomain[] {
  const scaleType = model.getScaleComponent(channel).get('type');

  const domain = normalizeUnaggregatedDomain(model.scaleDomain(channel), model.fieldDef(channel), scaleType, model.config.scale);
  if (domain !== model.scaleDomain(channel)) {
    model.specifiedScales[channel] = {
      ...model.specifiedScales[channel],
      domain
    };
  }

  // If channel is either X or Y then union them with X2 & Y2 if they exist
  if (channel === 'x' && model.channelHasField('x2')) {
    if (model.channelHasField('x')) {
      return parseSingleChannelDomain(scaleType, domain, model, 'x').concat(parseSingleChannelDomain(scaleType, domain, model, 'x2'));
    } else {
      return parseSingleChannelDomain(scaleType, domain, model, 'x2');
    }
  } else if (channel === 'y' && model.channelHasField('y2')) {
    if (model.channelHasField('y')) {
      return parseSingleChannelDomain(scaleType, domain, model, 'y').concat(parseSingleChannelDomain(scaleType, domain, model, 'y2'));
    } else {
      return parseSingleChannelDomain(scaleType, domain, model, 'y2');
    }
  }
  return parseSingleChannelDomain(scaleType, domain, model, channel);
}

function parseSingleChannelDomain(scaleType: ScaleType, domain: Domain, model: UnitModel, channel: ScaleChannel | 'x2' | 'y2'): VgNonUnionDomain[] {
  const fieldDef = model.fieldDef(channel);

  if (domain && domain !== 'unaggregated' && !isSelectionDomain(domain)) { // explicit value
    if (fieldDef.bin) {
      log.warn(log.message.conflictedDomain(channel));
    } else {
      if (isDateTime(domain[0])) {
        return (domain as DateTime[]).map((dt) => {
          return {signal: `{data: ${dateTimeExpr(dt, true)}}`};
        });
      }
      return [domain];
    }
  }

  const stack = model.stack;
  if (stack && channel === stack.fieldChannel) {
    if(stack.offset === 'normalize') {
      return [[0, 1]];
    }

    const data = model.requestDataName(MAIN);
    return [{
      data,
      field: model.field(channel, {suffix: 'start'})
    }, {
      data,
      field: model.field(channel, {suffix: 'end'})
    }];
  }

  const sort = isScaleChannel(channel) ? domainSort(model, channel, scaleType) : undefined;

  if (domain === 'unaggregated') {
    const data = model.requestDataName(MAIN);
    return [{
      data,
      field: model.field(channel, {aggregate: 'min'})
    }, {
      data,
      field: model.field(channel, {aggregate: 'max'})
    }];
  } else if (fieldDef.bin) { // bin
    if (isBinScale(scaleType)) {
      const signal = model.getName(`${binToString(fieldDef.bin)}_${fieldDef.field}_bins`);
      return [{signal: `sequence(${signal}.start, ${signal}.stop + ${signal}.step, ${signal}.step)`}];
    }

    if (hasDiscreteDomain(scaleType)) {
      // ordinal bin scale takes domain from bin_range, ordered by bin start
      // This is useful for both axis-based scale (x/y) and legend-based scale (other channels).
      return [{
        // If sort by aggregation of a specified sort field, we need to use RAW table,
        // so we can aggregate values for the scale independently from the main aggregation.
        data: util.isBoolean(sort) ? model.requestDataName(MAIN) : model.requestDataName(RAW),
        // Use range if we added it and the scale does not support computing a range as a signal.
        field: model.field(channel, binRequiresRange(fieldDef, channel) ? {binSuffix: 'range'} : {}),
        // we have to use a sort object if sort = true to make the sort correct by bin start
        sort: sort === true || !isSortField(sort) ? {
          field: model.field(channel, {}),
          op: 'min' // min or max doesn't matter since we sort by the start of the bin range
        } : sort
      }];
    } else { // continuous scales
      if (channel === 'x' || channel === 'y') {
        // X/Y position have to include start and end for non-ordinal scale
        const data = model.requestDataName(MAIN);
        return [{
          data,
          field: model.field(channel, {})
        }, {
          data,
          field: model.field(channel, {binSuffix: 'end'})
        }];
      } else {
        // TODO: use bin_mid
        return [{
          data: model.requestDataName(MAIN),
          field: model.field(channel, {})
        }];
      }
    }
  } else if (sort) {
    return [{
      // If sort by aggregation of a specified sort field, we need to use RAW table,
      // so we can aggregate values for the scale independently from the main aggregation.
      data: util.isBoolean(sort) ? model.requestDataName(MAIN) : model.requestDataName(RAW),
      field: model.field(channel),
      sort: sort
    }];
  } else {
    return [{
      data: model.requestDataName(MAIN),
      field: model.field(channel)
    }];
  }
}


export function domainSort(model: UnitModel, channel: ScaleChannel, scaleType: ScaleType): true | SortField<string> {
  if (!hasDiscreteDomain(scaleType)) {
    return undefined;
  }

  const sort = model.sort(channel);

  // Sorted based on an aggregate calculation over a specified sort field (only for ordinal scale)
  if (isSortField(sort)) {
    return sort;
  }

  if (sort === 'descending') {
    return {
      op: 'min',
      field: model.field(channel),
      order: 'descending'
    };
  }

  if (util.contains(['ascending', undefined /* default =ascending*/], sort)) {
    return true;
  }

  // sort === 'none'
  return undefined;
}



/**
 * Determine if a scale can use unaggregated domain.
 * @return {Boolean} Returns true if all of the following conditons applies:
 * 1. `scale.domain` is `unaggregated`
 * 2. Aggregation function is not `count` or `sum`
 * 3. The scale is quantitative or time scale.
 */
export function canUseUnaggregatedDomain(fieldDef: FieldDef<string>, scaleType: ScaleType): {valid: boolean, reason?: string} {
  if (!fieldDef.aggregate) {
    return {
      valid: false,
      reason: log.message.unaggregateDomainHasNoEffectForRawField(fieldDef)
    };
  }

  if (!SHARED_DOMAIN_OP_INDEX[fieldDef.aggregate]) {
    return {
      valid: false,
      reason: log.message.unaggregateDomainWithNonSharedDomainOp(fieldDef.aggregate)
    };
  }

  if (fieldDef.type === 'quantitative') {
    if (scaleType === 'log') {
      return {
        valid: false,
        reason: log.message.unaggregatedDomainWithLogScale(fieldDef)
      };
    }
  }

  return {valid: true};
}

/**
 * Converts an array of domains to a single Vega scale domain.
 */
export function mergeDomains(domains: VgNonUnionDomain[]): VgDomain {
  const uniqueDomains = util.unique(domains.map(domain => {
    // ignore sort property when computing the unique domains
    if (isDataRefDomain(domain)) {
      const {sort: _s, ...domainWithoutSort} = domain;
      return domainWithoutSort;
    }
    return domain;
  }), util.hash);

  const sorts: VgSortField[] = util.unique(domains.map(d => {
    if (isDataRefDomain(d)) {
      const s = d.sort;
      if (s !== undefined && !util.isBoolean(s)) {
        if (s.op === 'count') {
          // let's make sure that if op is count, we don't use a field
          delete s.field;
        }
        if (s.order === 'ascending') {
          // drop order: ascending as it is the default
          delete s.order;
        }
      }
      return s;
    }
    return undefined;
  }).filter(s => s !== undefined), util.hash);

  if (uniqueDomains.length === 1) {
    const domain = domains[0];
    if (isDataRefDomain(domain) && sorts.length > 0) {
      let sort = sorts[0];
      if (sorts.length > 1) {
        log.warn(log.message.MORE_THAN_ONE_SORT);
        sort = true;
      }
      return {
        ...domain,
        sort
      };
    }
    return domain;
  }

  // only keep simple sort properties that work with unioned domains
  const onlySimpleSorts = sorts.filter(s => {
    if (util.isBoolean(s)) {
      return true;
    }
    if (s.op === 'count') {
      return true;
    }
    log.warn(log.message.domainSortDropped(s));
    return false;
  }) as VgUnionSortField[];

  let sort: VgUnionSortField = true;

  if (onlySimpleSorts.length === 1) {
    sort = onlySimpleSorts[0];
  } else if (onlySimpleSorts.length > 1) {
    // ignore sort = false if we have another sort property
    const filteredSorts = onlySimpleSorts.filter(s => s !== false);

    if (filteredSorts.length > 1) {
      log.warn(log.message.MORE_THAN_ONE_SORT);
      sort = true;
    } else {
      sort = filteredSorts[0];
    }
  }

  const allData = util.unique(domains.map(d => {
    if (isDataRefDomain(d)) {
      return d.data;
    }
    return null;
  }), x => x);

  if (allData.length === 1 && allData[0] !== null) {
    // create a union domain of different fields with a single data source
    const domain: VgFieldRefUnionDomain = {
      data: allData[0],
      fields: uniqueDomains.map(d => (d as VgDataRef).field),
      sort
    };

    return domain;
  }

  return {fields: uniqueDomains, sort};
}

/**
 * Return a field if a scale single field.
 * Return `undefined` otherwise.
 *
 */
export function getFieldFromDomain(domain: VgDomain): string {
  if (isDataRefDomain(domain) && isString(domain.field)) {
    return domain.field;
  } else if (isDataRefUnionedDomain(domain)) {
    let field;
    for (const nonUnionDomain of domain.fields) {
      if (isDataRefDomain(nonUnionDomain) && isString(nonUnionDomain.field)) {
        if (!field) {
          field = nonUnionDomain.field;
        } else if (field !== nonUnionDomain.field) {
          log.warn('Detected faceted independent scales that union domain of multiple fields from different data sources.  We will use the first field.  The result view size may be incorrect.');
          return field;
        }
      }
    }
    log.warn('Detected faceted independent scales that union domain of identical fields from different source detected.  We will assume that this is the same field from a different fork of the same data source.  However, if this is not case, the result view size maybe incorrect.');
    return field;
  } else if (isFieldRefUnionDomain(domain) && isString) {
    log.warn('Detected faceted independent scales that union domain of multiple fields from the same data source.  We will use the first field.  The result view size may be incorrect.');
    const field = domain.fields[0];
    return isString(field) ? field : undefined;
  }

  return undefined;
}

export function assembleDomain(model: Model, channel: ScaleChannel) {
  const scaleComponent = model.component.scales[channel];
  const domains = scaleComponent.domains.map(domain => {
    // Correct references to data as the original domain's data was determined
    // in parseScale, which happens before parseData. Thus the original data
    // reference can be incorrect.

    if (isDataRefDomain(domain)) {
      domain.data = model.lookupDataSource(domain.data);
    }
    return domain;
  });

  // domains is an array that has to be merged into a single vega domain
  return mergeDomains(domains);
}
