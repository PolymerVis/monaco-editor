"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var channel_1 = require("../../channel");
var log = require("../../log");
var scale_1 = require("../../scale");
var vega_schema_1 = require("../../vega.schema");
var domain_1 = require("../scale/domain");
var dataflow_1 = require("./dataflow");
/**
 * A node that helps us track what fields we are faceting by.
 */
var FacetNode = /** @class */ (function (_super) {
    tslib_1.__extends(FacetNode, _super);
    /**
     * @param model The facet model.
     * @param name The name that this facet source will have.
     * @param data The source data for this facet data.
     */
    function FacetNode(model, name, data) {
        var _this = _super.call(this) || this;
        _this.model = model;
        _this.name = name;
        _this.data = data;
        if (model.facet.column) {
            _this.columnFields = [model.field(channel_1.COLUMN)];
            _this.columnName = model.getName('column_domain');
            if (model.fieldDef(channel_1.COLUMN).bin) {
                _this.columnFields.push(model.field(channel_1.COLUMN, { binSuffix: 'end' }));
            }
        }
        if (model.facet.row) {
            _this.rowFields = [model.field(channel_1.ROW)];
            _this.rowName = model.getName('row_domain');
            if (model.fieldDef(channel_1.ROW).bin) {
                _this.rowFields.push(model.field(channel_1.ROW, { binSuffix: 'end' }));
            }
        }
        _this.childModel = model.child;
        return _this;
    }
    Object.defineProperty(FacetNode.prototype, "fields", {
        get: function () {
            var fields = [];
            if (this.columnFields) {
                fields = fields.concat(this.columnFields);
            }
            if (this.rowFields) {
                fields = fields.concat(this.rowFields);
            }
            return fields;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The name to reference this source is its name.
     */
    FacetNode.prototype.getSource = function () {
        return this.name;
    };
    FacetNode.prototype.getChildIndependentFieldsWithStep = function () {
        var childIndependentFieldsWithStep = {};
        for (var _i = 0, _a = ['x', 'y']; _i < _a.length; _i++) {
            var channel = _a[_i];
            var childScaleComponent = this.childModel.component.scales[channel];
            if (childScaleComponent && !childScaleComponent.merged) {
                var type = childScaleComponent.get('type');
                var range = childScaleComponent.get('range');
                if (scale_1.hasDiscreteDomain(type) && vega_schema_1.isVgRangeStep(range)) {
                    var domain = domain_1.assembleDomain(this.childModel, channel);
                    var field = domain_1.getFieldFromDomain(domain);
                    if (field) {
                        childIndependentFieldsWithStep[channel] = field;
                    }
                    else {
                        log.warn('Unknown field for ${channel}.  Cannot calculate view size.');
                    }
                }
            }
        }
        return childIndependentFieldsWithStep;
    };
    FacetNode.prototype.assembleRowColumnData = function (channel, crossedDataName, childIndependentFieldsWithStep) {
        var aggregateChildField = {};
        var childChannel = channel === 'row' ? 'y' : 'x';
        if (childIndependentFieldsWithStep[childChannel]) {
            if (crossedDataName) {
                aggregateChildField = {
                    // If there is a crossed data, calculate max
                    fields: ["distinct_" + childIndependentFieldsWithStep[childChannel]],
                    ops: ['max'],
                    // Although it is technically a max, just name it distinct so it's easier to refer to it
                    as: ["distinct_" + childIndependentFieldsWithStep[childChannel]]
                };
            }
            else {
                aggregateChildField = {
                    // If there is no crossed data, just calculate distinct
                    fields: [childIndependentFieldsWithStep[childChannel]],
                    ops: ['distinct']
                };
            }
        }
        return {
            name: channel === 'row' ? this.rowName : this.columnName,
            // Use data from the crossed one if it exist
            source: crossedDataName || this.data,
            transform: [tslib_1.__assign({ type: 'aggregate', groupby: channel === 'row' ? this.rowFields : this.columnFields }, aggregateChildField)]
        };
    };
    FacetNode.prototype.assemble = function () {
        var data = [];
        var crossedDataName = null;
        var childIndependentFieldsWithStep = this.getChildIndependentFieldsWithStep();
        if (this.columnName && this.rowName && (childIndependentFieldsWithStep.x || childIndependentFieldsWithStep.y)) {
            // Need to create a cross dataset to correctly calculate cardinality
            crossedDataName = "cross_" + this.columnName + "_" + this.rowName;
            var fields = [].concat(childIndependentFieldsWithStep.x ? [childIndependentFieldsWithStep.x] : [], childIndependentFieldsWithStep.y ? [childIndependentFieldsWithStep.y] : []);
            var ops = fields.map(function () { return 'distinct'; });
            data.push({
                name: crossedDataName,
                source: this.data,
                transform: [{
                        type: 'aggregate',
                        groupby: this.columnFields.concat(this.rowFields),
                        fields: fields,
                        ops: ops
                    }]
            });
        }
        if (this.columnName) {
            data.push(this.assembleRowColumnData('column', crossedDataName, childIndependentFieldsWithStep));
        }
        if (this.rowName) {
            data.push(this.assembleRowColumnData('row', crossedDataName, childIndependentFieldsWithStep));
        }
        return data;
    };
    return FacetNode;
}(dataflow_1.DataFlowNode));
exports.FacetNode = FacetNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFjZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcGlsZS9kYXRhL2ZhY2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHlDQUF3RDtBQUN4RCwrQkFBaUM7QUFDakMscUNBQThDO0FBQzlDLGlEQUE4RTtBQUc5RSwwQ0FBbUU7QUFDbkUsdUNBQXdDO0FBT3hDOztHQUVHO0FBQ0g7SUFBK0IscUNBQVk7SUFTekM7Ozs7T0FJRztJQUNILG1CQUFtQyxLQUFpQixFQUFrQixJQUFZLEVBQVMsSUFBWTtRQUF2RyxZQUNFLGlCQUFPLFNBbUJSO1FBcEJrQyxXQUFLLEdBQUwsS0FBSyxDQUFZO1FBQWtCLFVBQUksR0FBSixJQUFJLENBQVE7UUFBUyxVQUFJLEdBQUosSUFBSSxDQUFRO1FBR3JHLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN2QixLQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxnQkFBTSxDQUFDLENBQUMsQ0FBQztZQUMxQyxLQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDakQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsS0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxnQkFBTSxFQUFFLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztZQUNsRSxDQUFDO1FBQ0gsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwQixLQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFH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