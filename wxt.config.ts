import { defineConfig } from 'wxt';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'Bayzat Reports',
    description: 'Bayzat - Reports Generator',
    permissions: ['tabs', 'webNavigation', 'offscreen','downloads'],
    web_accessible_resources: [{
      resources: ['fonts/Changa-Regular.ttf', 'images/bayzat.png', 'images/bayzat-report.svg'],
      matches: ['<all_urls>']
    }]
  },
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  autoIcons: {
    developmentIndicator: 'overlay'
  },
  vite: () => ({
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: false,
        routesDirectory: 'src/entrypoints/popup/routes',
        generatedRouteTree: 'src/entrypoints/popup/routeTree.gen.ts',
      }),
    ]
  }),
});
