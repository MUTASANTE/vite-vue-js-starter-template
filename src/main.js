import App from './App.vue';
import router from './router';
import store from './store';
import { init } from './conf';
import { configure, defineRule, Form } from 'vee-validate';
import { localize, setLocale } from '@vee-validate/i18n';
import { all } from '@vee-validate/rules';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createBootstrap } from 'bootstrap-vue-next';
import axios from 'axios';

import { createApp } from 'vue';

const app = createApp(App);

setLocale('fr');

configure({
  generateMessage: localize('fr'),
  // https://vee-validate.logaretm.com/v2/guide/interaction.html
  // https://vee-validate.logaretm.com/v4/guide/components/validation/#customizing-validation-triggers
  validateOnBlur: true, // controls if `blur` events should trigger validation with `handleChange` handler
  validateOnChange: true, // controls if `change` events should trigger validation with `handleChange` handler
  validateOnInput: false, // controls if `input` events should trigger validation with `handleChange` handler
  validateOnModelUpdate: true // controls if `update:modelValue` events should trigger validation with `handleChange` handler
});

// import all known VeeValidate rules
Object.entries(all).forEach(([name, rule]) => {
  defineRule(name, rule);
});

app.component('VeeForm', Form);
app.component('FontAwesomeIcon', FontAwesomeIcon);

// Support Ajax-like requests. Note that adding the X-Requested-With header
// makes the request "unsafe" (as defined by CORS), and will trigger a preflight request,
// which may not always be desirable.
// See https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
//axios.defaults.withCredentials = true;

init(app, axios);

app.use(createBootstrap());
app.use(router);
app.use(store);

// https://medium.com/vue-mastery/vue-router-4-route-params-not-available-on-created-setup-2f29e13a0d97
//app.mount('#app');
router.isReady().then(() => {
  app.mount('#app');
});
