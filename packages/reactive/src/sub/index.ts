import { tracked } from '@vueent/reactive';

class MyClass {
  @tracked public num = 0;
}

const my = new MyClass();

console.log(my);
