import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

const statusHandler = () => {
  if (typeof console !== 'undefined') console.clear();
};

/**
 * Permet de configurer dans ce projet :
 * - activation de l'autoloading des fichiers components .vue
 * - correction de l'erreur jQuery "Cannot read property 'fn' of undefined in VueJS"
 * - utilisation du plugin Axios (pour les requêtes serveur asynchrones)
 * @param {*} app application qui sera "mount-é" et affiché
 * @param {*} axios objet axios qui sera utilisé
 * @param {boolean} autoloadComponents ajout/maj de l'autoloading de composants Vue.js ou non
 * @param {*} jQuery objet jQuery qui sera utilisé (obsolète et redondant avec les capacités natives de Vue.js)
 *
 * NB : ne doit être appelé qu'une seule fois dans l'application Vue.js (idéalement dans main.js) !
 */
export function init(
  app,
  axios = null,
  autoloadComponents = true,
  jQuery = null
) {
  // https://github.com/webpack/webpack-dev-server/issues/565
  if (import.meta.env.VITE_DEBUG_MODE && import.meta.hot) {
    import.meta.hot.accept(); // already had this init code

    import.meta.hot.off('vite:beforeUpdate', statusHandler);
    import.meta.hot.on('vite:beforeUpdate', statusHandler);

    app.config.performance = !!import.meta.env.VITE_DEBUG_PERFORMANCE;

    app.config.warnHandler = function (msg, vm, trace) {
      if (console) console.error('warnHandler', msg, trace);
      typeof window !== 'undefined' &&
        alert(`ERROR(warnHandler): ${msg}, ${trace}`);
    };

    app.config.errorHandler = function (msg, vm, trace) {
      if (console) console.error('errorHandler', msg, trace);
      typeof window !== 'undefined' &&
        alert(`ERROR(errorHandler): ${msg}, ${trace}`);
    };

    if (typeof window !== 'undefined' && !window.onunhandledrejection) {
      window.onunhandledrejection = event => {
        if (console) console.error('onunhandledrejection', event.reason);
        alert(`ERROR(onunhandledrejection): ${event.reason}`);
      };
    }

    if (typeof window !== 'undefined' && !window.onerror) {
      // https://developer.mozilla.org/fr/docs/Web/API/GlobalEventHandlers/onerror
      // https://www.raymondcamden.com/2019/05/01/handling-errors-in-vuejs
      window.onerror = function (msg, url, lineNo, columnNo, error) {
        const message = [
          'Message: ' + msg,
          'URL: ' + url,
          'Line: ' + lineNo,
          'Column: ' + columnNo,
          'Error object: ' + JSON.stringify(error)
        ].join(' - ');
        if (console) console.error('onerror', message);
        const string = msg.toLowerCase();
        const substring = 'script error';
        if (string.indexOf(substring) > -1) {
          alert('ERROR(onerror): Script Error: See Browser Console for Detail');
        } else {
          alert(`ERROR(onerror): ${message}`);
        }
        return false;
      };
    }
  } else {
    app.config.warnHandler = function (msg, vm, trace) {
      if (console) console.error('warnHandler', msg, trace);
    };

    app.config.errorHandler = function (msg, vm, trace) {
      if (console) console.error('errorHandler', msg, trace);
    };

    if (typeof window !== 'undefined' && !window.onunhandledrejection) {
      window.onunhandledrejection = event => {
        if (console) console.error('onunhandledrejection', event.reason);
      };
    }
  }

  if (axios) {
    initAxios(axios);
  }

  // https://stackoverflow.com/questions/52548556/cannot-read-property-fn-of-undefined-in-vuejs
  // https://medium.com/code4mk-org/how-to-use-jquery-inside-vue-add-other-js-library-inside-vue-9eea8fbd0416
  if (jQuery && typeof window !== 'undefined' && !window.jQuery) {
    window.jQuery = jQuery;
  }

  if (!autoloadComponents) {
    return;
  }

  // https://zerotomastery.io/blog/how-to-auto-register-components-for-vue-with-vite/
  // https://vitejs.dev/guide/migration.html#removed-deprecated-apis
  const componentFiles = import.meta.glob(
    [
      './components/*.vue',
      // (!) src/components/ComponentNotFound.vue is dynamically imported by src/navigation/routes.js
      // but also statically imported by src/conf.js, dynamic import will not move module into another chunk.
      '!./components/ComponentNotFound.vue'
    ],
    {
      import: 'default',
      eager: true
    }
  );

  Object.entries(componentFiles).forEach(([path, m]) => {
    const componentName = upperFirst(
      camelCase(
        path
          .split('/')
          .pop()
          .replace(/\.\w+$/, '')
      )
    );
    if (import.meta.env.VITE_DEBUG_MODE && console)
      console.log(`Autoload ${componentName} depuis "${path}"`);
    app.component(componentName, m);
  });
}

/**
 * Permet de configurer une instance spécifique de l'objet axios.
 * La méthode init2() peut être appelée en complément de cette méthode, par exemple :
 * const axiosInstance = axios.create({
 * baseURL: servicesURL,
 * timeout: 10000,
 * headers: {
 *   common: {
 *     'X-Requested-With': 'XMLHttpRequest'
 *   }
 * },
 * DO_NOT_RECEIVE_JSON_DATA: true
 * });
 *
 * initAxios(axiosInstance);
 * init2(router, store, axiosInstance);
 *
 * @param {*} axios objet axios qui sera utilisé
 */
export function initAxios(axios) {
  axios.interceptors.response.use(undefined, function (error) {
    var matches;
    // https://github.com/axios/axios/blob/master/dist/axios.js
    // TODO : utiliser vue-i18n et vue-cli-plugin-i18n ?
    // On traduit en français les messages d'erreur d'Axios connus :
    if (error.message === 'Request aborted') {
      error.message = 'La requête a été interrompue';
    } else if (error.message === 'Network Error') {
      error.message = 'Service indisponible (problème de réseau)';
    } else if (
      error.message &&
      (matches = /^Request failed with status code ([0-9]+)$/g.exec(
        error.message.toString()
      )) &&
      matches.length == 2
    ) {
      error.message = `La requête a échoué avec le code statut ${matches[1]}`;
    } else if (
      error.message &&
      (matches = /^timeout of ([0-9]+)ms exceeded$/g.exec(
        error.message.toString()
      )) &&
      matches.length == 2
    ) {
      error.message = `Délai de ${matches[1]} ms dépassé`;
    }
    return Promise.reject(error);
  });

  axios.interceptors.request.use(
    import.meta.env.VITE_DEBUG_MODE
      ? function (config) {
          // https://stackoverflow.com/a/51279029/2332350
          config.__metadata__ = {
            startTime: new Date(),
            endTime: null
          };
          // Log valid request
          if (console) console.log(`Axios request:\n`, config);
          return Promise.resolve(config);
        }
      : undefined,
    function (error) {
      // On ne loggue pas les données d'authentification.
      if (!error.config?.data?.password) {
        // Log request error
        if (console) console.error(`Axios request error:\n`, error);
      }
      return Promise.reject(error);
    }
  );
  axios.interceptors.response.use(
    function (response) {
      // Axios renvoie le "string" response.data tel quel s'il n'arrive pas
      // à le "parser" sous forme d'objet JSON.
      // https://github.com/axios/axios/blob/6642ca9aa1efae47b1a9d3ce3adc98416318661c/lib/defaults.js#L57
      // https://github.com/axios/axios/issues/811
      // https://github.com/axios/axios/issues/61#issuecomment-411815115
      if (
        !response.config.DO_NOT_RECEIVE_JSON_DATA &&
        typeof response.data === 'string'
      ) {
        if (console)
          console.error(
            `Axios response error (cannot parse response data as JSON object):\n`,
            response
          );
        return Promise.reject({
          config: response.config,
          message:
            'Les données du serveur sont invalides. Chargement des données impossible.'
        });
      }
      if (import.meta.env.VITE_DEBUG_MODE && response.config?.__metadata__) {
        const m = response.config.__metadata__;
        m.endTime = new Date();
        response.__completedIn__ = (m.endTime - m.startTime) / 1000;
        // Log valid response
        if (console) console.log(`Axios response:\n`, response);
      }
      return Promise.resolve(response);
    },
    function (error) {
      if (import.meta.env.VITE_DEBUG_MODE && error.config?.__metadata__) {
        const m = error.config.__metadata__;
        m.endTime = new Date();
        error.__completedIn__ = (m.endTime - m.startTime) / 1000;
      }
      // On ne loggue ni les requêtes qui ont été intentionnellement interrompues,
      // ni les données d'authentification, ni les requêtes annulées par l'utilisateur.
      if (
        error.response?.status !== 400 &&
        error.response?.status !== 401 &&
        !axios.isCancel(error)
      ) {
        if (console) console.error(`Axios response error:\n`, error);
      }
      return Promise.reject(error);
    }
  );
}

// Inspiré de :
// https://github.com/adamlacombe/Shadow-DOM-inject-styles/blob/master/src/index.ts
// https://github.com/adamlacombe/Shadow-DOM-inject-styles/issues/4
function prependStyles(shadowRootElement, styles) {
  const root = shadowRootElement.shadowRoot;
  var styleAlreadyAdded = false;
  const currentStyleTags = Array.from(root.querySelectorAll('style'));
  currentStyleTags.forEach(element => {
    if (element.innerHTML === styles) {
      styleAlreadyAdded = true;
    }
  });

  if (!styleAlreadyAdded) {
    const newStyleTag = document.createElement('style');
    newStyleTag.innerHTML = styles;
    root.prepend(newStyleTag);
  }
}

export function copyExternalStylesToShadowDom(wcs) {
  const styles = Array.from(document.querySelectorAll('head>style')).reverse();

  wcs.forEach(function (currentWC) {
    styles.forEach(function (currentStyle) {
      prependStyles(
        // currentWC.getRootNode({ composed: true }).shadowRoot vaut null (TypeError: root is null)
        // lorsque currentWC est un élément DANS le shadow DOM, donc le code ci-dessous ne fonctionnera pas :
        //currentWC.getRootNode({ composed: true }),
        currentWC,
        currentStyle.innerHTML
      );
    });
  });
}
