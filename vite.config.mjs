import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import inject from '@rollup/plugin-inject';
import Components from 'unplugin-vue-components/vite';
import { BootstrapVueNextResolver } from 'bootstrap-vue-next';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import gzipPlugin from 'rollup-plugin-gzip';

export default ({ mode }) => {
  // Pour supprimer l'erreur suivante :
  // "import.meta" is not available with the "cjs" output format and will be empty [empty-import-meta]
  // https://stackoverflow.com/a/73222484/2332350
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd() /*, ''*/);
  process.env = Object.assign(process.env, env);
  // https://github.com/vitejs/vite/issues/14372
  if (!env.NODE_ENV && process.env.VITE_USER_NODE_ENV) {
    process.env.NODE_ENV = process.env.VITE_USER_NODE_ENV;
  }

  // https://vitejs.dev/config/
  return defineConfig({
    base: process.env.VITE_PUBLIC_PATH,
    optimizeDeps: {
      //include: ['element-resize-detector'],
      // new dependencies optimized: bootstrap-vue-next/components/BCollapse
      // optimized dependencies changed. reloading
      // https://stackoverflow.com/questions/75469067/vite-cypress-how-to-prevent-reloading-due-to-optimized-dependencies-causin
      exclude:
        process.env.NODE_ENV === 'development' ? ['bootstrap-vue-next'] : []
    },
    build: {
      // https://vite.dev/config/build-options.html#build-sourcemap
      // https://stackoverflow.com/a/38315512/2332350
      sourcemap: process.env.NODE_ENV === 'development'
    },
    // https://github.com/bootstrap-vue-next/bootstrap-vue-next/commit/c92579422d7640460d7a079e981d92c2fb121918
    // https://github.com/vitejs/vite/discussions/4013
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: [
            'mixed-decls',
            'color-functions',
            'global-builtin',
            'import'
          ]
        }
      }
    },
    plugins: [
      vue(),
      {
        ...inject({
          // TODO : variables to inject
        }),
        // https://github.com/vitejs/vite/issues/12916#issuecomment-1524962298
        // https://vitejs.dev/guide/api-plugin.html#rollup-plugin-compatibility
        enforce: 'post'
      },
      Components({
        //  By default this plugin will import components in the src/components path.
        dirs: ['src/dynamic-components'],
        // search for subdirectories
        deep: false,
        resolvers: [BootstrapVueNextResolver()]
      })
    ].concat(
      // On désactive les plugins optionnels pour accélérer le HMR :
      process.env.NODE_ENV === 'development'
        ? []
        : [
            gzipPlugin(),
            visualizer({
              gzipSize: true,
              brotliSize: true,
              filename: 'dist/bundle-analyzer-' + mode + '.html'
            })
          ]
    ),
    resolve: {
      alias: {
        // https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url
        //'@': fileURLToPath(new URL('./src', import.meta.url))
        '@': resolve(__dirname, './src')
      }
    }
  });
};
