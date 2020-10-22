import { BaseModel, SaveOptions, mixRollback, mixSave, mixValidate } from '@vueent/mix-models';

import { create as createDataModel, Data, DataModel } from './__mocks__/data-model';
import { create as createDeepModel } from './__mocks__/deep-model';
import './__mocks__/vue-vm';

test('dirty flag should be set after change and resetted with rollback', () => {
  const instance = createDataModel();

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

  const instance = createDataModel(undefined, true, saveOptions);

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

test('the base model has no mixins', () => {
  const instance = new DataModel('name', { name: '', official: { first: '', last: '' } });

  expect(instance.hasMixin(BaseModel)).toBe(false);
  expect(instance.hasMixin(mixSave)).toBe(false);
  expect(instance.hasMixin(mixRollback)).toBe(false);
  expect(instance.hasMixin(mixValidate)).toBe(false);
});

test('a model with mixins should propagate mixin check requests throw the prototypes list', () => {
  const instance = createDeepModel();

  expect(instance.hasMixin(mixRollback)).toBe(true);
});
