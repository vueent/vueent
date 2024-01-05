import { create } from './__mocks__/random-mixed-model';
import './__mocks__/vue-vm';

test('custom mixin should work', () => {
  const instance = create();

  instance.data.value = instance.rand;

  expect(instance.data.value).not.toBe(0);

  instance.destroy();
});
