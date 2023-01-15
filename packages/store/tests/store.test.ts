import { Store } from '@vueent/store';

import './__mocks__/vue-vm';
import { EncodedData as StorableEncodedData, StorableCollection } from './__mocks__/storable';
import { EncodedData as UserEncodedData, UserCollection } from './__mocks__/user';

test('store provides an access to multiple collections', async () => {
  let userPkCounter = 0;
  const getNewUserPk = () => ++userPkCounter;
  const userServerStore = new Map<number, UserEncodedData>();

  let storablePkCounter = 0;
  const getNewStorablePk = () => ++storablePkCounter;
  const storableServerStore = new Map<number, StorableEncodedData>();

  const store = new Store([
    new StorableCollection(storableServerStore, getNewStorablePk),
    new UserCollection(userServerStore, getNewUserPk)
  ]);

  const uBob = store.get(UserCollection).create();

  uBob.data.firstName = 'Bob';
  uBob.data.lastName = 'Doe';
  uBob.data.age = '33';

  expect(uBob.new).toBe(true);
  expect(uBob.dirty).toBe(true);

  await uBob.save();

  expect(uBob.new).toBe(false);
  expect(uBob.dirty).toBe(false);
  expect(uBob.pk).toBe(1);

  const uAlice = store.get(UserCollection).create();

  uAlice.data.firstName = 'Alice';
  uAlice.data.lastName = 'Doe';
  uAlice.data.age = '32';

  expect(uAlice.new).toBe(true);
  expect(uAlice.dirty).toBe(true);

  await uAlice.save();

  expect(uAlice.new).toBe(false);
  expect(uAlice.dirty).toBe(false);
  expect(uAlice.pk).toBe(2);

  const uJohn = store.get(UserCollection).create({
    id: 0,
    firstName: 'John',
    lastName: 'Smith',
    age: '60'
  });

  await uJohn.save();

  store.get(UserCollection).unloadAll();

  const sBob = store.get(StorableCollection).create();

  sBob.data.name = 'Bob';
  await sBob.save();

  expect(sBob.pk).toBe(1);

  const usersResult = await store.get(UserCollection).find({ queryParams: { lastName: 'Doe' } });

  expect(usersResult.length).toBe(2);
  expect(usersResult.some(u => u.data.firstName === 'Bob')).toBe(true);
  expect(usersResult.some(u => u.data.firstName === 'Alice')).toBe(true);
});
