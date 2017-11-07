
import {DataSourceType} from '../../data';
import {Dict, StringSet} from '../../util';


/**
 * A node in the dataflow tree.
 */
export class DataFlowNode {
  private _children: DataFlowNode[] = [];

  private _parent: DataFlowNode = null;

  constructor(public readonly debugName?: string) { }

  /**
   * Clone this node with a deep copy but don't clone links to children or parents.
   */
  public clone(): DataFlowNode {
    throw new Error('Cannot clone node');
  }

  /**
   * Set of fields that are being created by this node.
   */
  public producedFields(): StringSet {
    return {};
  }

  public dependentFields(): StringSet {
    return {};
  }

  get parent() {
    return this._parent;
  }

  /**
   * Set the parent of the node and also add this not to the parent's children.
   */
  set parent(parent: DataFlowNode) {
    this._parent = parent;
    parent.addChild(this);
  }

  get children() {
    return this._children;
  }

  public numChildren() {
    return this._children.length;
  }

  public addChild(child: DataFlowNode) {
    this._children.push(child);
  }

  public removeChild(oldChild: DataFlowNode) {
    this._children.splice(this._children.indexOf(oldChild), 1);
  }

  /**
   * Remove node from the dataflow.
   */
  public remove() {
    for (const child of this._children) {
      child.parent = this._parent;
    }
    this._parent.removeChild(this);
  }

  /**
   * Insert another node as a parent of this node.
   */
  public insertAsParentOf(other: DataFlowNode) {
    const parent = other.parent;
    parent.removeChild(this);
    this.parent = parent;
    other.parent = this;
  }

  public swapWithParent() {
    const parent = this._parent;
    const newParent = parent.parent;

    // reconnect the children
    for (const child of this._children) {
      child.parent = parent;
    }

    // remove old links
    this._children = [];  // equivalent to removing every child link one by one
    parent.removeChild(this);
    parent.parent.removeChild(parent);


    // swap two nodes
    this.parent = newParent;
    parent.parent = this;
  }
}

export class OutputNode extends DataFlowNode {
  private _source: string;

  private _name: string;

  public clone(): this {
    const cloneObj = new (<any>this.constructor);
    cloneObj.debugName = 'clone_' + this.debugName;
    cloneObj._source = this._source;
    cloneObj._name = 'clone_' + this._name;
    cloneObj.type = this.type;
    cloneObj.refCounts = this.refCounts;
    cloneObj.refCounts[cloneObj._name] = 0;
    return cloneObj;
  }

  /**
   * @param source The name of the source. Will change in assemble.
   * @param type The type of the output node.
   * @param refCounts A global ref counter map.
   */
  constructor(source: string, public readonly type: DataSourceType, private readonly refCounts: Dict<number>) {
    super(source);

    this._source = this._name = source;

    if (this.refCounts && !(this._name in this.refCounts)) {
      this.refCounts[this._name] = 0;
    }
  }

  /**
   * Request the datasource name and increase the ref counter.
   *
   * During the parsing phase, this will return the simple name such as 'main' or 'raw'.
   * It is crucial to request the name from an output node to mark it as a required node.
   * If nobody ever requests the name, this datasource will not be instantiated in the assemble phase.
   *
   * In the assemble phase, this will return the correct name.
   */
  public getSource() {
    this.refCounts[this._name]++;
    return this._source;
  }

  public isRequired(): boolean {
    return !!this.refCounts[this._name];
  }

  public setSource(source: string) {
    this._source = source;
  }
}
