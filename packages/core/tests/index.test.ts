import { initVueent } from '@vueent/core';

test('VueEnt instance should be created automatically on the first call', () => {
  const { useVueent } = initVueent();
  const vueent = useVueent();

  expect(vueent).not.toBe(undefined);
  expect(vueent.getController).not.toBe(undefined);
});
