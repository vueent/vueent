import { useVueent } from '@vueent/core';

test('VueenT instance should be created automatically on the first call', () => {
  const vueent = useVueent();

  expect(vueent).not.toBe(undefined);
  expect(vueent.getController).not.toBe(undefined);
});
