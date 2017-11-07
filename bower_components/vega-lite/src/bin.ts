import {Channel, COLOR, COLUMN, OPACITY, ROW, SHAPE, SIZE} from './channel';
import {isBoolean, keys} from './util';


export interface BaseBin {
  /**
   * The number base to use for automatic bin determination (default is base 10).
   *
   * __Default value:__ `10`
   *
   */
  base?: number;
  /**
   * An exact step size to use between bins.
   *
   * __Note:__ If provided, options such as maxbins will be ignored.
   */
  step?: number;
  /**
   * An array of allowable step sizes to choose from.
   * @minItems 1
   */
  steps?: number[];
  /**
   * A minimum allowable step size (particularly useful for integer values).
   */
  minstep?: number;
  /**
   * Scale factors indicating allowable subdivisions. The default value is [5, 2], which indicates that for base 10 numbers (the default base), the method may consider dividing bin sizes by 5 and/or 2. For example, for an initial step size of 10, the method can check if bin sizes of 2 (= 10/5), 5 (= 10/2), or 1 (= 10/(5*2)) might also satisfy the given constraints.
   *
   * __Default value:__ `[5, 2]`
   *
   * @minItems 1
   */
  divide?: number[];
  /**
   * Maximum number of bins.
   *
   * __Default value:__ `6` for `row`, `column` and `shape` channels; `10` for other channels
   *
   * @minimum 2
   */
  maxbins?: number;
  /**
   * If true (the default), attempts to make the bin boundaries use human-friendly boundaries, such as multiples of ten.
   */
  nice?: boolean;
}


/**
 * Binning properties or boolean flag for determining whether to bin data or not.
 */
export interface BinParams extends BaseBin {
  /**
   * A two-element (`[min, max]`) array indicating the range of desired bin values.
   * @minItems 2
   * @maxItems 2
   */
  extent?: number[];  // VgBinTransform uses a different extent so we need to pull this out.
}

export function binToString(bin: BinParams | boolean) {
  if (isBoolean(bin)) {
    return 'bin';
  }
  return 'bin' + keys(bin).map(p => `_${p}_${bin[p]}`.replace(',', '_')).join('');
}

export function autoMaxBins(channel: Channel): number {
  switch (channel) {
    case ROW:
    case COLUMN:
    case SIZE:
    case COLOR:
    case OPACITY:
      // Facets and Size shouldn't have too many bins
      // We choose 6 like shape to simplify the rule
    case SHAPE:
      return 6; // Vega's "shape" has 6 distinct values
    default:
      return 10;
  }
}
