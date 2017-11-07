"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Constants and utilities for data type */
/** Data type based on level of measurement */
var Type;
(function (Type) {
    Type.QUANTITATIVE = 'quantitative';
    Type.ORDINAL = 'ordinal';
    Type.TEMPORAL = 'temporal';
    Type.NOMINAL = 'nominal';
})(Type = exports.Type || (exports.Type = {}));
var TYPE_INDEX = {
    quantitative: 1,
    ordinal: 1,
    temporal: 1,
    nominal: 1
};
function isType(t) {
    return !!TYPE_INDEX[t];
}
exports.isType = isType;
exports.QUANTITATIVE = Type.QUANTITATIVE;
exports.ORDINAL = Type.ORDINAL;
exports.TEMPORAL = Type.TEMPORAL;
exports.NOMINAL = Type.NOMINAL;
/**
 * Get full, lowercase type name for a given type.
 * @param  type
 * @return Full type name.
 */
function getFullName(type) {
    if (type) {
        type = type.toLowerCase();
        switch (type) {
            case 'q':
            case exports.QUANTITATIVE:
                return 'quantitative';
            case 't':
            case exports.TEMPORAL:
                return 'temporal';
            case 'o':
            case exports.ORDINAL:
                return 'ordinal';
            case 'n':
            case exports.NOMINAL:
                return 'nominal';
        }
    }
    // If we get invalid input, return undefined type.
    return undefined;
}
exports.getFullName = getFullName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNENBQTRDO0FBQzVDLDhDQUE4QztBQUU5QyxJQUFpQixJQUFJLENBS3BCO0FBTEQsV0FBaUIsSUFBSTtJQUNOLGlCQUFZLEdBQW1CLGNBQWMsQ0FBQztJQUM5QyxZQUFPLEdBQWMsU0FBUyxDQUFDO0lBQy9CLGFBQVEsR0FBZSxVQUFVLENBQUM7SUFDbEMsWUFBTyxHQUFjLFNBQVMsQ0FBQztBQUM5QyxDQUFDLEVBTGdCLElBQUksR0FBSixZQUFJLEtBQUosWUFBSSxRQUtwQjtBQUdELElBQU0sVUFBVSxHQUFlO0lBQzdCLFlBQVksRUFBRSxDQUFDO0lBQ2YsT0FBTyxFQUFFLENBQUM7SUFDVixRQUFRLEVBQUUsQ0FBQztJQUNYLE9BQU8sRUFBRSxDQUFDO0NBQ1gsQ0FBQztBQUVGLGdCQUF1QixDQUFNO0lBQzNCLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUFGRCx3QkFFQztBQUVZLFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDakMsUUFBQSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUN2QixRQUFBLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3pCLFFBQUEsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFFcEM7Ozs7R0FJRztBQUNILHFCQUE0QixJQUFpQjtJQUMzQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ1QsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMxQixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2IsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLG9CQUFZO2dCQUNmLE1BQU0sQ0FBQyxjQUFjLENBQUM7WUFDeEIsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLGdCQUFRO2dCQUNYLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDcEIsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLGVBQU87Z0JBQ1YsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNuQixLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssZUFBTztnQkFDVixNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3JCLENBQUM7SUFDSCxDQUFDO0lBQ0Qsa0RBQWtEO0lBQ2xELE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQXBCRCxrQ0FvQkMifQ==