import { create as createDeepArrayModel, Data } from './__mocks__/deep-array-model';
import { SaveOptions } from '../src';

import './__mocks__/vue-vm';

test('after rollback the model data should be reverted to the previous saved state', async () => {
  const saveOptions: SaveOptions<Data> = {
    mixinType: 'save',
    create: (data: Data) => Promise.resolve(data)
  };

  const instance = createDeepArrayModel({ id: '1', phones: [{ number: '123123' }, { number: '12352112' }] }, true, saveOptions);

  expect(instance.data).toEqual({ id: '1', phones: [{ number: '123123' }, { number: '12352112' }] });

  instance.data.phones[0].number = '231';

  expect(instance.data).toEqual({ id: '1', phones: [{ number: '231' }, { number: '12352112' }] });

  instance.rollback({ phones: [{ number: true }, { number: true }] });

  expect(instance.data).toEqual({ id: '1', phones: [{ number: '123123' }, { number: '12352112' }] });
});
