import { toRef } from 'vue-demi';

import { create as createWrapperModel } from '../__mocks__/wrapper-model';
import { create as createSimpleModel } from '../__mocks__/simple-model';
import '../__mocks__/vue-vm';

test('model should accept extenral validations', () => {
  const wrapper = createWrapperModel();
  const simple = createSimpleModel(toRef(wrapper.data, 'child'), true, wrapper.v.c.child);

  expect(simple.data.name).toBe(wrapper.data.child.name);
  expect(simple.v.c.name.dirty).toBe(false);
  expect(simple.v.c.name.invalid).toBe(true);
  expect(wrapper.v.c.child.c.name.dirty).toBe(false);
  expect(wrapper.v.c.child.c.name.invalid).toBe(true);

  wrapper.data.child.name = 'hello';
  wrapper.v.c.child.c.name.touch();

  expect(simple.data.name).toBe('hello');
  expect(simple.v.c.name.dirty).toBe(true);
  expect(simple.v.c.name.invalid).toBe(false);

  wrapper.data.child = { name: '' };

  expect(simple.data.name).toBe('');
  expect(simple.v.c.name.invalid).toBe(true);

  wrapper.data.child.name = 'world';
  wrapper.v.c.child.c.name.touch();

  expect(simple.data.name).toBe('world');
  expect(simple.v.c.name.invalid).toBe(false);
});
