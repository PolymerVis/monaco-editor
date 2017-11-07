import {accessPath, stringValue, varName} from '../../../util';
import {TUPLE} from '../selection';
import nearest from './nearest';
import {TransformCompiler} from './transforms';


const inputBindings:TransformCompiler = {
  has: function(selCmpt) {
    return selCmpt.type === 'single' && selCmpt.resolve === 'global' &&
      selCmpt.bind && selCmpt.bind !== 'scales';
  },

  topLevelSignals: function(model, selCmpt, signals) {
    const name = selCmpt.name;
    const proj = selCmpt.project;
    const bind = selCmpt.bind;
    const datum = nearest.has(selCmpt) ?
      '(item().isVoronoi ? datum.datum : datum)' : 'datum';

    proj.forEach(function(p) {
      const sgname = varName(`${name}_${p.field}`);
      const hasSignal = signals.filter((s) => s.name === sgname);
      if (!hasSignal.length) {
        signals.unshift({
          name: sgname,
          value: '',
          on: [{
            events: selCmpt.events,
            update: `datum && item().mark.marktype !== 'group' ? ${datum}${accessPath(p.field)} : null`
          }],
          bind: bind[p.field] || bind[p.channel] || bind
        });
      }
    });

    return signals;
  },

  signals: function(model, selCmpt, signals) {
    const name = selCmpt.name;
    const proj = selCmpt.project;
    const signal = signals.filter((s) => s.name === name + TUPLE)[0];
    const fields = proj.map((p) => stringValue(p.field)).join(', ');
    const values = proj.map((p) => varName(`${name}_${p.field}`));

    signal.update = `${values.join(' && ')} ? {fields: [${fields}], values: [${values.join(', ')}]} : null`;
    delete signal.value;
    delete signal.on;

    return signals;
  }
};

export {inputBindings as default};
