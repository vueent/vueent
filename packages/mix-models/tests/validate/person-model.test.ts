import { create as createPersonModel } from '../__mocks__/person-model';

import '../__mocks__/vue-vm';

test('it should works perfectly', () => {
  const instance = createPersonModel();

  expect(instance.v.c.age.dirty).toBe(false);

  instance.data.age = 30;

  expect(instance.v.c.age.dirty).toBe(false);
  expect(instance.v.c.age.invalid).toBe(false);

  instance.v.c.age.touch();

  expect(instance.v.c.age.dirty).toBe(true);
  expect(instance.v.c.age.invalid).toBe(false);
  expect(instance.v.c.age.message).toBe('');
  expect(instance.v.c.age.dirtyMessage).toBe('');

  instance.data.age = -1;

  expect(instance.v.c.age.dirty).toBe(true);
  expect(instance.v.c.age.invalid).toBe(true);
  expect(instance.v.c.age.message).toBe('Age cannot be a negative value.');
  expect(instance.v.c.age.dirtyMessage).toBe('Age cannot be a negative value.');

  // do not use push and splice, it breaks reactivity.
  instance.data.phones = [...instance.data.phones, { value: '+155533344' }];

  // some children are invalid.
  expect(instance.v.invalid).toBe(true);
  expect(instance.v.dirty).toBe(true);

  // autotouch is not enabled.
  expect(instance.v.c.phones.c[0].c.value.dirty).toBe(false);
  expect(instance.v.c.phones.c[0].c.value.invalid).toBe(true);
  expect(instance.v.c.phones.c[0].c.value.dirtyMessage).toBe('');

  instance.v.c.phones.c[0].c.value.touch();

  expect(instance.v.c.phones.c[0].c.value.dirty).toBe(true);
  expect(instance.v.c.phones.c[0].c.value.dirtyMessage).toBe('Invalid phone number format.');

  instance.data.phones[0].value = '+15553334411';

  expect(instance.v.c.phones.c[0].c.value.invalid).toBe(false);

  instance.v.reset();

  expect(instance.v.dirty).toBe(false);

  instance.destroy();
});
