import { NonPositionChannel } from './channel';
import { Encoding } from './encoding';
import { Field, FieldDef } from './fielddef';
import { Mark, MarkDef } from './mark';
export declare type StackOffset = 'zero' | 'center' | 'normalize';
export declare function isStackOffset(stack: string): stack is StackOffset;
export interface StackProperties {
    /** Dimension axis of the stack. */
    groupbyChannel: 'x' | 'y';
    /** Measure axis of the stack. */
    fieldChannel: 'x' | 'y';
    /** Stack-by fields e.g., color, detail */
    stackBy: {
        fieldDef: FieldDef<string>;
        channel: NonPositionChannel;
    }[];
    /**
     * See `"stack"` property of Position Field Def.
     */
    offset: StackOffset;
    /**
     * Whether this stack will produce impute transform
     */
    impute: boolean;
}
export declare const STACKABLE_MARKS: ("area" | "circle" | "line" | "text" | "square" | "point" | "bar" | "rule" | "tick")[];
export declare const STACK_BY_DEFAULT_MARKS: ("area" | "bar")[];
export declare function stack(m: Mark | MarkDef, encoding: Encoding<Field>, stackConfig: StackOffset): StackProperties;
