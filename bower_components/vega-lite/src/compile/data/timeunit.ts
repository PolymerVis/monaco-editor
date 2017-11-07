import {field} from '../../fielddef';
import {fieldExpr, TimeUnit} from '../../timeunit';
import {TimeUnitTransform} from '../../transform';
import {Dict, duplicate, keys, vals} from '../../util';
import {VgFormulaTransform} from '../../vega.schema';
import {ModelWithField} from '../model';
import {DataFlowNode} from './dataflow';


export interface TimeUnitComponent {
  as: string;
  timeUnit: TimeUnit;
  field: string;
}

export class TimeUnitNode extends DataFlowNode {
  public clone() {
    return new TimeUnitNode(duplicate(this.formula));
  }

  constructor(private formula: Dict<TimeUnitComponent>) {
    super();
  }

  public static makeFromEncoding(model: ModelWithField) {
    const formula = model.reduceFieldDef((timeUnitComponent: TimeUnitComponent, fieldDef) => {
      if (fieldDef.timeUnit) {
        const f = field(fieldDef);
        timeUnitComponent[f] = {
          as: f,
          timeUnit: fieldDef.timeUnit,
          field: fieldDef.field
        };
      }
      return timeUnitComponent;
    }, {} as Dict<TimeUnitComponent>);

    if (keys(formula).length === 0) {
      return null;
    }

    return new TimeUnitNode(formula);
  }

  public static makeFromTransform(t: TimeUnitTransform) {
    return new TimeUnitNode({
      [t.field]: {
        as: t.as,
        timeUnit: t.timeUnit,
        field: t.field
      }
    });
  }

  public merge(other: TimeUnitNode) {
    this.formula = {...this.formula, ...other.formula};
    other.remove();
  }

  public producedFields() {
    const out = {};

    vals(this.formula).forEach(f => {
      out[f.as] = true;
    });

    return out;
  }

  public dependentFields() {
    const out = {};

    vals(this.formula).forEach(f => {
      out[f.field] = true;
    });

    return out;
  }

  public assemble() {
    return vals(this.formula).map(c => {
      return {
        type: 'formula',
        as: c.as,
        expr: fieldExpr(c.timeUnit, c.field)
      } as VgFormulaTransform;
    });
  }
}
