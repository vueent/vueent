import { useVueent, ControllerConstructor } from './vueent';

export abstract class Controller {
  public init() {
    // nope
  }

  public reset() {
    // nope
  }

  public destroy() {
    // nope
  }
}

export function inject<T extends Controller = Controller>(create: ControllerConstructor<T>) {
  return function(target: unknown, propertyKey: string | symbol) {
    Object.defineProperty(target, propertyKey, {
      get() {
        return useVueent().getController(create);
      }
    });
  };
}

export function register<T extends Controller = Controller>(create: ControllerConstructor<T>) {
  useVueent().registerController(create);
}

export function use<T extends Controller = Controller>(create: ControllerConstructor<T>) {
  return useVueent().getController(create);
}
