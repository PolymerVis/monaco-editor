"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log = require("../../../log");
var scale_1 = require("../../../scale");
var util_1 = require("../../../util");
var selection_1 = require("../selection");
var scaleBindings = {
    has: function (selCmpt) {
        return selCmpt.type === 'interval' && selCmpt.resolve === 'global' &&
            selCmpt.bind && selCmpt.bind === 'scales';
    },
    parse: function (model, selDef, selCmpt) {
        var bound = selCmpt.scales = [];
        selCmpt.project.forEach(function (p) {
            var channel = p.channel;
            var scale = model.getScaleComponent(channel);
            var scaleType = scale ? scale.get('type') : undefined;
            if (!scale || !scale_1.hasContinuousDomain(scaleType) || scale_1.isBinScale(scaleType)) {
                log.warn(log.message.SCALE_BINDINGS_CONTINUOUS);
                return;
            }
            scale.set('domainRaw', { signal: selection_1.channelSignalName(selCmpt, channel, 'data') }, true);
            bound.push(channel);
        });
    },
    topLevelSignals: function (model, selCmpt, signals) {
        // Top-level signals are only needed when coordinating composed views.
        if (!model.parent) {
            return signals;
        }
        var channels = selCmpt.scales.filter(function (channel) {
            return !(signals.filter(function (s) { return s.name === selection_1.channelSignalName(selCmpt, channel, 'data'); }).length);
        });
        return signals.concat(channels.map(function (channel) {
            return { name: selection_1.channelSignalName(selCmpt, channel, 'data') };
        }));
    },
    signals: function (model, selCmpt, signals) {
        // Nested signals need only push to top-level signals when within composed views.
        if (model.parent) {
            selCmpt.scales.forEach(function (channel) {
                var signal = signals.filter(function (s) { return s.name === selection_1.channelSignalName(selCmpt, channel, 'data'); })[0];
                signal.push = 'outer';
                delete signal.value;
                delete signal.update;
            });
        }
        return signals;
    }
};
exports.default = scaleBindings;
function domain(model, channel) {
    var scale = util_1.stringValue(model.scaleName(channel));
    return "domain(" + scale + ")";
}
exports.domain = domain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NhbGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBpbGUvc2VsZWN0aW9uL3RyYW5zZm9ybXMvc2NhbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0NBQW9DO0FBQ3BDLHdDQUErRDtBQUMvRCxzQ0FBMEM7QUFFMUMsMENBQStDO0FBSS9DLElBQU0sYUFBYSxHQUFxQjtJQUN0QyxHQUFHLEVBQUUsVUFBUyxPQUFPO1FBQ25CLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLFVBQVUsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLFFBQVE7WUFDaEUsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQztJQUM5QyxDQUFDO0lBRUQsS0FBSyxFQUFFLFVBQVMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPO1FBQ3BDLElBQU0sS0FBSyxHQUFjLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBRTdDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVMsQ0FBQztZQUNoQyxJQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQzFCLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvQyxJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUV4RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLDJCQUFtQixDQUFDLFNBQVMsQ0FBQyxJQUFJLGtCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztnQkFDaEQsTUFBTSxDQUFDO1lBQ1QsQ0FBQztZQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUMsTUFBTSxFQUFFLDZCQUFpQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwRixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGVBQWUsRUFBRSxVQUFTLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTztRQUMvQyxzRUFBc0U7UUFDdEUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFDLE9BQU87WUFDN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksS0FBSyw2QkFBaUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUF0RCxDQUFzRCxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUMsT0FBTztZQUN6QyxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsNkJBQWlCLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBQyxDQUFDO1FBQzdELENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTixDQUFDO0lBRUQsT0FBTyxFQUFFLFVBQVMsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPO1FBQ3ZDLGlGQUFpRjtRQUNqRixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNqQixPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU87Z0JBQzVCLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxLQUFLLDZCQUFpQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQXRELENBQXNELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFOUYsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7Z0JBQ3RCLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDcEIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDakIsQ0FBQztDQUNGLENBQUM7QUFFdUIsZ0NBQU87QUFFaEMsZ0JBQXVCLEtBQWdCLEVBQUUsT0FBZ0I7SUFDdkQsSUFBTSxLQUFLLEdBQUcsa0JBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDcEQsTUFBTSxDQUFDLFlBQVUsS0FBSyxNQUFHLENBQUM7QUFDNUIsQ0FBQztBQUhELHdCQUdDIn0=