import { defineConfig } from 'tsup';
import type { BuildOptions } from 'esbuild';

export default defineConfig({
  entry: {
    'widget': 'src/lib/widget/build.ts'
  },
  outDir: 'public',
  format: ['iife'],
  minify: true,
  clean: false,
  dts: false,
  outExtension({ format }) {
    return {
      js: `.min.js`
    }
  },
  esbuildOptions: (options: BuildOptions) => {
    options.footer = {
      js: '//# sourceURL=domiq-chat-widget.js',
    };
  },
}); 