import { mixValidate, mixRollback } from '@vueent/mix-models';

import { create as createSimpleModel } from '../__mocks__/simple-model';
import { create as createDeepModel } from '../__mocks__/deep-model';
import { create as createArrayModel } from '../__mocks__/array-model';
import '../__mocks__/vue-vm';

const splice = <T = any>(arr: Array<T>, start = 0, count = 1, ...items: T[]) => [
  ...arr.slice(0, start),
  ...items,
  ...arr.slice(start + count)
];

test('model should confirm an existence of Validate mixin', () => {
  const instance = createSimpleModel();

  expect(instance.hasMixin(mixValidate)).toBe(true);
});

test('model should confirm an existence of Rollback mixin', () => {
  const instance = createSimpleModel();

  expect(instance.hasMixin(mixRollback)).toBe(true);
});

test('has mixin should return false if mixin doesn`t exist', () => {
  const instance = createSimpleModel();

  expect(
    instance.hasMixin(() => {
      console.log('empty');
    })
  ).toBe(false);
});

test('touch should work after reset', () => {
  const instance = createSimpleModel();

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

test('validation does not work after destroy without direct touch', () => {
  const instance = createSimpleModel();

  instance.v.touch();

  expect(instance.v.c.name.dirtyMessage).toBe('Unexpected name length');

  instance.data.name = 'John';

  expect(instance.v.c.name.dirtyMessage).toBe('');

  instance.destroy();

  instance.data.name = '';

  expect(instance.v.c.name.dirtyMessage).toBe('');
});

test('touch should work after reset for a complex model', () => {
  const instance = createDeepModel();

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

  instance.data.phones = [...instance.data.phones, { value: '1234567890' }];

  expect(instance.v.c.phones.c[1].c.value.dirtyMessage).toBe('');
});

test('touch should work after rollback with simple model', () => {
  const instance = createSimpleModel();

  instance.data.name = 'John';
  instance.v.touch();

  expect(instance.v.c.name.dirty).toBe(true);
  expect(instance.v.c.name.invalid).toBe(false);

  instance.rollback();

  expect(instance.v.c.name.dirty).toBe(false);
  expect(instance.v.c.name.invalid).toBe(true);
  expect(instance.data.name).toBe('');

  instance.data.name = 'Jane';
  instance.v.touch();

  expect(instance.v.c.name.dirty).toBe(true);
  expect(instance.v.c.name.invalid).toBe(false);
});

test('touch should work after rollback', () => {
  const instance = createDeepModel();

  instance.data.phones = [{ value: '' }];
  instance.v.touch();

  expect(instance.v.dirty).toBe(true);
  expect(instance.v.c.email.dirty).toBe(true);
  expect(instance.v.c.email.dirtyMessage).toBe('invalid e-mail');
  expect(instance.v.c.phones.c[0].c.value.dirty).toBe(true);
  expect(instance.v.c.phones.c[0].c.value.dirtyMessage).toBe('invalid phone');

  instance.rollback();

  expect(instance.v.dirty).toBe(false);
  expect(instance.v.c.email.dirty).toBe(false);
  expect(instance.v.c.email.dirtyMessage).toBe('');
  expect(instance.v.c.phones.dirty).toBe(false);
  expect(instance.v.c.phones.dirtyMessage).toBe('');
  expect(instance.v.c.phones.c.length).toBe(0);

  instance.v.touch();

  expect(instance.v.dirty).toBe(true);
  expect(instance.v.c.email.dirty).toBe(true);
  expect(instance.v.c.email.dirtyMessage).toBe('invalid e-mail');
});

test('array neighbours should not be touched after adding a new neighbour', () => {
  let instance = createDeepModel(undefined, true, { mixinType: 'validate', autoTouch: true });

  instance.data.phones = [{ value: '' }];

  expect(instance.v.c.phones.c[0].dirty).toBe(false);
  expect(instance.v.c.phones.c[0].c.value.dirty).toBe(false);

  instance.data.phones = [...instance.data.phones, { value: '' }];

  expect(instance.v.c.phones.c[0].dirty).toBe(false);
  expect(instance.v.c.phones.c[1].dirty).toBe(false);

  instance.data.phones[1].value = '1234567890';

  expect(instance.v.c.phones.c[0].dirty).toBe(false);
  expect(instance.v.c.phones.c[1].dirty).toBe(true);
  expect(instance.v.c.phones.c[0].invalid).toBe(true);
  expect(instance.v.c.phones.c[1].invalid).toBe(false);

  instance.destroy();

  instance = createDeepModel(undefined, true, { mixinType: 'validate', autoTouch: true });
  instance.data.phones = [{ value: '1234567890' }, { value: '1234567890' }];
  instance.data.phones = [...instance.data.phones, { value: '' }];
  instance.data.phones[1].value = '123456789';

  expect(instance.v.c.phones.c[1].dirty).toBe(true);

  instance.data.phones = splice(instance.data.phones, 1, 1, { value: '' }, instance.data.phones[1]);

  expect(instance.v.c.phones.c[0].dirty).toBe(false);
  expect(instance.v.c.phones.c[1].dirty).toBe(false);
  expect(instance.v.c.phones.c[2].dirty).toBe(true);
  expect(instance.v.c.phones.c[2].invalid).toBe(true);
  expect(instance.v.c.phones.c[2].selfInvalid).toBe(false);
  expect(instance.v.c.phones.c[2].anyChildInvalid).toBe(true);
  expect(instance.v.c.phones.c[2].selfDirty).toBe(false);
  expect(instance.v.c.phones.c[2].anyChildDirty).toBe(true);
  expect(instance.v.c.phones.c[3].dirty).toBe(false);
  expect(instance.v.c.phones.invalid).toBe(true);
  expect(instance.v.invalid).toBe(true);
});

test('validation of simple array fields should use special methods', () => {
  const instance = createArrayModel(undefined, true, { mixinType: 'validate', autoTouch: true });

  instance.data.phones = ['1234567890', '0987654321', '', ''];

  for (let i = 0; i < 4; ++i) expect(instance.v.c.phones.c[i].dirty).toBe(false);

  instance.v.c.phones.c[1].reset();

  expect(instance.v.c.phones.c[1].dirty).toBe(false);

  instance.data.phones[1] = '0098765432';
  instance.v.c.phones.c[1].touch();

  expect(instance.v.c.phones.c[0].dirty).toBe(false);
  expect(instance.v.c.phones.c[1].dirty).toBe(true);
  expect(instance.v.c.phones.c[2].dirty).toBe(false);
  expect(instance.v.c.phones.c[3].dirty).toBe(false);

  instance.data.phones = [instance.data.phones[1], instance.data.phones[0]];

  for (let i = 0; i < 2; ++i) expect(instance.v.c.phones.c[i].invalid).toBe(false);

  expect(instance.v.c.phones.c[0].dirty).toBe(true);
  expect(instance.v.c.phones.c[1].dirty).toBe(true);

  instance.data.phones = [...instance.data.phones, ''];

  expect(instance.v.c.phones.c[2].dirty).toBe(false);
  expect(instance.v.c.phones.c[2].invalid).toBe(true);

  instance.data.phones = splice(instance.data.phones, 1, 2, instance.data.phones[2], instance.data.phones[1]);

  expect(instance.v.c.phones.c[1].invalid).toBe(true);
  expect(instance.v.c.phones.c[2].invalid).toBe(false);

  for (let i = 0; i < 3; ++i) expect(instance.v.c.phones.c[i].dirty).toBe(true);
});
