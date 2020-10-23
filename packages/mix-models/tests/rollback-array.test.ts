import { SaveOptions } from '@vueent/mix-models';

import { create as createDeepArrayModel, Data } from './__mocks__/deep-array-model';
import './__mocks__/vue-vm';

test('after rollback the model data should be reverted to the previous saved state', async () => {
  const saveOptions: SaveOptions<Data> = {
    mixinType: 'save',
    create: (data: Data) => Promise.resolve(data)
  };

  const instance = createDeepArrayModel(
    {
      id: '1',
      phones: [
        { number: [{ tel: '12312' }], name: 'Someone' },
        { number: [{ tel: '12352112' }], name: 'Somehow' }
      ],
      items: [{ sub: { my: { values: [1, 2, 3, 4, 5] } } }]
    },
    true,
    saveOptions
  );

  expect(instance.data).toEqual({
    id: '1',
    phones: [
      { number: [{ tel: '12312' }], name: 'Someone' },
      { number: [{ tel: '12352112' }], name: 'Somehow' }
    ],
    items: [{ sub: { my: { values: [1, 2, 3, 4, 5] } } }]
  });

  // should use `splice`, because changes inside arrays of trivial types are not tracked
  instance.data.items[0].sub.my.values.splice(0, 1, 23);

  expect(instance.data).toEqual({
    id: '1',
    phones: [
      { number: [{ tel: '12312' }], name: 'Someone' },
      { number: [{ tel: '12352112' }], name: 'Somehow' }
    ],
    items: [{ sub: { my: { values: [23, 2, 3, 4, 5] } } }]
  });

  instance.rollback({ items: { $array: true, sub: { my: { values: true } } } });

  expect(instance.data).toEqual({
    id: '1',
    phones: [
      { number: [{ tel: '12312' }], name: 'Someone' },
      { number: [{ tel: '12352112' }], name: 'Somehow' }
    ],
    items: [{ sub: { my: { values: [1, 2, 3, 4, 5] } } }]
  });

  instance.data.id = '2';

  instance.rollback();

  expect(instance.data).toEqual({
    id: '1',
    phones: [
      { number: [{ tel: '12312' }], name: 'Someone' },
      { number: [{ tel: '12352112' }], name: 'Somehow' }
    ],
    items: [{ sub: { my: { values: [1, 2, 3, 4, 5] } } }]
  });

  instance.data.phones[0].name = 'Dan';

  expect(instance.data).toEqual({
    id: '1',
    phones: [
      { number: [{ tel: '12312' }], name: 'Dan' },
      { number: [{ tel: '12352112' }], name: 'Somehow' }
    ],
    items: [{ sub: { my: { values: [1, 2, 3, 4, 5] } } }]
  });

  instance.rollback({ phones: { $array: true, $index: [0], name: true } });

  expect(instance.data).toEqual({
    id: '1',
    phones: [
      { number: [{ tel: '12312' }], name: 'Someone' },
      { number: [{ tel: '12352112' }], name: 'Somehow' }
    ],
    items: [{ sub: { my: { values: [1, 2, 3, 4, 5] } } }]
  });
});
