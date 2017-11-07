import {selector as parseSelector} from 'vega-event-selector';
import {ScaleChannel, X, Y} from '../../../channel';
import {stringValue} from '../../../util';
import {VgSignal} from '../../../vega.schema';
import {BRUSH as INTERVAL_BRUSH} from '../interval';
import {channelSignalName, positionalProjections, SelectionComponent} from '../selection';
import {UnitModel} from './../../unit';
import {default as scalesCompiler, domain} from './scales';
import {TransformCompiler} from './transforms';


const ANCHOR = '_zoom_anchor';
const DELTA = '_zoom_delta';

const zoom:TransformCompiler = {
  has: function(selCmpt) {
    return selCmpt.type === 'interval' && selCmpt.zoom;
  },

  signals: function(model, selCmpt, signals) {
    const name = selCmpt.name;
    const hasScales = scalesCompiler.has(selCmpt);
    const delta = name + DELTA;
    const {x, y} = positionalProjections(selCmpt);
    const sx = stringValue(model.scaleName(X));
    const sy = stringValue(model.scaleName(Y));
    let events = parseSelector(selCmpt.zoom, 'scope');

    if (!hasScales) {
      events = events.map((e) => (e.markname = name + INTERVAL_BRUSH, e));
    }

    signals.push({
      name: name + ANCHOR,
      on: [{
        events: events,
        update: !hasScales ? `{x: x(unit), y: y(unit)}` :
          '{' + [
            (sx ? `x: invert(${sx}, x(unit))` : ''),
            (sy ? `y: invert(${sy}, y(unit))` : '')
          ].filter((expr) => !!expr).join(', ') + '}'
      }]
    }, {
      name: delta,
      on: [{
        events: events,
        force: true,
        update: 'pow(1.001, event.deltaY * pow(16, event.deltaMode))'
      }]
    });

    if (x !== null) {
      onDelta(model, selCmpt, 'x', 'width', signals);
    }

    if (y !== null) {
      onDelta(model, selCmpt, 'y', 'height', signals);
    }

    return signals;
  }
};

export {zoom as default};

function onDelta(model: UnitModel, selCmpt: SelectionComponent, channel: ScaleChannel, size: 'width' | 'height', signals: VgSignal[]) {
  const name = selCmpt.name;
  const hasScales = scalesCompiler.has(selCmpt);
  const signal = signals.filter(s => {
    return s.name === channelSignalName(selCmpt, channel, hasScales ? 'data' : 'visual');
  })[0];
  const sizeSg = model.getSizeSignalRef(size).signal;
  const scaleCmpt = model.getScaleComponent(channel);
  const scaleType = scaleCmpt.get('type');
  const base = hasScales ? domain(model, channel) : signal.name;
  const delta = name + DELTA;
  const anchor = `${name}${ANCHOR}.${channel}`;
  const zoomFn = !hasScales ? 'zoomLinear' :
    scaleType === 'log' ? 'zoomLog' :
    scaleType === 'pow' ? 'zoomPow' : 'zoomLinear';
  const update = `${zoomFn}(${base}, ${anchor}, ${delta}` +
    (hasScales && scaleType === 'pow' ? `, ${scaleCmpt.get('exponent') || 1}` : '') + ')';

  signal.on.push({
    events: {signal: delta},
    update: hasScales ? update : `clampRange(${update}, 0, ${sizeSg})`
  });
}
