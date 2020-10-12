import { Model as SimpleModel } from '../__mocks__/simple-model';

import '../__mocks__/vue-vm';

test('touch should work after reset', () => {
  const instance = new SimpleModel();

  expect(instance.v.c.name.dirtyMessage).toBe('');

  instance.v.touch();

  expect(instance.v.c.name.dirtyMessage).toBe('Unexpected name length');

  instance.v.reset();

  expect(instance.v.c.name.dirtyMessage).toBe('');

  instance.v.touch();

  expect(instance.v.c.name.invalid).toBe(true);
  expect(instance.v.c.name.message).toBe('Unexpected name length');
  expect(instance.v.c.name.dirty).toBe(true);
  expect(instance.v.c.name.dirtyMessage).toBe('Unexpected name length');
});
