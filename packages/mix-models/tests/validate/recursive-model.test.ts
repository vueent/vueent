import { create as createResursiveModel } from '../__mocks__/recursive-model';
import '../__mocks__/vue-vm';

test('validate mixin should support models wth recursive arrays', () => {
  const instance = createResursiveModel();

  instance.data.items.push({ name: 'world', items: [] });

  expect(instance.v.c.items.c[0].c.name.invalid).toBe(false);

  instance.v.c.items.c[0].c.name.touch();

  expect(instance.v.c.items.c[0].c.name.dirty).toBe(true);
});
