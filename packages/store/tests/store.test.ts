import { initVueent } from '@vueent/core';
import { Store } from '@vueent/store';

import './__mocks__/vue-vm';
import { EncodedData as EncodedStorableData, StorableCollection } from './__mocks__/storable';
import { EncodedData as EncodedUserData, UsersCollection } from './__mocks__/user';
import { EncodedData as EncodedArticleData, ArticlesCollection } from './__mocks__/article';
import { ProjectStoreService } from './__mocks__/project-store-service';

test('store provides an access to multiple collections', async () => {
  let userPkCounter = 0;
  const getNewUserPk = () => ++userPkCounter;
  const userServerStore = new Map<number, EncodedUserData>();

  let storablePkCounter = 0;
  const getNewStorablePk = () => ++storablePkCounter;
  const storableServerStore = new Map<number, EncodedStorableData>();

  const store = new Store([
    new StorableCollection(storableServerStore, getNewStorablePk),
    new UsersCollection(userServerStore, getNewUserPk)
  ]);

  const uBob = store.get(UsersCollection).create();

  uBob.data.firstName = 'Bob';
  uBob.data.lastName = 'Doe';
  uBob.data.age = '33';

  expect(uBob.new).toBe(true);
  expect(uBob.dirty).toBe(true);

  await uBob.save();

  expect(uBob.new).toBe(false);
  expect(uBob.dirty).toBe(false);
  expect(uBob.pk).toBe(1);

  const uAlice = store.get(UsersCollection).create();

  uAlice.data.firstName = 'Alice';
  uAlice.data.lastName = 'Doe';
  uAlice.data.age = '32';

  expect(uAlice.new).toBe(true);
  expect(uAlice.dirty).toBe(true);

  await uAlice.save();

  expect(uAlice.new).toBe(false);
  expect(uAlice.dirty).toBe(false);
  expect(uAlice.pk).toBe(2);

  const uJohn = store.get(UsersCollection).create({
    id: 0,
    firstName: 'John',
    lastName: 'Smith',
    age: '60'
  });

  await uJohn.save();

  store.get(UsersCollection).unloadAll();

  const sBob = store.get(StorableCollection).create();

  sBob.data.name = 'Bob';
  await sBob.save();

  expect(sBob.pk).toBe(1);

  const usersResult = await store.get(UsersCollection).find({ queryParams: { lastName: 'Doe' } });

  expect(usersResult.length).toBe(2);
  expect(usersResult.some(u => u.data.firstName === 'Bob')).toBe(true);
  expect(usersResult.some(u => u.data.firstName === 'Alice')).toBe(true);
});

test('store service works', async () => {
  let userPkCounter = 0;
  const getNewUserPk = () => ++userPkCounter;
  const userServerStore = new Map<number, EncodedUserData>();

  let articlePkCounter = 0;
  const getNewArticlePk = () => ++articlePkCounter;
  const articleServerStore = new Map<number, EncodedArticleData>();

  const vueent = initVueent();

  vueent.useVueent();
  vueent.registerService(ProjectStoreService);

  const store = vueent.useService(ProjectStoreService, {
    users: {
      mapStore: userServerStore,
      getNewPk: getNewUserPk
    },
    articles: {
      mapStore: articleServerStore,
      getNewPk: getNewArticlePk
    }
  });

  const uBob = store.get(UsersCollection).create();

  uBob.data.firstName = 'Bob';
  uBob.data.lastName = 'Doe';
  uBob.data.age = '33';

  expect(uBob.new).toBe(true);
  expect(uBob.dirty).toBe(true);

  await uBob.save();

  expect(uBob.new).toBe(false);
  expect(uBob.dirty).toBe(false);
  expect(uBob.pk).toBe(1);

  const uAlice = store.get(UsersCollection).create();

  uAlice.data.firstName = 'Alice';
  uAlice.data.lastName = 'Doe';
  uAlice.data.age = '32';

  expect(uAlice.new).toBe(true);
  expect(uAlice.dirty).toBe(true);

  await uAlice.save();

  expect(uAlice.new).toBe(false);
  expect(uAlice.dirty).toBe(false);
  expect(uAlice.pk).toBe(2);

  const usersResult = await store.get(UsersCollection).find({ queryParams: { lastName: 'Doe' } });

  expect(usersResult.length).toBe(2);
  expect(usersResult.some(u => u.data.firstName === 'Bob')).toBe(true);
  expect(usersResult.some(u => u.data.firstName === 'Alice')).toBe(true);

  const aliceNotes = store.get(ArticlesCollection).create({
    id: 0,
    authorId: uAlice.data.id,
    title: "Alice's notes",
    text: "Alice's notes will be placed here.",
    publishedAt: Date.now()
  });

  await aliceNotes.save();

  expect(aliceNotes.pk).toBe(1);

  const bobNotes = store.get(ArticlesCollection).create({
    id: 0,
    authorId: uBob.data.id,
    title: "Bob's notes",
    text: "Bob's notes will be placed here.",
    publishedAt: Date.now()
  });

  await bobNotes.save();

  expect(bobNotes.pk).toBe(2);

  store.get(ArticlesCollection).unloadAll();

  const allNotes = await store.get(ArticlesCollection).find();

  expect(allNotes.length).toBe(2);
  expect(allNotes.some(n => n.data.title === "Bob's notes")).toBe(true);
  expect(allNotes.some(n => n.data.authorId === 2)).toBe(true);
});
