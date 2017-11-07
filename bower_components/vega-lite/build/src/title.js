"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
function extractTitleConfig(titleConfig) {
    var 
    // These are non-mark title config that need to be hardcoded
    anchor = titleConfig.anchor, offset = titleConfig.offset, orient = titleConfig.orient, 
    // color needs to be redirect to fill
    color = titleConfig.color, 
    // The rest are mark config.
    titleMarkConfig = tslib_1.__rest(titleConfig, ["anchor", "offset", "orient", "color"]);
    var mark = tslib_1.__assign({}, titleMarkConfig, color ? { fill: color } : {});
    var nonMark = tslib_1.__assign({}, anchor ? { anchor: anchor } : {}, offset ? { offset: offset } : {}, orient ? { orient: orient } : {});
    return { mark: mark, nonMark: nonMark };
}
exports.extractTitleConfig = extractTitleConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGl0bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBd0NBLDRCQUFtQyxXQUEwQjtJQU16RDtJQURBLDREQUE0RDtJQUM1RCwyQkFBTSxFQUFFLDJCQUFNLEVBQUUsMkJBQU07SUFDdEIscUNBQXFDO0lBQ3JDLHlCQUFLO0lBQ0wsNEJBQTRCO0lBQzVCLHNGQUFrQixDQUNKO0lBRWhCLElBQU0sSUFBSSx3QkFDTCxlQUFlLEVBQ2YsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUM5QixDQUFDO0lBRUYsSUFBTSxPQUFPLHdCQUNSLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxNQUFNLFFBQUEsRUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxNQUFNLFFBQUEsRUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxNQUFNLFFBQUEsRUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQzFCLENBQUM7SUFFRixNQUFNLENBQUMsRUFBQyxJQUFJLE1BQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQ3pCLENBQUM7QUF6QkQsZ0RBeUJDIn0=