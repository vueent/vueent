import { create as createObjectModel } from '../__mocks__/object-model';

import '../__mocks__/vue-vm';

test('validation should correctly work with recursive data', () => {
  const instance = createObjectModel();

  instance.v.touch();

  expect(instance.v.dirty).toBe(true);

  instance.data.internalData = { id: '', internalData: undefined };

  instance.v.touch();

  expect(instance.data.internalData).toEqual({ id: '', internalData: undefined });

  expect(instance.v.c.internalData.c.id.invalid).toBe(true);

  instance.data.internalData.internalData = { id: '10', internalData: undefined };

  instance.v.touch();

  expect(instance.v.c.internalData.c.internalData.c.id.invalid).toBe(false);

  instance.data.internalData = undefined;
  instance.data.id = '1';
  instance.v.touch();

  expect(instance.v.invalid).toBe(false);

  instance.data.internalData = { id: '10', internalData: { id: undefined, internalData: undefined } };
  instance.v.touch();

  expect(instance.v.c.internalData.c.internalData.invalid).toBe(true);
  expect(instance.v.invalid).toBe(true);

  if (instance.data.internalData.internalData) instance.data.internalData.internalData.id = '100';

  expect(instance.v.invalid).toBe(false);
});
