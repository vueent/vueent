import { tracked } from '@vueent/reactive';

import './vue-vm';

test('tracked property should be a ref when it is not defined', () => {
  class Calculable {
    @tracked num!: number;
  }

  const instance = new Calculable();
  const expected = undefined;

  expect(instance.num).toBe(expected);
});
