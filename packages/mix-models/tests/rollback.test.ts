import { create as createDataModel, Data, DataModel } from './__mocks__/data-model';
import { BaseModel, SaveOptions, mixRollback, mixSave, mixValidate } from '../src';

import './__mocks__/vue-vm';

test('after rollback the model data should be reverted to the previous saved state', async () => {
  expect.assertions(7);

  const saveOptions: SaveOptions<Data> = {
    mixinType: 'save',
    create: (data: Data) => Promise.resolve(data)
  };

  const instance = createDataModel({ name: 'Dan', official: { first: 'first', last: 'last' } }, true, saveOptions);

  expect(instance.data).toEqual({ name: 'Dan', official: { first: 'first', last: 'last' } });

  instance.data.name = 'Alex';

  expect(instance.data).toEqual({ name: 'Alex', official: { first: 'first', last: 'last' } });

  instance.rollback();

  expect(instance.data).toEqual({ name: 'Dan', official: { first: 'first', last: 'last' } });

  instance.data.official.first = 'second';
  instance.data.official.last = 'first';

  expect(instance.data).toEqual({ name: 'Dan', official: { first: 'second', last: 'first' } });

  instance.rollback({ official: { first: true } });

  expect(instance.data).toEqual({ name: 'Dan', official: { first: 'first', last: 'first' } });

  instance.data.name = 'Alex';

  await instance.save();

  instance.data.name = 'Dan';

  instance.rollback();

  expect(instance.data).toEqual({ name: 'Alex', official: { first: 'first', last: 'first' } });

  instance.data.official.first = 'test';
  instance.data.name = 'Dan';

  await instance.save();

  instance.rollback({ name: true });

  expect(instance.data).toEqual({ name: 'Dan', official: { first: 'test', last: 'first' } });
});
