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
      ]
    },
    true,
    saveOptions
  );

  expect(instance.data).toEqual({
    id: '1',
    phones: [
      { number: [{ tel: '12312' }], name: 'Someone' },
      { number: [{ tel: '12352112' }], name: 'Somehow' }
    ]
  });

  instance.data.phones[0].number[0].tel = '231';

  expect(instance.data).toEqual({
    id: '1',
    phones: [
      { number: [{ tel: '231' }], name: 'Someone' },
      { number: [{ tel: '12352112' }], name: 'Somehow' }
    ]
  });

  instance.rollback({ phones: { $array: true, number: { $array: true, tel: true }, name: true } });

  expect(instance.data).toEqual({
    id: '1',
    phones: [
      { number: [{ tel: '12312' }], name: 'Someone' },
      { number: [{ tel: '12352112' }], name: 'Somehow' }
    ]
  });

  instance.data.id = '2';

  instance.rollback();

  expect(instance.data).toEqual({
    id: '1',
    phones: [
      { number: [{ tel: '12312' }], name: 'Someone' },
      { number: [{ tel: '12352112' }], name: 'Somehow' }
    ]
  });
});
