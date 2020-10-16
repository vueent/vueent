import { create as createDeepArrayModel, Data } from './__mocks__/deep-array-model';
import { SaveOptions } from '../src';

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

  instance.data.items[0].sub.my.values[0] = 23;

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
});
