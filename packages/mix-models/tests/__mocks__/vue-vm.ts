import VueCompositionApi from '@vue/composition-api';
import { Vue, isVue2, createApp, defineComponent } from 'vue-demi';

if (isVue2) Vue.use(VueCompositionApi);

const VueInstance: unknown = createApp(
  defineComponent({
    name: 'App',
    render(createElement: Function) {
      return createElement('div', this.$slots.default);
    }
  })
);

export default VueInstance;
