import { Controller, Service, initVueent } from '@vueent/core';

test('controllers and services must be singletons', () => {
  class Controller1 extends Controller {}
  class Controller2 extends Controller {}
  class Service1 extends Service {}
  class Service2 extends Service {}

  const unmountedHandlers: Array<() => void> = [];
  const onUnmounted = (fn: () => void) => {
    unmountedHandlers.push(fn);
  };

  const vueent = initVueent({ onUnmounted });

  vueent.registerService(Service1);
  vueent.registerService(Service2);
  vueent.registerController(Controller1);
  vueent.registerController(Controller2);

  const c10 = vueent.useController(Controller1);
  const c20 = vueent.useController(Controller2);
  const c11 = vueent.useController(Controller1);
  const c21 = vueent.useController(Controller2);

  expect(c10).toBe(c11);
  expect(c20).toBe(c21);

  const s10 = vueent.useService(Service1);
  const s20 = vueent.useService(Service2);
  const s11 = vueent.useService(Service1);
  const s21 = vueent.useService(Service2);

  expect(s10).toBe(s11);
  expect(s20).toBe(s21);

  unmountedHandlers[1]();

  const c22 = vueent.useController(Controller2);
  const c23 = vueent.useController(Controller2);

  expect(c22).toBe(c23);
  expect(c22).not.toBe(c20);
});
