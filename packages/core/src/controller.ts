import type { BoundUseVueentFunc } from './vueent';

/**
 * An abstract base controller class.
 *
 * Each controller is a singleton and must extend the base controller or its descendant.
 */
export abstract class Controller {
  /**
   * Is called when the component is being prepared to be mounted, i.e. `onBeforeMount`.
   */
  public init() {
    // nope
  }

  /**
   * Is called when the component is mounted, i.e. `onMounted`.
   */
  public mounted() {
    // nope
  }

  /**
   * Is called when the component is being prepated to be unmounted, i.e. `onBeforeUnmount`.
   */
  public reset() {
    // nope
  }

  /**
   * Is called when the component has been unmounted, i.e. `onUnmounted`.
   */
  public destroy() {
    // nope
  }

  /**
   * Is called when the component is being prepared to be updated, i.e. `onBeforeUpdate`.
   */
  public willUpdate() {
    // nope
  }

  /**
   * Is called when the component has been updated, i.e. `onUpdated`.
   */
  public updated() {
    // nope
  }

  /**
   * Is called when the component is inserted into the DOM as part of a tree cached by `<KeepAlive>`, i.e. `onActivated`.
   */
  public activated() {
    // nope
  }

  /**
   * Is called when the component is removed from the DOM as part of a tree cached by `<KeepAlive>`, i.e. `onDeactivated`.
   */
  public deactivated() {
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
 * ATTENTION: This is a legacy decorator implementation.
 *
 * @param useVueent - Vueent instance accessor
 * @param create - controller constructor
 * @returns - property with a controller reference
 */
export function legacyInject<T extends Controller = Controller>(useVueent: BoundUseVueentFunc, create: Constructor<T>) {
  return function (target: unknown, propertyKey: string | symbol) {
    Object.defineProperty(target, propertyKey, {
      get() {
        return useVueent().getController(create, false);
      }
    });
  };
}

/**
 * Creates a property with a reference to the controller.
 *
 * The function will automatically lazy instantiate the controller if it hasn't already been instantiated.
 *
 * @param useVueent - Vueent instance accessor
 * @param create - controller constructor
 * @returns - property with a controller reference
 */
export function inject<T extends Controller = Controller>(useVueent: BoundUseVueentFunc, create: Constructor<T>) {
  return function <This = unknown>(
    target: ClassAccessorDecoratorTarget<This, T>, // eslint-disable-line @typescript-eslint/no-unused-vars
    context: ClassAccessorDecoratorContext<This, T> // eslint-disable-line @typescript-eslint/no-unused-vars
  ): ClassAccessorDecoratorResult<This, T> {
    return {
      get(this: This): T {
        return useVueent().getController(create, false);
      }
    };
  };
}

/**
 * Registers a controller in a vueent instance.
 *
 * This operation is necessary to access the controller instance via
 * {@link inject} decorator or {@link use} function.
 *
 * @param useVueent - Vueent instance accessor
 * @param create - controller constructor
 */
export function register<T extends Controller = Controller>(useVueent: BoundUseVueentFunc, create: Constructor<T>) {
  useVueent().registerController(create);
}

/**
 * Returns a controller instance.
 *
 * Due to the singleton nature of controllers, the function may instantiate the controller
 * if it hasn't already been instantiated.
 * If the controller hasn't been instantiated yet, the parameters will be passed to its constructor.
 *
 * @param useVueent - Vueent instance accessor
 * @param create - controller constructor
 * @param inSetupContext - marks that the controller is used inside the component's setup function
 * @param params - constructor parameters
 * @returns - controller instance
 */
export function use<T extends Controller = Controller>(
  useVueent: BoundUseVueentFunc,
  create: Constructor<T>,
  inSetupContext = true,
  ...params: Params<T>
) {
  return useVueent().getController(create, inSetupContext, ...params);
}
