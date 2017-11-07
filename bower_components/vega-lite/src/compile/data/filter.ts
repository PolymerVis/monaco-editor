import {expression, Filter} from '../../filter';
import {LogicalOperand} from '../../logical';
import {duplicate} from '../../util';
import {VgFilterTransform} from '../../vega.schema';
import {Model} from '../model';
import {DataFlowNode} from './dataflow';

export class FilterNode extends DataFlowNode {
  private expr: string;
  public clone() {
    return new FilterNode(this.model, duplicate(this.filter));
  }

  constructor(private readonly model: Model, private filter: LogicalOperand<Filter>) {
    super();
    this.expr = expression(this.model, this.filter, this);
  }

  public assemble(): VgFilterTransform {
    return {
      type: 'filter',
      expr: this.expr
    };
  }
}
