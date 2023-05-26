import { Options } from '@vueent/mix-models';

import { create, weakValidations } from '../__mocks__/credentials-model';
import '../__mocks__/vue-vm';

test('instance-specified validation rules should be used', () => {
  const instance = create(undefined, true, { mixinType: 'validate', pattern: weakValidations } as Options);

  instance.v.touch(); // validation check won't be triggered without a manual touch

  expect(instance.v.c.first.invalid).toBe(false);

  const instance2 = create();

  expect(instance2.v.c.first.invalid).toBe(true);

  instance2.data.first = 'John';

  instance2.v.touch();

  expect(instance2.v.c.first.invalid).toBe(false);

  instance.destroy();
  instance2.destroy();
});
