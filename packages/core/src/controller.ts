import { useVueent } from './vueent';

/**
 * An abstract base controller class.
 *
 * Each controller is a singleton must extend the base controller or its descendant.
 */
export abstract class Controller {
  /**
   * Is called when the component is being prepared to be mounted, i.e. `onBeforeMount`.
   */
  public init() {
    // nope
  }

  /**
   * Is called when the component is being prepated to be unmounted, i.e. `onBeforeUnmount`.
   */
  public reset() {
    // nope
  }

  /**
   * Is called when the component is has been unmounted, i.e. `onUnmounted`.
   */
  public destroy() {
    // nope
  }
}

export type Constructor<T extends Controller = Controller> = new (...args: any[]) => T;

export type Params<T extends Controller = Controller> = ConstructorParameters<Constructor<T>>;

/**
 * Creates a property with a reference to the controller.
 *
 * The function will automatically lazy instantiate the controller if it hasn't already been instantiated.
 *
 * @param create - controller constructor
 * @returns - property with a controller reference
 */
export function inject<T extends Controller = Controller>(create: Constructor<T>) {
  return function(target: unknown, propertyKey: string | symbol) {
    Object.defineProperty(target, propertyKey, {
      get() {
        return useVueent().getController(create);
      }
    });
  };
}

/**
 * Registers a controller in the vueent instance.
 *
 * This operation is necessary to access the controller instance via
 * {@link inject} decorator or {@link use} function.
 *
 * @param create - controller constructor
 */
export function register<T extends Controller = Controller>(create: Constructor<T>) {
  useVueent().registerController(create);
}

/**
 * Returns a controller instance.
 *
 * Due to the singleton nature of controllers, the function may instantiate the controller
 * if it hasn't already been instantiated.
 *
 * @param create - controller constructor
 * @param params - constructor params
 * @returns controller instance
 */
export function use<T extends Controller = Controller>(create: Constructor<T>, ...params: Params<T>) {
  return useVueent().getController(create, ...params);
}
