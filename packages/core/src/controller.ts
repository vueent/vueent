import { useVueent } from './vueent';

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

export type Constructor<T extends Controller = Controller> = new (...args: any[]) => T;

export type Params<T extends Controller = Controller> = ConstructorParameters<Constructor<T>>;

export function inject<T extends Controller = Controller>(create: Constructor<T>) {
  return function(target: unknown, propertyKey: string | symbol) {
    Object.defineProperty(target, propertyKey, {
      get() {
        return useVueent().getController(create);
      }
    });
  };
}

export function register<T extends Controller = Controller>(create: Constructor<T>) {
  useVueent().registerController(create);
}

export function use<T extends Controller = Controller>(create: Constructor<T>, ...params: Params<T>) {
  return useVueent().getController(create, ...params);
}
