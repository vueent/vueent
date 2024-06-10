import { Vueent, useVueent, VueentOptions } from './vueent';
import {
  Service,
  Constructor as ServiceConstructor,
  Params as ServiceParams,
  register as registerService,
  legacyInject as legacyInjectService,
  inject as injectService,
  use as useService
} from './service';
import {
  Controller,
  Constructor as ControllerConstructor,
  Params as ControllerParams,
  register as registerController,
  legacyInject as legacyInjectController,
  inject as injectController,
  use as useController
} from './controller';

export interface InitResult {
  /**
   * Returns an instance of Vueent class.
   *
   * An instance will be created automatically.
   *
   * @returns - {@link Vueent} instance
   */
  useVueent(): Vueent;

  /**
   * Registers a service in a vueent instance.
   *
   * This operation is necessary to access the service instance via
   * {@link injectService} decorator or {@link useService} function.
   *
   * @param create - service constructor
   */
  registerService<T extends Service = Service>(create: ServiceConstructor<T>): void;

  /**
   * Creates a property with a reference to the service.
   *
   * The function will automatically lazy instantiate the service if it hasn't already been instantiated.
   * If the service hasn't been instantiated yet, the parameters will be passed to its constructor.
   *
   * @param create - service constructor
   * @param params - constructor parameters
   * @returns - property with a service reference
   */
  legacyInjectService<T extends Service = Service>(
    create: ServiceConstructor<T>,
    ...params: ServiceParams<T>
  ): (target: unknown, propertyKey: string | symbol) => void;

  /**
   * Creates a property with a reference to the service.
   *
   * The function will automatically lazy instantiate the service if it hasn't already been instantiated.
   * If the service hasn't been instantiated yet, the parameters will be passed to its constructor.
   *
   * @param create - service constructor
   * @param params - constructor parameters
   * @returns - property with a service reference
   */
  injectService<T extends Service = Service>(
    create: ServiceConstructor<T>,
    ...params: ServiceParams<T>
  ): ReturnType<typeof injectService<T>>;

  /**
   * Returns a service instance.
   *
   * Due to the singleton nature of services, the function may instantiate the service
   * if it hasn't already been instantiated.
   * If the service hasn't been instantiated yet, the parameters will be passed to its constructor.
   *
   * @param create - service constructor
   * @param params - constructor parameters
   * @returns - service instance
   */
  useService<T extends Service = Service>(create: ServiceConstructor<T>, ...params: ServiceParams<T>): T;

  /**
   * Registers a controller in a vueent instance.
   *
   * This operation is necessary to access the controller instance via
   * {@link inject} decorator or {@link use} function.
   *
   * @param create - controller constructor
   */
  registerController<T extends Controller = Controller>(create: ControllerConstructor<T>): void;

  /**
   * Creates a property with a reference to the controller.
   *
   * The function will automatically lazy instantiate the controller if it hasn't already been instantiated.
   *
   * @param create - controller constructor
   * @returns - property with a controller reference
   */
  legacyInjectController<T extends Controller = Controller>(
    create: ControllerConstructor<T>
  ): (target: unknown, propertyKey: string | symbol) => void;

  /**
   * Creates a property with a reference to the controller.
   *
   * The function will automatically lazy instantiate the controller if it hasn't already been instantiated.
   *
   * @param create - controller constructor
   * @returns - property with a controller reference
   */
  injectController<T extends Controller = Controller>(create: ControllerConstructor<T>): ReturnType<typeof injectController<T>>;

  /**
   * Returns a controller instance.
   *
   * Due to the singleton nature of controllers, the function may instantiate the controller
   * if it hasn't already been instantiated.
   * If the controller hasn't been instantiated yet, the parameters will be passed to its constructor.
   *
   * @param create - controller constructor
   * @param inSetupContext - marks that the controller is used inside the component's setup function
   * @param params - constructor parameters
   * @returns - controller instance
   */
  useController<T extends Controller = Controller>(
    create: ControllerConstructor<T>,
    inSetupContext?: boolean,
    ...params: ControllerParams<T>
  ): T;
}

/**
 * Prepares a project-bound vueent context.
 *
 * @param options - vueent options
 * @returns - project-bound functions
 */
export function initVueent(options: VueentOptions = {}): InitResult {
  const context: { vueent?: Vueent; options: VueentOptions } = { vueent: undefined, options };
  const use = useVueent.bind(undefined, context);

  return {
    useVueent: use,
    registerService: registerService.bind(undefined, use),
    legacyInjectService: legacyInjectService.bind(undefined, use),
    injectService: injectService.bind(undefined, use) as InitResult['injectService'],
    useService: useService.bind(undefined, use) as InitResult['useService'],
    registerController: registerController.bind(undefined, use),
    legacyInjectController: legacyInjectController.bind(undefined, use),
    injectController: injectController.bind(undefined, use) as InitResult['injectController'],
    useController: useController.bind(undefined, use) as InitResult['useController']
  };
}
