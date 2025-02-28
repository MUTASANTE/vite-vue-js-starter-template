// eslint-disable-next-line
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:81/tp/PHPDemoGeremi';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
//axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
//axios.defaults.withCredentials = true;

export default {
  state: {},
  getters: {},
  mutations: {},
  actions: {}
};
