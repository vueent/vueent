import { StoreService } from '@vueent/store';

import { EncodedData as EncodedUserData, UsersCollection } from './user';
import { EncodedData as EncodedArticleData, ArticlesCollection } from './article';

export class ProjectStoreService extends StoreService<UsersCollection | ArticlesCollection> {
  constructor(serverStores: {
    users: {
      mapStore: Map<number, EncodedUserData>;
      getNewPk: () => number;
    };
    articles: {
      mapStore: Map<number, EncodedArticleData>;
      getNewPk: () => number;
    };
  }) {
    super([
      new UsersCollection(serverStores.users.mapStore, serverStores.users.getNewPk),
      new ArticlesCollection(serverStores.articles.mapStore, serverStores.articles.getNewPk)
    ]);
  }
}
