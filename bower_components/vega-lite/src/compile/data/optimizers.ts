import {hasIntersection, keys} from '../../util';
import {DataFlowNode, OutputNode} from './dataflow';
import {ParseNode} from './formatparse';
import {SourceNode} from './source';
import {TimeUnitNode} from './timeunit';


/**
 * Start optimization path at the leaves. Useful for merging up or removing things.
 *
 * If the callback returns true, the recursion continues.
 */
export function iterateFromLeaves(f: (node: DataFlowNode) => boolean) {
  function optimizeNextFromLeaves(node: DataFlowNode) {
    if (node instanceof SourceNode) {
      return;
    }

    const next = node.parent;
    if (f(node)) {
      optimizeNextFromLeaves(next);
    }
  }

  return optimizeNextFromLeaves;
}

/**
 * Move parse nodes up to forks.
 */
export function moveParseUp(node: DataFlowNode) {
  const parent = node.parent;

  // move parse up by merging or swapping
  if (node instanceof ParseNode) {
    if (parent instanceof SourceNode) {
      return false;
    }

    if (parent.numChildren() > 1) {
      // don't move parse further up but continue with parent.
      return true;
    }

    if (parent instanceof ParseNode) {
      parent.merge(node);
    } else {
      // don't swap with nodes that produce something that the parse node depends on (e.g. lookup)
      if (hasIntersection(parent.producedFields(), node.dependentFields())) {
        return true;
      }

      node.swapWithParent();
    }
  }

  return true;
}

/**
 * Repeatedly remove leaf nodes that are not output nodes.
 * The reason is that we don't need subtrees that don't have any output nodes.
 */
export function removeUnusedSubtrees(node: DataFlowNode) {
  if (node instanceof OutputNode || node.numChildren() > 0) {
    // no need to continue with parent because it is output node or will have children (there was a fork)
    return false;
  } else {
    node.remove();
  }
  return true;
}

/**
 * Removes duplicate time unit nodes (as determined by the name of the
 * output field) that may be generated due to selections projected over
 * time units.
 */
export function removeDuplicateTimeUnits(leaf: DataFlowNode) {
  let fields = {};
  return iterateFromLeaves((node: DataFlowNode) => {
    if (node instanceof TimeUnitNode) {
      const pfields = node.producedFields();
      const dupe = keys(pfields).every((k) => !!fields[k]);

      if (dupe) {
        node.remove();
      } else {
        fields = {...fields, ...pfields};
      }
    }

    return true;
  })(leaf);
}
