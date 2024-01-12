export {
  Service,
  Constructor as ServiceConstructor,
  Params as ServiceParams,
  register as registerService,
  use as useService,
  legacyInject as legacyInjectService,
  inject as injectService
} from './service';

export {
  Controller,
  Constructor as ControllerConstructor,
  Params as ControllerParams,
  register as registerController,
  use as useController,
  legacyInject as legacyInjectController,
  inject as injectController
} from './controller';

export { Vueent, ServiceRegistry, ControllerRegistry, useVueent } from './vueent';
export { initVueent, InitResult } from './init';
