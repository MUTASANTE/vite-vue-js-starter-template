import {
  createRouter,
  createWebHistory,
  createWebHashHistory
} from 'vue-router';
import { detectIE } from './services/auth.compat';
import qs from 'qs';

export const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('./views/AboutView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/components/ComponentNotFound.vue')
  }
];

// XXX : bug sous Edge !!! A remonter à vue-router ?
// Voir également https://github.com/vuejs/vue-router/pull/2774
if (detectIE() && window.history?.replaceState) {
  const oldReplaceState = window.history.replaceState;
  window.history.replaceState = function (...args) {
    var matches;
    const newArgs = [...args];
    if (
      newArgs.length >= 3 &&
      newArgs[2] &&
      // Il faut supprimer le lecteur Windows de chaque Url "locale" (de type file:)
      // sinon "window.history.replaceState(stateCopy, '', absolutePath);"
      // dans la fonction setupScroll() de Vue-router ne fonctionnera pas !
      (matches = /^\/[A-Z]:(\/.*)$/gi.exec(newArgs[2].toString())) &&
      matches.length == 2
    ) {
      newArgs[2] = matches[1];
    }
    return oldReplaceState.apply(this, newArgs);
  };
}

const router = createRouter({
  routes,
  history:
    import.meta.env.VITE_ROUTE_MODE !== 'hash'
      ? createWebHistory(import.meta.env.BASE_URL)
      : createWebHashHistory(import.meta.env.BASE_URL),
  // https://cli.vuejs.org/config/#publicpath
  scrollBehavior(to, from, savedPosition) {
    if (to.hash && import.meta.env.VITE_ROUTE_MODE !== 'hash') {
      return { selector: to.hash };
    }
    if (savedPosition) {
      return savedPosition;
    }
  },
  // https://github.com/vuejs/vue-router/issues/1259#issuecomment-306000548
  // permet d'utiliser des objets en tant que "query" :
  parseQuery(query) {
    return qs.parse(query);
  },
  stringifyQuery(query) {
    return qs.stringify(query);
  }
});

export default router;
