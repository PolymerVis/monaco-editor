(function(PolymerVis) {
  PolymerVis.monaco = PolymerVis.monaco || {};
  PolymerVis.monaco.schemas = {
    vega: {
      uri: 'https://vega.github.io/schema/vega/v3.0.json',
      schema: PolymerVis.schemas.vega,
      fileMatch: ['*']
    },
    'vega-lite': {
      uri: 'https://vega.github.io/schema/vega-lite/v2.json',
      // schema: PolymerVis.schemas['vega-lite'],
      fileMatch: ['*']
    }
  };
})((window.PolymerVis = window.PolymerVis || {}));
