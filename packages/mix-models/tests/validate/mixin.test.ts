import { Model as SimpleModel } from '../__mocks__/simple-model';
import { Model as DeepModel } from '../__mocks__/deep-model';

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

test('touch should work after reset for a complex model', () => {
  const instance = new DeepModel();

  expect(instance.v.dirty).toBe(false);
  expect(instance.v.c.email.invalid).toBe(true);
  expect(instance.v.c.email.dirtyMessage).toBe('');

  instance.data.phones = [{ value: '' }];

  expect(instance.v.dirty).toBe(false);
  expect(instance.v.c.email.dirtyMessage).toBe('');
  expect(instance.v.c.phones.c[0].c.value.dirtyMessage).toBe('');

  instance.v.touch();

  expect(instance.v.dirty).toBe(true);
  expect(instance.v.c.email.dirty).toBe(true);
  expect(instance.v.c.email.dirtyMessage).toBe('invalid e-mail');
  expect(instance.v.c.phones.c[0].c.value.dirty).toBe(true);
  expect(instance.v.c.phones.c[0].c.value.dirtyMessage).toBe('invalid phone');

  instance.v.reset();

  expect(instance.v.dirty).toBe(false);
  expect(instance.v.c.email.dirty).toBe(false);
  expect(instance.v.c.email.dirtyMessage).toBe('');
  expect(instance.v.c.phones.dirty).toBe(false);
  expect(instance.v.c.phones.dirtyMessage).toBe('');
  expect(instance.v.c.phones.c[0].c.value.dirty).toBe(false);
  expect(instance.v.c.phones.c[0].c.value.dirtyMessage).toBe('');

  instance.data.phones?.push({ value: '1234567890' });
  instance.v.touch();

  expect(instance.v.dirty).toBe(true);
  expect(instance.v.c.email.dirty).toBe(true);
  expect(instance.v.c.email.message).toBe('invalid e-mail');
  expect(instance.v.c.email.dirtyMessage).toBe('invalid e-mail');
  expect(instance.v.c.phones.c[0].c.value.dirty).toBe(true);
  expect(instance.v.c.phones.c[0].c.value.dirtyMessage).toBe('invalid phone');
  expect(instance.v.c.phones.c[1].c.value.dirty).toBe(true);
  expect(instance.v.c.phones.c[1].invalid).toBe(false);
  expect(instance.v.c.phones.c[1].c.value.dirtyMessage).toBe('');
});
