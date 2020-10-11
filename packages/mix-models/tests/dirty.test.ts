import { BaseModel, RollbackPrivate, SavePrivate, SaveOptions, mix, mixRollback, mixSave } from '@vueent/mix-models';

import './vue-vm';

interface Data {
  name: string;
  official: {
    first: string;
    last: string;
  };
}

class DataModel extends BaseModel<Data> {}

interface Model extends DataModel, RollbackPrivate<Data>, SavePrivate<Data> {}

class Model extends mix<Data, typeof DataModel>(DataModel, mixRollback(), mixSave()) {
  constructor(initialData?: Data, saveOptions?: SaveOptions<Data>) {
    super('name', initialData ?? { name: '', official: { first: '', last: '' } }, true, saveOptions);
  }
}

test('dirty flag should be set after change and resetted with rollback', () => {
  const instance = new Model();

  instance.data.name = 'John';

  expect(instance.dirty).toBe(true);

  instance.rollback();
  instance.data.name = 'Jane';

  expect(instance.dirty).toBe(true);

  instance.rollback();

  expect(instance.dirty).toBe(false);
});

test('dirty flag should be resetted after saving', async () => {
  expect.assertions(5);

  const saveOptions: SaveOptions<Data> = {
    mixinType: 'save',
    create: (data: Data) => Promise.resolve(data)
  };

  const instance = new Model(undefined, saveOptions);

  expect(instance.dirty).toBe(false);

  instance.data.name = 'Jane';

  expect(instance.dirty).toBe(true);

  await instance.save();

  expect(instance.dirty).toBe(false);

  instance.data.name = 'John';

  expect(instance.dirty).toBe(true);

  instance.rollback();

  expect(instance.dirty).toBe(false);
});
