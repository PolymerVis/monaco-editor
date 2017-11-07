import embed from 'vega-embed';

export function runStreamingExample(eleId: string) {
  const vlSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
    data: {name: 'table'},
    autosize: {
      update: true
    },
    width: 400,
    mark: 'line',
    encoding: {
      x: {field: 'x', type: 'quantitative', scale: {zero: false}},
      y: {field: 'y', type: 'quantitative'},
      color: {field: 'category', type: 'nominal'}
    }
  };

  embed(eleId, vlSpec, {
    actions: false
  }).then(res => {
    const {view} = res;

    /**
     * Generates a new tuple with random walk.
     */
    function newGenerator() {
      let counter = -1;
      let previousY = [5,5,5,5];
      return () => {
        counter++;
        const newVals = previousY.map((v, category) => ({
          x: counter,
          y: v + Math.round(Math.random() * 10 - category * 3),
          category
        }));
        previousY = newVals.map((v)=> v.y);
        return newVals;
      };
    }

    const valueGenerator = newGenerator();

    let minimumX = -100;
    window.setInterval(() => {
      minimumX++;
      const changeSet = view.changeset()
        .insert(valueGenerator())
        .remove((t: {x: number}) => t.x < minimumX);
      view.change('table', changeSet).run();
    }, 1000);
  });
}
