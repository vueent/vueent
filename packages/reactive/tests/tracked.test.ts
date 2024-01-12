import { tracked } from '@vueent/reactive';

import './__mocks__/vue-vm';

test('tracked property should be a ref when it is not defined', () => {
  class Calculable {
    @tracked accessor num!: number;
  }

  const instance = new Calculable();
  const expected = undefined;

  expect(instance.num).toBe(expected);
});
