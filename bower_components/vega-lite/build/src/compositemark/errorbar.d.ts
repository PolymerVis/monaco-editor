import { Field } from '../fielddef';
import { Encoding } from './../encoding';
import { GenericUnitSpec, LayerSpec } from './../spec';
export declare const ERRORBAR: 'error-bar';
export declare type ERRORBAR = typeof ERRORBAR;
export declare function normalizeErrorBar(spec: GenericUnitSpec<Encoding<Field>, ERRORBAR>): LayerSpec;
