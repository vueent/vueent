import { Controller, Service, initVueent } from '@vueent/core';

test('it injecting services', () => {
  const vueent = initVueent({ persistentControllers: true });

  class SharedService extends Service {
    public title = '';
  }

  vueent.registerService(SharedService);

  class AppController extends Controller {
    @vueent.injectService(SharedService) private accessor shared!: SharedService;

    public get title() {
      return this.shared.title;
    }

    public set title(value) {
      this.shared.title = value;
    }

    constructor() {
      super();

      this.shared.title = 'App';
    }
  }

  vueent.registerController(AppController);

  class HomeController extends Controller {
    @vueent.injectController(AppController) private accessor app!: AppController;

    public get title() {
      return this.app.title;
    }

    public set title(value) {
      this.app.title = value;
    }
  }

  vueent.registerController(HomeController);

  const homeCtrl = vueent.useController(HomeController);

  expect(homeCtrl.title).toBe('App');

  homeCtrl.title = 'Home';

  expect(homeCtrl.title).toBe('Home');

  const appCtrl = vueent.useController(AppController);

  expect(appCtrl.title).toBe('Home');

  const sharedSrv = vueent.useService(SharedService);

  expect(sharedSrv.title).toBe('Home');

  appCtrl.title = 'App';

  expect(homeCtrl.title).toBe('App');
});
