import VueCompositionApi from '@vue/composition-api';
import { Vue, isVue2, createApp, defineComponent } from 'vue-demi';

import { tracked, calculated } from '../src';

if (isVue2) Vue.use(VueCompositionApi);

createApp(
  defineComponent({
    name: 'App',
    render(createElement: Function) {
      return createElement('div', this.$slots.default);
    }
  })
);

function randomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

test('calculated property should be calculated synchronously', () => {
  class Calculable {
    @tracked num = 1;
    @calculated get mul() {
      return this.num * 2;
    }
  }

  const instance = new Calculable();
  const num = randomInt(1000);
  const expected = num * 2;

  instance.num = num;

  expect(instance.mul).toBe(expected);
});

test('calculated property must have a getter', () => {
  let error;

  try {
    class Calculable {
      @tracked num = 1;
      @calculated set mul(value: number) {
        console.log(value);
      }
    }

    new Calculable();
  } catch (e) {
    error = e;
  }

  expect(error && error.message).toBe('Getter must be defined for calculated property');
});

test('calculated property must support a setter', () => {
  class Calculable {
    factor = 2;
    @tracked num = 2;
    @calculated get mul() {
      return this.num * this.factor;
    }

    set mul(value: number) {
      this.factor = value;
    }
  }

  const instance = new Calculable();
  const factor = randomInt(100);
  const num = randomInt(100);
  const expected = num * factor;

  instance.mul = factor;
  instance.num = num;

  expect(instance.mul).toBe(expected);
});

test('calculated property should be initialized on the first access when the setter is available', () => {
  class Calculable {
    @tracked num = 2;
    @calculated get mul() {
      return this.num * 2;
    }

    set mul(value: number) {
      this.num = value;
    }
  }

  const instance = new Calculable();
  const num = randomInt(1000);
  const expected = num * 2;

  instance.num = num;

  expect(instance.mul).toBe(expected);
});

test('calculated property should not be initialized reinitialized on the access', () => {
  class Calculable {
    @tracked num = 2;
    @calculated get mul() {
      return this.num * 2;
    }

    set mul(value: number) {
      this.num = value;
    }
  }

  const instance = new Calculable();
  let num = randomInt(1000);
  let expected = num * 2;

  instance.num = num;

  expect(instance.mul).toBe(expected);

  num = randomInt(1000);
  instance.mul = num;
  expected = num * 2;

  expect(instance.mul).toBe(expected);
});

test('tracked property should be a ref when it is not defined', () => {
  class Calculable {
    @tracked num!: number;
  }

  const instance = new Calculable();
  const expected = undefined;

  expect(instance.num).toBe(expected);
});
