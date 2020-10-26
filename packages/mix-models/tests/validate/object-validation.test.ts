import { create as createObjectModel } from '../__mocks__/object-model';

import '../__mocks__/vue-vm';

test('blabla call stack exceeded', () => {
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
});
