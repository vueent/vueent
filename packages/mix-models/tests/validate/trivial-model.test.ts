import { Options } from '@vueent/mix-models';
import { create as createTrivialModel } from '../__mocks__/trivial-model';
import { Data, EncodedData, normalize, denormalize } from '../__mocks__/trivial-model';
import { Storage } from '../__mocks__/storage';

import '../__mocks__/vue-vm';

function makeTrivialModel(id = 0, options: Options[] = []) {
  return createTrivialModel(
    {
      id,
      age: '22',
      name: 'John'
    },
    true,
    ...options
  );
}

test('Validation should work after the data object replacement (rollback)', () => {
  const instance = makeTrivialModel();

  instance.data.age = '';
  instance.v.c.age.touch();

  expect(instance.v.c.age.invalid).toBe(true);

  instance.data.age = '19';
  instance.v.c.age.touch();
  instance.data.name = 'John';
  instance.v.c.name.touch();
  instance.data.desc = 'something about';
  instance.v.c.desc.touch();

  expect(instance.v.dirty).toBe(true);
  expect(instance.v.c.age.dirty).toBe(true);
  expect(instance.v.c.name.dirty).toBe(true);
  expect(instance.v.c.desc.dirty).toBe(true);
  expect(instance.v.invalid).toBe(false);

  instance.rollback();

  expect(instance.v.dirty).toBe(false);

  instance.data.age = '';
  instance.v.c.age.touch();

  expect(instance.v.dirty).toBe(true);
  expect(instance.v.invalid).toBe(true);

  instance.data.age = '19';
  instance.v.c.age.touch();

  expect(instance.v.invalid).toBe(false);
});

test('Validation should work after the model instance saving', async () => {
  const storage = new Storage<EncodedData>();

  const create = async (data: Data) => normalize(await storage.add(denormalize(data)));
  const update = async (id: unknown, data: Data) => normalize(await storage.update(Number(id), denormalize(data)));
  const destroy = (id: unknown) => storage.destroy(Number(id));

  const instance = makeTrivialModel(0, [{ mixinType: 'save', create, update, destroy } as Options]);

  instance.v.touch();

  expect(instance.v.invalid).toBe(false);

  await instance.save();

  expect(instance.pk).not.toEqual(0);
  expect(instance.v.invalid).toBe(false);

  instance.data.age = '';
  instance.v.c.age.touch();
  expect(instance.v.invalid).toBe(true);

  const loadedData = await storage.get(1);

  const instance2 = createTrivialModel(normalize(loadedData), true, {
    mixinType: 'save',
    create,
    update: async (id: unknown, data: Data) => {
      const response = await update(id, data);

      response.desc = undefined; // clear desc field

      return response;
    },
    destroy
  } as Options);

  expect(instance2.pk).toEqual(instance.pk);
  expect(instance2.data.desc).toEqual(undefined);

  instance2.data.desc = '';
  instance2.v.c.desc.touch();

  expect(instance2.v.c.desc.invalid).toBe(true);

  instance.destroy();
  instance2.destroy();
});
