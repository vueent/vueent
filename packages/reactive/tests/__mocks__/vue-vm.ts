import VueCompositionApi from '@vue/composition-api';
import { Vue, isVue2, createApp, defineComponent } from 'vue-demi';

let VueInstance: unknown | undefined;

if (!VueInstance) {
  if (isVue2) Vue.use(VueCompositionApi);

  VueInstance = createApp(
    defineComponent({
      name: 'App',
      render(createElement: Function) {
        return createElement('div', this.$slots.default);
      }
    })
  );
}

export default VueInstance;
