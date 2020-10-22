import { create as createConditionalModel } from '../__mocks__/conditional-model';
import '../__mocks__/vue-vm';

test('email field should be required only if the name is not set', () => {
  const instance = createConditionalModel();

  expect(instance.v.c.email.invalid).toBe(true);

  instance.data.name = 'John Doe';

  instance.v.touch(); // validation check won't be triggered without a manual touch

  expect(instance.v.c.name.invalid).toBe(false);
  expect(instance.v.c.email.invalid).toBe(false);
});
